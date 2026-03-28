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
    // 3. LECTURA GENERAL (GET ALL)
    // =============================
    console.log('\n--- 3. Extracción General de Subcategorías ---');

    res = await makeRequest('GET', BASE_URLS.subcategories);
    if (res.status === 200) console.log(` ✅ Subcategorías obtenidas: ${res.data.count}`);
    else console.log(' ❌ Error en extracción general');

    // =============================
    // 4. CONSULTA POR ID (GET /:id)
    // =============================
    console.log('\n--- 4. Consulta de Subcategoría por ID ---');

    if (subcategoryId) {
      // 4a. ID válido y existente — debe retornar 200 con categoría populada
      console.log(`[GET /api/subcategories/${subcategoryId}] ID válido recién creado`);
      res = await makeRequest('GET', `${BASE_URLS.subcategories}/${subcategoryId}`);

      if (res.status === 200 && res.data.data._id === subcategoryId) {
        console.log(` ✅ Subcategoría encontrada: "${res.data.data.name}" → Categoría: ${res.data.data.category?.name}`);
      } else {
        console.log(` ❌ Fallo en consulta por ID. Status: ${res.status}`, res.data);
      }

      // 4b. ObjectId válido pero inexistente — debe retornar 404
      console.log('\n[GET /api/subcategories/000000000000000000000000] ObjectId inexistente (404 esperado)');
      res = await makeRequest('GET', `${BASE_URLS.subcategories}/000000000000000000000000`);
      if (res.status === 404) console.log(' ✅ Entidad inexistente manejada correctamente');
      else console.log(` ❌ Respuesta inesperada: ${res.status}`);

      // 4c. ID con formato inválido — CastError debe retornar 404
      console.log('\n[GET /api/subcategories/id-invalido] Formato de ID incorrecto (404 esperado)');
      res = await makeRequest('GET', `${BASE_URLS.subcategories}/id-invalido`);
      if (res.status === 404) console.log(' ✅ CastError manejado: formato inválido retorna 404');
      else console.log(` ❌ CastError no capturado. Status: ${res.status}`);
    }

    // =============================
    // 5. ACTUALIZACIÓN (PUT)
    // =============================
    console.log('\n--- 5. Modificador Dinámico (PUT) ---');

    res = await makeRequest('PUT', `${BASE_URLS.subcategories}/${subcategoryId}`, {
      name: name + ' (Parchado Automático)'
    }, adminToken);

    if (res.status === 200) console.log(' ✅ Parche de nombre aplicado correctamente');
    else console.log(' ❌ Error al aplicar parche', res.data);

    // =============================
    // 6. PURGA (Flujo dos pasos)
    // =============================
    console.log('\n--- 6. Eliminación y Limpieza (Soft → Hard Delete) ---');

    // Verificar que hard delete sin desactivar retorna 400
    console.log('[DELETE ?hardDelete=true] Intento prematuro sobre subcategoría activa (400 esperado)');
    res = await makeRequest('DELETE', `${BASE_URLS.subcategories}/${subcategoryId}?hardDelete=true`, null, adminToken);
    if (res.status === 400) console.log(' ✅ Guard activo: no se puede hard delete sin desactivar primero');
    else console.log(` ❌ Guard no funcionó. Status: ${res.status}`);

    // Paso 1: desactivar (soft delete)
    console.log('\n[DELETE] Paso 1 — Desactivando subcategoría...');
    res = await makeRequest('DELETE', `${BASE_URLS.subcategories}/${subcategoryId}`, null, adminToken);
    if (res.status === 200) console.log(' ✅ Subcategoría desactivada');
    else console.log(` ❌ Error al desactivar. Status: ${res.status}`, res.data);

    // Verificar que ya no es accesible (active = false → 404)
    res = await makeRequest('GET', `${BASE_URLS.subcategories}/${subcategoryId}`);
    if (res.status === 404) console.log(' ✅ Subcategoría inaccesible tras soft delete');

    // Paso 2: eliminar permanentemente
    console.log('\n[DELETE ?hardDelete=true] Paso 2 — Eliminando permanentemente...');
    res = await makeRequest('DELETE', `${BASE_URLS.subcategories}/${subcategoryId}?hardDelete=true`, null, adminToken);
    if (res.status === 200) {
      console.log(' ✅ Subcategoría eliminada permanentemente');
    } else {
      console.log(` ❌ Error en hard delete. Status: ${res.status}`, res.data);
    }

  } catch (err) {
    console.error('❌ Interrupción grave QA Subcategories:', err.message);
  }

  console.log('\n==========================================');
  console.log('🏁 CONCLUYÓ TEST DE SUBCATEGORÍAS');
  console.log('==========================================');
};

runTests();
