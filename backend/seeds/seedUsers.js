const dotenv = require('dotenv');
const User = require('../models/User');
const conectarDB = require('../config/db');

dotenv.config({ path: `${__dirname}/../.env` });

const importData = async () => {
  try {
    await conectarDB();

    // Limpiamos los usuarios existentes para evitar duplicados en pruebas
    await User.deleteMany();

    const users = [
      {
        name: 'Administrador Principal',
        email: 'admin@knstore.com',
        password: 'password123',
        role: 'Admin',
      },
      {
        name: 'Proveedor Externo',
        email: 'proveedor@knstore.com',
        password: 'password123',
        role: 'Provider',
      },
      {
        name: 'Cliente Regular',
        email: 'cliente@gmail.com',
        password: 'password123',
        role: 'Client',
      },
    ];

    // Insertamos los usuarios (usamos create para ejecutar middleware de hash)
    for (const userData of users) {
      await User.create(userData);
    }

    console.log('✅ Usuarios Iniciales Importados Exitosamente');
    console.log('--- Credenciales de Prueba ---');
    console.table(users.map(u => ({ Rol: u.role, Email: u.email, Password: u.password })));
    process.exit();

  } catch (error) {
    console.error(`❌ Error al importar datos: ${error.message}`);
    process.exit(1);
  }
};

importData();
