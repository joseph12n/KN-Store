-- ============================================================
-- ==================  DATOS DE PRUEBA  =======================
-- El orden respeta las dependencias entre FK
-- ============================================================
 
-- ── 1. ROLES ─────────────────────────────────────────────────
--   id_rol 1 = admin | 2 = manager | 3 = customer
INSERT INTO roles (nombre_rol) VALUES
  ('admin'),
  ('manager'),
  ('customer');
 
-- ── 2. TIPOS DE DOCUMENTO ────────────────────────────────────
--   id_tipo_doc 1=CC | 2=CE | 3=Pasaporte | 4=NIT | 5=TI
INSERT INTO document_types (sigla, nombre_tipo) VALUES
  ('CC','Cedula de Ciudadania'),
  ('CCE','Cedula de Extranjeria'),
  ('PA','Pasaporte'),
  ('NIT','NIT'),
  ('TI','Tarjeta de Identidad');
 
-- ── 3. USUARIOS ──────────────────────────────────────────────
--   id_rol: 1=admin | 2=manager | 3=customer
--   id_tipo_doc: 1=CC | 3=Pasaporte
INSERT INTO users (id_rol, id_tipo_doc, num_documento, name, email, password) VALUES
  (1, 1, '80123456',   'Carlos Garcia',    'admin@knstore.co',    '$2b$10$hashed_admin_pw'),
  (2, 1, '52987654',   'Laura Perez',      'manager@knstore.co',  '$2b$10$hashed_manager_pw'),
  (3, 1, '1020304050', 'Andres Molina',    'andres@correo.co',    '$2b$10$hashed_customer1_pw'),
  (3, 1, '1030405060', 'Valentina Torres', 'valentina@correo.co', '$2b$10$hashed_customer2_pw'),
  (3, 3, 'PA9876543',  'Diego Sanchez',    'diego@correo.co',     '$2b$10$hashed_customer3_pw');
 
-- ── 4. CATEGORÍAS ────────────────────────────────────────────
INSERT INTO categories (name, slug) VALUES
  ('Electronica', 'electronica'),
  ('Ropa',        'ropa'),
  ('Calzado',     'calzado');
 
-- ── 5. SUBCATEGORÍAS ─────────────────────────────────────────
INSERT INTO subcategories (category_id, name, slug) VALUES
  (1, 'Telefonos',  'telefonos'),
  (1, 'Laptops',    'laptops'),
  (2, 'Camisetas',  'camisetas'),
  (2, 'Pantalones', 'pantalones'),
  (3, 'Tenis',      'tenis'),
  (3, 'Botas',      'botas');
 
-- ── 6. PRODUCTOS ─────────────────────────────────────────────
INSERT INTO products (subcategory_id, name, slug, description, brand, cost_price, sale_price) VALUES
  (1, 'Samsung Galaxy A55', 'samsung-galaxy-a55',
      'Smartphone 6.6" AMOLED, 8GB RAM, 128GB almacenamiento.',
      'Samsung', 950000.00, 1250000.00),
  (2, 'HP Laptop 15 FHD', 'hp-laptop-15-fhd',
      'Laptop Intel Core i5, 16GB RAM, SSD 512GB.',
      'HP', 2100000.00, 2799000.00),
  (3, 'Camiseta Urban Street', 'camiseta-urban-street',
      'Camiseta 100% algodon, corte regular fit.',
      'Urban Co.', 28000.00, 65000.00),
  (4, 'Pantalon Slim Basico', 'pantalon-slim-basico',
      'Pantalon de drill slim fit, disponible en varios colores.',
      'BasicWear', 55000.00, 120000.00),
  (5, 'Tenis Running ProX', 'tenis-running-prox',
      'Zapatilla deportiva con suela EVA y plantilla anatomica.',
      'ProX Sport', 150000.00, 299000.00);
 
-- ── 7. VARIANTES ─────────────────────────────────────────────
INSERT INTO product_variants (product_id, sku, color, size, stock) VALUES
  (1, 'GAL-A55-BLU-128', 'Azul',   '128GB', 30),
  (1, 'GAL-A55-BLK-128', 'Negro',  '128GB', 25),
  (2, 'HP-L15-SLV',      'Plata',  '15"',   15),
  (3, 'URB-CAM-WHT-S',   'Blanco', 'S',     50),
  (3, 'URB-CAM-WHT-M',   'Blanco', 'M',     60),
  (3, 'URB-CAM-BLK-L',   'Negro',  'L',     40),
  (4, 'BSC-PNT-KAK-32',  'Kaki',   '32',    20),
  (5, 'PRX-TEN-WHT-40',  'Blanco', '40',    35),
  (5, 'PRX-TEN-WHT-42',  'Blanco', '42',    28);
 
-- ── 8. ETIQUETAS ─────────────────────────────────────────────
INSERT INTO product_tags (product_id, tag) VALUES
  (1, 'nuevo'), (1, 'android'), (1, 'samsung'),
  (2, 'laptop'), (2, 'gaming'), (2, 'hp'),
  (3, 'casual'), (3, 'streetwear'),
  (4, 'basico'), (4, 'slim'),
  (5, 'running'), (5, 'deporte');
 
-- ── 9. DIRECCIONES ───────────────────────────────────────────
INSERT INTO addresses (user_id, street, city, department, zip_code, is_default) VALUES
  (3, 'Carrera 15 #80-32',       'Bogota',   'Cundinamarca',    '110221', TRUE),
  (4, 'Calle 123 #45-67',        'Medellin', 'Antioquia',       '050021', TRUE),
  (4, 'Avenida El Poblado #12-34','Medellin', 'Antioquia',       '050015', FALSE),
  (5, 'Calle 5 #10-20',          'Cali',     'Valle del Cauca', '760001', TRUE);
 
-- ── 10. CARRITOS ─────────────────────────────────────────────
INSERT INTO carts (user_id) VALUES
  (3),   -- carrito de Andres
  (4);   -- carrito de Valentina
 
-- ── 11. ÍTEMS DEL CARRITO ────────────────────────────────────
INSERT INTO cart_items (cart_id, product_id, variant_id, quantity, unit_price) VALUES
  (1, 1, 1, 1, 1250000.00),  -- Andres: Galaxy A55 Azul x1
  (2, 3, 5, 2,   65000.00),  -- Valentina: Camiseta Blanco M x2
  (2, 5, 8, 1,  299000.00);  -- Valentina: Tenis Running 40 x1
 
-- ── 12. PEDIDOS ──────────────────────────────────────────────
INSERT INTO orders (user_id, address_id, status, total) VALUES
  (4, 2, 'CONFIRMED', 429000.00),   -- Pedido de Valentina
  (5, 4, 'DELIVERED', 299000.00);   -- Pedido de Diego
 
-- ── 13. ÍTEMS DEL PEDIDO ─────────────────────────────────────
INSERT INTO order_items (order_id, product_id, variant_id, quantity, unit_price) VALUES
  (1, 3, 5, 2,  65000.00),   -- Pedido 1: Camiseta M x2
  (1, 5, 8, 1, 299000.00),   -- Pedido 1: Tenis 40 x1
  (2, 5, 9, 1, 299000.00);   -- Pedido 2: Tenis 42 x1
 
-- ── 14. PAGOS ────────────────────────────────────────────────
INSERT INTO payments (order_id, method, status, amount, gateway_ref) VALUES
  (1, 'pse',         'APPROVED', 429000.00, 'PSE-2025-ABC123'),
  (2, 'credit_card', 'APPROVED', 299000.00, 'CC-2025-XYZ789');
 
-- ── 15. ENVÍOS ───────────────────────────────────────────────
INSERT INTO shipments (order_id, tracking_number, carrier, status, dispatched_at) VALUES
  (1, 'SERVIENTREGA-98765', 'Servientrega', 'IN_TRANSIT', '2025-07-10 08:30:00'),
  (2, 'COORDINADORA-11223', 'Coordinadora', 'DELIVERED',  '2025-07-08 09:00:00');
 
-- ── 16. FACTURAS ─────────────────────────────────────────────
INSERT INTO invoices (order_id, reference, total) VALUES
  (1, 'INV-2025-00001', 429000.00),
  (2, 'INV-2025-00002', 299000.00);
 
 