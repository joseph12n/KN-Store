/**
 * Utilidad de Generación de Token JWT
 *
 * Genera un JSON Web Token firmado con el ID del usuario.
 * Se usa para autenticar las sesiones después del login o registro.
 *
 * @module utils/generateToken
 */

const jwt = require('jsonwebtoken');

/**
 * Genera un token JWT firmado.
 *
 * @param {string} id - El ID del usuario (_id de MongoDB)
 * @returns {string} Token JWT firmado con expiración de 30 días
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secretKey_placeholder', {
    expiresIn: '30d',
  });
};

module.exports = generateToken;
