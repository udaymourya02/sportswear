// seed.js
const { MongoClient } = require('mongodb');
require('dotenv').config();


const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

const products = [
  // Copy the mockProducts array from lib/mock-data.ts
];

const categories = [
  // Copy the mockCategories array from lib/mock-data.ts
];

async function seedDatabase() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const database = client.db();
    
    // Clear existing data
    await database.collection('products').deleteMany({});
    await database.collection('categories').deleteMany({});
    
    // Insert new data
    if (products.length > 0) {
      await database.collection('products').insertMany(products);
      console.log(`${products.length} products inserted`);
    }
    
    if (categories.length > 0) {
      await database.collection('categories').insertMany(categories);
      console.log(`${categories.length} categories inserted`);
    }
    
    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await client.close();
  }
}

seedDatabase();
