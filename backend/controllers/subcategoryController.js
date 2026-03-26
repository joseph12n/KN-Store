/**
 * Controlador de Subcategorías
 *
 * Administra el CRUD de subcategorías, asegurando que 
 * se validen contra su categoría principal antes de la creación.
 * Retorna JSON en formato estandarizado.
 *
 * @module controllers/subcategoryController
 */

const Subcategory = require('../models/Subcategory');
const Category = require('../models/Category');

// ==================== RUTAS PÚBLICAS ====================

/**
 * Obtiene todas las subcategorías con paginación opcional y poblado.
 * @route GET /api/subcategories
 * @access Público
 */
const getSubcategories = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const startIndex = (page - 1) * limit;

    const total = await Subcategory.countDocuments();
    
    // Obtenemos solo subcategorías activas e inyectamos su categoría padre
    const subcategories = await Subcategory.find({ active: true })
      .populate('category', 'name')
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: subcategories.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      },
      data: subcategories
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en el servidor', error: error.message });
  }
};

/**
 * Obtiene una subcategoría por su ID.
 * @route GET /api/subcategories/:id
 * @access Público
 */
const getSubcategoryById = async (req, res) => {
  try {
    const subcategory = await Subcategory.findById(req.params.id)
      .populate('category', 'name description');

    if (!subcategory || !subcategory.active) {
      return res.status(404).json({ success: false, message: 'Subcategoría no encontrada o inactiva' });
    }

    res.status(200).json({
      success: true,
      data: subcategory
    });
  } catch (error) {
    // Si el ID tiene un formato inválido para MongoDB, capturamos el cast error
    if (error.name === 'CastError') {
      return res.status(404).json({ success: false, message: 'Subcategoría no encontrada' });
    }
    res.status(500).json({ success: false, message: 'Error en el servidor', error: error.message });
  }
};

// ==================== RUTAS DE ADMINISTRACIÓN ====================

/**
 * Crea una nueva subcategoría vinculada a una categoría padre.
 * @route POST /api/subcategories
 * @access Privado (Admin / Provider)
 */
const createSubcategory = async (req, res) => {
  try {
    const { name, description, category } = req.body;

    // 1. Validamos que la categoría referenciada realmente exista
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(404).json({ success: false, message: 'La categoría especificada no existe' });
    }

    // 2. Creamos la subcategoría
    const subcategory = await Subcategory.create({
      name,
      description,
      category
    });

    res.status(201).json({
      success: true,
      data: subcategory,
      message: 'Subcategoría generada exitosamente'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al crear la subcategoría', error: error.message });
  }
};

/**
 * Actualiza parcialmente una subcategoría.
 * @route PUT /api/subcategories/:id
 * @access Privado (Admin / Provider)
 */
const updateSubcategory = async (req, res) => {
  try {
    let subcategory = await Subcategory.findById(req.params.id);

    if (!subcategory || !subcategory.active) {
      return res.status(404).json({ success: false, message: 'Subcategoría no encontrada' });
    }

    // Si se envió un nuevo category_id, validamos que exista
    if (req.body.category) {
      const categoryExists = await Category.findById(req.body.category);
      if (!categoryExists) {
        return res.status(404).json({ success: false, message: 'La nueva categoría especificada no existe' });
      }
    }

    // Realizamos un parche y retornamos el objeto actualizado (new: true)
    subcategory = await Subcategory.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('category', 'name');

    res.status(200).json({
      success: true,
      data: subcategory,
      message: 'Subcategoría modificada exitosamente'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en el servidor', error: error.message });
  }
};

/**
 * Elimina (borrado suave o permanente) una subcategoría por su ID.
 * @route DELETE /api/subcategories/:id
 * @access Privado (Solo Admin)
 */
const deleteSubcategory = async (req, res) => {
  try {
    const subcategory = await Subcategory.findById(req.params.id);

    if (!subcategory) {
      return res.status(404).json({ success: false, message: 'Subcategoría no encontrada' });
    }

    // Revisar query string, ej: ?hardDelete=true
    if (req.query.hardDelete === 'true') {
      await subcategory.deleteOne();
      return res.status(200).json({ success: true, message: 'Subcategoría eliminada permanentemente' });
    }

    // Borrado Suave (Soft Delete) por defecto
    subcategory.active = false;
    await subcategory.save();

    res.status(200).json({ success: true, message: 'Subcategoría inhabilitada correctamente' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al eliminar', error: error.message });
  }
};

// ==================== EXPORTACIÓN ====================

module.exports = {
  getSubcategories,
  getSubcategoryById,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory
};