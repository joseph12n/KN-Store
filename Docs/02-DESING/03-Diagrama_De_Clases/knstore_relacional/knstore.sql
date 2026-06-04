-- ============================================================
--  KN_STORE — Modelado de Base de Datos MySQL
--  Generado a partir de los Requerimientos Funcionales (RF)
--  v2: Normalización — roles y tipos de documento separados
-- ============================================================
 
CREATE DATABASE IF NOT EXISTS kn_store
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
 
USE kn_store;
 
-- ============================================================
-- 1. ROLES
--    Normalización: catálogo centralizado, sustituye el ENUM
--    en users → agregar un rol nuevo es solo un INSERT, no un
--    ALTER TABLE.
--    RNF-004 Control de acceso por rol
-- ============================================================
CREATE TABLE roles (
  id_rol     INT AUTO_INCREMENT PRIMARY KEY,
  nombre_rol VARCHAR(50) NOT NULL UNIQUE
);
 
-- ============================================================
-- 2. TIPOS DE DOCUMENTO
--    Normalización: catálogo reutilizable para identificación
--    legal del usuario (CC, CE, Pasaporte, NIT, etc.)
-- ============================================================
CREATE TABLE document_types (
  id_tipo_doc INT AUTO_INCREMENT PRIMARY KEY,
  sigla VARCHAR(10) NOT NULL UNIQUE,
  nombre_tipo VARCHAR(60) NOT NULL UNIQUE
);
 
-- ============================================================
-- 3. USUARIOS
--    RF-001 Registro | RF-006 Admin lista | RF-010 Eliminación lógica
--    RNF-001 bcrypt  | RNF-004 Roles      | RNF-005 active = FALSE
--    Relaciones:
--      users → roles        (N usuarios : 1 rol)
--      users → doc_types    (N usuarios : 1 tipo de documento)
-- ============================================================
CREATE TABLE users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  id_rol        INT          NOT NULL,
  id_tipo_doc   INT,
  num_documento VARCHAR(30)  COMMENT 'Número del documento de identidad',
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(150) NOT NULL UNIQUE,
  password      VARCHAR(255) NOT NULL COMMENT 'Hash bcrypt (costo >= 10)',
  active        BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at    DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_rol     FOREIGN KEY (id_rol)      REFERENCES roles(id_rol),
  CONSTRAINT fk_user_tipodoc FOREIGN KEY (id_tipo_doc) REFERENCES document_types(id_tipo_doc)
);
 
-- ============================================================
-- 4. CATEGORÍAS
--    RF-011 Lista pública | RF-013 Crear | RF-015 Eliminar
-- ============================================================
CREATE TABLE categories (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  slug       VARCHAR(120) NOT NULL UNIQUE,
  active     BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
 
-- ============================================================
-- 5. SUBCATEGORÍAS
--    RF-016 Lista pública | RF-017 Crear | RF-019 Eliminar
-- ============================================================
CREATE TABLE subcategories (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT          NOT NULL,
  name        VARCHAR(100) NOT NULL,
  slug        VARCHAR(120) NOT NULL UNIQUE,
  active      BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_subcat_category FOREIGN KEY (category_id) REFERENCES categories(id)
);
 
-- ============================================================
-- 6. PRODUCTOS
--    RF-020 Crear con variantes | RF-022 Cálculo automático
--    RF-024 Full-text           | RF-026 Slug
--    RNF-026 DECIMAL(10,2)
-- ============================================================
CREATE TABLE products (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  subcategory_id INT          NOT NULL,
  name           VARCHAR(200) NOT NULL,
  slug           VARCHAR(220) NOT NULL UNIQUE,
  description    TEXT,
  brand          VARCHAR(100) COMMENT 'RF-029 filtro por marca',
  cost_price     DECIMAL(10,2) NOT NULL,
  sale_price     DECIMAL(10,2) NOT NULL,
  -- RF-022: cálculo automático de precio, utilidad y margen
  profit         DECIMAL(10,2) GENERATED ALWAYS AS (sale_price - cost_price) STORED,
  margin         DECIMAL(10,2) GENERATED ALWAYS AS (
                   CASE WHEN sale_price > 0
                     THEN ROUND(((sale_price - cost_price) / sale_price) * 100, 2)
                     ELSE 0
                   END
                 ) STORED,
  active         BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at     DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_product_subcategory FOREIGN KEY (subcategory_id) REFERENCES subcategories(id),
  -- RF-024: índice full-text para búsqueda eficiente
  FULLTEXT INDEX ft_product_search (name, description)
);
 
-- ============================================================
-- 7. VARIANTES DE PRODUCTO
--    RF-020 Crear producto con variantes
--    RNF-024 Concurrencia en stock
-- ============================================================
CREATE TABLE product_variants (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT          NOT NULL,
  sku        VARCHAR(100) UNIQUE,
  color      VARCHAR(50),
  size       VARCHAR(30),
  stock      INT          NOT NULL DEFAULT 0,
  active     BOOLEAN      NOT NULL DEFAULT TRUE,
  CONSTRAINT fk_variant_product FOREIGN KEY (product_id) REFERENCES products(id)
);
 
-- ============================================================
-- 8. ETIQUETAS DE PRODUCTO
--    RF-030 Filtrar productos por etiqueta
-- ============================================================
CREATE TABLE product_tags (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT         NOT NULL,
  tag        VARCHAR(80) NOT NULL,
  CONSTRAINT fk_tag_product FOREIGN KEY (product_id) REFERENCES products(id),
  UNIQUE KEY uq_product_tag (product_id, tag)
);
 
-- ============================================================
-- 9. DIRECCIONES
--    RF-037 Crear | RF-039 Editar | RF-041 Predeterminada
-- ============================================================
CREATE TABLE addresses (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT          NOT NULL,
  street      VARCHAR(200) NOT NULL,
  city        VARCHAR(100) NOT NULL,
  department  VARCHAR(100),
  zip_code    VARCHAR(20),
  country     VARCHAR(80)  NOT NULL DEFAULT 'Colombia',
  is_default  BOOLEAN      NOT NULL DEFAULT FALSE,
  active      BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_address_user FOREIGN KEY (user_id) REFERENCES users(id)
);
 
-- ============================================================
-- 10. CARRITOS
--     RF-042 Agregar | RF-043 Consultar | RF-046 Vaciar
--     Un único carrito activo por usuario
-- ============================================================
CREATE TABLE carts (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT      NOT NULL UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES users(id)
);
 
-- ============================================================
-- 11. ÍTEMS DEL CARRITO
--     RF-044 Modificar cantidad | RF-045 Eliminar ítem
-- ============================================================
CREATE TABLE cart_items (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  cart_id    INT           NOT NULL,
  product_id INT           NOT NULL,
  variant_id INT,
  quantity   INT           NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  subtotal   DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  CONSTRAINT fk_cartitem_cart    FOREIGN KEY (cart_id)    REFERENCES carts(id),
  CONSTRAINT fk_cartitem_product FOREIGN KEY (product_id) REFERENCES products(id),
  CONSTRAINT fk_cartitem_variant FOREIGN KEY (variant_id) REFERENCES product_variants(id)
);
 
-- ============================================================
-- 12. PEDIDOS
--     RF-047 Checkout | RF-049 Cancelar | RF-052 Actualizar estado
--     RNF-023 Atomicidad | RNF-025 Auditoría | RNF-026 DECIMAL(12,2)
-- ============================================================
CREATE TABLE orders (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT           NOT NULL,
  address_id INT           NOT NULL,
  status     ENUM('PENDING','CONFIRMED','SHIPPED','DELIVERED','CANCELLED')
             NOT NULL DEFAULT 'PENDING',
  total      DECIMAL(12,2) NOT NULL,
  created_at DATETIME      DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_order_user    FOREIGN KEY (user_id)    REFERENCES users(id),
  CONSTRAINT fk_order_address FOREIGN KEY (address_id) REFERENCES addresses(id)
);
 
-- ============================================================
-- 13. ÍTEMS DEL PEDIDO
--     RF-048 Cálculo automático del total
-- ============================================================
CREATE TABLE order_items (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  order_id   INT           NOT NULL,
  product_id INT           NOT NULL,
  variant_id INT,
  quantity   INT           NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  subtotal   DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  CONSTRAINT fk_orderitem_order   FOREIGN KEY (order_id)   REFERENCES orders(id),
  CONSTRAINT fk_orderitem_product FOREIGN KEY (product_id) REFERENCES products(id),
  CONSTRAINT fk_orderitem_variant FOREIGN KEY (variant_id) REFERENCES product_variants(id)
);
 
-- ============================================================
-- 14. PAGOS
--     RF-054 Iniciar pago | RF-055 Procesar | RF-057 Reembolso
--     RNF-026 DECIMAL(12,2)
-- ============================================================
CREATE TABLE payments (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  order_id    INT           NOT NULL,
  method      ENUM('credit_card','debit_card','pse','cash','nequi') NOT NULL,
  status      ENUM('PENDING','APPROVED','REJECTED','REFUNDED') NOT NULL DEFAULT 'PENDING',
  amount      DECIMAL(12,2) NOT NULL,
  gateway_ref VARCHAR(200)  COMMENT 'Referencia de la pasarela externa',
  created_at  DATETIME      DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_payment_order FOREIGN KEY (order_id) REFERENCES orders(id)
);
 
-- ============================================================
-- 15. ENVÍOS
--     RF-060 Crear envío | RF-061 Tracking | RF-062 Actualizar estado
--     RF-063 Devolución
-- ============================================================
CREATE TABLE shipments (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  order_id         INT          NOT NULL,
  tracking_number  VARCHAR(100),
  carrier          VARCHAR(100),
  status           ENUM('PENDING','IN_TRANSIT','DELIVERED','RETURNED')
                   NOT NULL DEFAULT 'PENDING',
  dispatched_at    DATETIME,
  delivered_at     DATETIME,
  created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_shipment_order FOREIGN KEY (order_id) REFERENCES orders(id)
);
 
-- ============================================================
-- 16. FACTURAS
--     RF-066 Generar automáticamente | RF-067 Referencia única
--     RF-068 Consultar propia        | RF-069 Listar (Admin/Manager)
-- ============================================================
CREATE TABLE invoices (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  order_id  INT           NOT NULL UNIQUE,
  reference VARCHAR(50)   NOT NULL UNIQUE COMMENT 'Ej: INV-2025-00001',
  total     DECIMAL(12,2) NOT NULL,
  issued_at DATETIME      DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_invoice_order FOREIGN KEY (order_id) REFERENCES orders(id)
);

