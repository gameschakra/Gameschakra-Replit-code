import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });
dotenv.config({ path: path.join(process.cwd(), '.env') });

async function fixDatabaseSchema() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Check and add missing columns
    const queries = [
      // Add city column if not exists
      `DO $$ 
       BEGIN
           IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                          WHERE table_name='users' AND column_name='city') THEN
               ALTER TABLE users ADD COLUMN city text;
               RAISE NOTICE 'Added city column';
           ELSE
               RAISE NOTICE 'city column already exists';
           END IF;
       END $$;`,
      
      // Add country column if not exists
      `DO $$ 
       BEGIN
           IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                          WHERE table_name='users' AND column_name='country') THEN
               ALTER TABLE users ADD COLUMN country text;
               RAISE NOTICE 'Added country column';
           ELSE
               RAISE NOTICE 'country column already exists';
           END IF;
       END $$;`,
      
      // Add is_blocked column if not exists
      `DO $$ 
       BEGIN
           IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                          WHERE table_name='users' AND column_name='is_blocked') THEN
               ALTER TABLE users ADD COLUMN is_blocked boolean DEFAULT false NOT NULL;
               RAISE NOTICE 'Added is_blocked column';
           ELSE
               RAISE NOTICE 'is_blocked column already exists';
           END IF;
       END $$;`
    ];

    for (const query of queries) {
      try {
        await client.query(query);
        console.log('✓ Query executed successfully');
      } catch (error) {
        console.error('✗ Error executing query:', error.message);
      }
    }

    // Verify the columns exist
    const columnsResult = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('city', 'country', 'is_blocked')
      ORDER BY column_name;
    `);

    console.log('\nCurrent user table columns:');
    columnsResult.rows.forEach(row => {
      console.log(`- ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable}, default: ${row.column_default})`);
    });

  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await client.end();
    console.log('\nDatabase connection closed');
  }
}

fixDatabaseSchema().catch(console.error);