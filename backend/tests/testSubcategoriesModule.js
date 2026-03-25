const { makeRequest, BASE_URLS, PORT } = require('./helpers/httpClient');

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

        let res = await makeRequest('POST', `${BASE_URLS.users}/login`, {
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

        const categoriesRes = await makeRequest('GET', BASE_URLS.categories);

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

        res = await makeRequest('POST', BASE_URLS.subcategories, {
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

        res = await makeRequest('GET', BASE_URLS.subcategories);

        if (res.status === 200) {
            console.log(`✅ Subcategorías obtenidas: ${res.data.count}`);
        } else {
            console.log('❌ Error al listar');
        }

        // =============================
        // OBTENER POR ID
        // =============================
        console.log('\n--- GET BY ID ---');

        res = await makeRequest('GET', `${BASE_URLS.subcategories}/${subcategoryId}`);

        if (res.status === 200) {
            console.log('✅ Subcategoría encontrada');
        } else {
            console.log('❌ Error al buscar');
        }

        // =============================
        // ACTUALIZAR
        // =============================
        console.log('\n--- UPDATE ---');

        res = await makeRequest('PUT', `${BASE_URLS.subcategories}/${subcategoryId}`, {
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

        res = await makeRequest('DELETE', `${BASE_URLS.subcategories}/${subcategoryId}`, null, adminToken);

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
