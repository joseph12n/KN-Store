const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Modelos
const Subcategory = require('./models/Subcategory');
const Category = require('./models/Category');

// Conexión
const conectarDB = require('./config/db');

dotenv.config({ path: './.env' });

const importData = async () => {
  try {
    await conectarDB();

    console.log('🌱 Cargando subcategorías...');

    // Obtener categorías existentes
    const categories = await Category.find();

    if (categories.length === 0) {
      console.log('⚠️ No hay categorías, debes crear categorías primero');
      process.exit();
    }

    // Limpiar subcategorías
    await Subcategory.deleteMany();

    // Crear subcategorías (relacionadas)
    const subcategories = [
      {
        name: 'Running Pro',
        description: 'Subcategoría especializada en running',
        category: categories[0]._id,
      },
      {
        name: 'Casual Urbano',
        description: 'Estilo urbano para uso diario',
        category: categories[1]?._id || categories[0]._id,
      },
      {
        name: 'Formal Elegante',
        description: 'Subcategoría para eventos formales',
        category: categories[2]?._id || categories[0]._id,
      },
      {
        name: 'Botas Outdoor',
        description: 'Ideal para clima frío y aventuras',
        category: categories[3]?._id || categories[0]._id,
      },
      {
        name: 'Sandalias Playa',
        description: 'Perfectas para clima cálido',
        category: categories[4]?._id || categories[0]._id,
      }
    ];

    // Insertar en BD
    await Subcategory.insertMany(subcategories);

    console.log('✅ Subcategorías importadas exitosamente');

    // Mostrar en tabla (esto te luce mucho 🔥)
    console.table(
      subcategories.map(sc => ({
        Subcategoría: sc.name,
        Categoria: sc.category.toString()
      }))
    );

    process.exit();

  } catch (error) {
    console.error(`❌ Error al importar subcategorías: ${error.message}`);
    process.exit(1);
  }
};

importData();