-- ============================================================
-- ===========  CONSULTAS DE VERIFICACIÓN  ====================
-- ============================================================
 
-- Usuarios con su rol y tipo de documento (JOIN normalizado)
SELECT u.id, u.name, u.email,
       r.nombre_rol        AS rol,
       dt.nombre_tipo      AS tipo_documento,
       u.num_documento,
       u.active
FROM users u
JOIN roles          r  ON u.id_rol      = r.id_rol
LEFT JOIN document_types dt ON u.id_tipo_doc = dt.id_tipo_doc;
 
-- Todos los usuarios de un rol específico
SELECT u.name, u.email, u.num_documento
FROM users u
JOIN roles r ON u.id_rol = r.id_rol
WHERE r.nombre_rol = 'customer';
 
-- Productos con margen calculado automáticamente (RF-022)
SELECT name, brand, cost_price, sale_price, profit, margin
FROM products;
 
-- Catálogo público: productos activos con subcategoría y categoría
SELECT p.name AS producto, p.brand AS marca, p.sale_price AS precio,
       s.name AS subcategoria, c.name AS categoria
FROM products p
JOIN subcategories s ON p.subcategory_id = s.id
JOIN categories    c ON s.category_id    = c.id
WHERE p.active = TRUE;
 
-- Carrito de un usuario con subtotales
SELECT u.name AS cliente, pr.name AS producto,
       ci.quantity, ci.unit_price, ci.subtotal
FROM cart_items ci
JOIN carts    ca ON ci.cart_id    = ca.id
JOIN users     u ON ca.user_id    = u.id
JOIN products pr ON ci.product_id = pr.id
WHERE u.id = 4;
 
-- Detalle completo de un pedido
SELECT o.id AS pedido, u.name AS cliente,
       oi.quantity, pr.name AS producto, oi.subtotal,
       o.total, o.status,
       py.method AS metodo_pago, py.status AS estado_pago,
       sh.tracking_number, sh.carrier, sh.status AS estado_envio,
       inv.reference AS factura
FROM orders o
JOIN users        u   ON o.user_id     = u.id
JOIN order_items  oi  ON oi.order_id   = o.id
JOIN products     pr  ON oi.product_id = pr.id
JOIN payments     py  ON py.order_id   = o.id
JOIN shipments    sh  ON sh.order_id   = o.id
JOIN invoices     inv ON inv.order_id  = o.id
WHERE o.id = 1;
 
-- Productos filtrados por etiqueta (RF-030)
SELECT p.name, p.brand, pt.tag
FROM products p
JOIN product_tags pt ON pt.product_id = p.id
WHERE pt.tag = 'running';
 
-- Búsqueda full-text en productos (RF-024 / RF-025)
SELECT name, brand, sale_price
FROM products
WHERE MATCH(name, description) AGAINST ('laptop gaming' IN NATURAL LANGUAGE MODE);
 