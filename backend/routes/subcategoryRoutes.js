/**
 * Rutas de Subcategorías
 *
 * Operaciones CRUD sobre conjuntos dependientes de una Categoría Principal.
 * 
 * @module routes/subcategoryRoutes
 */

const express = require('express');
const router = express.Router();

// ==================== CONTROLADORES ====================
const {
  getSubcategories,
  getSubcategoryById,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
} = require('../controllers/subcategoryController');

// ==================== MIDDLEWARES ====================
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');
const {
  validateCreateSubcategory,
  validateUpdateSubcategory,
} = require('../middlewares/subcategoryValidator');

// ==================== RUTAS PÚBLICAS ====================
router.route('/')
  .get(getSubcategories);

router.route('/:id')
  .get(getSubcategoryById);

// ==================== RUTAS DE ADMINISTRACIÓN ====================

router.route('/')
  .post(protect, authorizeRoles('Admin', 'Provider'), validateCreateSubcategory, createSubcategory);

router.route('/:id')
  .put(protect, authorizeRoles('Admin', 'Provider'), validateUpdateSubcategory, updateSubcategory)
  .delete(protect, authorizeRoles('Admin'), deleteSubcategory);

// ==================== EXPORTACIÓN ====================
module.exports = router;