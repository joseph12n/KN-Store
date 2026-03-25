const dotenv = require('dotenv');

// Modelos
const Product = require('../models/Product');
const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');

// Conexión
const conectarDB = require('../config/db');

dotenv.config({ path: `${__dirname}/../.env` });

const importData = async () => {
  try {
    await conectarDB();

    console.log('🌱 Cargando productos...');

    // Obtener categorías existentes
    const categories = await Category.find();

    if (categories.length === 0) {
      console.log('⚠️ No hay categorías, ejecuta primero: npm run seed:categories');
      process.exit();
    }

    // Obtener subcategorías existentes
    const subcategories = await Subcategory.find();

    if (subcategories.length === 0) {
      console.log('⚠️ No hay subcategorías, ejecuta primero: npm run seed:subcategories');
      process.exit();
    }

    // Limpiar productos
    await Product.deleteMany();

    // Crear productos con todos los campos nuevos
    const products = [
      {
        name: 'Nike Air Max 90',
        sku: 'NIKE-AM90-BLK-001',
        description: 'Zapatillas de running con tecnología Air Max de última generación, diseñadas para máxima comodidad y rendimiento en cada paso',
        brand: 'Nike',
        price: 129.99,
        costPrice: 79.99,
        stock: 50,
        tags: ['running', 'deportivas', 'tecnología'],
        category: categories[0]._id,
        subcategory: subcategories[0]._id,
        discount: {
          percentage: 15,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        },
        variants: [
          { size: '37', color: 'Blanco', stock: 10, sku: 'NIKE-AM90-WHT-37', isDefault: true },
          { size: '38', color: 'Blanco', stock: 15, sku: 'NIKE-AM90-WHT-38' },
          { size: '39', color: 'Negro', stock: 12, sku: 'NIKE-AM90-BLK-39' },
          { size: '40', color: 'Negro', stock: 13, sku: 'NIKE-AM90-BLK-40' }
        ],
        images: ['https://via.placeholder.com/300?text=Nike+Air+Max+90'],
        isAvailable: true
      },
      {
        name: 'Adidas Superstar',
        sku: 'ADIDAS-SS-WHT-002',
        description: 'Clásicas zapatillas Adidas Superstar, ideales para el uso casual diario con estilo legendario y comodidad inigualable',
        brand: 'Adidas',
        price: 99.99,
        costPrice: 60.00,
        stock: 75,
        tags: ['casual', 'clásico', 'urbano'],
        category: categories[1]._id,
        subcategory: subcategories[1]._id,
        discount: {
          percentage: 10,
          startDate: new Date(),
          endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
        },
        variants: [
          { size: '37', color: 'Blanco', stock: 25, sku: 'ADIDAS-SS-WHT-37', isDefault: true },
          { size: '38', color: 'Blanco', stock: 30, sku: 'ADIDAS-SS-WHT-38' },
          { size: '39', color: 'Negro', stock: 20, sku: 'ADIDAS-SS-BLK-39' }
        ],
        images: ['https://via.placeholder.com/300?text=Adidas+Superstar'],
        isAvailable: true
      },
      {
        name: 'Puma RS-X',
        sku: 'PUMA-RSX-RED-003',
        description: 'Zapatillas modernas Puma RS-X con diseño retro futurista, perfectas para el estilo urbano y la comodidad absoluta',
        brand: 'Puma',
        price: 119.99,
        costPrice: 70.00,
        stock: 45,
        tags: ['moderno', 'urbano', 'tendencia'],
        category: categories[1]._id,
        subcategory: subcategories[1]._id,
        discount: null,
        variants: [
          { size: '38', color: 'Rojo', stock: 15, sku: 'PUMA-RSX-RED-38', isDefault: true },
          { size: '39', color: 'Azul', stock: 16, sku: 'PUMA-RSX-BLU-39' },
          { size: '40', color: 'Blanco', stock: 14, sku: 'PUMA-RSX-WHT-40' }
        ],
        images: ['https://via.placeholder.com/300?text=Puma+RS-X'],
        isAvailable: true
      },
      {
        name: 'New Balance 574',
        sku: 'NB-574-GRY-004',
        description: 'Zapatillas New Balance 574 con amplia compatibilidad de talles y colores para toda la familia, comodidad garantizada',
        brand: 'New Balance',
        price: 109.99,
        costPrice: 65.00,
        stock: 60,
        tags: ['familiar', 'cómodo', 'versátil'],
        category: categories[0]._id,
        subcategory: subcategories[0]._id,
        discount: {
          percentage: 5,
          amount: null
        },
        variants: [
          { size: '36', color: 'Gris', stock: 20, sku: 'NB-574-GRY-36' },
          { size: '37', color: 'Gris', stock: 20, sku: 'NB-574-GRY-37', isDefault: true },
          { size: '38', color: 'Negro', stock: 20, sku: 'NB-574-BLK-38' }
        ],
        images: ['https://via.placeholder.com/300?text=New+Balance+574'],
        isAvailable: true
      },
      {
        name: 'Converse Chuck Taylor',
        sku: 'CONV-CT-BLK-005',
        description: 'Icónicas zapatillas Converse Chuck Taylor, clásicas y versátiles para cualquier ocasión casual con máximo estilo',
        brand: 'Converse',
        price: 69.99,
        costPrice: 40.00,
        stock: 100,
        tags: ['clásico', 'lona', 'versátil'],
        category: categories[1]._id,
        subcategory: subcategories[1]._id || subcategories[0]._id,
        discount: null,
        variants: [
          { size: '37', color: 'Negro', stock: 30, sku: 'CONV-CT-BLK-37', isDefault: true },
          { size: '38', color: 'Blanco', stock: 35, sku: 'CONV-CT-WHT-38' },
          { size: '39', color: 'Rojo', stock: 35, sku: 'CONV-CT-RED-39' }
        ],
        images: ['https://via.placeholder.com/300?text=Converse+Chuck+Taylor'],
        isAvailable: true
      },
      {
        name: 'Nike React Infinity',
        sku: 'NIKE-RIN-BLU-006',
        description: 'Tecnología React NextGen ofrece comodidad y respuesta excepcionales para runners exigentes que buscan lo mejor',
        brand: 'Nike',
        price: 159.99,
        costPrice: 95.00,
        stock: 30,
        tags: ['premium', 'running', 'tecnología'],
        category: categories[0]._id,
        subcategory: subcategories[0]._id,
        discount: null,
        variants: [
          { size: '38', color: 'Azul', stock: 10, sku: 'NIKE-RIN-BLU-38', isDefault: true },
          { size: '39', color: 'Blanco', stock: 10, sku: 'NIKE-RIN-WHT-39' },
          { size: '40', color: 'Rojo', stock: 10, sku: 'NIKE-RIN-RED-40' }
        ],
        images: ['https://via.placeholder.com/300?text=Nike+React+Infinity'],
        isAvailable: true,
        availableDate: null
      }
    ];

    // Insertar en BD (usando save() para que se ejecuten los middlewares pre-save, como la generación del slug)
    for (const productData of products) {
      const product = new Product(productData);
      await product.save();
    }

    console.log('✅ Productos importados exitosamente');

    // Mostrar en tabla
    console.table(
      products.map(p => ({
        'Producto': p.name,
        'SKU': p.sku,
        'Precio': `$${p.price}`,
        'Stock': p.stock,
        'Marca': p.brand,
        'Descuento': p.discount?.percentage ? `${p.discount.percentage}%` : 'No'
      }))
    );

    process.exit();

  } catch (error) {
    console.error(`❌ Error al importar productos: ${error.message}`);
    process.exit(1);
  }
};

importData();
