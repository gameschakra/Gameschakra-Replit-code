import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import * as dotenv from 'dotenv';

// Load appropriate env file
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
dotenv.config({ path: envFile });

// Validate DATABASE_URL
if (!process.env.DATABASE_URL) {
  console.error('❌ FATAL: DATABASE_URL is required for migrations');
  process.exit(1);
}

console.log('🚀 Starting database migration...');
console.log(`📁 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🔗 Database: ${process.env.DATABASE_URL.replace(/:[^:@]*@/, ':***@')}`);

async function runMigrations() {
  try {
    // Create migration client with AWS RDS compatible SSL configuration
    const sslConfig = process.env.NODE_ENV === 'production' 
      ? { 
          rejectUnauthorized: false, // AWS RDS uses self-signed certificates
          require: true // Still require SSL connection
        }
      : { rejectUnauthorized: false };

    const migrationClient = postgres(process.env.DATABASE_URL!, {
      ssl: sslConfig,
      max: 1, // Use single connection for migrations
      connection: {
        options: `--search_path=public`
      }
    });

    const db = drizzle(migrationClient);

    console.log('🏃‍♂️ Running migrations...');
    await migrate(db, { 
      migrationsFolder: './migrations',
      migrationsTable: '__drizzle_migrations__'
    });

    console.log('✅ Migrations completed successfully');
    await migrationClient.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();