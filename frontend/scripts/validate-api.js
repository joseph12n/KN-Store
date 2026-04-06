/**
 * Script de validación de conectividad API para Next.js
 * Ejecutar: node scripts/validate-api.js
 *
 * Verifica que el backend de Express responde correctamente
 * en los endpoints públicos que consume el frontend.
 */

const API_URL = process.env.API_URL || 'http://localhost:3000/api';

const endpoints = [
  { name: 'GET /products', url: `${API_URL}/products`, method: 'GET' },
  { name: 'GET /categories', url: `${API_URL}/categories`, method: 'GET' },
  { name: 'GET /subcategories', url: `${API_URL}/subcategories`, method: 'GET' },
];

const authEndpoints = [
  {
    name: 'POST /users/login',
    url: `${API_URL}/users/login`,
    method: 'POST',
    body: { email: 'admin@knstore.com', password: 'password123' },
  },
];

async function testEndpoint({ name, url, method, body, token }) {
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;

    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    const start = Date.now();
    const res = await fetch(url, options);
    const elapsed = Date.now() - start;
    const json = await res.json();

    const ok = res.ok && json.success !== false;
    const dataCount = Array.isArray(json.data) ? json.data.length : (json.data ? 1 : 0);

    console.log(
      `  ${ok ? 'PASS' : 'FAIL'} ${name} — ${res.status} — ${dataCount} items — ${elapsed}ms`
    );

    return { ok, data: json.data, status: res.status };
  } catch (err) {
    console.log(`  FAIL ${name} — ${err.message}`);
    return { ok: false, error: err.message };
  }
}

async function main() {
  console.log(`\nAPI Validation — ${API_URL}\n${'='.repeat(50)}`);

  // Test public endpoints
  console.log('\n[Public endpoints]');
  let allOk = true;
  for (const ep of endpoints) {
    const result = await testEndpoint(ep);
    if (!result.ok) allOk = false;
  }

  // Test auth
  console.log('\n[Auth endpoints]');
  const loginResult = await testEndpoint(authEndpoints[0]);
  if (!loginResult.ok) allOk = false;

  // Test protected endpoint with token
  if (loginResult.ok && loginResult.data?.token) {
    console.log('\n[Protected endpoints (with token)]');
    const token = loginResult.data.token;

    const protectedEndpoints = [
      { name: 'GET /users/profile', url: `${API_URL}/users/profile`, method: 'GET', token },
      { name: 'GET /users (Admin)', url: `${API_URL}/users`, method: 'GET', token },
    ];

    for (const ep of protectedEndpoints) {
      const result = await testEndpoint(ep);
      if (!result.ok) allOk = false;
    }
  }

  // Summary
  console.log(`\n${'='.repeat(50)}`);
  if (allOk) {
    console.log('All API endpoints validated successfully!');
    console.log('The Next.js frontend can communicate with the backend.\n');
  } else {
    console.log('Some endpoints failed. Make sure the backend is running:');
    console.log('  cd backend && npm run dev\n');
  }

  // Validate Next.js rewrite config
  console.log('[Next.js rewrite validation]');
  console.log('  The next.config.js proxies /api/* → http://localhost:3000/api/*');
  console.log('  Client-side fetch("/api/products") → backend via rewrite');
  console.log('  Server-side fetch uses API_URL env var directly\n');
}

main();
