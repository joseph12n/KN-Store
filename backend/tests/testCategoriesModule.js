/**
 * Suite de Pruebas: Módulo de Categorías
 *
 * Certifica los endpoints REST de las divisiones de catálogo maestras. 
 * Verifica control de roles, inyecciones fallidas por datos parciales,
 * borrado condicional y consistencia HTTP.
 *
 * @module tests/testCategoriesModule
 */

const { makeRequest, BASE_URLS } = require('./helpers/httpClient');

const runTests = async () => {
  console.log('==========================================');
  console.log('🧪 INICIANDO PRUEBAS DEL MÓDULO DE CATEGORÍAS');
  console.log('=> Asegúrate de que el servidor esté corriendo en el puerto 3000');
  console.log('==========================================\n');

  let adminToken = null;
  let providerToken = null;
  let clientToken = null;

  let createdCategoryId = null;
  let createdByProviderId = null;

  try {
    // ==========================================
    // 0. AUTENTICACIÓN
    // ==========================================
    console.log('--- 0. Autenticación de Roles (Vía Seeds) ---');

    // Admin
    let res = await makeRequest('POST', `${BASE_URLS.users}/login`, {
      email: 'admin@knstore.com',
      password: 'password123',
    });
    if (res.status === 200 && res.data.data.token) {
      adminToken = res.data.data.token;
      console.log(' ✅ Admin autenticado');
    }

    // Provider
    res = await makeRequest('POST', `${BASE_URLS.users}/login`, {
      email: 'proveedor@knstore.com',
      password: 'password123',
    });
    if (res.status === 200 && res.data.data.token) {
      providerToken = res.data.data.token;
      console.log(' ✅ Provider autenticado');
    }

    // Client
    res = await makeRequest('POST', `${BASE_URLS.users}/login`, {
      email: 'cliente@gmail.com',
      password: 'password123',
    });
    if (res.status === 200 && res.data.data.token) {
      clientToken = res.data.data.token;
      console.log(' ✅ Cliente autenticado');
    }

    // ==========================================
    // 1. RUTAS PÚBLICAS
    // ==========================================
    console.log('\n--- 1. Rutas Públicas de Categorías ---');

    console.log('[GET /api/categories] Petición sin tokens');
    res = await makeRequest('GET', BASE_URLS.categories);
    if (res.status === 200 && Array.isArray(res.data.data)) {
      console.log(` ✅ Extracción abierta correcta: ${res.data.data.length} elementos`);
    } else {
      console.log(' ❌ Fallo global en lectura de base pública', res.data);
    }

    // ==========================================
    // 2. ADMINISTRADOR (Escritura/Lectura)
    // ==========================================
    console.log('\n--- 2. Permisos de Admin ---');

    const nombreTestAdmin = `Test Admin ${Date.now()}`;
    console.log(`[POST /api/categories] Creador Admin: "${nombreTestAdmin}"`);
    res = await makeRequest('POST', BASE_URLS.categories, {
      name: nombreTestAdmin,
      description: 'QA Inyección generada por un Administrador',
    }, adminToken);
    
    if (res.status === 201 && res.data.data._id) {
      createdCategoryId = res.data.data._id;
      console.log(` ✅ Registro consolidado ID: ${createdCategoryId}`);
    } else {
      console.log(' ❌ Dificultad en creación', res.data);
    }

    if (createdCategoryId) {
      console.log(`\n[PUT /api/categories/${createdCategoryId}] Modificador Admin`);
      res = await makeRequest('PUT', `${BASE_URLS.categories}/${createdCategoryId}`, {
        name: `${nombreTestAdmin} (Modificado)`,
      }, adminToken);
      
      if (res.status === 200 && res.data.data.name.includes('Modificado')) {
        console.log(' ✅ Parche modificado de nombre exitoso');
      }
    }

    // ==========================================
    // 3. PROVEEDOR (Creación Restrictiva)
    // ==========================================
    console.log('\n--- 3. Permisos de Provider ---');

    const nombreTestProvider = `Test Provider ${Date.now()}`;
    console.log(`[POST /api/categories] Creador Provider: "${nombreTestProvider}"`);
    res = await makeRequest('POST', BASE_URLS.categories, {
      name: nombreTestProvider,
    }, providerToken);
    
    if (res.status === 201 && res.data.data._id) {
      createdByProviderId = res.data.data._id;
      console.log(` ✅ Registro provisto consolidado: ${createdByProviderId}`);
    }

    if (createdByProviderId) {
      console.log(`\n[DELETE /api/categories/${createdByProviderId}] Proveedor intenta borrar matriz`);
      res = await makeRequest('DELETE', `${BASE_URLS.categories}/${createdByProviderId}`, null, providerToken);
      
      if (res.status === 403) {
        console.log(' ✅ Bloqueo de RBAC operando: Un perfil de Provider carece de poder de eliminación');
      } else {
        console.log(` ❌ Alerta de Permisibilidad. Codigo obtenido: ${res.status}`);
      }
    }

    // ==========================================
    // 4. CLIENTE / INVITADO (Bloqueos)
    // ==========================================
    console.log('\n--- 4. Privacidad y Bloqueos (Cliente/Anónimo) ---');

    console.log('[POST /api/categories] Cliente intenta inyectar datos (Restringido)');
    res = await makeRequest('POST', BASE_URLS.categories, { name: 'Ilegal' }, clientToken);
    if (res.status === 403) console.log(' ✅ 403: Role restringido correctamente');

    console.log('[POST /api/categories] Anónimo intenta inyectar (Restringido)');
    res = await makeRequest('POST', BASE_URLS.categories, { name: 'Gato' });
    if (res.status === 401) console.log(' ✅ 401: Anonimato restringido');

    // ==========================================
    // 5. VALIDACIONES LÓGICAS (express-validator)
    // ==========================================
    console.log('\n--- 5. Validaciones (Defectos forzados) ---');

    console.log('[POST /api/categories] Falta Título');
    res = await makeRequest('POST', BASE_URLS.categories, { description: 'Missing' }, adminToken);
    if (res.status === 400) console.log(' ✅ 400: Filtro de estructura activa.');

    console.log('[GET /api/categories/000000000000000000000000] Entidad inexistente');
    res = await makeRequest('GET', `${BASE_URLS.categories}/000000000000000000000000`);
    if (res.status === 404) console.log(' ✅ 404: Null entity exception manejada');

    // ==========================================
    // 6. PURGA / LIMPIEZA
    // ==========================================
    console.log('\n--- 6. Limpieza Total ---');

    if (createdCategoryId) {
      console.log(`[DELETE] Purgando instancia Admin...`);
      res = await makeRequest('DELETE', `${BASE_URLS.categories}/${createdCategoryId}`, null, adminToken);
      if (res.status === 200) console.log(' ✅ Limpio');
    }

    if (createdByProviderId) {
      console.log(`[DELETE] Purgando instancia Provider desde cuenta Admin...`);
      res = await makeRequest('DELETE', `${BASE_URLS.categories}/${createdByProviderId}`, null, adminToken);
      if (res.status === 200) console.log(' ✅ Limpio');
    }

  } catch (err) {
    console.error('Error transversal detectado QA Categories:', err.message);
  }

  console.log('\n==========================================');
  console.log('🏁 CONCLUYÓ TEST EN CATEGORÍAS');
  console.log('==========================================');
};

runTests();
