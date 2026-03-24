/**
 * Rutas de Subcategorías
 * 
 * Maneja endpoints CRUD para subcategorías
 * Relación:
 * - Una subcategoría pertenece a una categoría
 * - Una subcategoría puede tener varios productos
 */

const express = require('express');
const router = express.Router();

// Controllers
const subcategoryController = require('../controllers/subcategoryController');
const productController = require('../controllers/productController');

// Middlewares
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');
const { validateSubcategory, validateSubcategoryUpdate } = require('../middlewares/subcategoryValidator');
const { validateProduct } = require('../middlewares/productValidator');

// Models
const Product = require('../models/Product');


// ==============================
// 📌 SUBCATEGORÍAS
// ==============================

// ✔ Crear subcategoría
router.post(
    '/',
    protect,
    authorizeRoles('Admin','Provider'),
    validateSubcategory,
    subcategoryController.createSubcategory
);

// ✔ Obtener todas
router.get('/', subcategoryController.getSubcategories);

// ✔ Obtener por ID
router.get('/:id', subcategoryController.getSubcategoryById);

// ✔ Actualizar
router.put(
    '/:id',
    protect,
    authorizeRoles('Admin','Provider'),
    validateSubcategoryUpdate,
    subcategoryController.updateSubcategory
);

// ✔ Eliminar (soft / hard)
router.delete(
    '/:id',
    protect,
    authorizeRoles('Admin'),
    subcategoryController.deleteSubcategory
);


// ==============================
// 📌 PRODUCTOS (relacionados)
// ==============================

/**
 * NOTA:
 * Estas rutas están aquí porque dependen de subcategorías
 */

// ✔ Crear producto
router.post(
    '/products',
    protect,
    authorizeRoles(['admin', 'coordinador']),
    validateProduct,
    productController.createProduct
);

// ✔ Listar productos
router.get('/products', productController.getProducts);

// ✔ Obtener producto por ID
router.get('/products/:id', productController.getProductById);

// ✔ Actualizar producto
router.put(
    '/products/:id',
    protect,
    authorizeRoles(['admin', 'coordinador']),
    validateProduct,
    productController.updateProduct
);

// ✔ Eliminar producto
router.delete(
    '/products/:id',
    protect,
    authorizeRoles(['admin']),
    productController.deleteProduct
);

// ✔ Obtener productos por subcategoría
router.get('/:id/products', async (req, res) => {
    try {
        const products = await Product.find({ subcategory: req.params.id })
            .populate('category', 'name')
            .populate('subcategory', 'name');

        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener productos de la subcategoría'
        });
    }
});

module.exports = router;