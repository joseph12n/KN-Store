const http = require('http');

const PORT = 3000;
const BASE_URL_CATEGORIES = `http://localhost:${PORT}/api/categories`;
const BASE_URL_USERS = `http://localhost:${PORT}/api/users`;

// Helper para realizar peticiones HTTP nativas sin dependencias extra
const makeRequest = (method, url, data = null, token = null) => {
    return new Promise((resolve, reject) => {
        const parsedUrl = new URL(url);

        const options = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port,
            path: parsedUrl.pathname + parsedUrl.search,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => (body += chunk));
            res.on('end', () => {
                let parsedBody = body;
                try { parsedBody = JSON.parse(body); } catch (e) {}
                resolve({ status: res.statusCode, data: parsedBody });
            });
        });

        req.on('error', (e) => reject(e));

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
};

const runTests = async () => {
    console.log('==========================================');
    console.log('🧪 INICIANDO PRUEBAS DEL MÓDULO DE CATEGORÍAS');
    console.log('=> Asegúrate de que el servidor esté corriendo en el puerto 3000');
    console.log('==========================================\n');

    let adminToken = null;
    let providerToken = null;
    let clientToken = null;

    let createdCategoryId = null;      // Creada por Admin
    let createdByProviderId = null;    // Creada por Provider

    try {
        // ==========================================
        // LOGIN DE ROLES (usa el seed de usuarios)
        // ==========================================
        console.log('--- 0. Autenticación de Roles ---');

        // Login Admin
        let res = await makeRequest('POST', `${BASE_URL_USERS}/login`, {
            email: 'admin@knstore.com',
            password: 'password123',
        });
        if (res.status === 200 && res.data.token) {
            adminToken = res.data.token;
            console.log(' ✅ Admin autenticado correctamente.');
        } else {
            console.log(' ❌ Falló login de Admin.', res.data);
        }

        // Login Provider
        res = await makeRequest('POST', `${BASE_URL_USERS}/login`, {
            email: 'proveedor@knstore.com',
            password: 'password123',
        });
        if (res.status === 200 && res.data.token) {
            providerToken = res.data.token;
            console.log(' ✅ Provider autenticado correctamente.');
        } else {
            console.log(' ❌ Falló login de Provider.', res.data);
        }

        // Login Cliente
        res = await makeRequest('POST', `${BASE_URL_USERS}/login`, {
            email: 'cliente@gmail.com',
            password: 'password123',
        });
        if (res.status === 200 && res.data.token) {
            clientToken = res.data.token;
            console.log(' ✅ Cliente autenticado correctamente.');
        } else {
            console.log(' ❌ Falló login de Cliente.', res.data);
        }

        // ==========================================
        // 1. RUTAS PÚBLICAS
        // ==========================================
        console.log('\n--- 1. Rutas Públicas ---');

        // 1.1 Obtener todas las categorías (sin token)
        console.log('[GET /api/categories] Obteniendo todas las categorías (público)');
        res = await makeRequest('GET', BASE_URL_CATEGORIES);
        if (res.status === 200 && Array.isArray(res.data)) {
            console.log(` ✅ Se obtuvieron ${res.data.length} categorías correctamente.`);
        } else {
            console.log(' ❌ Error al obtener categorías.', res.data);
        }

        // ==========================================
        // 2. RUTAS PRIVADAS - ADMIN
        // ==========================================
        console.log('\n--- 2. Rutas Privadas (Admin) ---');

        // 2.1 Crear categoría como Admin
        const nombreCategoriaAdmin = `Calzado Test Admin ${Date.now()}`;
        console.log(`[POST /api/categories] Creando categoría: "${nombreCategoriaAdmin}"`);
        res = await makeRequest('POST', BASE_URL_CATEGORIES, {
            name: nombreCategoriaAdmin,
            description: 'Categoría de prueba creada por Admin',
        }, adminToken);
        if (res.status === 201 && res.data._id) {
            createdCategoryId = res.data._id;
            console.log(` ✅ Categoría creada correctamente. ID: ${createdCategoryId}`);
        } else {
            console.log(' ❌ Error al crear categoría como Admin.', res.data);
        }

        // 2.2 Obtener categoría por ID
        if (createdCategoryId) {
            console.log(`\n[GET /api/categories/${createdCategoryId}] Obteniendo categoría por ID (público)`);
            res = await makeRequest('GET', `${BASE_URL_CATEGORIES}/${createdCategoryId}`);
            if (res.status === 200 && res.data._id === createdCategoryId) {
                console.log(` ✅ Categoría encontrada: "${res.data.name}"`);
            } else {
                console.log(' ❌ Error al obtener categoría por ID.', res.data);
            }
        }

        // 2.3 Actualizar categoría como Admin
        if (createdCategoryId) {
            console.log(`\n[PUT /api/categories/${createdCategoryId}] Actualizando categoría como Admin`);
            res = await makeRequest('PUT', `${BASE_URL_CATEGORIES}/${createdCategoryId}`, {
                name: `${nombreCategoriaAdmin} (Actualizada)`,
                description: 'Descripción actualizada por Admin',
            }, adminToken);
            if (res.status === 200 && res.data.name.includes('Actualizada')) {
                console.log(` ✅ Categoría actualizada correctamente: "${res.data.name}"`);
            } else {
                console.log(' ❌ Error al actualizar categoría.', res.data);
            }
        }

        // ==========================================
        // 3. RUTAS PRIVADAS - PROVIDER
        // ==========================================
        console.log('\n--- 3. Rutas Privadas (Provider) ---');

        // 3.1 Crear categoría como Provider
        const nombreCategoriaProvider = `Calzado Test Provider ${Date.now()}`;
        console.log(`[POST /api/categories] Creando categoría: "${nombreCategoriaProvider}"`);
        res = await makeRequest('POST', BASE_URL_CATEGORIES, {
            name: nombreCategoriaProvider,
            description: 'Categoría de prueba creada por Provider',
        }, providerToken);
        if (res.status === 201 && res.data._id) {
            createdByProviderId = res.data._id;
            console.log(` ✅ Categoría creada por Provider correctamente. ID: ${createdByProviderId}`);
        } else {
            console.log(' ❌ Error al crear categoría como Provider.', res.data);
        }

        // 3.2 Provider intenta eliminar una categoría (solo Admin puede)
        if (createdByProviderId) {
            console.log(`\n[DELETE /api/categories/${createdByProviderId}] Provider intentando eliminar (debe fallar con 403)`);
            res = await makeRequest('DELETE', `${BASE_URL_CATEGORIES}/${createdByProviderId}`, null, providerToken);
            if (res.status === 403) {
                console.log(' ✅ Bloqueado correctamente (403) - Provider no puede eliminar categorías.');
            } else {
                console.log(` ❌ Falló la protección RBAC. Status obtenido: ${res.status}`);
            }
        }

        // ==========================================
        // 4. PROTECCIÓN DE RUTAS - CLIENTE
        // ==========================================
        console.log('\n--- 4. Protección de Rutas (Cliente) ---');

        // 4.1 Cliente intenta crear categoría (debe fallar con 403)
        console.log('[POST /api/categories] Cliente intentando crear categoría (debe fallar con 403)');
        res = await makeRequest('POST', BASE_URL_CATEGORIES, {
            name: 'Categoría No Autorizada',
            description: 'Esto no debería crearse',
        }, clientToken);
        if (res.status === 403) {
            console.log(' ✅ Bloqueado correctamente (403) - Cliente no puede crear categorías.');
        } else {
            console.log(` ❌ Falló la protección RBAC. Status obtenido: ${res.status}`);
        }

        // 4.2 Sin token intenta crear categoría (debe fallar con 401)
        console.log('\n[POST /api/categories] Sin token intentando crear categoría (debe fallar con 401)');
        res = await makeRequest('POST', BASE_URL_CATEGORIES, {
            name: 'Categoría Sin Token',
        });
        if (res.status === 401) {
            console.log(' ✅ Bloqueado correctamente (401) - Se requiere autenticación.');
        } else {
            console.log(` ❌ Falló la protección de autenticación. Status obtenido: ${res.status}`);
        }

        // ==========================================
        // 5. VALIDACIONES
        // ==========================================
        console.log('\n--- 5. Validaciones ---');

        // 5.1 Crear categoría sin nombre (debe fallar)
        console.log('[POST /api/categories] Creando categoría sin nombre (debe fallar con 400)');
        res = await makeRequest('POST', BASE_URL_CATEGORIES, {
            description: 'Sin nombre',
        }, adminToken);
        if (res.status === 400) {
            console.log(' ✅ Validación correcta (400) - El nombre es obligatorio.');
        } else {
            console.log(` ❌ Falló la validación del nombre. Status: ${res.status}`, res.data);
        }

        // 5.2 Obtener categoría con ID inválido
        console.log('\n[GET /api/categories/id_invalido] Buscando categoría con ID inexistente (debe fallar)');
        res = await makeRequest('GET', `${BASE_URL_CATEGORIES}/000000000000000000000000`);
        if (res.status === 404) {
            console.log(' ✅ Respuesta correcta (404) - Categoría no encontrada.');
        } else {
            console.log(` ❌ Se esperaba 404. Status obtenido: ${res.status}`);
        }

        // ==========================================
        // 6. LIMPIEZA - Admin elimina las categorías de prueba
        // ==========================================
        console.log('\n--- 6. Limpieza ---');

        if (createdCategoryId) {
            console.log(`[DELETE /api/categories/${createdCategoryId}] Admin eliminando categoría de prueba`);
            res = await makeRequest('DELETE', `${BASE_URL_CATEGORIES}/${createdCategoryId}`, null, adminToken);
            if (res.status === 200) {
                console.log(' ✅ Categoría de Admin eliminada correctamente.');
            } else {
                console.log(' ❌ Error al eliminar categoría.', res.data);
            }
        }

        if (createdByProviderId) {
            console.log(`[DELETE /api/categories/${createdByProviderId}] Admin eliminando categoría de Provider`);
            res = await makeRequest('DELETE', `${BASE_URL_CATEGORIES}/${createdByProviderId}`, null, adminToken);
            if (res.status === 200) {
                console.log(' ✅ Categoría de Provider eliminada correctamente.');
            } else {
                console.log(' ❌ Error al eliminar categoría.', res.data);
            }
        }

    } catch (err) {
        console.error('Error fatal en las pruebas:', err.message);
        if (err.code === 'ECONNREFUSED') {
            console.log("\n⚠️  EL SERVIDOR NO ESTÁ RESPONDIENDO. POR FAVOR INICIA EL SERVIDOR. ('npm run dev')\n");
        }
    }

    console.log('\n==========================================');
    console.log('🏁 PRUEBAS FINALIZADAS');
    console.log('==========================================');
};

runTests();
