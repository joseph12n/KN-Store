const mongoose = require('mongoose');
const slugify = require('slugify');

const productSchema = new mongoose.Schema(
    {
        // Identificadores
        name: {
            type: String,
            required: [true, 'El nombre del producto es requerido'],
            unique: true,
            trim: true,
            minlength: [3, 'El nombre debe tener al menos 3 caracteres']
        },
        sku: {
            type: String,
            required: [true, 'El SKU es requerido'],
            unique: true,
            trim: true,
            uppercase: true
        },
        slug: {
            type: String,
            unique: true,
            lowercase: true
        },

        // Información básica
        description: {
            type: String,
            required: [true, 'La descripción es requerida'],
            minlength: [10, 'La descripción debe tener al menos 10 caracteres']
        },
        brand: String,

        // Precios
        price: {
            type: Number,
            required: [true, 'El precio es requerido'],
            min: [0, 'El precio no puede ser negativo']
        },
        costPrice: {
            type: Number,
            required: [true, 'El precio de costo es requerido'],
            min: [0, 'El precio de costo no puede ser negativo']
        },

        // Stock e inventario
        stock: {
            type: Number,
            required: [true, 'El stock es requerido'],
            min: [0, 'El stock no puede ser negativo'],
            default: 0
        },

        // Referencias
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: [true, 'La categoría es requerida']
        },
        subcategory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subcategory',
            required: [true, 'La subcategoría es requerida']
        },

        // Variantes
        variants: [
            {
                size: String,
                color: String,
                stock: { type: Number, default: 0 },
                sku: String,
                isDefault: { type: Boolean, default: false }
            }
        ],

        // Imágenes y etiquetas
        images: [
            {
                type: String,
                default: 'https://via.placeholder.com/300?text=Producto'
            }
        ],
        tags: [String],

        // Descuentos
        discount: {
            percentage: {
                type: Number,
                min: 0,
                max: 100,
                default: 0
            },
            amount: {
                type: Number,
                min: 0,
                default: 0
            },
            startDate: Date,
            endDate: Date
        },

        // Disponibilidad
        isAvailable: {
            type: Boolean,
            default: true
        },
        availableDate: Date,
        discontinuedDate: Date,

        // Soft delete
        active: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true,
        versionKey: false,
        toJSON: { virtuals: true }
    }
);

// ==================== VIRTUAL FIELDS ====================

// Precio final con descuento aplicado
productSchema.virtual('finalPrice').get(function () {
    let finalPrice = this.price;

    // Aplicar descuento porcentual
    if (this.discount && this.discount.percentage > 0) {
        const now = new Date();
        const inDateRange =
            (!this.discount.startDate || now >= this.discount.startDate) &&
            (!this.discount.endDate || now <= this.discount.endDate);

        if (inDateRange) {
            finalPrice = this.price * (1 - this.discount.percentage / 100);
        }
    }

    // Aplicar descuento en monto fijo (solo si no hay descuento porcentual)
    if (this.discount && this.discount.amount > 0 && (!this.discount.percentage || this.discount.percentage === 0)) {
        finalPrice = Math.max(0, this.price - this.discount.amount);
    }

    return Math.round(finalPrice * 100) / 100;
});

// Ganancia bruta
productSchema.virtual('profit').get(function () {
    return Math.round((this.price - this.costPrice) * 100) / 100;
});

// Margen de ganancia en porcentaje
productSchema.virtual('profitMargin').get(function () {
    if (this.price === 0) return 0;
    return Math.round(((this.profit / this.price) * 100) * 100) / 100;
});

// ¿Está actualmente en descuento?
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

// Días hasta estar disponible
productSchema.virtual('daysUntilAvailable').get(function () {
    if (!this.availableDate || this.isAvailable) {
        return 0;
    }

    const now = new Date();
    const diffTime = Math.abs(this.availableDate - now);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
});

// ==================== MIDDLEWARES ====================

// Pre-save: generar slug automáticamente
productSchema.pre('save', function (next) {
    if (this.isModified('name')) {
        this.slug = slugify(this.name, {
            lower: true,
            strict: true
        });
    }
    next();
});

// Post-save: manejar errores de duplicados
productSchema.post('save', function (error, doc, next) {
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

module.exports = mongoose.model('Product', productSchema);
