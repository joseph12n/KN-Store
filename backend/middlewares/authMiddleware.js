/**
 * Middleware de Autenticación y Autorización
 *
 * Provee funciones para proteger rutas verificando tokens JWT
 * y autorizar el acceso basado en los roles del usuario.
 *
 * @module middlewares/authMiddleware
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware para proteger rutas.
 * Verifica la existencia y validez del token JWT enviado en el header Authorization.
 * Si es válido, inyecta el usuario (sin contraseña) en req.user y continúa.
 *
 * @param {Object} req - Objeto de petición de Express
 * @param {Object} res - Objeto de respuesta de Express
 * @param {Function} next - Función para pasar al siguiente middleware/controlador
 */
const protect = async (req, res, next) => {
  let token;

  // Verificar si el token viene en los headers con el prefijo Bearer
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extraer el token (Bearer [token])
      token = req.headers.authorization.split(' ')[1];

      // Decodificar y verificar el token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretKey_placeholder');

      // Buscar al usuario en la BD (excluyendo el password)
      req.user = await User.findById(decoded.id).select('-password');

      // Si el usuario ya no existe, rechazar
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'El usuario asociado al token ya no existe' });
      }

      next();
    } catch (error) {
      console.error('Error verificando token:', error.message);
      return res.status(401).json({ success: false, message: 'No autorizado, token falló' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'No autorizado, no hay token' });
  }
};

/**
 * Middleware para autorizar roles específicos.
 * Comprueba si el rol del usuario autenticado (req.user) está en la lista de roles permitidos.
 * Debe ejecutarse DESPUÉS del middleware "protect".
 *
 * @param {...string} roles - Lista de roles permitidos (ej: 'Admin', 'Provider')
 * @returns {Function} Middleware de Express
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // Verificar que haya un usuario autenticado
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'No autorizado, autenticación requerida' });
    }

    // Verificar si el rol del usuario está incluido en los permitidos
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `El rol '${req.user.role}' no tiene permiso para acceder a este recurso`
      });
    }

    next();
  };
};

module.exports = {
  protect,
  authorizeRoles
};
