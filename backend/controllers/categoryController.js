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
    // Solo retornar categorías activas en la vista pública
    const categories = await Category.find({ active: true });

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

    if (!category || !category.active) {
      return res.status(404).json({ success: false, message: 'Categoría no encontrada o inactiva' });
    }

    res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    // CastError ocurre si el ID no tiene el formato válido de ObjectId de MongoDB
    if (error.name === 'CastError') {
      return res.status(404).json({ success: false, message: 'El ID de categoría no es válido' });
    }
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
 * Elimina una categoría con flujo de dos pasos:
 *   1. DELETE /api/categories/:id           → desactiva (soft delete, active = false)
 *   2. DELETE /api/categories/:id?hardDelete=true → elimina permanentemente (solo si ya inactiva)
 *
 * @route DELETE /api/categories/:id
 * @access Privado (Solo Admin)
 */
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
    }

    if (req.query.hardDelete === 'true') {
      // Guardia: la categoría debe estar previamente desactivada
      if (category.active) {
        return res.status(400).json({
          success: false,
          message: 'Debes desactivar la categoría antes de eliminarla permanentemente',
        });
      }
      await Category.deleteOne({ _id: req.params.id });
      return res.json({ success: true, message: 'Categoría eliminada permanentemente' });
    }

    // Paso 1 — Soft delete: desactivar categoría
    category.active = false;
    await category.save();

    res.json({ success: true, message: 'Categoría desactivada correctamente' });
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
