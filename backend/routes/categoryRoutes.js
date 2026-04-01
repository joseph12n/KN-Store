/**
 * Rutas de Categorías
 *
 * Controla el acceso público a las listas de categorías y 
 * delega los roles de administración/proveedor para alteraciones.
 *
 * @module routes/categoryRoutes
 */

const express = require('express');
const router = express.Router();

// ==================== CONTROLADORES ====================
const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');

// ==================== MIDDLEWARES ====================
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');
const { validateCreateCategory } = require('../middlewares/categoryValidator');

// ==================== RUTAS PÚBLICAS ====================
router.route('/')
  .get(getCategories);

router.route('/:id')
  .get(getCategoryById);

// ==================== RUTAS DE ADMINISTRACIÓN ====================
// (Manager + Admin pueden crear y editar, Solo Admin puede borrar)

router.route('/')
  .post(protect, authorizeRoles('Admin', 'Manager'), validateCreateCategory, createCategory);

router.route('/:id')
  .put(protect, authorizeRoles('Admin', 'Manager'), updateCategory)
  .delete(protect, authorizeRoles('Admin'), deleteCategory);

// ==================== EXPORTACIÓN ====================
module.exports = router;
