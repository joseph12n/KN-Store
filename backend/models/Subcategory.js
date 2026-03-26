/**
 * Modelo de Subcategoría
 *
 * Representa las subcategorías de productos en la tienda.
 * Cada subcategoría pertenece a una categoría (relación muchos a uno)
 * y puede contener múltiples productos.
 *
 * @module models/Subcategory
 */

const mongoose = require('mongoose');

// ==================== ESQUEMA ====================

const subcategorySchema = new mongoose.Schema(
  {
    // Nombre de la subcategoría (debe ser único)
    name: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      unique: true,
      trim: true,
    },

    // Descripción de la subcategoría
    description: {
      type: String,
      required: [true, 'La descripción es obligatoria'],
      trim: true,
    },

    // Referencia a la categoría padre (FK)
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'La categoría es obligatoria'],
    },

    // Estado de la subcategoría (para soft delete)
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ==================== MIDDLEWARES ====================

/**
 * Post-save: Maneja errores de duplicados en MongoDB.
 * Evita que se creen subcategorías con el mismo nombre.
 */
subcategorySchema.post('save', function (error, doc, next) {
  if (error.code === 11000) {
    next(new Error('Ya existe una subcategoría con ese nombre'));
  } else {
    next(error);
  }
});

// ==================== EXPORTACIÓN ====================

module.exports = mongoose.model('Subcategory', subcategorySchema);