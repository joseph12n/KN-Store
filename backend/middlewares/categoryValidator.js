// Archivo de validación manual de datos para categorías
// Se ejecuta antes de los controladores para garantizar la integridad de la data

const validateCreateCategory = (req, res, next) => {
  const { name } = req.body;

  // Validar que name esté presente y no esté vacío
  if (!name || name.trim().length === 0) {
    return res.status(400).json({ message: 'El nombre de la categoría es obligatorio' });
  }

  next();
};

const validateUpdateCategory = (req, res, next) => {
  const { name } = req.body;

  // Si se envía name, validar que no esté vacío
  if (name !== undefined && name.trim().length === 0) {
    return res.status(400).json({ message: 'El nombre de la categoría no puede estar vacío' });
  }

  next();
};

module.exports = {
  validateCreateCategory,
  validateUpdateCategory,
};
