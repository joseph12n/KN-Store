/**
 * Controlador de Usuarios
 *
 * Se encarga de la lógica de negocio para:
 * - Autenticación (Login, Registro, Logout)
 * - Gestión de perfiles (Consultar, Eliminar cuenta propia)
 * - Administración de usuarios (CRUD por parte de Admin)
 *
 * @module controllers/userController
 */

const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// ==================== RUTAS PÚBLICAS ====================

/**
 * Autentica un usuario y genera un token JWT.
 * @route POST /api/users/login
 * @access Público
 */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Verificar si el usuario existe (buscando por email e incluyendo el password para comparar)
    const user = await User.findOne({ email }).select('+password');

    // Credenciales inválidas
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Correo o contraseña incorrectos' });
    }

    // Cuenta desactivada (soft delete aplicado por admin)
    if (!user.active) {
      return res.status(401).json({ success: false, message: 'Esta cuenta ha sido desactivada' });
    }

    // El método .toJSON del modelo elimina el password antes de enviarlo
    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      },
      message: 'Autenticación exitosa',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en el servidor', error: error.message });
  }
};

/**
 * Cierra la sesión del usuario.
 * @route POST /api/users/logout
 * @access Privado
 */
const logoutUser = async (req, res) => {
  try {
    // Al usar JWT stateless, el servidor no puede invalidar el token activamente.
    // El cliente debe borrar el token de su almacenamiento (localStorage/Cookies).
    // Aquí podemos realizar limpieza o registrar auditoría si es necesario.
    res.status(200).json({
      success: true,
      message: 'Sesión cerrada exitosamente',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al cerrar sesión', error: error.message });
  }
};

/**
 * Registra un nuevo usuario con rol de Cliente.
 * @route POST /api/users/register
 * @access Público
 */
const registerClient = async (req, res) => {
  try {
    const { name, last_name, email, password } = req.body;

    // Verificar si el usuario ya existe
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ success: false, message: 'El usuario ya está registrado' });
    }

    // Crear el usuario con rol de Client por defecto
    const user = await User.create({
      name,
      last_name,
      email,
      password,
      role: 'Client',
    });

    if (user) {
      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          last_name: user.last_name,
          email: user.email,
          role: user.role,
          token: generateToken(user._id),
        },
        message: 'Usuario registrado exitosamente',
      });
    } else {
      res.status(400).json({ success: false, message: 'Datos de usuario inválidos' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en el servidor', error: error.message });
  }
};

// ==================== RUTAS DE PERFIL (CUALQUIER ROL) ====================

/**
 * Obtiene el perfil del usuario autenticado.
 * @route GET /api/users/profile
 * @access Privado
 */
const getUserProfile = async (req, res) => {
  try {
    // req.user viene del middleware protect (ya comprobado y sin password)
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        success: true,
        data: user,
      });
    } else {
      res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en el servidor', error: error.message });
  }
};

/**
 * Permite a cualquier usuario eliminar su propio perfil.
 * @route DELETE /api/users/profile
 * @access Privado
 */
const deleteProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      await User.deleteOne({ _id: req.user._id });
      res.json({ success: true, message: 'Cuenta eliminada exitosamente' });
    } else {
      res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al eliminar cuenta', error: error.message });
  }
};

// ==================== RUTAS DE ADMINISTRACIÓN (ADMIN ONLY) ====================

/**
 * Obtiene un usuario específico por su ID de MongoDB.
 * Útil para vistas de detalle en el panel de administración.
 * @route GET /api/users/:id
 * @access Privado (Solo Admin)
 */
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      res.json({
        success: true,
        data: user,
      });
    } else {
      res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
  } catch (error) {
    // CastError ocurre si el ID no tiene el formato válido de ObjectId de MongoDB
    if (error.name === 'CastError') {
      return res.status(404).json({ success: false, message: 'El ID de usuario no es válido' });
    }
    res.status(500).json({ success: false, message: 'Error en el servidor', error: error.message });
  }
};

/**
 * Obtiene todos los usuarios del sistema.
 * @route GET /api/users
 * @access Privado (Solo Admin)
 */
const getUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en el servidor', error: error.message });
  }
};

/**
 * Crea un usuario asignándole un rol específico.
 * @route POST /api/users
 * @access Privado (Solo Admin)
 */
const createUser = async (req, res) => {
  try {
    const { name, last_name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ success: false, message: 'El usuario ya existe' });
    }

    const user = await User.create({
      name,
      last_name,
      email,
      password,
      role: role || 'Client', // Por si no se envía rol
    });

    if (user) {
      res.status(201).json({
        success: true,
        data: user, // Retornamos sin token, es creación administrativa
        message: 'Usuario creado exitosamente',
      });
    } else {
      res.status(400).json({ success: false, message: 'Datos de usuario inválidos' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en el servidor', error: error.message });
  }
};

/**
 * Actualiza la información y/o rol de un usuario existente.
 * @route PUT /api/users/:id
 * @access Privado (Solo Admin)
 */
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.name = req.body.name || user.name;
      user.last_name = req.body.last_name !== undefined ? req.body.last_name : user.last_name;
      user.email = req.body.email || user.email;
      user.role = req.body.role || user.role;

      // Actualizar la contraseña solo si se envía una nueva
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        success: true,
        data: updatedUser,
        message: 'Usuario actualizado exitosamente',
      });
    } else {
      res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en el servidor', error: error.message });
  }
};

/**
 * Elimina un usuario con flujo de dos pasos:
 *   1. DELETE /api/users/:id           → desactiva (soft delete, active = false)
 *   2. DELETE /api/users/:id?hardDelete=true → elimina permanentemente (solo si ya inactivo)
 *
 * @route DELETE /api/users/:id
 * @access Privado (Solo Admin)
 */
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    // Evitar que el admin se borre a sí mismo
    if (user._id.equals(req.user._id)) {
      return res.status(400).json({ success: false, message: 'No puedes eliminar tu propia cuenta de administrador' });
    }

    if (req.query.hardDelete === 'true') {
      // Guardia: el usuario debe estar previamente desactivado
      if (user.active) {
        return res.status(400).json({
          success: false,
          message: 'Debes desactivar el usuario antes de eliminarlo permanentemente',
        });
      }
      await User.deleteOne({ _id: user._id });
      return res.json({ success: true, message: 'Usuario eliminado permanentemente' });
    }

    // Paso 1 — Soft delete: desactivar cuenta
    user.active = false;
    await user.save();

    res.json({ success: true, message: 'Usuario desactivado exitosamente' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en el servidor', error: error.message });
  }
};

// ==================== EXPORTACIÓN ====================

module.exports = {
  loginUser,
  logoutUser,
  registerClient,
  getUserProfile,
  deleteProfile,
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
