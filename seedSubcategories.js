const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('./backend/models/Category');
const Subcategory = require('./backend/models/Subcategory');
const conectarDB = require('./backend/config/db');

dotenv.config({ path: './backend/.env' });

const importData = async () => {
  try {
    await conectarDB();

    const categories = await Category.find();

    if (categories.length === 0) {
      console.log('⚠️  No hay categorías. Ejecuta primero: node seedData.js');
      process.exit(1);
    }

    // Mapa de nombres para ubicar categorías fácilmente
    const catMap = {};
    categories.forEach(c => { catMap[c.name] = c._id; });

    // Limpiar subcategorías existentes
    await Subcategory.deleteMany();

    const subcategories = [
      // Zapatillas Deportivas
      {
        name: 'Running Hombre',
        description: 'Zapatillas de running diseñadas para hombre con tecnología de amortiguación avanzada.',
        category: catMap['Zapatillas Deportivas'] || categories[0]._id,
      },
      {
        name: 'Running Mujer',
        description: 'Zapatillas de running diseñadas para mujer, ligeras y cómodas para largas distancias.',
        category: catMap['Zapatillas Deportivas'] || categories[0]._id,
      },
      // Zapatos Casuales
      {
        name: 'Sneakers Urbanos',
        description: 'Zapatillas casuales de estilo urbano para uso diario.',
        category: catMap['Zapatos Casuales'] || categories[1]._id,
      },
      {
        name: 'Mocasines Casuales',
        description: 'Calzado sin cordones de estilo casual y cómodo.',
        category: catMap['Zapatos Casuales'] || categories[1]._id,
      },
      // Zapatos Formales
      {
        name: 'Oxfords',
        description: 'Zapatos clásicos de cordones para ambientes formales y de negocios.',
        category: catMap['Zapatos Formales'] || categories[2]._id,
      },
      // Botas
      {
        name: 'Botas de Montaña',
        description: 'Botas resistentes para actividades al aire libre y senderismo.',
        category: catMap['Botas'] || categories[3]._id,
      },
      // Sandalias y Chanclas
      {
        name: 'Sandalias de Playa',
        description: 'Sandalias ligeras y resistentes al agua, perfectas para la playa.',
        category: catMap['Sandalias y Chanclas'] || categories[4]._id,
      },
    ];

    for (const sub of subcategories) {
      await Subcategory.create(sub);
    }

    console.log('✅ Subcategorías importadas exitosamente');
    console.table(subcategories.map(s => ({
      Subcategoría: s.name,
      Categoría: Object.keys(catMap).find(k => catMap[k].toString() === s.category.toString()) || 'N/A',
    })));
    process.exit();

  } catch (error) {
    console.error(`❌ Error al importar subcategorías: ${error.message}`);
    process.exit(1);
  }
};

importData();
