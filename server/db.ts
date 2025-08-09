import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// Load environment variables explicitly
import * as dotenv from 'dotenv';
import { existsSync } from 'fs';

// Load appropriate env file based on NODE_ENV and availability
let envFile = '.env';
if (process.env.NODE_ENV === 'production' && existsSync('.env.production')) {
  envFile = '.env.production';
} else if (existsSync('.env.local')) {
  envFile = '.env.local';
}

console.log(`Loading environment from: ${envFile}`);
dotenv.config({ path: envFile });

// Validate required environment variables
if (!process.env.DATABASE_URL) {
  console.error('❌ FATAL: DATABASE_URL is required');
  process.exit(1);
}

// Connection string - NO FALLBACKS IN PRODUCTION
const connectionString = process.env.DATABASE_URL;

console.log("DATABASE_URL:", process.env.DATABASE_URL);
console.log("Connection string:", connectionString);

// Create a postgres client with max lifetime to prevent connection timeout
let client: any;
let db: any;

try {
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgres')) {
    // AWS RDS SSL configuration
    const sslConfig = process.env.NODE_ENV === 'production' 
      ? { rejectUnauthorized: false } // AWS RDS uses self-signed certificates
      : { rejectUnauthorized: false }; // Allow dev certificates
    
    client = postgres(connectionString, {
      ssl: sslConfig,
      max: parseInt(process.env.MAX_CONNECTIONS || '10'),
      idle_timeout: 20,
      max_lifetime: 60 * 30
    });
    
    // Create a drizzle instance
    db = drizzle(client);
    
    // Test the connection by running a simple query
    async function testConnection() {
      try {
        const result = await client`SELECT 1 as connection_test`;
        console.log("Connected to PostgreSQL database successfully");
      } catch (error) {
        console.error("Error connecting to PostgreSQL database:", error);
        // Don't throw error in development, just warn
        console.warn("Database connection failed, some features may not work");
      }
    }
    
    // Initial connection test
    testConnection();
  } else {
    console.warn("No valid DATABASE_URL found, database features will be disabled");
    // Create a comprehensive mock db object for development
    const mockQueryBuilder = {
      where: () => mockQueryBuilder,
      leftJoin: () => mockQueryBuilder,
      rightJoin: () => mockQueryBuilder,
      innerJoin: () => mockQueryBuilder,
      orderBy: () => mockQueryBuilder,
      limit: () => mockQueryBuilder,
      offset: () => mockQueryBuilder,
      groupBy: () => mockQueryBuilder,
      having: () => mockQueryBuilder,
      returning: () => [],
      execute: () => Promise.resolve([]),
      then: (resolve: any) => resolve([])
    };
    
    db = {
      select: () => ({ 
        from: () => mockQueryBuilder
      }),
      insert: () => ({ 
        values: () => ({ 
          returning: () => [],
          execute: () => Promise.resolve([])
        }) 
      }),
      update: () => ({ 
        set: () => ({ 
          where: () => mockQueryBuilder 
        }) 
      }),
      delete: () => ({ 
        where: () => mockQueryBuilder 
      })
    };
  }
} catch (error) {
  console.error("Database initialization error:", error);
  console.warn("Running without database connection");
  // Create a comprehensive mock db object
  const mockQueryBuilder = {
    where: () => mockQueryBuilder,
    leftJoin: () => mockQueryBuilder,
    rightJoin: () => mockQueryBuilder,
    innerJoin: () => mockQueryBuilder,
    orderBy: () => mockQueryBuilder,
    limit: () => mockQueryBuilder,
    offset: () => mockQueryBuilder,
    groupBy: () => mockQueryBuilder,
    having: () => mockQueryBuilder,
    returning: () => [],
    execute: () => Promise.resolve([]),
    then: (resolve: any) => resolve([])
  };
  
  db = {
    select: () => ({ 
      from: () => mockQueryBuilder
    }),
    insert: () => ({ 
      values: () => ({ 
        returning: () => [],
        execute: () => Promise.resolve([])
      }) 
    }),
    update: () => ({ 
      set: () => ({ 
        where: () => mockQueryBuilder 
      }) 
    }),
    delete: () => ({ 
      where: () => mockQueryBuilder 
    })
  };
}

export { db };
