/**
 * Validaciones para el Modelo de Producto
 *
 * Utiliza express-validator para comprobar exhaustivamente
 * todos los campos antes de crear o actualizar un producto.
 * Asegura la integridad de precios, stock, y referencias.
 *
 * @module middlewares/productValidator
 */

const { check, validationResult } = require('express-validator');

// ==================== REGLAS DE VALIDACIÓN ====================

/**
 * Reglas de validación para la creación de un nuevo producto.
 * Todos los campos requeridos deben estar presentes y tener el formato correcto.
 */
const productChecks = [
  check('name')
    .trim()
    .notEmpty().withMessage('El nombre del producto es obligatorio')
    .isLength({ min: 3 }).withMessage('El nombre debe tener al menos 3 caracteres'),

  check('sku')
    .trim()
    .notEmpty().withMessage('El código SKU es obligatorio'),

  check('description')
    .trim()
    .notEmpty().withMessage('La descripción es obligatoria')
    .isLength({ min: 10 }).withMessage('La descripción debe tener al menos 10 caracteres'),

  check('price')
    .isNumeric().withMessage('El precio debe ser un número')
    .isFloat({ min: 0 }).withMessage('El precio no puede ser negativo'),

  check('costPrice')
    .isNumeric().withMessage('El precio de costo debe ser un número')
    .isFloat({ min: 0 }).withMessage('El precio de costo no puede ser negativo')
    .custom((value, { req }) => {
      if (parseFloat(value) > parseFloat(req.body.price)) {
        throw new Error('El precio de costo no puede ser mayor al precio de venta');
      }
      return true;
    }),

  check('stock')
    .isInt({ min: 0 }).withMessage('El stock debe ser un número entero positivo o cero'),

  check('category')
    .notEmpty().withMessage('La categoría es obligatoria')
    .isMongoId().withMessage('El ID de categoría no es válido'),

  check('subcategory')
    .notEmpty().withMessage('La subcategoría es obligatoria')
    .isMongoId().withMessage('El ID de subcategoría no es válido'),

  // --- Opcionales ---
  check('brand')
    .optional()
    .isLength({ min: 2 }).withMessage('La marca debe tener al menos 2 caracteres'),

  check('size')
    .optional()
    .isString().withMessage('La talla/tamaño debe ser una cadena de texto'),

  check('provider')
    .optional()
    .isMongoId().withMessage('El ID del proveedor no es válido'),

  check('discount.percentage')
    .optional()
    .isInt({ min: 0, max: 100 }).withMessage('El descuento debe estar entre 0-100%'),

  check('discount.amount')
    .optional()
    .isFloat({ min: 0 }).withMessage('El monto de descuento no puede ser negativo'),

  check('discount.endDate')
    .optional()
    .isISO8601().withMessage('Formato de fecha de fin de descuento no válido')
    .custom((value, { req }) => {
      if (req.body.discount && req.body.discount.startDate && value) {
        if (new Date(value) <= new Date(req.body.discount.startDate)) {
          throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
        }
      }
      return true;
    }),

  check('variants.*.stock')
    .optional()
    .isInt({ min: 0 }).withMessage('El stock de la variante no puede ser negativo'),
];

/**
 * Reglas para la actualización de un producto.
 * Todos los campos son opcionales, pero si vienen, se validan igual.
 */
const productUpdateChecks = [
  check('name')
    .optional()
    .trim()
    .isLength({ min: 3 }).withMessage('El nombre debe tener al menos 3 caracteres'),

  check('sku')
    .optional()
    .trim()
    .notEmpty().withMessage('El código SKU no puede estar vacío'),

  check('description')
    .optional()
    .trim()
    .isLength({ min: 10 }).withMessage('La descripción debe tener al menos 10 caracteres'),

  check('price')
    .optional()
    .isFloat({ min: 0 }).withMessage('El precio no puede ser negativo'),

  check('costPrice')
    .optional()
    .isFloat({ min: 0 }).withMessage('El precio de costo no puede ser negativo'),

  check('stock')
    .optional()
    .isInt({ min: 0 }).withMessage('El stock debe ser un número entero positivo o cero'),

  check('category')
    .optional()
    .isMongoId().withMessage('El ID de categoría no es válido'),

  check('subcategory')
    .optional()
    .isMongoId().withMessage('El ID de subcategoría no es válido'),

  // --- Opcionales ---
  check('brand')
    .optional()
    .isLength({ min: 2 }).withMessage('La marca debe tener al menos 2 caracteres'),

  check('size')
    .optional()
    .isString().withMessage('La talla/tamaño debe ser una cadena de texto'),

  check('provider')
    .optional()
    .isMongoId().withMessage('El ID del proveedor no es válido'),

  check('discount.percentage')
    .optional()
    .isInt({ min: 0, max: 100 }).withMessage('El descuento debe estar entre 0-100%'),

  check('discount.amount')
    .optional()
    .isFloat({ min: 0 }).withMessage('El monto de descuento no puede ser negativo'),
];

// ==================== MANEJADOR DE ERRORES ====================

/**
 * Middleware que evalúa los resultados de express-validator.
 * Si hay errores, devuelve un JSON (400) agrupando todos los fallos.
 */
const validateResults = (req, res, next) => {
  const errors = validationResult(req);

  // Formateamos los errores para devolver un mensaje o lista clara
  if (!errors.isEmpty()) {
    // Si solo hay uno, retornamos ese mensaje directamente
    if (errors.array().length === 1) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg
      });
    }

    // Si hay varios, los devolvemos todos
    return res.status(400).json({
      success: false,
      message: 'Errores de validación en los datos provistos',
      errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
    });
  }

  next();
};

// ==================== EXPORTACIÓN ====================

module.exports = {
  validateCreateProduct: [
    ...productChecks,
    validateResults
  ],
  validateUpdateProduct: [
    ...productUpdateChecks,
    validateResults
  ]
};
