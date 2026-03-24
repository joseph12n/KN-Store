const { check, validationResult } = require('express-validator');

/**
 * Middleware de validación para Productos
 *
 * Valida los datos antes de que lleguen al controlador
 */

exports.validateProduct = [

    // Nombre
    check('name')
        .notEmpty()
        .withMessage('El nombre del producto es obligatorio')
        .isLength({ min: 3 })
        .withMessage('El nombre debe tener al menos 3 caracteres'),

    // SKU
    check('sku')
        .notEmpty()
        .withMessage('El SKU es obligatorio')
        .matches(/^[A-Z0-9-]+$/)
        .withMessage('El SKU solo puede contener letras mayúsculas, números y guiones'),

    // Descripción
    check('description')
        .notEmpty()
        .withMessage('La descripción es obligatoria')
        .isLength({ min: 10 })
        .withMessage('La descripción debe tener al menos 10 caracteres'),

    // Precio
    check('price')
        .notEmpty()
        .withMessage('El precio es obligatorio')
        .isFloat({ min: 0.01 })
        .withMessage('El precio debe ser un número mayor a 0'),

    // Precio de costo
    check('costPrice')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('El precio de costo debe ser un número válido'),

    // Stock
    check('stock')
        .notEmpty()
        .withMessage('El stock es obligatorio')
        .isInt({ min: 0 })
        .withMessage('El stock debe ser un número entero >= 0'),

    // Categoría
    check('category')
        .notEmpty()
        .withMessage('La categoría es obligatoria')
        .isMongoId()
        .withMessage('El ID de la categoría no es válido'),

    // Subcategoría
    check('subcategory')
        .notEmpty()
        .withMessage('La subcategoría es obligatoria')
        .isMongoId()
        .withMessage('El ID de la subcategoría no es válido'),

    // Brand (opcional)
    check('brand')
        .optional()
        .isLength({ min: 2 })
        .withMessage('La marca debe tener al menos 2 caracteres'),

    // Descuento
    check('discount.percentage')
        .optional()
        .isInt({ min: 0, max: 100 })
        .withMessage('El descuento debe estar entre 0-100%'),

    check('discount.amount')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('El monto de descuento debe ser válido'),

    // Disponibilidad
    check('isAvailable')
        .optional()
        .isBoolean()
        .withMessage('isAvailable debe ser true o false'),

    (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Errores de validación',
                errors: errors.array()
            });
        }

        next();
    }
];

// Validación para actualización (todos opcionales)
exports.validateProductUpdate = [
    check('name')
        .optional()
        .isLength({ min: 3 })
        .withMessage('El nombre debe tener al menos 3 caracteres'),

    check('sku')
        .optional()
        .matches(/^[A-Z0-9-]+$/)
        .withMessage('El SKU solo puede contener letras mayúsculas, números y guiones'),

    check('description')
        .optional()
        .isLength({ min: 10 })
        .withMessage('La descripción debe tener al menos 10 caracteres'),

    check('price')
        .optional()
        .isFloat({ min: 0.01 })
        .withMessage('El precio debe ser un número mayor a 0'),

    check('costPrice')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('El precio de costo debe ser un número válido'),

    check('stock')
        .optional()
        .isInt({ min: 0 })
        .withMessage('El stock debe ser un número entero >= 0'),

    check('category')
        .optional()
        .isMongoId()
        .withMessage('El ID de la categoría no es válido'),

    check('subcategory')
        .optional()
        .isMongoId()
        .withMessage('El ID de la subcategoría no es válido'),

    check('brand')
        .optional()
        .isLength({ min: 2 })
        .withMessage('La marca debe tener al menos 2 caracteres'),

    check('discount.percentage')
        .optional()
        .isInt({ min: 0, max: 100 })
        .withMessage('El descuento debe estar entre 0-100%'),

    check('discount.amount')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('El monto de descuento debe ser válido'),

    check('isAvailable')
        .optional()
        .isBoolean()
        .withMessage('isAvailable debe ser true o false'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Errores de validación',
                errors: errors.array()
            });
        }
        next();
    }
];

