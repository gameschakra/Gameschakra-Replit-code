import { db } from "../server/db";

async function runMigration() {
  try {
    console.log("Running migration to add is_blocked column...");
    
    const migrationSQL = `
-- Add isBlocked column to users table
DO $$ 
BEGIN
    -- Add is_blocked column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='is_blocked') THEN
        ALTER TABLE users ADD COLUMN is_blocked boolean DEFAULT false NOT NULL;
        RAISE NOTICE 'Added is_blocked column';
    ELSE
        RAISE NOTICE 'is_blocked column already exists';
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