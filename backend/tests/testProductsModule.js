/**
 * Suite de Pruebas: Módulo de Productos
 *
 * Valida la existencia de dependencias (User, Subcategory, Category) para 
 * luego transaccionar peticiones estructurales robustas e 
 * interacciones de paginación o búsqueda de texto.
 *
 * @module tests/testProductsModule
 */

const { makeRequest, BASE_URLS } = require('./helpers/httpClient');

const runTests = async () => {
  console.log('==========================================');
  console.log('🧪 INICIANDO PRUEBAS MÓDULO DE PRODUCTOS');
  console.log('=> Asegúrate de que el servidor esté corriendo en el puerto 3000');
  console.log('==========================================\n');

  let adminToken = null;
  let providerToken = null;
  let clientToken = null;
  
  let categoryId = null;
  let subcategoryId = null;
  
  let productId = null;
  let productSlug = null;

  try {
    // ==========================================
    // 0. AUTENTICACIÓN
    // ==========================================
    console.log('--- 0. Autenticación de Roles ---');

    let res = await makeRequest('POST', `${BASE_URLS.users}/login`, { email: 'admin@knstore.com', password: 'password123' });
    if (res.status === 200) { adminToken = res.data.data.token; console.log(' ✅ Admin'); }

    res = await makeRequest('POST', `${BASE_URLS.users}/login`, { email: 'proveedor@knstore.com', password: 'password123' });
    if (res.status === 200) { providerToken = res.data.data.token; console.log(' ✅ Provider'); }

    res = await makeRequest('POST', `${BASE_URLS.users}/login`, { email: 'cliente@gmail.com', password: 'password123' });
    if (res.status === 200) { clientToken = res.data.data.token; console.log(' ✅ Cliente'); }

    // ==========================================
    // 0.1 RECUPERACIÓN DEPENDENCIAS MATRIZ
    // ==========================================
    console.log('\n--- Recuperación de Relaciones (Categoría/Subcategoría) ---');

    const catRes = await makeRequest('GET', BASE_URLS.categories);
    if (catRes.status === 200 && catRes.data.data.length > 0) {
      categoryId = catRes.data.data[0]._id;
      console.log(` ✅ Matriz Central (Categoría) validada: ${categoryId}`);
    } else {
      console.log(' ❌ Ausencia de elementos en Base (npm run seed)');
      return;
    }

    const subRes = await makeRequest('GET', BASE_URLS.subcategories);
    if (subRes.status === 200 && subRes.data.count > 0) {
      const match = subRes.data.data.find(s => s.category && s.category._id === categoryId) || subRes.data.data[0];
      subcategoryId = match._id;
      categoryId = match.category._id || categoryId;
      console.log(` ✅ Rama Inferior (Subcategoría) hallada: ${subcategoryId}`);
    } else {
      console.log(' ❌ Ausencia de elementos subcategóricos en Base');
      return;
    }

    // ==========================================
    // 1. INYECCIÓN BÁSICA
    // ==========================================
    console.log('\n--- 1. Inyección de Producto ---');

    const skuTest = `QA-SKU-${Date.now()}`;
    console.log(`[POST /api/products] Operario: Admin, Inyectando QA`);
    
    res = await makeRequest('POST', BASE_URLS.products, {
      name: `Cinta Métrica QA ${Date.now()}`,
      sku: skuTest,
      description: 'Producto temporal para auditoría de transacciones automatizadas.',
      brand: 'GenericoQA',
      price: 89.99,
      costPrice: 50.00,
      stock: 30,
      category: categoryId,
      subcategory: subcategoryId,
      tags: ['test', 'prueba', 'QA'],
      isAvailable: true,
    }, adminToken);
    
    if (res.status === 201 && res.data.success) {
      productId = res.data.data._id;
      productSlug = res.data.data.slug;
      console.log(` ✅ Bloque exitoso. ID: ${productId} | Slug: ${productSlug}`);
    } else {
      console.log(' ❌ Error de creación', res.data);
    }

    // Provider
    console.log('\n[POST /api/products] Operario: Provider');
    res = await makeRequest('POST', BASE_URLS.products, {
      name: `Zapatilla Provider QA ${Date.now()}`,
      sku: `PROV-QA-SKU-${Date.now()}`,
      description: 'Producto registrado por perfil Proveedor.',
      brand: 'ProviderBrand',
      price: 59.99,
      costPrice: 35.00,
      stock: 20,
      category: categoryId,
      subcategory: subcategoryId,
    }, providerToken);
    if (res.status === 201) console.log(` ✅ Proveedor validado. ID: ${res.data.data._id}`);

    // Cliente (Debe frenar)
    console.log('\n[POST /api/products] Operario: Cliente (403)');
    res = await makeRequest('POST', BASE_URLS.products, { name: 'Inválido', sku: 'NO', description: '0000000000', price: 1, costPrice: 0, stock: 1, category: categoryId, subcategory: subcategoryId }, clientToken);
    if (res.status === 403) console.log(' ✅ RBAC Cliente contuvo el ataque.');

    // ==========================================
    // 2. EXTRACCIONES PÚBLICAS Y LECTURAS
    // ==========================================
    console.log('\n--- 2. Obtener Productos ---');

    // 2a. Listado general paginado
    res = await makeRequest('GET', BASE_URLS.products);
    if (res.status === 200) console.log(` ✅ [GET Lista] Colección general. Elementos: ${res.data.data.length}`);
    else console.log(` ❌ [GET Lista] Error al obtener productos. Status: ${res.status}`);

    // 2b. Consulta por ID
    console.log('\n--- 2b. Consulta de Producto por ID ---');

    if (productId) {
      // ID válido y existente — debe retornar 200
      console.log(`[GET /api/products/${productId}] ID válido recién creado`);
      res = await makeRequest('GET', `${BASE_URLS.products}/${productId}`);

      if (res.status === 200 && res.data.data._id === productId) {
        console.log(` ✅ Producto encontrado: "${res.data.data.name}"`);
      } else {
        console.log(` ❌ Fallo en consulta por ID. Status: ${res.status}`, res.data);
      }

      // ObjectId válido pero inexistente — debe retornar 404
      console.log('\n[GET /api/products/000000000000000000000000] ObjectId inexistente (404 esperado)');
      res = await makeRequest('GET', `${BASE_URLS.products}/000000000000000000000000`);
      if (res.status === 404) console.log(' ✅ Entidad inexistente manejada correctamente');
      else console.log(` ❌ Respuesta inesperada: ${res.status}`);

      // ID con formato inválido — CastError debe retornar 404
      console.log('\n[GET /api/products/id-invalido] Formato de ID incorrecto (404 esperado)');
      res = await makeRequest('GET', `${BASE_URLS.products}/id-invalido`);
      if (res.status === 404) console.log(' ✅ CastError manejado: formato inválido retorna 404');
      else console.log(` ❌ CastError no capturado. Status: ${res.status}`);
    }

    // 2c. Consulta por Slug
    if (productSlug) {
      console.log(`\n[GET /api/products/slug/${productSlug}] Búsqueda por slug`);
      res = await makeRequest('GET', `${BASE_URLS.products}/slug/${productSlug}`);
      if (res.status === 200) console.log(` ✅ [GET Slug] Producto encontrado: "${res.data.data.name}"`);
      else console.log(` ❌ [GET Slug] Fallo al buscar por slug. Status: ${res.status}`);
    }

    // ==========================================
    // 3. PAGINACIÓN Y FILTRADO (TEXT SEARCH)
    // ==========================================
    console.log('\n--- 3. Paginación y Filtrado Complejo ---');

    console.log('[GET ?page=1&limit=2] Paginado P1/L2');
    res = await makeRequest('GET', `${BASE_URLS.products}?page=1&limit=2`);
    if (res.status === 200) console.log(` ✅ Respuesta. HasNext: ${res.data.pagination.hasNext} | Pages: ${res.data.pagination.pages}`);

    console.log('[GET ?inStock=true] Filtrado InStock');
    res = await makeRequest('GET', `${BASE_URLS.products}?inStock=true`);
    if (res.status === 200) console.log(` ✅ Filtrado exitoso. Contó: ${res.data.data.length}`);

    console.log('[GET ?q=Test] Texto/Indizado Full-Text Search');
    res = await makeRequest('GET', `${BASE_URLS.products}?q=Test`);
    if (res.status === 200) console.log(` ✅ Índices de búsqueda respondiendo`);

    // ==========================================
    // 4. ELIMINACIÓN (Flujo dos pasos)
    // ==========================================
    console.log('\n--- 4. Eliminación de Producto (Soft → Hard Delete) ---');

    if (productId) {
      // RBAC: Provider no puede eliminar
      console.log(`\n[DELETE] Provider intenta eliminar (403 esperado)`);
      res = await makeRequest('DELETE', `${BASE_URLS.products}/${productId}`, null, providerToken);
      if (res.status === 403) console.log(' ✅ RBAC Provider bloqueado correctamente');
      else console.log(` ❌ RBAC no funcionó. Status: ${res.status}`);

      // Guard: hard delete sin desactivar → 400
      console.log(`\n[DELETE ?hardDelete=true] Intento prematuro sobre producto activo (400 esperado)`);
      res = await makeRequest('DELETE', `${BASE_URLS.products}/${productId}?hardDelete=true`, null, adminToken);
      if (res.status === 400) console.log(' ✅ Guard activo: no se puede hard delete sin desactivar primero');
      else console.log(` ❌ Guard no funcionó. Status: ${res.status}`);

      // Paso 1: desactivar (soft delete)
      console.log(`\n[DELETE] Paso 1 — Desactivando producto...`);
      res = await makeRequest('DELETE', `${BASE_URLS.products}/${productId}`, null, adminToken);
      if (res.status === 200) console.log(' ✅ Producto desactivado');
      else console.log(` ❌ Error al desactivar. Status: ${res.status}`);

      // Verificar que ya no es accesible (active = false → 404)
      res = await makeRequest('GET', `${BASE_URLS.products}/${productId}`);
      if (res.status === 404) console.log(' ✅ Producto inaccesible tras soft delete');

      // Paso 2: eliminar permanentemente
      console.log(`\n[DELETE ?hardDelete=true] Paso 2 — Eliminando permanentemente...`);
      res = await makeRequest('DELETE', `${BASE_URLS.products}/${productId}?hardDelete=true`, null, adminToken);
      if (res.status === 200) console.log(' ✅ Producto eliminado permanentemente');
      else console.log(` ❌ Error en hard delete. Status: ${res.status}`);
    }

  } catch (err) {
    console.error('❌ Error Transversal en Sistema QA:', err.message);
  }

  console.log('\n==========================================');
  console.log('🏁 CONCLUYÓ TEST DE PRODUCTOS');
  console.log('==========================================');
};

runTests();
