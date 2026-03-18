const express = require('express');
const router = express.Router();

const {
  loginUser,
  registerClient,
  getUserProfile,
  deleteProfile,
  getUsers,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/userController');

const { protect, authorizeRoles } = require('../middlewares/authMiddleware');
const {
  validateRegister,
  validateLogin,
  validateCreateUser,
  validateUpdateUser
} = require('../middlewares/userValidator');

// ==========================================
// RUTAS PÚBLICAS
// ==========================================
router.post('/login', validateLogin, loginUser);
router.post('/register', validateRegister, registerClient);

// ==========================================
// RUTAS PRIVADAS (Requieren Token)
// ==========================================

// --- Perfil propio (Cualquier rol - Especialmente Cliente) ---
router.route('/profile')
  .get(protect, getUserProfile)
  .delete(protect, deleteProfile);

// --- Rutas de Administración ---
// Obtener todos y crear usuario interno (Admins y Providers)
router.route('/')
  .get(protect, authorizeRoles('Admin', 'Provider'), getUsers)
  .post(protect, authorizeRoles('Admin', 'Provider'), validateCreateUser, createUser);

// Actualizar usuario específico
router.route('/:id')
  .put(protect, authorizeRoles('Admin', 'Provider'), validateUpdateUser, updateUser)
  // Eliminar usuario específico (Solo Admin)
  .delete(protect, authorizeRoles('Admin'), deleteUser);

module.exports = router;
