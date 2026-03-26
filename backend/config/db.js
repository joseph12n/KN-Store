/**
 * Configuración de Base de Datos
 *
 * Establece la conexión con MongoDB usando Mongoose.
 * La URI se obtiene de las variables de entorno (.env).
 * Si la conexión falla, el proceso se detiene inmediatamente.
 *
 * @module config/db
 */

const mongoose = require('mongoose');

/**
 * Conecta la aplicación a la base de datos MongoDB.
 * Usa MONGO_URI de las variables de entorno o un fallback local.
 */
const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/kn_store';

    await mongoose.connect(uri);

    console.log('✅ Conexión exitosa a MongoDB');
  } catch (error) {
    console.error('❌ Error al conectar a la base de datos:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;