/**
 * Rutas de Usuarios
 *
 * Define los endpoints para registro, autenticación y gestión 
 * de perfiles y usuarios. Implementa middleware de validación pre-controlador
 * y middleware de protección/roles.
 *
 * @module routes/userRoutes
 */

const express = require('express');
const router = express.Router();

// ==================== CONTROLADORES ====================
const {
  loginUser,
  registerClient,
  logoutUser,
  getUserProfile,
  deleteProfile,
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
} = require('../controllers/userController');

// ==================== MIDDLEWARES ====================
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');
const {
  validateRegister,
  validateLogin,
  validateCreateUser,
  validateUpdateUser,
} = require('../middlewares/userValidator');

// ==================== RUTAS PÚBLICAS ====================
router.post('/login', validateLogin, loginUser);
router.post('/register', validateRegister, registerClient);

// --- Recuperación de contraseña y verificación de correo ---
router.post('/password-reset-request', requestPasswordReset);
router.post('/reset-password/:token', resetPassword);
router.get('/verify-email/:token', verifyEmail);

// ==================== RUTAS PRIVADAS (Requieren Autenticación) ====================

// --- Manejo de la sesión actual ---
router.post('/logout', protect, logoutUser);

// --- Perfil propio ---
router.route('/profile')
  .get(protect, getUserProfile)
  .delete(protect, deleteProfile);

// ==================== RUTAS DE ADMINISTRACIÓN (Requerido: Admin) ====================

// Aplicar protección y verificación a todas las rutas debajo
router.use(protect);
router.use(authorizeRoles('Admin'));

router.route('/')
  .get(getUsers)
  .post(validateCreateUser, createUser);

router.route('/:id')
  .get(getUserById)
  .put(validateUpdateUser, updateUser)
  .delete(deleteUser);

// ==================== EXPORTACIÓN ====================
module.exports = router;
