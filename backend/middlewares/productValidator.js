const { check, validationResult } = require('express-validator');

/**
 * Middleware de validación para Productos
 *
 * Usa el patrón .run(req) recomendado por express-validator v7
 * para compatibilidad con Express 5.
 */

const productChecks = [
    check('name')
        .notEmpty().withMessage('El nombre del producto es obligatorio')
        .isLength({ min: 3 }).withMessage('El nombre debe tener al menos 3 caracteres'),

    check('sku')
        .notEmpty().withMessage('El SKU es obligatorio')
        .matches(/^[A-Z0-9-]+$/).withMessage('El SKU solo puede contener letras mayúsculas, números y guiones'),

    check('description')
        .notEmpty().withMessage('La descripción es obligatoria')
        .isLength({ min: 10 }).withMessage('La descripción debe tener al menos 10 caracteres'),

    check('price')
        .notEmpty().withMessage('El precio es obligatorio')
        .isFloat({ min: 0.01 }).withMessage('El precio debe ser un número mayor a 0'),

    check('costPrice')
        .optional()
        .isFloat({ min: 0 }).withMessage('El precio de costo debe ser un número válido'),

    check('stock')
        .notEmpty().withMessage('El stock es obligatorio')
        .isInt({ min: 0 }).withMessage('El stock debe ser un número entero >= 0'),

    check('category')
        .notEmpty().withMessage('La categoría es obligatoria')
        .isMongoId().withMessage('El ID de la categoría no es válido'),

    check('subcategory')
        .notEmpty().withMessage('La subcategoría es obligatoria')
        .isMongoId().withMessage('El ID de la subcategoría no es válido'),

    check('brand')
        .optional()
        .isLength({ min: 2 }).withMessage('La marca debe tener al menos 2 caracteres'),

    check('discount.percentage')
        .optional()
        .isInt({ min: 0, max: 100 }).withMessage('El descuento debe estar entre 0-100%'),

    check('discount.amount')
        .optional()
        .isFloat({ min: 0 }).withMessage('El monto de descuento debe ser válido'),

    check('isAvailable')
        .optional()
        .isBoolean().withMessage('isAvailable debe ser true o false'),
];

const productUpdateChecks = [
    check('name')
        .optional()
        .isLength({ min: 3 }).withMessage('El nombre debe tener al menos 3 caracteres'),

    check('sku')
        .optional()
        .matches(/^[A-Z0-9-]+$/).withMessage('El SKU solo puede contener letras mayúsculas, números y guiones'),

    check('description')
        .optional()
        .isLength({ min: 10 }).withMessage('La descripción debe tener al menos 10 caracteres'),

    check('price')
        .optional()
        .isFloat({ min: 0.01 }).withMessage('El precio debe ser un número mayor a 0'),

    check('costPrice')
        .optional()
        .isFloat({ min: 0 }).withMessage('El precio de costo debe ser un número válido'),

    check('stock')
        .optional()
        .isInt({ min: 0 }).withMessage('El stock debe ser un número entero >= 0'),

    check('category')
        .optional()
        .isMongoId().withMessage('El ID de la categoría no es válido'),

    check('subcategory')
        .optional()
        .isMongoId().withMessage('El ID de la subcategoría no es válido'),

    check('brand')
        .optional()
        .isLength({ min: 2 }).withMessage('La marca debe tener al menos 2 caracteres'),

    check('discount.percentage')
        .optional()
        .isInt({ min: 0, max: 100 }).withMessage('El descuento debe estar entre 0-100%'),

    check('discount.amount')
        .optional()
        .isFloat({ min: 0 }).withMessage('El monto de descuento debe ser válido'),

    check('isAvailable')
        .optional()
        .isBoolean().withMessage('isAvailable debe ser true o false'),
];

exports.validateProduct = async (req, res, next) => {
    await Promise.all(productChecks.map(v => v.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Errores de validación',
            errors: errors.array()
        });
    }

    next();
};

exports.validateProductUpdate = async (req, res, next) => {
    await Promise.all(productUpdateChecks.map(v => v.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Errores de validación',
            errors: errors.array()
        });
    }

    next();
};
