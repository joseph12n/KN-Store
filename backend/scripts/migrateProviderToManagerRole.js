const dotenv = require('dotenv');
const User = require('../models/User');
const connectDB = require('../config/db');

dotenv.config({ path: `${__dirname}/../.env` });

// Script de migración puntual:
// Convierte datos históricos con rol Provider al nuevo rol Manager.
// Ejecutar una vez por entorno cuando exista data anterior al cambio.
const migrateProviderToManagerRole = async () => {
  try {
    await connectDB();

    const result = await User.updateMany(
      { role: 'Provider' },
      { $set: { role: 'Manager' } }
    );

    console.log('Migracion completada');
    console.log(`Usuarios modificados: ${result.modifiedCount}`);

    process.exit(0);
  } catch (error) {
    console.error('Error en migracion de rol Provider -> Manager:', error.message);
    process.exit(1);
  }
};

migrateProviderToManagerRole();
