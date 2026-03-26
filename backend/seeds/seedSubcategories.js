/**
 * Seed de Subcategorías
 *
 * Requiere que la colección de Categorías ya exista, dado
 * que extrae de ellas el FK relacional para inyectar sub-categorizaciones.
 *
 * @module seeds/seedSubcategories
 */

const dotenv = require('dotenv');
const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');
const conectarDB = require('../config/db');

dotenv.config({ path: `${__dirname}/../.env` });

const importData = async () => {
  try {
    await conectarDB();

    const categories = await Category.find();

    if (categories.length === 0) {
      console.log('⚠️  Ausencia de categorías en DB. Corre "npm run seed" (All).');
      process.exit(1);
    }

    // Mapa veloz de nombres a ObjectIds
    const catMap = {};
    categories.forEach(c => { catMap[c.name] = c._id; });

    // Limpieza
    await Subcategory.deleteMany();

    const subcategories = [
      // == Zapatillas Deportivas ==
      {
        name: 'Running Hombre',
        description: 'Colección de Running Hombre con alta transpirabilidad y firmeza.',
        category: catMap['Zapatillas Deportivas'] || categories[0]._id,
      },
      {
        name: 'Running Mujer',
        description: 'Ligeras y cómodas para todo tipo de carreras y rodajes de mujer.',
        category: catMap['Zapatillas Deportivas'] || categories[0]._id,
      },
      // == Zapatos Casuales ==
      {
        name: 'Sneakers Urbanos',
        description: 'Lifestyle urbano unisex. Perfiles ultra bajos casuales.',
        category: catMap['Zapatos Casuales'] || categories[1]._id,
      },
      {
        name: 'Mocasines Casuales',
        description: 'Ideales sin cordones o lazada con cuero/piel sintética o natural.',
        category: catMap['Zapatos Casuales'] || categories[1]._id,
      },
      // == Zapatos Formales ==
      {
        name: 'Oxfords',
        description: 'Modelos de negocios para corbata. Estilo British Oxford.',
        category: catMap['Zapatos Formales'] || categories[2]._id,
      },
      // == Botas ==
      {
        name: 'Botas de Montaña',
        description: 'Trekkers y GORE-TEX para intemperismo en media y alta montaña.',
        category: catMap['Botas'] || categories[3]._id,
      },
      // == Sandalias y Chanclas ==
      {
        name: 'Sandalias de Playa',
        description: 'Sliders ligeras. Goma EVA sumergible y ergonómica.',
        category: catMap['Sandalias y Chanclas'] || categories[4]._id,
      },
    ];

    await Subcategory.insertMany(subcategories);

    console.log('✅ Subcategorías injertadas de manera relacional perfecta.');
    console.table(subcategories.map(s => ({
      Subcategoría: s.name,
      Categoría_Madre: Object.keys(catMap).find(k => catMap[k].toString() === s.category.toString()) || 'Unknown',
    })));
    process.exit();

  } catch (error) {
    console.error(`❌ Falla en Subcategorización inicial: ${error.message}`);
    process.exit(1);
  }
};

importData();
