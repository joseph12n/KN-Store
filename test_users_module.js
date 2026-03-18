const http = require('http');

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}/api/users`;

// Helper interactivo rápido para realizar peticiones HTTP (nativo de Node sin dependencias extra)
const makeRequest = (method, path, data = null, token = null) => {
    return new Promise((resolve, reject) => {
        const url = new URL(`${BASE_URL}${path}`);
        
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                let parsedBody = body;
                try { parsedBody = JSON.parse(body); } catch(e) {}
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
        let res = await makeRequest('POST', '/register', {
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
        res = await makeRequest('POST', '/login', {
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
        res = await makeRequest('GET', '/profile', null, clientToken);
         if(res.status === 200) {
             console.log(` ✅ Obtuvo perfil correctly (Role: ${res.data.role}).`);
        } else {
             console.log(" ❌ Fallo obteniendo perfil.", res.data);
        }

        // 2.2 Validación de Permisos (Un Cliente intentando acceder a ruta de Admin/Provider)
        console.log(`\n[GET /] (RUTA PROTEGIDA) Intentando obtener todos los usuarios como Cliente`);
        res = await makeRequest('GET', '', null, clientToken);
        if(res.status === 403) {
             console.log(` ✅ Bloqueado correctamente (Código 403) por rol insuficiente.`);
        } else {
             console.log(` ❌ Fallo la protección RBAC. Obteniendo status ${res.status}`);
        }

        // -----------------------------------------------------
        // * NOTA PARA ADMIN/PROVIDER *
        // Como los Admins sólo pueden ser creados por otro Admin (y el seeding inicial no lo hemos hecho automatizado aquí)
        // en esta prueba no podemos loguear dinámicamente a un Admin sin primero forzarlo por BD o Seeder.
        // Simularemos el final de la prueba eliminando la cuenta del cliente para dejar limpio el sistema.
        // -----------------------------------------------------

        console.log("\n--- Limpieza ---");
        
        // 2.3 Cliente elimina su propia cuenta (Eliminación exitosa)
        console.log(`[DELETE /profile] Cliente borrando su propia cuenta`);
        res = await makeRequest('DELETE', '/profile', null, clientToken);
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
