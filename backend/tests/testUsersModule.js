const { makeRequest, BASE_URLS } = require('./helpers/httpClient');

const runTests = async () => {
    console.log("==========================================");
    console.log("🧪 INICIANDO PRUEBAS DEL MÓDULO DE USUARIOS");
    console.log("=> Asegúrate de que el servidor esté corriendo en el puerto 3000");
    console.log("==========================================\n");

    let clientToken = null;
    let adminToken = null;
    let providerToken = null;
    
    // IDs guardados para limpiar después
    let testClientId = null;
    let testAdminId = null;

    try {
        console.log("--- 1. Pruebas Públicas (Auth y Registro) ---");
        
        // 1.1 Registro de un Cliente (Exitoso)
        const emailClient = `test_client_${Date.now()}@test.com`;
        console.log(`[POST /register] Registrando cliente: ${emailClient}`);
        let res = await makeRequest('POST', `${BASE_URLS.users}/register`, {
            name: "Test Cliente",
            email: emailClient,
            password: "password123"
        });
        console.log(` Status: ${res.status}`);
        if(res.status === 201) {
            console.log(" ✅ Cliente registrado correctamente.");
            testClientId = res.data._id;
        } else {
             console.log(" ❌ Fallo el registro.", res.data);
        }

        // 1.2 Login del Cliente
        console.log(`\n[POST /login] Iniciando sesión con: ${emailClient}`);
        res = await makeRequest('POST', `${BASE_URLS.users}/login`, {
            email: emailClient,
            password: "password123"
        });
        console.log(` Status: ${res.status}`);
        if(res.status === 200 && res.data.token) {
             console.log(" ✅ Inició sesión correctamente. Token obtenido.");
             clientToken = res.data.token;
        } else {
             console.log(" ❌ Falló inicio de sesión.", res.data);
        }

        console.log("\n--- 2. Acciones del Cliente (Requiere Token) ---");
        
        // 2.1 Obtener Perfil Propio
        console.log(`[GET /profile] Obteniendo perfil del cliente test`);
        res = await makeRequest('GET', `${BASE_URLS.users}/profile`, null, clientToken);
         if(res.status === 200) {
             console.log(` ✅ Obtuvo perfil correctly (Role: ${res.data.role}).`);
        } else {
             console.log(" ❌ Fallo obteniendo perfil.", res.data);
        }

        // 2.2 Validación de Permisos (Un Cliente intentando acceder a ruta de Admin/Provider)
        console.log(`\n[GET /] (RUTA PROTEGIDA) Intentando obtener todos los usuarios como Cliente`);
        res = await makeRequest('GET', BASE_URLS.users, null, clientToken);
        if(res.status === 403) {
             console.log(` ✅ Bloqueado correctamente (Código 403) por rol insuficiente.`);
        } else {
             console.log(` ❌ Fallo la protección RBAC. Obteniendo status ${res.status}`);
        }

        console.log("\n--- Limpieza ---");
        
        // 2.3 Cliente elimina su propia cuenta (Eliminación exitosa)
        console.log(`[DELETE /profile] Cliente borrando su propia cuenta`);
        res = await makeRequest('DELETE', `${BASE_URLS.users}/profile`, null, clientToken);
        if(res.status === 200) {
             console.log(` ✅ Perfil eliminado correctamente de la Base de Datos.`);
        } else {
             console.log(" ❌ Error al eliminar el perfil.", res.data);
        }

    } catch (err) {
        console.error("Error fatal en las pruebas:", err.message);
        if (err.code === 'ECONNREFUSED') {
            console.log("\n⚠️  EL SERVIDOR NO ESTÁ RESPONDIENDO. POR FAVOR INICIA EL SERVIDOR. ('npm run dev')\n");
        }
    }

    console.log("\n==========================================");
    console.log("🏁 PRUEBAS FINALIZADAS");
    console.log("==========================================");
};

runTests();
