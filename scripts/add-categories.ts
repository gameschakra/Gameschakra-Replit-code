import { storage } from '../server/storage';
import { InsertCategory } from '../shared/schema';
import { db } from '../server/db';

const categories: Array<InsertCategory> = [
  {
    name: 'Action',
    slug: 'action',
    description: 'Fast-paced games focused on reflexes and hand-eye coordination',
    imageUrl: null
  },
  {
    name: 'Adventure',
    slug: 'adventure',
    description: 'Story-driven games with exploration and puzzle-solving',
    imageUrl: null
  },
  {
    name: 'Arcade',
    slug: 'arcade',
    description: 'Simple, fun games with straightforward gameplay mechanics',
    imageUrl: null
  },
  {
    name: 'Puzzle',
    slug: 'puzzle',
    description: 'Brain-teasing games focusing on logical thinking and problem-solving',
    imageUrl: null
  },
  {
    name: 'Strategy',
    slug: 'strategy',
    description: 'Games that require careful planning and thoughtful decision-making',
    imageUrl: null
  },
  {
    name: 'RPG',
    slug: 'rpg',
    description: 'Role-playing games with character development and immersive worlds',
    imageUrl: null
  },
  {
    name: 'Racing',
    slug: 'racing',
    description: 'Fast-paced vehicular competition games',
    imageUrl: null
  },
  {
    name: 'Sports',
    slug: 'sports',
    description: 'Games based on real-world athletic competitions',
    imageUrl: null
  },
  {
    name: 'Simulation',
    slug: 'simulation',
    description: 'Games that simulate real-world activities or systems',
    imageUrl: null
  },
  {
    name: 'Educational',
    slug: 'educational',
    description: 'Games designed to teach or train specific skills or knowledge',
    imageUrl: null
  },
  {
    name: 'Multiplayer',
    slug: 'multiplayer',
    description: 'Games designed for multiple players to enjoy together',
    imageUrl: null
  },
  {
    name: 'Card & Board',
    slug: 'card-board',
    description: 'Digital adaptations of card games and board games',
    imageUrl: null
  }
];

async function addCategories() {
  console.log('Starting to add categories...');
  
  try {
    // Test database connection
    await db.execute('SELECT 1');
    console.log('Database connection successful');

    // Add each category if it doesn't exist
    for (const category of categories) {
      const existingCategory = await storage.getCategoryBySlug(category.slug);
      if (!existingCategory) {
        console.log(`Adding category: ${category.name}`);
        await storage.createCategory(category);
      } else {
        console.log(`Category already exists: ${category.name}`);
      }
    }
    
    console.log('Successfully added all categories!');
    process.exit(0);
  } catch (error) {
    console.error('Error adding categories:', error);
    process.exit(1);
  }
}

// Run the function
addCategories();