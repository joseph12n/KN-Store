const jwt = require('jsonwebtoken');

// Función para generar o firmar el Token JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secretKey_placeholder', {
    expiresIn: '30d',
  });
};

module.exports = generateToken;
