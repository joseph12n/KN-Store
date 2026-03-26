/**
 * Suite de Pruebas: Módulo de Usuarios
 *
 * Ejecuta transacciones HTTP locales para certificar el
 * flujo de autenticación, obtención de perfiles y autorizaciones (RBAC).
 *
 * @module tests/testUsersModule
 */

const { makeRequest, BASE_URLS } = require('./helpers/httpClient');

const runTests = async () => {
  console.log('==========================================');
  console.log('🧪 INICIANDO PRUEBAS DEL MÓDULO DE USUARIOS');
  console.log('=> Asegúrate de que el servidor esté corriendo en el puerto 3000');
  console.log('==========================================\n');

  let clientToken = null;
  let testClientId = null;

  try {
    // ==========================================
    // 1. REGISTRO Y LOGIN PÚBLICO
    // ==========================================
    console.log('--- 1. Pruebas Públicas (Auth y Registro) ---');
    
    // Generar un correo dinámico para no colisionar con pruebas previas
    const emailClient = `test_client_${Date.now()}@test.com`;
    
    console.log(`[POST /register] Registrando cliente: ${emailClient}`);
    let res = await makeRequest('POST', `${BASE_URLS.users}/register`, {
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
    // 4. LIMPIEZA / ELIMINACIÓN DE CUENTA
    // ==========================================
    console.log('\n--- Limpieza ---');
    
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
