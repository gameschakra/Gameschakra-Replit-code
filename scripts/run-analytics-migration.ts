import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';

// Load environment variables
dotenv.config({ path: '.env' });

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is required');
  process.exit(1);
}

async function runAnalyticsMigration() {
  console.log('🚀 Running analytics migration...');
  
  try {
    const client = postgres(process.env.DATABASE_URL!, {
      ssl: { rejectUnauthorized: false },
      max: 1
    });

    // Read and execute the migration SQL
    const migrationSQL = readFileSync('./migrations/0001_analytics_tables_only.sql', 'utf8');
    
    // Split by statement separator and execute each
    const statements = migrationSQL.split('-->').map(s => s.trim()).filter(s => s);
    
    for (const statement of statements) {
      if (statement.startsWith('statement-breakpoint')) continue;
      
      console.log('Executing:', statement.substring(0, 50) + '...');
      await client.unsafe(statement);
    }
    
    console.log('✅ Analytics migration completed successfully');
    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runAnalyticsMigration();