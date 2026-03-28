/**
 * Suite de Pruebas: Módulo de Usuarios
 *
 * Ejecuta transacciones HTTP locales para certificar el
 * flujo de autenticación, obtención de perfiles y autorizaciones (RBAC),
 * incluyendo la consulta de usuario por ID desde el panel de administración.
 *
 * @module tests/testUsersModule
 */

const { makeRequest, BASE_URLS } = require('./helpers/httpClient');

const runTests = async () => {
  console.log('==========================================');
  console.log('🧪 INICIANDO PRUEBAS DEL MÓDULO DE USUARIOS');
  console.log('=> Asegúrate de que el servidor esté corriendo en el puerto 3000');
  console.log('==========================================\n');

  let adminToken = null;
  let clientToken = null;
  let testClientId = null;

  try {
    // ==========================================
    // 0. AUTENTICACIÓN DE ADMIN (vía Seeds)
    // ==========================================
    console.log('--- 0. Autenticación de Administrador ---');

    let res = await makeRequest('POST', `${BASE_URLS.users}/login`, {
      email: 'admin@knstore.com',
      password: 'password123',
    });

    if (res.status === 200 && res.data.data.token) {
      adminToken = res.data.data.token;
      console.log(' ✅ Admin autenticado');
    } else {
      console.log(' ⚠️  Admin no disponible (¿corres npm run seed:users?)');
    }

    // ==========================================
    // 1. REGISTRO Y LOGIN PÚBLICO
    // ==========================================
    console.log('\n--- 1. Pruebas Públicas (Auth y Registro) ---');

    // Generar un correo dinámico para no colisionar con pruebas previas
    const emailClient = `test_client_${Date.now()}@test.com`;

    console.log(`[POST /register] Registrando cliente: ${emailClient}`);
    res = await makeRequest('POST', `${BASE_URLS.users}/register`, {
      name: 'Test',
      last_name: 'Cliente', // Necesario tras la reestructuración del diagrama de clases
      email: emailClient,
      password: 'password123'
    });

    if (res.status === 201) {
      console.log(' ✅ Cliente registrado correctamente.');
      testClientId = res.data.data._id;
    } else {
      console.log(` ❌ Falló el registro. Status: ${res.status}`, res.data);
    }

    // ==========================================
    // LOGIN
    // ==========================================
    console.log(`\n[POST /login] Iniciando sesión con: ${emailClient}`);
    res = await makeRequest('POST', `${BASE_URLS.users}/login`, {
      email: emailClient,
      password: 'password123'
    });

    if (res.status === 200 && res.data.data.token) {
      console.log(' ✅ Inició sesión correctamente. Token JWT obtenido.');
      clientToken = res.data.data.token;
    } else {
      console.log(` ❌ Falló inicio de sesión. Status: ${res.status}`, res.data);
    }

    // ==========================================
    // 2. RUTAS PRIVADAS (CLIENTE)
    // ==========================================
    console.log('\n--- 2. Acciones del Cliente (Requiere Token) ---');

    console.log('[GET /profile] Obteniendo perfil propio del cliente test');
    res = await makeRequest('GET', `${BASE_URLS.users}/profile`, null, clientToken);

    if (res.status === 200) {
      console.log(` ✅ Perfil de usuario extraído => Rol: ${res.data.data.role}`);
    } else {
      console.log(' ❌ Fallo obteniendo perfil.', res.data);
    }

    // ==========================================
    // 3. PROTECCIÓN DE ROLES (RBAC)
    // ==========================================
    console.log('\n[GET /] (RUTA PROTEGIDA) Intentando obtener todos los usuarios como Cliente');
    res = await makeRequest('GET', BASE_URLS.users, null, clientToken);

    if (res.status === 403) {
      console.log(' ✅ Bloqueado correctamente (Código 403) por rol insuficiente.');
    } else {
      console.log(` ❌ Fallo la protección RBAC. Obteniendo status ${res.status}`);
    }

    // ==========================================
    // 4. CONSULTA POR ID (ADMIN)
    // GET /api/users/:id
    // ==========================================
    console.log('\n--- 4. Consulta de Usuario por ID (Solo Admin) ---');

    if (adminToken && testClientId) {
      // 4a. Admin obtiene usuario por ID válido — debe retornar 200
      console.log(`[GET /api/users/${testClientId}] Admin consulta al cliente recién registrado`);
      res = await makeRequest('GET', `${BASE_URLS.users}/${testClientId}`, null, adminToken);

      if (res.status === 200 && res.data.data._id === testClientId) {
        console.log(` ✅ Usuario encontrado: ${res.data.data.name} ${res.data.data.last_name} (${res.data.data.role})`);
      } else {
        console.log(` ❌ Fallo en consulta por ID. Status: ${res.status}`, res.data);
      }

      // 4b. Cliente intenta obtener otro usuario por ID — debe retornar 403
      console.log(`\n[GET /api/users/${testClientId}] Cliente intenta acceder (403 esperado)`);
      res = await makeRequest('GET', `${BASE_URLS.users}/${testClientId}`, null, clientToken);

      if (res.status === 403) {
        console.log(' ✅ RBAC activo: Cliente no puede consultar usuarios por ID');
      } else {
        console.log(` ❌ Fallo en protección RBAC. Status: ${res.status}`);
      }

      // 4c. ID con formato inválido — debe retornar 404
      console.log('\n[GET /api/users/id-invalido] ID con formato incorrecto (404 esperado)');
      res = await makeRequest('GET', `${BASE_URLS.users}/id-invalido`, null, adminToken);

      if (res.status === 404) {
        console.log(' ✅ CastError manejado: ID inválido retorna 404');
      } else {
        console.log(` ❌ Error inesperado para ID inválido. Status: ${res.status}`);
      }

      // 4d. ID válido pero inexistente — debe retornar 404
      console.log('\n[GET /api/users/000000000000000000000000] ObjectId inexistente (404 esperado)');
      res = await makeRequest('GET', `${BASE_URLS.users}/000000000000000000000000`, null, adminToken);

      if (res.status === 404) {
        console.log(' ✅ Null entity exception manejada correctamente');
      } else {
        console.log(` ❌ Respuesta inesperada para entidad inexistente. Status: ${res.status}`);
      }
    } else {
      console.log(' ⚠️  Sección omitida: se requiere adminToken y testClientId');
    }

    // ==========================================
    // 5. LIMPIEZA / ELIMINACIÓN DE CUENTA
    // ==========================================
    console.log('\n--- 5. Limpieza ---');

    console.log('[DELETE /profile] Cliente borrando su propia cuenta (Soft / Hard Delete)');
    res = await makeRequest('DELETE', `${BASE_URLS.users}/profile`, null, clientToken);

    if (res.status === 200) {
      console.log(' ✅ Perfil eliminado correctamente de la Base de Datos.');
    } else {
      console.log(' ❌ Error al erradicar el perfil.', res.data);
    }

  } catch (err) {
    console.error('Error fatal detectado en pipeline de QA Users:', err.message);
    if (err.code === 'ECONNREFUSED') {
      console.log('\n⚠️  EL SERVIDOR SE ENCUENTRA APAGADO. Inicia: npm run dev\n');
    }
  }

  console.log('\n==========================================');
  console.log('🏁 PRUEBAS DE USUARIOS FINALIZADAS');
  console.log('==========================================');
};

// Iniciar subrutina QA
runTests();
