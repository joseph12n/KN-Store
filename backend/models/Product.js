/**
 * Modelo de Producto
 *
 * Define el esquema de productos con soporte para:
 * - Categorización jerárquica (categoría + subcategoría)
 * - Variantes de talla/color
 * - Descuentos con fecha de vigencia
 * - Búsqueda de texto completo (name, description, sku)
 * - Soft delete (campo active)
 * - Campos virtuales (finalPrice, profit, profitMargin, etc.)
 *
 * Atributos del diagrama de clases:
 * - id, name, price, size, stock, brand, category_id, description, images, provider_id
 *
 * Métodos: create(), modify(), delete(), check()
 *
 * @module models/Product
 */

const mongoose = require('mongoose');
const slugify = require('slugify');

// ==================== ESQUEMA ====================

const productSchema = new mongoose.Schema(
  {
    // ---- Identificadores ----

    // Nombre del producto (único, genera slug automáticamente)
    name: {
      type: String,
      required: [true, 'El nombre del producto es requerido'],
      unique: true,
      trim: true,
      minlength: [3, 'El nombre debe tener al menos 3 caracteres'],
    },

    // Código SKU del producto (único, se almacena en mayúsculas)
    sku: {
      type: String,
      required: [true, 'El SKU es requerido'],
      unique: true,
      trim: true,
      uppercase: true,
    },

    // Slug para URL amigable (generado automáticamente desde el nombre)
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },

    // ---- Información básica ----

    // Descripción detallada del producto
    description: {
      type: String,
      required: [true, 'La descripción es requerida'],
      minlength: [10, 'La descripción debe tener al menos 10 caracteres'],
    },

    // Marca del producto
    brand: String,

    // Talla o tamaño del producto (atributo del diagrama de clases)
    size: {
      type: String,
      trim: true,
    },

    // ---- Precios ----

    // Precio de venta al público
    price: {
      type: Number,
      required: [true, 'El precio es requerido'],
      min: [0, 'El precio no puede ser negativo'],
    },

    // Precio de costo (para calcular ganancia)
    costPrice: {
      type: Number,
      required: [true, 'El precio de costo es requerido'],
      min: [0, 'El precio de costo no puede ser negativo'],
    },

    // ---- Stock e inventario ----

    // Cantidad disponible en inventario
    stock: {
      type: Number,
      required: [true, 'El stock es requerido'],
      min: [0, 'El stock no puede ser negativo'],
      default: 0,
    },

    // ---- Referencias (FK) ----

    // Categoría del producto (relación 1:1 con Category)
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'La categoría es requerida'],
    },

    // Subcategoría del producto (relación 1:1 con Subcategory)
    subcategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subcategory',
      required: [true, 'La subcategoría es requerida'],
    },

    // Proveedor del producto (referencia a User con rol Provider)
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    // ---- Variantes ----

    // Variantes del producto (combinaciones de talla, color y stock)
    variants: [
      {
        size: String,
        color: String,
        stock: { type: Number, default: 0 },
        sku: String,
        isDefault: { type: Boolean, default: false },
      },
    ],

    // ---- Imágenes y etiquetas ----

    // URLs de las imágenes del producto
    images: [
      {
        type: String,
        default: 'https://via.placeholder.com/300?text=Producto',
      },
    ],

    // Etiquetas para filtrado y búsqueda
    tags: [String],

    // ---- Descuentos ----

    // Configuración de descuento con vigencia temporal
    discount: {
      percentage: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      amount: {
        type: Number,
        min: 0,
        default: 0,
      },
      startDate: Date,
      endDate: Date,
    },

    // ---- Disponibilidad ----

    // Indica si el producto está disponible para venta
    isAvailable: {
      type: Boolean,
      default: true,
    },

    // Fecha en que estará disponible (para prelanzamientos)
    availableDate: Date,

    // Fecha en que fue descontinuado
    discontinuedDate: Date,

    // ---- Soft delete ----

    // false = producto eliminado lógicamente (no aparece en listados públicos)
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
  }
);

// ==================== CAMPOS VIRTUALES ====================

/**
 * Calcula el precio final aplicando descuentos vigentes.
 * Prioriza descuento porcentual sobre monto fijo.
 */
productSchema.virtual('finalPrice').get(function () {
  let finalPrice = this.price;

  if (this.discount && this.discount.percentage > 0) {
    const now = new Date();
    const inDateRange =
      (!this.discount.startDate || now >= this.discount.startDate) &&
      (!this.discount.endDate || now <= this.discount.endDate);

    if (inDateRange) {
      finalPrice = this.price * (1 - this.discount.percentage / 100);
    }
  }

  if (this.discount && this.discount.amount > 0 && (!this.discount.percentage || this.discount.percentage === 0)) {
    finalPrice = Math.max(0, this.price - this.discount.amount);
  }

  return Math.round(finalPrice * 100) / 100;
});

/**
 * Calcula la ganancia bruta (precio de venta - precio de costo).
 */
productSchema.virtual('profit').get(function () {
  return Math.round((this.price - this.costPrice) * 100) / 100;
});

/**
 * Calcula el margen de ganancia en porcentaje.
 */
productSchema.virtual('profitMargin').get(function () {
  if (this.price === 0) return 0;
  return Math.round(((this.profit / this.price) * 100) * 100) / 100;
});

/**
 * Indica si el producto tiene un descuento actualmente vigente.
 */
productSchema.virtual('isOnDiscount').get(function () {
  if (!this.discount || (this.discount.percentage === 0 && this.discount.amount === 0)) {
    return false;
  }

  const now = new Date();
  return (
    (!this.discount.startDate || now >= this.discount.startDate) &&
    (!this.discount.endDate || now <= this.discount.endDate)
  );
});

/**
 * Calcula los días restantes hasta la fecha de disponibilidad.
 */
productSchema.virtual('daysUntilAvailable').get(function () {
  if (!this.availableDate || this.isAvailable) {
    return 0;
  }

  const now = new Date();
  const diffTime = Math.abs(this.availableDate - now);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// ==================== MIDDLEWARES ====================

/**
 * Pre-save: Genera automáticamente el slug a partir del nombre.
 */
productSchema.pre('save', async function () {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true,
    });
  }
});

/**
 * Post-save: Maneja errores de campos duplicados (sku, name, slug).
 */
productSchema.post('save', { errorHandler: true }, function (error, doc, next) {
  if (error.name === 'MongoServerError' && error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    next(new Error(`${field} ya existe en la base de datos`));
  } else {
    next(error);
  }
});

// ==================== ÍNDICES ====================

productSchema.index({ name: 'text', description: 'text', sku: 'text' });
productSchema.index({ category: 1, active: 1 });
productSchema.index({ subcategory: 1, active: 1 });
productSchema.index({ brand: 1, active: 1 });
productSchema.index({ tags: 1, active: 1 });
productSchema.index({ slug: 1, active: 1 });
productSchema.index({ createdAt: -1 });

// ==================== EXPORTACIÓN ====================

module.exports = mongoose.model('Product', productSchema);
