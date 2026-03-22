const Category = require('../models/Category');

// @desc    Obtener todas las categorías
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({});
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las categorías', error: error.message });
  }
};

// @desc    Obtener una categoría por ID
// @route   GET /api/categories/:id
// @access  Public
const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (category) {
      res.json(category);
    } else {
      res.status(404).json({ message: 'Categoría no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la categoría', error: error.message });
  }
};

// @desc    Crear una nueva categoría
// @route   POST /api/categories
// @access  Private/Admin/Provider
const createCategory = async (req, res) => {
  const { name, description } = req.body;

  try {
    const categoryExists = await Category.findOne({ name: name.trim() });

    if (categoryExists) {
      return res.status(400).json({ message: 'Ya existe una categoría con ese nombre' });
    }

    const category = await Category.create({ name, description });

    if (category) {
      res.status(201).json(category);
    } else {
      res.status(400).json({ message: 'Datos de categoría inválidos' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al crear la categoría', error: error.message });
  }
};

// @desc    Actualizar una categoría específica
// @route   PUT /api/categories/:id
// @access  Private/Admin/Provider
const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (category) {
      category.name = req.body.name || category.name;
      // Permitir actualizar description (incluso a cadena vacía)
      if (req.body.description !== undefined) {
        category.description = req.body.description;
      }

      const updatedCategory = await category.save();
      res.json(updatedCategory);
    } else {
      res.status(404).json({ message: 'Categoría no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar la categoría', error: error.message });
  }
};

// @desc    Eliminar una categoría específica
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (category) {
      await Category.deleteOne({ _id: req.params.id });
      res.json({ message: 'Categoría eliminada exitosamente' });
    } else {
      res.status(404).json({ message: 'Categoría no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar la categoría', error: error.message });
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
