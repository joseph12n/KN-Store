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
const { verifyToken } = require('../middlewares/authJwt');
const { checkRole } = require('../middlewares/role');
const { validateSubcategory } = require('../middlewares/subcategoryValidator');

// Models
const Product = require('../models/Product');


// ==============================
// 📌 SUBCATEGORÍAS
// ==============================

// ✔ Crear subcategoría
router.post(
    '/',
    verifyToken,
    checkRole(['admin', 'coordinador']),
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
    verifyToken,
    checkRole(['admin', 'coordinador']),
    validateSubcategory,
    subcategoryController.updateSubcategory
);

// ✔ Eliminar (soft / hard)
router.delete(
    '/:id',
    verifyToken,
    checkRole(['admin']),
    subcategoryController.deleteSubcategory
);


// ==============================
// 📌 PRODUCTOS (relacionados)
// ==============================

/**
 * NOTA:
 * Estas rutas están aquí porque dependen de subcategorías
 */

// Validaciones básicas de producto (mejoradas)
const { check, validationResult } = require('express-validator');

const validateProduct = [
    check('name').notEmpty().withMessage('El nombre es obligatorio'),
    check('description').notEmpty().withMessage('La descripción es obligatoria'),
    check('price').isNumeric().withMessage('El precio debe ser numérico'),
    check('stock').isNumeric().withMessage('El stock debe ser numérico'),
    check('category').isMongoId().withMessage('Categoría inválida'),
    check('subcategory').isMongoId().withMessage('Subcategoría inválida'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        next();
    }
];

// ✔ Crear producto
router.post(
    '/products',
    verifyToken,
    checkRole(['admin', 'coordinador']),
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
    verifyToken,
    checkRole(['admin', 'coordinador']),
    validateProduct,
    productController.updateProduct
);

// ✔ Eliminar producto
router.delete(
    '/products/:id',
    verifyToken,
    checkRole(['admin']),
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