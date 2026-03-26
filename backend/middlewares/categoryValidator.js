/**
 * Validaciones para el Modelo de Categoría
 *
 * Constata los datos obligatorios antes de permitir
 * la creación de nuevas categorías.
 *
 * @module middlewares/categoryValidator
 */

/**
 * Valida los datos requeridos para crear una categoría.
 * Solo exige que se proporcione el nombre.
 */
const validateCreateCategory = (req, res, next) => {
  const { name } = req.body;

  // 1. Validar nombre de la categoría
  if (!name || name.trim().length === 0) {
    return res.status(400).json({ success: false, message: 'El nombre de la categoría es obligatorio' });
  }

  // La descripción es opcional, así que permitimos que pase
  next();
};

module.exports = {
  validateCreateCategory
};
