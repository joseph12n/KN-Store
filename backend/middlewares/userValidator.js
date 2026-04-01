/**
 * Validaciones para el Modelo de Usuario
 *
 * Middlewares manuales para validar la completitud e integridad de los datos
 * antes de que lleguen a los controladores de usuarios.
 * Intercepta peticiones inválidas y retorna errores 400.
 *
 * @module middlewares/userValidator
 */

/**
 * Valida los datos requeridos para iniciar sesión.
 */
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Por favor ingrese correo y contraseña' });
  }

  next();
};

/**
 * Valida los datos requeridos para registrar un nuevo cliente (ruta pública).
 */
const validateRegister = (req, res, next) => {
  const { name, last_name, email, password } = req.body;

  // 1. Validar nombre
  if (!name || name.trim().length === 0) {
    return res.status(400).json({ success: false, message: 'El nombre es obligatorio' });
  }

  // 2. Validar apellido
  if (!last_name || last_name.trim().length === 0) {
    return res.status(400).json({ success: false, message: 'El apellido es obligatorio' });
  }

  // 3. Validar formato de email
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: 'Por favor ingrese un correo válido' });
  }

  // 4. Validar longitud de contraseña
  if (!password || password.length < 6) {
    return res.status(400).json({ success: false, message: 'La contraseña debe tener al menos 6 caracteres' });
  }

  next();
};

/**
 * Valida los datos requeridos para crear un usuario (ruta privada por Admin).
 * Permite especificar el rol.
 */
const validateCreateUser = (req, res, next) => {
  const { name, last_name, email, password, role } = req.body;

  if (!name || !last_name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Nombre, Apellido, Email y Contraseña son requeridos' });
  }

  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: 'Formato de correo inválido' });
  }

  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'La contraseña debe tener al menos 6 caracteres' });
  }

  const validRoles = ['Admin', 'Manager', 'Client', 'Provider'];
  if (role && !validRoles.includes(role)) {
    return res.status(400).json({ success: false, message: `El rol '${role}' no es válido` });
  }

  next();
};

/**
 * Valida los datos al actualizar un usuario.
 * Todos los campos son opcionales durante la actualización.
 */
const validateUpdateUser = (req, res, next) => {
  const { email, role, password, last_name } = req.body;

  if (email) {
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Formato de correo inválido' });
    }
  }

  if (last_name !== undefined && last_name.trim().length === 0) {
    return res.status(400).json({ success: false, message: 'El apellido no puede estar vacío' });
  }

  if (role) {
    const validRoles = ['Admin', 'Manager', 'Client', 'Provider'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: `El rol '${role}' no es válido` });
    }
  }

  if (password && password.length < 6) {
    return res.status(400).json({ success: false, message: 'La nueva contraseña debe tener al menos 6 caracteres' });
  }

  next();
};

module.exports = {
  validateLogin,
  validateRegister,
  validateCreateUser,
  validateUpdateUser
};
