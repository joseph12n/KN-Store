const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('./backend/models/Category');
const conectarDB = require('./backend/config/db');

dotenv.config({ path: './backend/.env' });

const categories = [
  {
    name: 'Zapatillas Deportivas',
    description: 'Calzado diseñado para actividades físicas y deportes, con soporte y amortiguación óptima.',
  },
  {
    name: 'Zapatos Casuales',
    description: 'Calzado cómodo y versátil para el uso diario y ocasiones informales.',
  },
  {
    name: 'Zapatos Formales',
    description: 'Calzado elegante para ambientes de trabajo, eventos y ocasiones especiales.',
  },
  {
    name: 'Botas',
    description: 'Calzado de caña alta ideal para climas fríos, actividades al aire libre y moda urbana.',
  },
  {
    name: 'Sandalias y Chanclas',
    description: 'Calzado abierto y ligero, perfecto para climas cálidos y uso en la playa o el hogar.',
  },
  {
    name: 'Zapatillas Running',
    description: 'Especializadas para correr, con tecnología de amortiguación y ligereza para rendimiento óptimo.',
  },
  {
    name: 'Zapatillas Basketball',
    description: 'Calzado de alto rendimiento con soporte de tobillo para jugar baloncesto.',
  },
  {
    name: 'Zapatos para Niños',
    description: 'Calzado cómodo, resistente y colorido diseñado especialmente para los más pequeños.',
  },
  {
    name: 'Mocasines y Loafers',
    description: 'Calzado sin cordones, elegante y cómodo, ideal para looks smart-casual.',
  },
  {
    name: 'Ediciones Limitadas',
    description: 'Colecciones exclusivas y colaboraciones especiales de zapatillas y zapatos de edición limitada.',
  },
];

const importData = async () => {
  try {
    await conectarDB();

    // Elimina categorías existentes para evitar duplicados
    await Category.deleteMany();

    await Category.insertMany(categories);

    console.log('✅ Categorías importadas exitosamente');
    console.table(categories.map(c => ({ Categoría: c.name })));
    process.exit();

  } catch (error) {
    console.error(`❌ Error al importar categorías: ${error.message}`);
    process.exit(1);
  }
};

importData();
