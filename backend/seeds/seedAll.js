/**
 * Orquestador de Seeds
 *
 * Utilidad de desarrollo que ejecuta automáticamente en secuencia
 * todos los scripts para poblar la base de datos (Users -> Categories -> Subcategories -> Products).
 *
 * @module seeds/seedAll
 */

const { execSync } = require('child_process');
const path = require('path');

const seedsDir = __dirname;

const seeds = [
  { file: 'seedUsers.js', label: 'Usuarios' },
  { file: 'seedCategories.js', label: 'Categorías' },
  { file: 'seedSubcategories.js', label: 'Subcategorías' },
  { file: 'seedProducts.js', label: 'Productos' },
];

/**
 * Función principal encargada de la ejecución asíncrona pero bloqueante de secuencias.
 */
const runAllSeeds = () => {
  console.log('==========================================');
  console.log('🌱 EJECUTANDO TODOS LOS SEEDS');
  console.log('==========================================\n');

  for (const seed of seeds) {
    const seedPath = path.join(seedsDir, seed.file);
    console.log(`\n🔄 Ejecutando seed: ${seed.label} (${seed.file})`);
    console.log('------------------------------------------');

    try {
      // stdio: 'inherit' imprime la terminal del subproceso directamente en consola
      execSync(`node "${seedPath}"`, {
        stdio: 'inherit',
        cwd: path.join(seedsDir, '..'),
      });
    } catch (error) {
      console.error(`\n❌ Error mortal en secuencia de ${seed.label}. Abortando despliegue de seeds...`);
      process.exit(1);
    }
  }

  console.log('\n==========================================');
  console.log('✅ TODOS LOS SEEDS EJECUTADOS EXITOSAMENTE');
  console.log('==========================================');
};

runAllSeeds();
