const { execSync } = require('child_process');
const path = require('path');

const seedsDir = __dirname;

const seeds = [
  { file: 'seedUsers.js', label: 'Usuarios' },
  { file: 'seedCategories.js', label: 'Categorías' },
  { file: 'seedSubcategories.js', label: 'Subcategorías' },
  { file: 'seedProducts.js', label: 'Productos' },
];

const runAllSeeds = async () => {
  console.log('==========================================');
  console.log('🌱 EJECUTANDO TODOS LOS SEEDS');
  console.log('==========================================\n');

  for (const seed of seeds) {
    const seedPath = path.join(seedsDir, seed.file);
    console.log(`\n🔄 Ejecutando seed: ${seed.label} (${seed.file})`);
    console.log('------------------------------------------');

    try {
      execSync(`node "${seedPath}"`, {
        stdio: 'inherit',
        cwd: path.join(seedsDir, '..'),
      });
    } catch (error) {
      console.error(`\n❌ Error en seed de ${seed.label}. Abortando...`);
      process.exit(1);
    }
  }

  console.log('\n==========================================');
  console.log('✅ TODOS LOS SEEDS EJECUTADOS EXITOSAMENTE');
  console.log('==========================================');
};

runAllSeeds();
