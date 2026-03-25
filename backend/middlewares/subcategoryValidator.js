const { check, validationResult } = require('express-validator');

/**
 * Middleware de validación para Subcategorías
 * 
 * ¿Para qué sirve?
 * ✔ Validar los datos antes de que lleguen al controlador
 * ✔ Evitar datos incorrectos en la base de datos
 * ✔ Mejorar seguridad y consistencia del sistema
 */

exports.validateSubcategory = [

    /**
     * VALIDAR NOMBRE
     * - No puede estar vacío
     * - Debe tener mínimo 3 caracteres
     */
    check('name')
        .notEmpty()
        .withMessage('El nombre de la subcategoría es obligatorio')

        .isLength({ min: 3 })
        .withMessage('El nombre debe tener al menos 3 caracteres'),

    /**
     * VALIDAR DESCRIPCIÓN
     * - No puede estar vacía
     * - Debe ser más descriptiva (mínimo 5 caracteres)
     */
    check('description')
        .notEmpty()
        .withMessage('La descripción es obligatoria')

        .isLength({ min: 5 })
        .withMessage('La descripción debe tener al menos 5 caracteres'),

    /**
     * VALIDAR CATEGORÍA
     * - No puede estar vacía
     * - Debe ser un ID válido de MongoDB
     */
    check('category')
        .notEmpty()
        .withMessage('Debes seleccionar una categoría')

        .isMongoId()
        .withMessage('El ID de la categoría no es válido'),

    /**
     * VALIDACIÓN FINAL
     * - Revisa si hubo errores en los campos anteriores
     * - Si hay errores, detiene la petición
     */
    (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Errores de validación',
                errors: errors.array()
            });
        }

        // Si todo está bien, continúa al controlador
        next();
    }
];

// Validación para actualización partial (puede incluir sólo uno o varios campos)
exports.validateSubcategoryUpdate = [
    check('name')
        .optional()
        .isLength({ min: 3 })
        .withMessage('El nombre debe tener al menos 3 caracteres'),

    check('description')
        .optional()
        .isLength({ min: 5 })
        .withMessage('La descripción debe tener al menos 5 caracteres'),

    check('category')
        .optional()
        .isMongoId()
        .withMessage('El ID de la categoría no es válido'),

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