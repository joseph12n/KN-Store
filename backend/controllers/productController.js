const Product = require('../models/Product');
const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');

// ==================== CREAR ====================

exports.createProduct = async (req, res) => {
    try {
        const { name, sku, description, brand, price, costPrice, stock, category, subcategory, variants, images, tags, discount, isAvailable, availableDate } = req.body;

        // Validar que la categoría existe
        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
            return res.status(404).json({
                success: false,
                message: 'La categoría no existe'
            });
        }

        // Validar que la subcategoría existe
        const subcategoryExists = await Subcategory.findById(subcategory);
        if (!subcategoryExists) {
            return res.status(404).json({
                success: false,
                message: 'La subcategoría no existe'
            });
        }

        // Validar que la subcategoría pertenece a la categoría
        if (subcategoryExists.category.toString() !== category) {
            return res.status(400).json({
                success: false,
                message: 'La subcategoría no pertenece a la categoría seleccionada'
            });
        }

        // Crear el producto
        const newProduct = new Product({
            name: name.trim(),
            sku: sku.toUpperCase(),
            description: description.trim(),
            brand,
            price,
            costPrice,
            stock,
            category,
            subcategory,
            variants: variants || [],
            images: images || [],
            tags: tags || [],
            discount: discount || {},
            isAvailable: isAvailable !== undefined ? isAvailable : true,
            availableDate
        });

        await newProduct.save();

        // Populate de referencias
        await newProduct.populate('category', 'name');
        await newProduct.populate('subcategory', 'name');

        res.status(201).json({
            success: true,
            message: 'Producto creado correctamente',
            data: newProduct
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error al crear producto',
            error: error.message
        });
    }
};

// ==================== LEER/OBTENER ====================

exports.getProducts = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            sort = '-createdAt',
            priceMin,
            priceMax,
            inStock,
            tags,
            brand,
            q,
            includeInactive = false
        } = req.query;

        // Construir filtro
        let filter = includeInactive ? {} : { active: true, isAvailable: true };

        // Filtro de rango de precios
        if (priceMin || priceMax) {
            filter.price = {};
            if (priceMin) filter.price.$gte = parseFloat(priceMin);
            if (priceMax) filter.price.$lte = parseFloat(priceMax);
        }

        // Filtro de stock
        if (inStock === 'true') {
            filter.stock = { $gt: 0 };
        }

        // Filtro de tags
        if (tags) {
            const tagArray = tags.split(',').map(t => t.trim());
            filter.tags = { $in: tagArray };
        }

        // Filtro de marca
        if (brand) {
            filter.brand = brand;
        }

        // Búsqueda de texto (nombre y descripción)
        if (q) {
            filter.$or = [
                { name: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } },
                { sku: { $regex: q, $options: 'i' } }
            ];
        }

        // Convertir sort query a formato Mongoose
        const sortObj = {};
        const sortFields = sort.split(',');
        sortFields.forEach(field => {
            if (field.startsWith('-')) {
                sortObj[field.substring(1)] = -1;
            } else {
                sortObj[field] = 1;
            }
        });

        // Calcular paginación
        const pageNum = Math.max(1, parseInt(page));
        const pageSize = Math.max(1, Math.min(100, parseInt(limit)));
        const skip = (pageNum - 1) * pageSize;

        // Ejecutar queries en paralelo
        const [products, total] = await Promise.all([
            Product.find(filter)
                .populate('category', 'name')
                .populate('subcategory', 'name')
                .sort(sortObj)
                .limit(pageSize)
                .skip(skip),
            Product.countDocuments(filter)
        ]);

        const pages = Math.ceil(total / pageSize);

        res.status(200).json({
            success: true,
            data: products,
            pagination: {
                total,
                page: pageNum,
                pages,
                limit: pageSize,
                hasNext: pageNum < pages,
                hasPrev: pageNum > 1
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener productos'
        });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category', 'name')
            .populate('subcategory', 'name');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: product
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener producto'
        });
    }
};

exports.getProductBySlug = async (req, res) => {
    try {
        const product = await Product.findOne({ slug: req.params.slug, active: true })
            .populate('category', 'name')
            .populate('subcategory', 'name');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: product
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener producto'
        });
    }
};

exports.getProductsByBrand = async (req, res) => {
    try {
        const { page = 1, limit = 10, sort = '-createdAt' } = req.query;

        const pageNum = Math.max(1, parseInt(page));
        const pageSize = Math.max(1, Math.min(100, parseInt(limit)));
        const skip = (pageNum - 1) * pageSize;

        const [products, total] = await Promise.all([
            Product.find({ brand: req.params.brand, active: true })
                .populate('category', 'name')
                .populate('subcategory', 'name')
                .sort(sort)
                .limit(pageSize)
                .skip(skip),
            Product.countDocuments({ brand: req.params.brand, active: true })
        ]);

        const pages = Math.ceil(total / pageSize);

        res.status(200).json({
            success: true,
            data: products,
            pagination: {
                total,
                page: pageNum,
                pages,
                limit: pageSize,
                hasNext: pageNum < pages,
                hasPrev: pageNum > 1
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener productos por marca'
        });
    }
};

exports.getProductsByTag = async (req, res) => {
    try {
        const { page = 1, limit = 10, sort = '-createdAt' } = req.query;

        const pageNum = Math.max(1, parseInt(page));
        const pageSize = Math.max(1, Math.min(100, parseInt(limit)));
        const skip = (pageNum - 1) * pageSize;

        const [products, total] = await Promise.all([
            Product.find({ tags: req.params.tag, active: true })
                .populate('category', 'name')
                .populate('subcategory', 'name')
                .sort(sort)
                .limit(pageSize)
                .skip(skip),
            Product.countDocuments({ tags: req.params.tag, active: true })
        ]);

        const pages = Math.ceil(total / pageSize);

        res.status(200).json({
            success: true,
            data: products,
            pagination: {
                total,
                page: pageNum,
                pages,
                limit: pageSize,
                hasNext: pageNum < pages,
                hasPrev: pageNum > 1
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener productos por etiqueta'
        });
    }
};

exports.getProductsBySubcategory = async (req, res) => {
    try {
        const { page = 1, limit = 10, sort = '-createdAt', includeInactive = false } = req.query;

        const pageNum = Math.max(1, parseInt(page));
        const pageSize = Math.max(1, Math.min(100, parseInt(limit)));
        const skip = (pageNum - 1) * pageSize;

        const filter = {
            subcategory: req.params.id,
            ...(includeInactive ? {} : { active: true })
        };

        const [products, total] = await Promise.all([
            Product.find(filter)
                .populate('category', 'name')
                .populate('subcategory', 'name')
                .sort(sort)
                .limit(pageSize)
                .skip(skip),
            Product.countDocuments(filter)
        ]);

        const pages = Math.ceil(total / pageSize);

        res.status(200).json({
            success: true,
            data: products,
            pagination: {
                total,
                page: pageNum,
                pages,
                limit: pageSize,
                hasNext: pageNum < pages,
                hasPrev: pageNum > 1
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener productos de la subcategoría'
        });
    }
};

exports.getProductsByCategory = async (req, res) => {
    try {
        const { page = 1, limit = 10, sort = '-createdAt', includeInactive = false } = req.query;

        const pageNum = Math.max(1, parseInt(page));
        const pageSize = Math.max(1, Math.min(100, parseInt(limit)));
        const skip = (pageNum - 1) * pageSize;

        const filter = {
            category: req.params.id,
            ...(includeInactive ? {} : { active: true })
        };

        const [products, total] = await Promise.all([
            Product.find(filter)
                .populate('category', 'name')
                .populate('subcategory', 'name')
                .sort(sort)
                .limit(pageSize)
                .skip(skip),
            Product.countDocuments(filter)
        ]);

        const pages = Math.ceil(total / pageSize);

        res.status(200).json({
            success: true,
            data: products,
            pagination: {
                total,
                page: pageNum,
                pages,
                limit: pageSize,
                hasNext: pageNum < pages,
                hasPrev: pageNum > 1
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener productos de la categoría'
        });
    }
};

// ==================== ACTUALIZAR ====================

exports.updateProduct = async (req, res) => {
    try {
        const { name, sku, description, brand, price, costPrice, stock, category, subcategory, variants, images, tags, discount, isAvailable, availableDate } = req.body;

        // Validar que la categoría existe si se proporciona
        if (category) {
            const categoryExists = await Category.findById(category);
            if (!categoryExists) {
                return res.status(404).json({
                    success: false,
                    message: 'La categoría no existe'
                });
            }
        }

        // Validar que la subcategoría existe si se proporciona
        if (subcategory) {
            const subcategoryExists = await Subcategory.findById(subcategory);
            if (!subcategoryExists) {
                return res.status(404).json({
                    success: false,
                    message: 'La subcategoría no existe'
                });
            }

            if (category && subcategoryExists.category.toString() !== category) {
                return res.status(400).json({
                    success: false,
                    message: 'La subcategoría no pertenece a la categoría seleccionada'
                });
            }
        }

        // Preparar objeto de actualización
        const updateData = {};
        if (name) updateData.name = name.trim();
        if (sku) updateData.sku = sku.toUpperCase();
        if (description) updateData.description = description.trim();
        if (brand) updateData.brand = brand;
        if (price !== undefined) updateData.price = price;
        if (costPrice !== undefined) updateData.costPrice = costPrice;
        if (stock !== undefined) updateData.stock = stock;
        if (category) updateData.category = category;
        if (subcategory) updateData.subcategory = subcategory;
        if (variants !== undefined) updateData.variants = variants;
        if (images !== undefined) updateData.images = images;
        if (tags !== undefined) updateData.tags = tags;
        if (discount !== undefined) updateData.discount = discount;
        if (isAvailable !== undefined) updateData.isAvailable = isAvailable;
        if (availableDate !== undefined) updateData.availableDate = availableDate;

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        )
            .populate('category', 'name')
            .populate('subcategory', 'name');

        if (!updatedProduct) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Producto actualizado correctamente',
            data: updatedProduct
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar producto',
            error: error.message
        });
    }
};

// ==================== ELIMINAR ====================

exports.deleteProduct = async (req, res) => {
    try {
        const { hardDelete } = req.query;

        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }

        if (hardDelete === 'true') {
            // Hard delete - eliminación permanente
            await Product.findByIdAndDelete(req.params.id);

            return res.status(200).json({
                success: true,
                message: 'Producto eliminado permanentemente'
            });
        }

        // Soft delete - solo desactivar
        product.active = false;
        await product.save();

        res.status(200).json({
            success: true,
            message: 'Producto desactivado'
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar producto'
        });
    }
};
