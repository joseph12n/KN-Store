/**
 * Validaciones para el Modelo de Subcategoría
 *
 * Utiliza express-validator para asegurar que el nombre,
 * la descripción y la referencia a la categoría existan y sean válidas.
 *
 * @module middlewares/subcategoryValidator
 */

const { check, validationResult } = require('express-validator');

// ==================== REGLAS DE VALIDACIÓN ====================

/**
 * Reglas para la creación de una subcategoría.
 */
const subcategoryChecks = [
  check('name')
    .trim()
    .notEmpty().withMessage('El nombre de la subcategoría es obligatorio')
    .isLength({ min: 2 }).withMessage('El nombre debe tener al menos 2 caracteres'),

  check('description')
    .trim()
    .notEmpty().withMessage('La descripción es obligatoria')
    .isLength({ min: 10 }).withMessage('La descripción debe tener al menos 10 caracteres'),

  check('category')
    .notEmpty().withMessage('La categoría (ID) es obligatoria')
    .isMongoId().withMessage('El ID de categoría no es válido')
];

/**
 * Reglas para la actualización de una subcategoría.
 */
const subcategoryUpdateChecks = [
  check('name')
    .optional()
    .trim()
    .notEmpty().withMessage('El nombre no puede estar vacío')
    .isLength({ min: 2 }).withMessage('El nombre debe tener al menos 2 caracteres'),

  check('description')
    .optional()
    .trim()
    .notEmpty().withMessage('La descripción no puede estar vacía')
    .isLength({ min: 10 }).withMessage('La descripción debe tener al menos 10 caracteres'),

  check('category')
    .optional()
    .isMongoId().withMessage('El ID de categoría no es válido')
];

// ==================== MANEJADOR DE ERRORES ====================

/**
 * Middleware que evalúa los resultados de express-validator.
 * @param {Object} req - Objeto de petición Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función next
 */
const validateResults = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    if (errors.array().length === 1) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
    });
  }

  next();
};

// ==================== EXPORTACIÓN ====================

module.exports = {
  validateCreateSubcategory: [
    ...subcategoryChecks,
    validateResults
  ],
  validateUpdateSubcategory: [
    ...subcategoryUpdateChecks,
    validateResults
  ]
};