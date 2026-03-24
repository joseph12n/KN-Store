const Subcategory = require('../models/Subcategory');
const Category = require('../models/Category');
const Product = require('../models/Product');

// ✔ CREAR
exports.createSubcategory = async (req, res) => {
    try {
        const { name, description, category } = req.body;

        // validar categoría padre
        const parentCategory = await Category.findById(category);
        if (!parentCategory) {
            return res.status(404).json({
                success: false,
                message: 'La categoría no existe'
            });
        }

        // evitar duplicados manualmente (extra)
        const existing = await Subcategory.findOne({ name: name.trim() });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'La subcategoría ya existe'
            });
        }

        const newSubcategory = new Subcategory({
            name: name.trim(),
            description: description.trim(),
            category
        });

        await newSubcategory.save();

        res.status(201).json({
            success: true,
            message: 'Subcategoría creada correctamente',
            data: newSubcategory
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error al crear subcategoría'
        });
    }
};

// ✔ LISTAR
exports.getSubcategories = async (req, res) => {
    try {
        const includeInactive = req.query.includeInactive === 'true';

        const filter = includeInactive ? {} : { active: true };

        const subcategories = await Subcategory.find(filter)
            .populate('category', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: subcategories.length,
            data: subcategories
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener subcategorías'
        });
    }
};

// ✔ OBTENER POR ID
exports.getSubcategoryById = async (req, res) => {
    try {
        const subcategory = await Subcategory.findById(req.params.id)
            .populate('category', 'name');

        if (!subcategory) {
            return res.status(404).json({
                success: false,
                message: 'Subcategoría no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: subcategory
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al buscar subcategoría'
        });
    }
};

// ✔ ACTUALIZAR
exports.updateSubcategory = async (req, res) => {
    try {
        const { name, description, category } = req.body;

        // validar nueva categoría si viene
        if (category) {
            const parentCategory = await Category.findById(category);
            if (!parentCategory) {
                return res.status(400).json({
                    success: false,
                    message: 'La categoría no existe'
                });
            }
        }

        const updated = await Subcategory.findByIdAndUpdate(
            req.params.id,
            {
                ...(name && { name: name.trim() }),
                ...(description && { description: description.trim() }),
                ...(category && { category })
            },
            { new: true, runValidators: true }
        );

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'Subcategoría no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Subcategoría actualizada',
            data: updated
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar subcategoría'
        });
    }
};

// ✔ ELIMINAR (SOFT + HARD)
exports.deleteSubcategory = async (req, res) => {
    try {
        const hardDelete = req.query.hardDelete === 'true';

        const subcategory = await Subcategory.findById(req.params.id);

        if (!subcategory) {
            return res.status(404).json({
                success: false,
                message: 'Subcategoría no encontrada'
            });
        }

        if (hardDelete) {
            // eliminar productos relacionados
            await Product.deleteMany({ subcategory: req.params.id });

            await Subcategory.findByIdAndDelete(req.params.id);

            return res.status(200).json({
                success: true,
                message: 'Subcategoría eliminada permanentemente'
            });
        }

        // soft delete
        subcategory.active = false;
        await subcategory.save();

        // desactivar productos relacionados
        await Product.updateMany(
            { subcategory: req.params.id },
            { active: false }
        );

        res.status(200).json({
            success: true,
            message: 'Subcategoría desactivada'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar subcategoría'
        });
    }
};