const http = require('http');

const PORT = 3000;

/**
 * Helper reutilizable para realizar peticiones HTTP nativas sin dependencias extra.
 * @param {string} method - Método HTTP (GET, POST, PUT, DELETE)
 * @param {string} url - URL completa del endpoint
 * @param {object|null} data - Body de la petición (solo para POST/PUT)
 * @param {string|null} token - Token JWT para autenticación
 * @returns {Promise<{status: number, data: any}>}
 */
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

/**
 * URLs base para los endpoints de la API.
 */
const BASE_URLS = {
    users: `http://localhost:${PORT}/api/users`,
    categories: `http://localhost:${PORT}/api/categories`,
    subcategories: `http://localhost:${PORT}/api/subcategories`,
    products: `http://localhost:${PORT}/api/products`,
};

module.exports = { makeRequest, BASE_URLS, PORT };
