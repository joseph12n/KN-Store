/**
 * Modelo de Categoría
 *
 * Define el esquema de categorías para agrupar productos.
 * Cada categoría puede contener múltiples productos (relación 1:*).
 *
 * Atributos del diagrama de clases:
 * - category_id, name, description
 *
 * Métodos: create(), modify(), delete(), check()
 *
 * @module models/Category
 */

const mongoose = require('mongoose');

// ==================== ESQUEMA ====================

const categorySchema = new mongoose.Schema(
  {
    // Nombre de la categoría (debe ser único)
    name: {
      type: String,
      required: [true, 'El nombre de la categoría es obligatorio'],
      unique: true,
      trim: true,
    },

    // Descripción opcional de la categoría
    description: {
      type: String,
      trim: true,
      default: '',
    },

    // Estado de la categoría (false = desactivada / soft delete)
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Agrega createdAt y updatedAt
  }
);

// ==================== EXPORTACIÓN ====================

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;
