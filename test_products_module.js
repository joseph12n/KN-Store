const http = require('http');

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}/api/products`;
const BASE_URL_USERS = `http://localhost:${PORT}/api/users`;
const BASE_URL_CATEGORIES = `http://localhost:${PORT}/api/categories`;
const BASE_URL_SUBCATEGORIES = `http://localhost:${PORT}/api/subcategories`;

// Helper para realizar peticiones HTTP sin dependencias extra
const makeRequest = (method, url, data = null, token = null) => {
    return new Promise((resolve, reject) => {
        const parsedUrl = new URL(url);

        const options = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port,
            path: parsedUrl.pathname + parsedUrl.search,
            method,
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
                let parsed = body;
                try { parsed = JSON.parse(body); } catch {}
                resolve({ status: res.statusCode, data: parsed });
            });
        });

        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
};

const runTests = async () => {
    console.log('==========================================');
    console.log('🧪 PRUEBAS MÓDULO DE PRODUCTOS');
    console.log('=> Asegúrate de que el servidor esté corriendo en el puerto 3000');
    console.log('==========================================\n');

    let adminToken = null;
    let providerToken = null;
    let clientToken = null;
    let categoryId = null;
    let subcategoryId = null;
    let productId = null;
    let productSlug = null;

    try {

        // ==========================================
        // 0. AUTENTICACIÓN DE ROLES
        // ==========================================
        console.log('--- 0. Autenticación de Roles ---');

        let res = await makeRequest('POST', `${BASE_URL_USERS}/login`, {
            email: 'admin@knstore.com',
            password: 'password123',
        });
        if (res.status === 200 && res.data.token) {
            adminToken = res.data.token;
            console.log(' ✅ Admin autenticado.');
        } else {
            console.log(' ❌ Falló login de Admin.', res.data);
        }

        res = await makeRequest('POST', `${BASE_URL_USERS}/login`, {
            email: 'proveedor@knstore.com',
            password: 'password123',
        });
        if (res.status === 200 && res.data.token) {
            providerToken = res.data.token;
            console.log(' ✅ Provider autenticado.');
        } else {
            console.log(' ❌ Falló login de Provider.', res.data);
        }

        res = await makeRequest('POST', `${BASE_URL_USERS}/login`, {
            email: 'cliente@gmail.com',
            password: 'password123',
        });
        if (res.status === 200 && res.data.token) {
            clientToken = res.data.token;
            console.log(' ✅ Cliente autenticado.');
        } else {
            console.log(' ❌ Falló login de Cliente.', res.data);
        }

        // ==========================================
        // OBTENER CATEGORIA Y SUBCATEGORIA
        // ==========================================
        console.log('\n--- Obteniendo Categoría y Subcategoría de referencia ---');

        const catRes = await makeRequest('GET', BASE_URL_CATEGORIES);
        if (catRes.status === 200 && catRes.data.length > 0) {
            categoryId = catRes.data[0]._id;
            console.log(` ✅ Categoría obtenida: "${catRes.data[0].name}" (${categoryId})`);
        } else {
            console.log(' ❌ No hay categorías disponibles. Ejecuta: node seedData.js');
            return;
        }

        const subRes = await makeRequest('GET', BASE_URL_SUBCATEGORIES);
        if (subRes.status === 200 && subRes.data.count > 0) {
            // Buscar una subcategoría que pertenezca a la categoría obtenida
            const matchingSub = subRes.data.data.find(
                s => s.category && s.category._id === categoryId
            ) || subRes.data.data[0];
            subcategoryId = matchingSub._id;
            categoryId = matchingSub.category._id || categoryId;
            console.log(` ✅ Subcategoría obtenida: "${matchingSub.name}" (${subcategoryId})`);
        } else {
            console.log(' ❌ No hay subcategorías. Ejecuta: node seedSubcategories.js');
            return;
        }

        // ==========================================
        // 1. CREAR PRODUCTO
        // ==========================================
        console.log('\n--- 1. Crear Producto ---');

        const skuTest = `TEST-SKU-${Date.now()}`;

        // 1.1 Crear producto como Admin (exitoso)
        console.log('[POST /api/products] Admin crea un producto');
        res = await makeRequest('POST', BASE_URL, {
            name: `Zapatilla Test ${Date.now()}`,
            sku: skuTest,
            description: 'Producto de prueba con descripción válida para el test',
            brand: 'TestBrand',
            price: 89.99,
            costPrice: 50.00,
            stock: 30,
            category: categoryId,
            subcategory: subcategoryId,
            tags: ['test', 'prueba'],
            isAvailable: true,
        }, adminToken);
        if (res.status === 201 && res.data.success) {
            productId = res.data.data._id;
            productSlug = res.data.data.slug;
            console.log(` ✅ Producto creado. ID: ${productId} | Slug: ${productSlug}`);
        } else {
            console.log(' ❌ Error al crear producto.', res.data);
        }

        // 1.2 Crear producto como Provider (exitoso)
        console.log('\n[POST /api/products] Provider crea un producto');
        res = await makeRequest('POST', BASE_URL, {
            name: `Zapatilla Provider ${Date.now()}`,
            sku: `PROV-SKU-${Date.now()}`,
            description: 'Producto creado por proveedor para prueba del sistema',
            brand: 'ProviderBrand',
            price: 59.99,
            costPrice: 35.00,
            stock: 20,
            category: categoryId,
            subcategory: subcategoryId,
        }, providerToken);
        if (res.status === 201 && res.data.success) {
            console.log(` ✅ Provider puede crear productos. ID: ${res.data.data._id}`);
        } else {
            console.log(' ❌ Provider no pudo crear producto.', res.data);
        }

        // 1.3 Cliente intenta crear producto (debe fallar 403)
        console.log('\n[POST /api/products] Cliente intenta crear producto (debe fallar 403)');
        res = await makeRequest('POST', BASE_URL, {
            name: 'Producto No Autorizado',
            sku: 'NO-AUTH-001',
            description: 'Este producto no debería crearse',
            price: 10.00,
            costPrice: 5.00,
            stock: 5,
            category: categoryId,
            subcategory: subcategoryId,
        }, clientToken);
        if (res.status === 403) {
            console.log(' ✅ Bloqueado correctamente (403) - Cliente no puede crear productos.');
        } else {
            console.log(` ❌ Falló protección RBAC. Status: ${res.status}`);
        }

        // 1.4 Sin token intenta crear (debe fallar 401)
        console.log('\n[POST /api/products] Sin token intenta crear (debe fallar 401)');
        res = await makeRequest('POST', BASE_URL, {
            name: 'Producto Sin Token',
            sku: 'NO-TOKEN-001',
            description: 'Sin autenticación',
            price: 10.00,
            costPrice: 5.00,
            stock: 5,
            category: categoryId,
            subcategory: subcategoryId,
        });
        if (res.status === 401) {
            console.log(' ✅ Bloqueado correctamente (401) - Se requiere autenticación.');
        } else {
            console.log(` ❌ Falló protección de autenticación. Status: ${res.status}`);
        }

        // ==========================================
        // 2. OBTENER PRODUCTOS (LECTURA PÚBLICA)
        // ==========================================
        console.log('\n--- 2. Obtener Productos (Rutas Públicas) ---');

        // 2.1 Listar todos
        console.log('[GET /api/products] Listar todos los productos');
        res = await makeRequest('GET', BASE_URL);
        if (res.status === 200 && res.data.success) {
            console.log(` ✅ Productos obtenidos: ${res.data.data.length} | Total: ${res.data.pagination.total}`);
        } else {
            console.log(' ❌ Error al listar productos.', res.data);
        }

        // 2.2 Obtener por ID
        if (productId) {
            console.log(`\n[GET /api/products/${productId}] Obtener por ID`);
            res = await makeRequest('GET', `${BASE_URL}/${productId}`);
            if (res.status === 200 && res.data.success) {
                console.log(` ✅ Producto encontrado: "${res.data.data.name}"`);
            } else {
                console.log(' ❌ Error al obtener por ID.', res.data);
            }
        }

        // 2.3 Obtener por Slug
        if (productSlug) {
            console.log(`\n[GET /api/products/slug/${productSlug}] Obtener por Slug`);
            res = await makeRequest('GET', `${BASE_URL}/slug/${productSlug}`);
            if (res.status === 200 && res.data.success) {
                console.log(` ✅ Producto encontrado por slug: "${res.data.data.name}"`);
            } else {
                console.log(' ❌ Error al obtener por slug.', res.data);
            }
        }

        // 2.4 Obtener por Categoría
        console.log(`\n[GET /api/products/category/${categoryId}] Obtener por Categoría`);
        res = await makeRequest('GET', `${BASE_URL}/category/${categoryId}`);
        if (res.status === 200 && res.data.success) {
            console.log(` ✅ Productos de la categoría: ${res.data.data.length}`);
        } else {
            console.log(' ❌ Error al obtener por categoría.', res.data);
        }

        // 2.5 Obtener por Subcategoría
        console.log(`\n[GET /api/products/subcategory/${subcategoryId}] Obtener por Subcategoría`);
        res = await makeRequest('GET', `${BASE_URL}/subcategory/${subcategoryId}`);
        if (res.status === 200 && res.data.success) {
            console.log(` ✅ Productos de la subcategoría: ${res.data.data.length}`);
        } else {
            console.log(' ❌ Error al obtener por subcategoría.', res.data);
        }

        // 2.6 Obtener por Marca
        console.log('\n[GET /api/products/brand/TestBrand] Obtener por Marca');
        res = await makeRequest('GET', `${BASE_URL}/brand/TestBrand`);
        if (res.status === 200 && res.data.success) {
            console.log(` ✅ Productos de la marca "TestBrand": ${res.data.data.length}`);
        } else {
            console.log(' ❌ Error al obtener por marca.', res.data);
        }

        // 2.7 Obtener por Tag
        console.log('\n[GET /api/products/tags/test] Obtener por Tag');
        res = await makeRequest('GET', `${BASE_URL}/tags/test`);
        if (res.status === 200 && res.data.success) {
            console.log(` ✅ Productos con tag "test": ${res.data.data.length}`);
        } else {
            console.log(' ❌ Error al obtener por tag.', res.data);
        }

        // ==========================================
        // 3. FILTROS Y PAGINACIÓN
        // ==========================================
        console.log('\n--- 3. Filtros y Paginación ---');

        // 3.1 Búsqueda de texto
        console.log('[GET /api/products?q=Nike] Búsqueda de texto');
        res = await makeRequest('GET', `${BASE_URL}?q=Nike`);
        if (res.status === 200 && res.data.success) {
            console.log(` ✅ Resultados de búsqueda "Nike": ${res.data.data.length}`);
        } else {
            console.log(' ❌ Error en búsqueda de texto.', res.data);
        }

        // 3.2 Filtro de precio
        console.log('\n[GET /api/products?priceMin=50&priceMax=100] Filtro de precio');
        res = await makeRequest('GET', `${BASE_URL}?priceMin=50&priceMax=100`);
        if (res.status === 200 && res.data.success) {
            console.log(` ✅ Productos entre $50-$100: ${res.data.data.length}`);
        } else {
            console.log(' ❌ Error en filtro de precio.', res.data);
        }

        // 3.3 Filtro en stock
        console.log('\n[GET /api/products?inStock=true] Filtro solo en stock');
        res = await makeRequest('GET', `${BASE_URL}?inStock=true`);
        if (res.status === 200 && res.data.success) {
            console.log(` ✅ Productos en stock: ${res.data.data.length}`);
        } else {
            console.log(' ❌ Error en filtro de stock.', res.data);
        }

        // 3.4 Paginación
        console.log('\n[GET /api/products?page=1&limit=2] Paginación (2 por página)');
        res = await makeRequest('GET', `${BASE_URL}?page=1&limit=2`);
        if (res.status === 200 && res.data.success) {
            const p = res.data.pagination;
            console.log(` ✅ Paginación correcta. Página: ${p.page}/${p.pages} | Total: ${p.total} | hasNext: ${p.hasNext}`);
        } else {
            console.log(' ❌ Error en paginación.', res.data);
        }

        // ==========================================
        // 4. ACTUALIZAR PRODUCTO
        // ==========================================
        console.log('\n--- 4. Actualizar Producto ---');

        if (productId) {
            // 4.1 Admin actualiza
            console.log(`[PUT /api/products/${productId}] Admin actualiza precio y stock`);
            res = await makeRequest('PUT', `${BASE_URL}/${productId}`, {
                price: 99.99,
                stock: 50,
            }, adminToken);
            if (res.status === 200 && res.data.success) {
                console.log(` ✅ Producto actualizado. Nuevo precio: $${res.data.data.price} | Stock: ${res.data.data.stock}`);
            } else {
                console.log(' ❌ Error al actualizar producto.', res.data);
            }

            // 4.2 Provider actualiza
            console.log(`\n[PUT /api/products/${productId}] Provider actualiza descripción`);
            res = await makeRequest('PUT', `${BASE_URL}/${productId}`, {
                description: 'Descripción actualizada correctamente por el proveedor del sistema',
            }, providerToken);
            if (res.status === 200 && res.data.success) {
                console.log(' ✅ Provider puede actualizar productos.');
            } else {
                console.log(' ❌ Provider no pudo actualizar.', res.data);
            }

            // 4.3 Cliente intenta actualizar (debe fallar 403)
            console.log(`\n[PUT /api/products/${productId}] Cliente intenta actualizar (debe fallar 403)`);
            res = await makeRequest('PUT', `${BASE_URL}/${productId}`, {
                price: 1.00,
            }, clientToken);
            if (res.status === 403) {
                console.log(' ✅ Bloqueado correctamente (403) - Cliente no puede actualizar productos.');
            } else {
                console.log(` ❌ Falló protección RBAC. Status: ${res.status}`);
            }
        }

        // ==========================================
        // 5. VALIDACIONES
        // ==========================================
        console.log('\n--- 5. Validaciones ---');

        // 5.1 Crear producto sin campos obligatorios
        console.log('[POST /api/products] Crear sin campos obligatorios (debe fallar 400)');
        res = await makeRequest('POST', BASE_URL, {
            name: 'Producto Incompleto',
        }, adminToken);
        if (res.status === 400) {
            console.log(' ✅ Validación correcta (400) - Campos obligatorios requeridos.');
        } else {
            console.log(` ❌ Falló la validación. Status: ${res.status}`, res.data);
        }

        // 5.2 Precio negativo
        console.log('\n[POST /api/products] Precio negativo (debe fallar 400)');
        res = await makeRequest('POST', BASE_URL, {
            name: 'Producto Precio Negativo',
            sku: `NEG-${Date.now()}`,
            description: 'Test de validación de precio negativo en el sistema',
            price: -10,
            costPrice: 5,
            stock: 10,
            category: categoryId,
            subcategory: subcategoryId,
        }, adminToken);
        if (res.status === 400) {
            console.log(' ✅ Validación correcta (400) - Precio negativo rechazado.');
        } else {
            console.log(` ❌ Falló la validación de precio negativo. Status: ${res.status}`);
        }

        // 5.3 ID inexistente
        console.log('\n[GET /api/products/000000000000000000000000] ID inexistente (debe fallar 404)');
        res = await makeRequest('GET', `${BASE_URL}/000000000000000000000000`);
        if (res.status === 404) {
            console.log(' ✅ Respuesta correcta (404) - Producto no encontrado.');
        } else {
            console.log(` ❌ Se esperaba 404. Status: ${res.status}`);
        }

        // ==========================================
        // 6. ELIMINAR PRODUCTO (SOFT Y HARD DELETE)
        // ==========================================
        console.log('\n--- 6. Eliminar Producto ---');

        if (productId) {
            // 6.1 Provider intenta eliminar (debe fallar 403)
            console.log(`[DELETE /api/products/${productId}] Provider intenta eliminar (debe fallar 403)`);
            res = await makeRequest('DELETE', `${BASE_URL}/${productId}`, null, providerToken);
            if (res.status === 403) {
                console.log(' ✅ Bloqueado correctamente (403) - Solo Admin puede eliminar productos.');
            } else {
                console.log(` ❌ Falló protección RBAC en DELETE. Status: ${res.status}`);
            }

            // 6.2 Admin hace soft delete
            console.log(`\n[DELETE /api/products/${productId}] Admin hace soft delete`);
            res = await makeRequest('DELETE', `${BASE_URL}/${productId}`, null, adminToken);
            if (res.status === 200 && res.data.success) {
                console.log(' ✅ Soft delete exitoso - Producto desactivado.');
            } else {
                console.log(' ❌ Error en soft delete.', res.data);
            }

            // 6.3 Verificar que ya no aparece en listado público
            console.log(`\n[GET /api/products/${productId}] Verificar que sigue accesible por ID tras soft delete`);
            res = await makeRequest('GET', `${BASE_URL}/${productId}`);
            if (res.status === 200) {
                console.log(` ✅ Producto aún accesible por ID. active: ${res.data.data.active}`);
            } else {
                console.log(` Status: ${res.status}`);
            }

            // 6.4 Admin hace hard delete
            console.log(`\n[DELETE /api/products/${productId}?hardDelete=true] Admin hace hard delete`);
            res = await makeRequest('DELETE', `${BASE_URL}/${productId}?hardDelete=true`, null, adminToken);
            if (res.status === 200 && res.data.success) {
                console.log(' ✅ Hard delete exitoso - Producto eliminado permanentemente.');
            } else {
                console.log(' ❌ Error en hard delete.', res.data);
            }

            // 6.5 Verificar que ya no existe
            console.log(`\n[GET /api/products/${productId}] Verificar eliminación permanente (debe fallar 404)`);
            res = await makeRequest('GET', `${BASE_URL}/${productId}`);
            if (res.status === 404) {
                console.log(' ✅ Producto eliminado correctamente (404).');
            } else {
                console.log(` ❌ El producto sigue existiendo. Status: ${res.status}`);
            }
        }

    } catch (error) {
        console.error('❌ Error general:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.log("\n⚠️  EL SERVIDOR NO ESTÁ RESPONDIENDO. Inicia el servidor con: npm run dev\n");
        }
    }

    console.log('\n==========================================');
    console.log('🏁 PRUEBAS DE PRODUCTOS FINALIZADAS');
    console.log('==========================================');
};

runTests();
