// Archivo de validación manual de datos para usuarios
// Se ejecuta antes de los controladores para garantizar la integridad de la data

const validateRegister = (req, res, next) => {
    const { name, email, password } = req.body;
    
    // 1. Validar nombre
    if (!name || name.trim().length === 0) {
        return res.status(400).json({ message: 'El nombre es obligatorio' });
    }

    // 2. Validar formato de email
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!email || !emailRegex.test(email)) {
        return res.status(400).json({ message: 'Por favor ingrese un correo válido' });
    }

    // 3. Validar longitud de contraseña
    if (!password || password.length < 6) {
        return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
    }

    next();
};

const validateLogin = (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'El correo y la contraseña son obligatorios' });
    }

    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Formato de correo inválido' });
    }

    next();
};

const validateCreateUser = (req, res, next) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Nombre, Email y Contraseña son requeridos' });
    }

    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Formato de correo inválido' });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const validRoles = ['Admin', 'Provider', 'Client'];
    if (role && !validRoles.includes(role)) {
        return res.status(400).json({ message: `El rol '${role}' no es válido` });
    }

    next();
};

const validateUpdateUser = (req, res, next) => {
    const { email, role, password } = req.body;

    if (email) {
        const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Formato de correo inválido' });
        }
    }

    if (role) {
        const validRoles = ['Admin', 'Provider', 'Client'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ message: `El rol '${role}' no es válido` });
        }
    }

    if (password && password.length < 6) {
         return res.status(400).json({ message: 'La nueva contraseña debe tener al menos 6 caracteres' });
    }

    next();
};

module.exports = {
    validateRegister,
    validateLogin,
    validateCreateUser,
    validateUpdateUser
};
