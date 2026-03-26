/**
 * Seed de Usuarios
 *
 * Purga e inserta la tabla de Usuarios (Admin, Provider y Client)
 * para realizar simulaciones y pruebas locales de forma correcta.
 *
 * @module seeds/seedUsers
 */

const dotenv = require('dotenv');
const User = require('../models/User');
const conectarDB = require('../config/db');

// Configuración de entorno
dotenv.config({ path: `${__dirname}/../.env` });

const importData = async () => {
  try {
    // 1. Conexión MongoDB
    await conectarDB();

    // 2. Erradicación previa de colección
    await User.deleteMany();

    // 3. Declaración estructural
    const users = [
      {
        name: 'Administrador',
        last_name: 'Principal',
        email: 'admin@knstore.com',
        password: 'password123',
        role: 'Admin',
      },
      {
        name: 'Proveedor',
        last_name: 'Externo',
        email: 'proveedor@knstore.com',
        password: 'password123',
        role: 'Provider',
      },
      {
        name: 'Cliente',
        last_name: 'Regular',
        email: 'cliente@gmail.com',
        password: 'password123',
        role: 'Client',
      },
    ];

    // 4. Inserción (Se usa create para que pre-save encripte cada constraseña dinámicamente)
    for (const userData of users) {
      await User.create(userData);
    }

    console.log('✅ Usuarios estáticos creados. Lista:');
    console.table(users.map(u => ({ Rol: u.role, Correo: u.email })));

    process.exit();
  } catch (error) {
    console.error(`❌ Error importando usuarios temporales: ${error.message}`);
    process.exit(1);
  }
};

importData();
