const express = require('express');
const router = express.Router();

const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');

const { protect, authorizeRoles } = require('../middlewares/authMiddleware');
const {
  validateCreateCategory,
  validateUpdateCategory,
} = require('../middlewares/categoryValidator');

// ==========================================
// RUTAS PÚBLICAS
// ==========================================

// Obtener todas las categorías / Crear nueva categoría
router.route('/')
  .get(getCategories)
  .post(protect, authorizeRoles('Admin', 'Provider'), validateCreateCategory, createCategory);

// Obtener, actualizar o eliminar una categoría por ID
router.route('/:id')
  .get(getCategoryById)
  .put(protect, authorizeRoles('Admin', 'Provider'), validateUpdateCategory, updateCategory)
  .delete(protect, authorizeRoles('Admin'), deleteCategory);

module.exports = router;
