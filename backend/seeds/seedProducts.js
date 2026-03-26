/**
 * Seed de Productos
 *
 * Popula el catálogo base de la tienda virtual, inyectando dependencias
 * relacionales desde Categorías y Subcategorías vigentes.
 *
 * @module seeds/seedProducts
 */

const dotenv = require('dotenv');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');
const conectarDB = require('../config/db');

dotenv.config({ path: `${__dirname}/../.env` });

const importData = async () => {
  try {
    await conectarDB();
    console.log('🌱 Cargando catálogo de productos maestros...');

    const [categories, subcategories] = await Promise.all([
      Category.find(),
      Subcategory.find()
    ]);

    if (!categories.length || !subcategories.length) {
      console.log('⚠️ Requisitos insuficientes (Faltan Cat/Sub). Ejecuta: npm run seed');
      process.exit(1);
    }

    // Limpieza
    await Product.deleteMany();

    const products = [
      {
        name: 'Nike Air Max 90',
        sku: 'NIKE-AM90-BLK-001',
        description: 'Zapatillas de running con tecnología Air Max de última generación.',
        brand: 'Nike',
        price: 129.99,
        costPrice: 79.99,
        stock: 50,
        size: 'N/A',
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
        description: 'Clásicas zapatillas Adidas Superstar, estilo legendario.',
        brand: 'Adidas',
        price: 99.99,
        costPrice: 60.00,
        stock: 75,
        size: 'N/A',
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
        description: 'Zapatillas retro futuristas Puma RS-X.',
        brand: 'Puma',
        price: 119.99,
        costPrice: 70.00,
        stock: 45,
        size: 'N/A',
        tags: ['moderno', 'urbano', 'tendencia'],
        category: categories[1]._id, // Asume que ID1 es calzado casual
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
        description: 'Clásicas deportivas de New Balance.',
        brand: 'New Balance',
        price: 109.99,
        costPrice: 65.00,
        stock: 60,
        size: 'N/A',
        tags: ['familiar', 'cómodo', 'versátil'],
        category: categories[0]._id, // Asume running o deporte
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
        description: 'Botines / sneakers de caña alta Converse originales.',
        brand: 'Converse',
        price: 69.99,
        costPrice: 40.00,
        stock: 100,
        size: 'N/A',
        tags: ['clásico', 'lona', 'versátil'],
        category: categories[1]._id, // Casual
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
        description: 'React NextGen previene esguinces y fascitis plantar con alto rebote.',
        brand: 'Nike',
        price: 159.99,
        costPrice: 95.00,
        stock: 30,
        size: 'N/A',
        tags: ['premium', 'running', 'tecnología'],
        category: categories[0]._id, // Deporte
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

    // Iteramos e inyectamos individualmente para aplicar middlewares pre-save de mongoose (.slug)
    for (const prodData of products) {
      const p = new Product(prodData);
      await p.save();
    }

    console.log('✅ Portafolio comercial importado al milímetro');

    console.table(
      products.map(p => ({
        'Producto': p.name,
        'SKU': p.sku,
        'Precio': `$${p.price}`,
        'Stock': p.stock,
        'Marca': p.brand,
        'Descuento': p.discount?.percentage ? `${p.discount.percentage}%` : 'N/A'
      }))
    );

    process.exit();
  } catch (error) {
    console.error(`❌ Falla en la inyección de Productos Maestros: ${error.message}`);
    process.exit(1);
  }
};

importData();
