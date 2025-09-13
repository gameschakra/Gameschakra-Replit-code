import { db } from "../server/db";
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

async function runMigration() {
  try {
    console.log("Running migration to add city and country columns...");
    
    const migrationSQL = `
-- Manually add city and country fields to users table (avoiding enum conflicts)
DO $$ 
BEGIN
    -- Add city column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='city') THEN
        ALTER TABLE users ADD COLUMN city text;
        RAISE NOTICE 'Added city column';
    ELSE
        RAISE NOTICE 'City column already exists';
    END IF;
    
    -- Add country column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='country') THEN
        ALTER TABLE users ADD COLUMN country text;
        RAISE NOTICE 'Added country column';
    ELSE
        RAISE NOTICE 'Country column already exists';
    END IF;
END $$;
    `;
    
    // Execute the migration SQL directly using the db connection
    await db.execute(migrationSQL as any);
    
    console.log("✅ Migration completed successfully!");
    
  } catch (error) {
    console.error("❌ Migration failed:", error);
  } finally {
    process.exit(0);
  }
}

runMigration();