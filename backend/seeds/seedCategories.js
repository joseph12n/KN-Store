/**
 * Seed de Categorías
 *
 * Popula la base de datos con 10 categorías maestras base,
 * que serán requeridas a posteriori por el resto del sistema de modelos.
 *
 * @module seeds/seedCategories
 */

const dotenv = require('dotenv');
const Category = require('../models/Category');
const conectarDB = require('../config/db');

dotenv.config({ path: `${__dirname}/../.env` });

const categories = [
  { name: 'Zapatillas Deportivas', description: 'Calzado diseñado para actividades físicas.' },
  { name: 'Zapatos Casuales', description: 'Calzado cómodo y versátil para el uso diario.' },
  { name: 'Zapatos Formales', description: 'Calzado elegante para eventos especiales.' },
  { name: 'Botas', description: 'Calzado de caña alta.' },
  { name: 'Sandalias y Chanclas', description: 'Calzado abierto, cálido y ligero.' },
  { name: 'Zapatillas Running', description: 'Especializadas para correr en asfalto.' },
  { name: 'Zapatillas Basketball', description: 'Altas o medias de basket para soporte de tobillos.' },
  { name: 'Zapatos para Niños', description: 'Cómodos y elásticos.' },
  { name: 'Mocasines y Loafers', description: 'Sin cordones, cómodos y semi formales.' },
  { name: 'Ediciones Limitadas', description: 'Colaboradores especiales internacionales.' },
];

const importData = async () => {
  try {
    await conectarDB();

    // Eliminar contenido previo
    await Category.deleteMany();
    
    // Inserción masiva optimizada, pues no contiene pre-saves engorrosos
    await Category.insertMany(categories);

    console.log('✅ Categorías importadas exitosamente');
    console.table(categories.map(c => ({ Categoría: c.name })));
    process.exit();

  } catch (error) {
    console.error(`❌ Falla masiva en seedCategories: ${error.message}`);
    process.exit(1);
  }
};

importData();
