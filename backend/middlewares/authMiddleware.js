const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware para verificar que haya un token válido y autenticar al usuario
const protect = async (req, res, next) => {
  let token;

  // Verificamos si existe el header Authorization y comienza con 'Bearer'
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Obtenemos el token (ej. "Bearer eyJhbGci...")
      token = req.headers.authorization.split(' ')[1];

      // Decodificamos y verificamos el token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretKey_placeholder');

      // Buscamos al usuario en la BD descartando la contraseña y lo añadimos a 'req'
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'No autorizado, usuario no encontrado' });
      }

      next();
    } catch (error) {
      console.error('Error de token:', error);
      res.status(401).json({ message: 'No autorizado, token fallido o expirado' });
    }
  }

  // Si después de la lógica no hemos extraído el token
  if (!token) {
    res.status(401).json({ message: 'No autorizado, sin token' });
  }
};

// Middleware para autorizar acceso basado en roles pasados como argumento
// Uso: authorizeRoles('Admin', 'Provider')
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // req.user debió haber sido seteado previamente por el middleware `protect`
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Acceso denegado. El rol '${req.user ? req.user.role : 'desconocido'}' no está autorizado para esta ruta.` 
      });
    }
    next();
  };
};

module.exports = { protect, authorizeRoles };
