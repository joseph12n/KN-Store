const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Autenticar usuario y conseguir token (Login)
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    // Verificamos usuario existente y validamos contraseña
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Correo o contraseña inválidos' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor al intentar iniciar sesión', error: error.message });
  }
};

// @desc    Registrar un nuevo Cliente
// @route   POST /api/users/register
// @access  Public
const registerClient = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

    // Al registrarse públicamente el rol siempre es 'Client'
    const user = await User.create({
      name,
      email,
      password,
      role: 'Client',
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Datos de usuario inválidos' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error registrando usuario', error: error.message });
  }
};

// @desc    Conseguir el perfil de usuario actual
// @route   GET /api/users/profile
// @access  Private (Requiere token, cualquier rol)
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      res.status(404).json({ message: 'Usuario no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el perfil', error: error.message });
  }
};

// @desc    Eliminar propio perfil de cuenta (Cliente)
// @route   DELETE /api/users/profile
// @access  Private (Requiere token)
const deleteProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      // Utilizamos deleteOne en lugar de remove que está deprecado en Mongoose más recientes
      await User.deleteOne({ _id: req.user._id });
      res.json({ message: 'Cuenta eliminada exitosamente' });
    } else {
      res.status(404).json({ message: 'Usuario no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al intentar eliminar la cuenta', error: error.message });
  }
};

// ----------------------------------------------------------------------
// SECCIÓN DE ADMINISTRACIÓN (Admin y Provider según corresponda)

// @desc    Obtener lista todos los usuarios
// @route   GET /api/users
// @access  Private/Admin/Provider
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error al recuperar usuarios', error: error.message });
  }
};

// @desc    Crear un nuevo usuario interinamente (Admin o Provider)
// @route   POST /api/users
// @access  Private/Admin/Provider
const createUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

    // Regla de negocio opcional: que un provider no pueda crear a un Admin?
    // Aquí implementamos algo sencillo: pueden pasar cualquier rol válido.
    // Si req.user.role === 'Provider' && role === 'Admin' rechazar (opcional)
    if (req.user.role === 'Provider' && role === 'Admin') {
      return res.status(403).json({ message: 'Los proveedores no pueden crear Administradores' });
    }

    const validRoles = ['Admin', 'Provider', 'Client'];
    const userRole = validRoles.includes(role) ? role : 'Client';

    const user = await User.create({
      name,
      email,
      password,
      role: userRole,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      res.status(400).json({ message: 'Datos de usuario inválidos' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error creando usuario', error: error.message });
  }
};

// @desc    Actualizar un usuario especifico
// @route   PUT /api/users/:id
// @access  Private/Admin/Provider
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      // Regla: Provider no puede editar o destituir un Admin.
      if (req.user.role === 'Provider' && user.role === 'Admin') {
         return res.status(403).json({ message: 'Los proveedores no pueden modificar a los Administradores' });
      }

      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.role = req.body.role || user.role;

      // Si envía pass, lo actualizamos (mongoose middleware lo encriptará)
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      });
    } else {
      res.status(404).json({ message: 'Usuario no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error actualizando al usuario', error: error.message });
  }
};

// @desc    Eliminar un usuario especifico
// @route   DELETE /api/users/:id
// @access  Private/Admin (Solo admin puede eliminar otros)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      await User.deleteOne({ _id: req.params.id });
      res.json({ message: 'Usuario eliminado del sistema exitosamente' });
    } else {
      res.status(404).json({ message: 'Usuario no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar usuario', error: error.message });
  }
};

module.exports = {
  loginUser,
  registerClient,
  getUserProfile,
  deleteProfile,
  getUsers,
  createUser,
  updateUser,
  deleteUser
};
