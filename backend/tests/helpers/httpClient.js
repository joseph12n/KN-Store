/**
 * Helper: HTTP Client para Testing Local
 *
 * Utiliza el módulo nativo "http" de Node.js para
 * ejecutar peticiones REST contra el backend sin requerir 
 * bibliotecas como axios o supertest, agilizando el pipeline QA.
 *
 * @module tests/helpers/httpClient
 */

const http = require('http');

const PORT = process.env.PORT || 3000;

/**
 * URLs base mapeadas contra el gateway para pruebas modulares.
 */
const BASE_URLS = {
  users: `http://localhost:${PORT}/api/users`,
  categories: `http://localhost:${PORT}/api/categories`,
  subcategories: `http://localhost:${PORT}/api/subcategories`,
  products: `http://localhost:${PORT}/api/products`,
};

/**
 * Función asíncrona genérica para transacciones REST por HTTP.
 * 
 * @param {string} method - 'GET' | 'POST' | 'PUT' | 'DELETE'
 * @param {string} url - URI Endpoint
 * @param {object|null} data - Serializado y adjuntado al body de la request
 * @param {string|null} token - Token de portador JWT inyectado en headers
 * @returns {Promise<{status: number, data: any}>} Resolución de Promesa Node
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
        try { 
          parsed = JSON.parse(body); 
        } catch {}

        resolve({ status: res.statusCode, data: parsed });
      });
    });

    req.on('error', reject);
    
    // Anexamos el payload de la inyección
    if (data) req.write(JSON.stringify(data));
    
    req.end();
  });
};

module.exports = { makeRequest, BASE_URLS, PORT };
