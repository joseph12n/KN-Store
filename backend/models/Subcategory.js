const mongoose = require('mongoose');

/**
 * Modelo de Subcategoría
 * 
 * Representa las subcategorías de productos en la tienda.
 * Cada subcategoría pertenece a una categoría (relación muchos a uno)
 */
const subcategorySchema = new mongoose.Schema({

    // Nombre de la subcategoría (único)
    name: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        unique: true,
        trim: true
    },

    // Descripción de la subcategoría
    description: {
        type: String,
        required: [true, 'La descripción es obligatoria'],
        trim: true
    },

    // Referencia a la categoría padre
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'La categoría es obligatoria']
    },

    // Estado de la subcategoría (soft delete)
    active: {
        type: Boolean,
        default: true
    }

}, {
    timestamps: true,   // agrega createdAt y updatedAt automáticamente
    versionKey: false  // elimina el campo __v
});


/**
 * Middleware post-save
 * 
 * Maneja errores de duplicados en MongoDB
 * Evita que se creen subcategorías con el mismo nombre
 */
subcategorySchema.post('save', function (error, doc, next) {
    if (error.code === 11000) {
        next(new Error('Ya existe una subcategoría con ese nombre'));
    } else {
        next(error);
    }
});


// Exportación del modelo
module.exports = mongoose.model('Subcategory', subcategorySchema);