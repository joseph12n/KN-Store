/**
 * Controlador de Categorías
 *
 * Maneja las operaciones CRUD básicas para las categorías de productos.
 * Retorna respuestas consistentes en formato estructurado.
 *
 * @module controllers/categoryController
 */

const Category = require('../models/Category');

// ==================== RUTAS PÚBLICAS ====================

/**
 * Obtener todas las categorías.
 * @route GET /api/categories
 * @access Público
 */
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({});
    
    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener las categorías', error: error.message });
  }
};

/**
 * Obtener una categoría específica por su ID.
 * @route GET /api/categories/:id
 * @access Público
 */
const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (category) {
      res.json({
        success: true,
        data: category,
      });
    } else {
      res.status(404).json({ success: false, message: 'Categoría no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener la categoría', error: error.message });
  }
};

// ==================== RUTAS DE ADMINISTRACIÓN ====================

/**
 * Crear una nueva categoría.
 * @route POST /api/categories
 * @access Privado (Admin / Provider)
 */
const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    const categoryExists = await Category.findOne({ name: name.trim() });

    if (categoryExists) {
      return res.status(400).json({ success: false, message: 'Ya existe una categoría con ese nombre' });
    }

    const category = await Category.create({ name, description });

    if (category) {
      res.status(201).json({
        success: true,
        data: category,
        message: 'Categoría creada correctamente',
      });
    } else {
      res.status(400).json({ success: false, message: 'Datos de categoría inválidos' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al crear la categoría', error: error.message });
  }
};

/**
 * Actualizar una categoría existente por completo o de manera parcial.
 * @route PUT /api/categories/:id
 * @access Privado (Admin / Provider)
 */
const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (category) {
      category.name = req.body.name || category.name;
      
      // Permitir la actualización de la descripción (incluso si se envía en blanco)
      if (req.body.description !== undefined) {
        category.description = req.body.description;
      }

      const updatedCategory = await category.save();
      
      res.json({
        success: true,
        data: updatedCategory,
        message: 'Categoría actualizada correctamente',
      });
    } else {
      res.status(404).json({ success: false, message: 'Categoría no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al actualizar la categoría', error: error.message });
  }
};

/**
 * Eliminar una categoría por su ID.
 * Solo puede ser ejecutado por un Admin.
 * @route DELETE /api/categories/:id
 * @access Privado (Solo Admin)
 */
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (category) {
      await Category.deleteOne({ _id: req.params.id });
      res.json({ success: true, message: 'Categoría eliminada exitosamente' });
    } else {
      res.status(404).json({ success: false, message: 'Categoría no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al eliminar la categoría', error: error.message });
  }
};

// ==================== EXPORTACIÓN ====================

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
