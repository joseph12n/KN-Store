/**
 * Modelo de Usuario
 *
 * Define el esquema de usuarios del sistema con los roles:
 * Admin, Manager y Client. Incluye encriptación automática
 * de contraseña y verificación segura.
 *
 * Atributos del diagrama de clases:
 * - id, email, password_hash, name, last_name, role, created_at
 *
 * Métodos: create(), modify(), delete(), login(), logout(), sign_in()
 *
 * @module models/User
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ==================== ESQUEMA ====================

const userSchema = new mongoose.Schema(
  {
    // Nombre del usuario
    name: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
    },

    // Apellido del usuario
    last_name: {
      type: String,
      required: [true, 'El apellido es obligatorio'],
      trim: true,
    },

    // Correo electrónico (único, validado con regex)
    email: {
      type: String,
      required: [true, 'El correo electrónico es obligatorio'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Por favor ingrese un correo válido',
      ],
    },

    // Contraseña (se encripta automáticamente con bcrypt en pre-save)
    password: {
      type: String,
      required: [true, 'La contraseña es obligatoria'],
      minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
    },

    // Rol del usuario en el sistema
    role: {
      type: String,
      enum: {
        // Se mantiene Provider temporalmente por compatibilidad con datos históricos.
        values: ['Admin', 'Manager', 'Client', 'Provider'],
        message: '{VALUE} no es un rol válido',
      },
      default: 'Client',
    },

    // Estado de la cuenta (false = desactivada / soft delete)
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Agrega createdAt y updatedAt automáticamente
  }
);

// ==================== MIDDLEWARES ====================

/**
 * Pre-save: Encripta la contraseña antes de guardar en la BD.
 * Solo se ejecuta si el campo password fue modificado o es nuevo.
 */
userSchema.pre('save', async function () {
  if (this.role === 'Provider') {
    this.role = 'Manager';
  }

  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// ==================== MÉTODOS DE INSTANCIA ====================

/**
 * Compara la contraseña ingresada con la contraseña encriptada en la BD.
 *
 * @param {string} enteredPassword - Contraseña en texto plano ingresada por el usuario
 * @returns {Promise<boolean>} true si coinciden, false si no
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * Elimina la contraseña del objeto JSON en las respuestas.
 * Garantiza que nunca se exponga la contraseña en el API.
 *
 * @returns {object} Objeto del usuario sin el campo password
 */
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

// ==================== EXPORTACIÓN ====================

const User = mongoose.model('User', userSchema);
module.exports = User;
