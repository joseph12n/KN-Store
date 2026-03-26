/**
 * Suite de Pruebas: Módulo de Subcategorías
 *
 * Valida la existencia de categorías y procede a interactuar
 * con los endpoints relacionales propios del catálogo.
 *
 * @module tests/testSubcategoriesModule
 */

const { makeRequest, BASE_URLS } = require('./helpers/httpClient');

const runTests = async () => {
  console.log('==========================================');
  console.log('🧪 PRUEBAS MÓDULO SUBCATEGORÍAS');
  console.log('==========================================\n');

  let adminToken = null;
  let subcategoryId = null;
  let categoryId = null;

  try {
    // =============================
    // 0. LOGIN ADMIN
    // =============================
    console.log('--- 0. Autenticación Administrador ---');

    let res = await makeRequest('POST', `${BASE_URLS.users}/login`, {
      email: 'admin@knstore.com',
      password: 'password123',
    });

    if (res.status === 200 && res.data.data.token) {
      adminToken = res.data.data.token;
      console.log(' ✅ Autoridad de Administrador confirmada');
    } else {
      console.log(' ❌ Rechazo predeterminado', res.data);
      return;
    }

    // =============================
    // 1. OBTENCIÓN DE CATEGORÍA MATRIZ
    // =============================
    console.log('\n--- 1. Extracción de ID Padre (Categoría) ---');

    const categoriesRes = await makeRequest('GET', BASE_URLS.categories);

    if (categoriesRes.status === 200 && categoriesRes.data.data.length > 0) {
      categoryId = categoriesRes.data.data[0]._id;
      console.log(` ✅ Matriz Categoría ubicada: ${categoryId}`);
    } else {
      console.log(' ❌ Base de datos vacía - Corre: npm run seed');
      return;
    }

    // =============================
    // 2. CREACIÓN (POST)
    // =============================
    console.log('\n--- 2. Inyección de Subcategoría ---');

    const name = `Sub QA ${Date.now()}`;

    res = await makeRequest('POST', BASE_URLS.subcategories, {
      name,
      description: 'Bloque inyectado bajo contexto automatizado (QA)',
      category: categoryId
    }, adminToken);

    if (res.status === 201) {
      subcategoryId = res.data.data._id;
      console.log(` ✅ Registro Subcategory consolidado: ${subcategoryId}`);
    } else {
      console.log(' ❌ Rechazo del parser', res.data);
    }

    // =============================
    // 3. LECTURA (GET ALL & ID)
    // =============================
    console.log('\n--- 3. Extracción de Lotes ---');

    res = await makeRequest('GET', BASE_URLS.subcategories);
    if (res.status === 200) console.log(` ✅ Subcategorías colectadas: ${res.data.count}`);
    else console.log(' ❌ Ruptura en extracción global');

    console.log('\n--- 4. Extracción Unitaria (ID) ---');
    res = await makeRequest('GET', `${BASE_URLS.subcategories}/${subcategoryId}`);
    if (res.status === 200) console.log(' ✅ Match de ObjectID exitoso');
    else console.log(' ❌ Fallo por ID fantasma');

    // =============================
    // 4. ACTUALIZACIÓN (PUT)
    // =============================
    console.log('\n--- 5. Modificador Dinámico (PUT) ---');

    res = await makeRequest('PUT', `${BASE_URLS.subcategories}/${subcategoryId}`, {
      name: name + ' (Parchado Automático)'
    }, adminToken);

    if (res.status === 200) console.log(' ✅ Modificador estático aplicado');
    else console.log(' ❌ Falla aplicando parche al nombre');

    // =============================
    // 5. PURGA (DELETE)
    // =============================
    console.log('\n--- 6. Eliminación y Limpieza (Hard Delete) ---');

    res = await makeRequest('DELETE', `${BASE_URLS.subcategories}/${subcategoryId}?hardDelete=true`, null, adminToken);

    if (res.status === 200) {
      console.log(' ✅ Restos eliminados en su totalidad');
    } else {
      console.log(' ❌ Restos no pudieron ser purgados satisfactoriamente', res.data);
    }

  } catch (err) {
    console.error('❌ Interrupción grave QA Subcategories:', err.message);
  }

  console.log('\n==========================================');
  console.log('🏁 CONCLUYÓ TEST DE SUBCATEGORÍAS');
  console.log('==========================================');
};

runTests();
