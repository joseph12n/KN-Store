/**
 * Rutas de Productos
 *
 * Maneja endpoints CRUD para productos con características avanzadas:
 * - Búsqueda y filtrado
 * - Paginación
 * - Ordenamiento
 * - Descuentos y disponibilidad
 */

const express = require('express');
const router = express.Router();

// Controllers
const productController = require('../controllers/productController');

// Middlewares
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');
const { validateProduct, validateProductUpdate } = require('../middlewares/productValidator');

// ==============================
// 📌 PRODUCTOS - CRUD
// ==============================

// ✔ Crear producto
router.post(
    '/',
    protect,
    authorizeRoles('Admin', 'Provider'),
    validateProduct,
    productController.createProduct
);

// ✔ Obtener todos (con búsqueda, filtrado, paginación, ordenamiento)
router.get(
    '/',
    productController.getProducts
);

// ✔ Obtener producto por ID
router.get(
    '/:id',
    productController.getProductById
);

// ✔ Obtener por slug (URL friendly)
router.get(
    '/slug/:slug',
    productController.getProductBySlug
);

// ✔ Actualizar producto
router.put(
    '/:id',
    protect,
    authorizeRoles('Admin', 'Provider'),
    validateProductUpdate,
    productController.updateProduct
);

// ✔ Eliminar producto (soft/hard)
router.delete(
    '/:id',
    protect,
    authorizeRoles('Admin'),
    productController.deleteProduct
);

// ==============================
// 📌 FILTROS Y BÚSQUEDAS
// ==============================

// ✔ Obtener por marca
router.get(
    '/brand/:brand',
    productController.getProductsByBrand
);

// ✔ Obtener por etiqueta
router.get(
    '/tags/:tag',
    productController.getProductsByTag
);

// ✔ Obtener por subcategoría
router.get(
    '/subcategory/:id',
    productController.getProductsBySubcategory
);

// ✔ Obtener por categoría
router.get(
    '/category/:id',
    productController.getProductsByCategory
);

module.exports = router;

