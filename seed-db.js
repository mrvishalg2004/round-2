// This is a simple script to run the database seeder
require('ts-node/register');

// Import directly from the seed.ts file
const { runSeed } = require('./src/utils/seed');

// Run the seed function
runSeed()
  .then(() => {
    console.log('Database seeded successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error seeding database:', error);
    process.exit(1);
  }); 