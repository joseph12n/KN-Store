const http = require('http');

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}/api/subcategories`;
const BASE_URL_USERS = `http://localhost:${PORT}/api/users`;

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
    console.log('🧪 PRUEBAS MÓDULO SUBCATEGORÍAS');
    console.log('==========================================\n');

    let adminToken = null;
    let subcategoryId = null;

    try {

        // =============================
        // LOGIN ADMIN
        // =============================
        console.log('--- LOGIN ADMIN ---');

        let res = await makeRequest('POST', `${BASE_URL_USERS}/login`, {
            email: 'admin@knstore.com',
            password: 'password123',
        });

        if (res.status === 200 && res.data.token) {
            adminToken = res.data.token;
            console.log('✅ Admin autenticado');
        } else {
            console.log('❌ Error login admin');
            return;
        }

        // =============================
        // NECESITAS UN CATEGORY ID
        // =============================
        console.log('\n--- OBTENIENDO CATEGORY ID ---');

        const categoriesRes = await makeRequest('GET', `http://localhost:${PORT}/api/categories`);

        let categoryId = null;

        if (categoriesRes.status === 200 && categoriesRes.data.length > 0) {
            categoryId = categoriesRes.data[0]._id;
            console.log('✅ Category ID obtenido:', categoryId);
        } else {
            console.log('❌ No hay categorías para probar');
            return;
        }

        // =============================
        // CREAR SUBCATEGORÍA
        // =============================
        console.log('\n--- CREAR SUBCATEGORÍA ---');

        const name = `Sub Test ${Date.now()}`;

        res = await makeRequest('POST', BASE_URL, {
            name,
            description: 'Subcategoría de prueba',
            category: categoryId
        }, adminToken);

        if (res.status === 201) {
            subcategoryId = res.data.data._id;
            console.log('✅ Subcategoría creada:', subcategoryId);
        } else {
            console.log('❌ Error al crear', res.data);
        }

        // =============================
        // LISTAR
        // =============================
        console.log('\n--- LISTAR ---');

        res = await makeRequest('GET', BASE_URL);

        if (res.status === 200) {
            console.log(`✅ Subcategorías obtenidas: ${res.data.count}`);
        } else {
            console.log('❌ Error al listar');
        }

        // =============================
        // OBTENER POR ID
        // =============================
        console.log('\n--- GET BY ID ---');

        res = await makeRequest('GET', `${BASE_URL}/${subcategoryId}`);

        if (res.status === 200) {
            console.log('✅ Subcategoría encontrada');
        } else {
            console.log('❌ Error al buscar');
        }

        // =============================
        // ACTUALIZAR
        // =============================
        console.log('\n--- UPDATE ---');

        res = await makeRequest('PUT', `${BASE_URL}/${subcategoryId}`, {
            name: name + ' Updated'
        }, adminToken);

        if (res.status === 200) {
            console.log('✅ Subcategoría actualizada');
        } else {
            console.log('❌ Error al actualizar');
        }

        // =============================
        // DELETE
        // =============================
        console.log('\n--- DELETE ---');

        res = await makeRequest('DELETE', `${BASE_URL}/${subcategoryId}`, null, adminToken);

        if (res.status === 200) {
            console.log('✅ Subcategoría eliminada');
        } else {
            console.log('❌ Error al eliminar');
        }

    } catch (error) {
        console.error('❌ Error general:', error.message);
    }

    console.log('\n==========================================');
    console.log('🏁 FIN DE PRUEBAS');
    console.log('==========================================');
};

runTests();