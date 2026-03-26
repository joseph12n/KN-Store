/**
 * Rutas de Productos
 *
 * Módulo complejo compuesto por filtros avanzados, 
 * extracción de dependencias relacionales y validación estricta de variables en express-validator.
 *
 * @module routes/productRoutes
 */

const express = require('express');
const router = express.Router();

// ==================== CONTROLADORES ====================
const {
  getProducts,
  getProductById,
  getProductBySlug,
  getProductsByCategory,
  getProductsBySubcategory,
  getProductsByBrand,
  getProductsByTag,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');

// ==================== MIDDLEWARES ====================
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');
const { validateCreateProduct, validateUpdateProduct } = require('../middlewares/productValidator');

// ==================== RUTAS PÚBLICAS (Filtros Globales) ====================
router.route('/')
  .get(getProducts);

// ==================== RUTAS PÚBLICAS (Extracción Específica) ====================
router.get('/slug/:slug', getProductBySlug);
router.get('/category/:categoryId', getProductsByCategory);
router.get('/subcategory/:subcategoryId', getProductsBySubcategory);
router.get('/brand/:brand', getProductsByBrand);
router.get('/tags/:tag', getProductsByTag);

router.route('/:id')
  .get(getProductById);

// ==================== RUTAS DE ADMINISTRACIÓN ====================

router.route('/')
  // Provider y Admin autorizados para subir catálogo base
  .post(protect, authorizeRoles('Admin', 'Provider'), validateCreateProduct, createProduct);

router.route('/:id')
  // Modificación de catálogo
  .put(protect, authorizeRoles('Admin', 'Provider'), validateUpdateProduct, updateProduct)
  // Únicamente administrador para erradicar temporal o permanentemente productos
  .delete(protect, authorizeRoles('Admin'), deleteProduct);

// ==================== EXPORTACIÓN ====================
module.exports = router;
