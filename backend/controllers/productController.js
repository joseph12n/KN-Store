/**
 * Controlador de Productos
 *
 * Maneja el ciclo de vida completo de un producto en el sistema,
 * además de proveer opciones de paginado, búsqueda por slug
 * o text search avanzado, y filtros condicionales.
 *
 * @module controllers/productController
 */

const Product = require('../models/Product');
const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');

// ==================== RUTAS DE LECTURA (PÚBLICAS) ====================

/**
 * Obtener productos listados (con filtrado y paginación condicional).
 * @route GET /api/products
 * @access Público
 */
const getProducts = async (req, res) => {
  try {
    // ---- 1. Configuración de paginación ----
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const skip = (page - 1) * limit;

    // Solo devolver productos activos y disponibles
    let filter = { active: true, isAvailable: true };

    // ---- 2. Búsqueda de texto (search text) ----
    if (req.query.q) {
      filter.$text = { $search: req.query.q };
    }

    // ---- 3. Filtrado por Stock ----
    if (req.query.inStock === 'true') {
      filter.stock = { $gt: 0 };
    }

    // ---- 4. Filtrado por rango de Precio ----
    if (req.query.priceMin || req.query.priceMax) {
      filter.price = {};
      if (req.query.priceMin) filter.price.$gte = Number(req.query.priceMin);
      if (req.query.priceMax) filter.price.$lte = Number(req.query.priceMax);
    }

    // ---- 5. Ordenamiento ----
    let sortObj = { createdAt: -1 };
    if (req.query.sortBy) {
      const parts = req.query.sortBy.split(':');
      sortObj[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }

    // ---- 6. Ejecución de la consulta en BD ----
    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name')
        .populate('subcategory', 'name')
        .populate('provider', 'name email')
        .sort(sortObj)
        .limit(limit)
        .skip(skip),
      Product.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      pagination: {
        page,
        limit,
        total,
        pages: totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      data: products,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al listar los productos', error: error.message });
  }
};

/**
 * Obtener un producto específico por su ObjectID.
 * @route GET /api/products/:id
 * @access Público
 */
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name')
      .populate('subcategory', 'name')
      .populate('provider', 'name email');

    if (!product || !product.active) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado o no disponible' });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ success: false, message: 'El ID del producto no es válido' });
    }
    res.status(500).json({ success: false, message: 'Error interno en el servidor', error: error.message });
  }
};

/**
 * Obtener un producto mediante un slug (URL human friendly).
 * @route GET /api/products/slug/:slug
 * @access Público
 */
const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, active: true })
      .populate('category', 'name')
      .populate('subcategory', 'name')
      .populate('provider', 'name email');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Producto inexistente' });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error procesando la solicitud', error: error.message });
  }
};

// ==================== RUTAS DE FILTRADO RELACIONAL ====================

/**
 * Reutiliza código común para retornar resultados filtrados por propiedad.
 */
const getProductsByProperty = async (propertyObj, res) => {
  try {
    const products = await Product.find({ ...propertyObj, active: true, isAvailable: true })
      .populate('category', 'name')
      .populate('subcategory', 'name');

    res.status(200).json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al procesar filtrado', error: error.message });
  }
};

/**
 * Extraer todos los productos adjuntos a una Categoría.
 * @route GET /api/products/category/:categoryId
 */
const getProductsByCategory = (req, res) => getProductsByProperty({ category: req.params.categoryId }, res);

/**
 * Extraer todos los productos adjuntos a una Subcategoría.
 * @route GET /api/products/subcategory/:subcategoryId
 */
const getProductsBySubcategory = (req, res) => getProductsByProperty({ subcategory: req.params.subcategoryId }, res);

/**
 * Extraer todos los productos pertenecientes a una misma Marca.
 * @route GET /api/products/brand/:brand
 */
const getProductsByBrand = (req, res) => getProductsByProperty({ brand: req.params.brand }, res);

/**
 * Extraer todos los productos de una etiqueta especial.
 * @route GET /api/products/tags/:tag
 */
const getProductsByTag = (req, res) => getProductsByProperty({ tags: req.params.tag }, res);


// ==================== RUTAS DE ADMINISTRACIÓN (ESCRITURA) ====================

/**
 * Registra y almacena un nuevo producto.
 * @route POST /api/products
 * @access Privado (Admin / Provider)
 */
const createProduct = async (req, res) => {
  try {
    const { 
      name, sku, description, brand, size, price, costPrice, stock, 
      category, subcategory, provider, variants, 
      images, tags, discount, isAvailable, availableDate 
    } = req.body;

    // Verificar que la categoría y la subcategoría designadas existan
    const [catExists, subExists] = await Promise.all([
      Category.findById(category),
      Subcategory.findById(subcategory)
    ]);

    if (!catExists) return res.status(404).json({ success: false, message: 'La categoría no existe en el sistema' });
    if (!subExists) return res.status(404).json({ success: false, message: 'La subcategoría referenciada no existe' });

    const newProduct = new Product({
      name: name.trim(),
      sku: sku.toUpperCase(),
      description: description.trim(),
      brand,
      size,
      price,
      costPrice,
      stock,
      category,
      subcategory,
      provider,
      variants: variants || [],
      images: images || [],
      tags: tags || [],
      discount: discount || {},
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      availableDate
    });

    await newProduct.save();

    await newProduct.populate('category', 'name');
    await newProduct.populate('subcategory', 'name');
    await newProduct.populate('provider', 'name email');

    res.status(201).json({ success: true, data: newProduct, message: 'Producto creado exitosamente' });
  } catch (error) {
    if (error.message.includes('ya existe en la base de datos')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: 'Error interno en el servidor', error: error.message });
  }
};

/**
 * Parchea o modifica los detalles de un producto.
 * @route PUT /api/products/:id
 * @access Privado (Admin / Provider)
 */
const updateProduct = async (req, res) => {
  try {
    const { 
      name, sku, description, brand, size, price, costPrice, stock, 
      category, subcategory, provider, variants, images, tags, discount, 
      isAvailable, availableDate 
    } = req.body;

    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) return res.status(404).json({ success: false, message: 'La categoría especificada no existe' });
    }

    if (subcategory) {
      const subcategoryExists = await Subcategory.findById(subcategory);
      if (!subcategoryExists) return res.status(404).json({ success: false, message: 'La subcategoría especificada no existe' });
    }

    // Construimos un parche dinámico para evitar sobreescritura vacía
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (sku) updateData.sku = sku.toUpperCase();
    if (description) updateData.description = description.trim();
    if (brand) updateData.brand = brand;
    if (size !== undefined) updateData.size = size;
    if (price !== undefined) updateData.price = price;
    if (costPrice !== undefined) updateData.costPrice = costPrice;
    if (stock !== undefined) updateData.stock = stock;
    if (category) updateData.category = category;
    if (subcategory) updateData.subcategory = subcategory;
    if (provider !== undefined) updateData.provider = provider;
    if (variants !== undefined) updateData.variants = variants;
    if (images !== undefined) updateData.images = images;
    if (tags !== undefined) updateData.tags = tags;
    if (discount !== undefined) updateData.discount = discount;
    if (isAvailable !== undefined) updateData.isAvailable = isAvailable;
    if (availableDate !== undefined) updateData.availableDate = availableDate;

    // Ejecutamos la actualización validando integridades
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true, runValidators: true }
    )
    .populate('category', 'name')
    .populate('subcategory', 'name')
    .populate('provider', 'name email');

    if (!updatedProduct) return res.status(404).json({ success: false, message: 'Producto no encontrado' });

    res.status(200).json({ success: true, data: updatedProduct, message: 'Producto actualizado exitosamente' });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ success: false, message: 'Ya existe un producto con ese nombre o SKU' });
    res.status(500).json({ success: false, message: 'Error interno en el servidor', error: error.message });
  }
};

/**
 * Elimina un producto con flujo de dos pasos:
 *   1. DELETE /api/products/:id           → desactiva (soft delete, active = false)
 *   2. DELETE /api/products/:id?hardDelete=true → elimina permanentemente (solo si ya inactivo)
 *
 * @route DELETE /api/products/:id
 * @access Privado (Admin Only)
 */
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }

    if (req.query.hardDelete === 'true') {
      // Guardia: el producto debe estar previamente desactivado
      if (product.active) {
        return res.status(400).json({
          success: false,
          message: 'Debes desactivar el producto antes de eliminarlo permanentemente',
        });
      }
      await product.deleteOne();
      return res.status(200).json({ success: true, message: 'Producto eliminado permanentemente' });
    }

    // Paso 1 — Soft delete: desactivar producto
    product.active = false;
    await product.save();

    res.status(200).json({ success: true, message: 'Producto desactivado correctamente' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error interno en el servidor', error: error.message });
  }
};

// ==================== EXPORTACIÓN ====================

module.exports = {
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
};
