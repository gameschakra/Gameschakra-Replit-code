import { defineConfig } from "drizzle-kit";
import * as dotenv from 'dotenv';
import { existsSync } from 'fs';

// Load appropriate env file (same logic as db.ts)
let envFile = '.env';
if (process.env.NODE_ENV === 'production' && existsSync('.env.production')) {
  envFile = '.env.production';
} else if (existsSync('.env.local')) {
  envFile = '.env.local';
}

console.log(`Drizzle loading environment from: ${envFile}`);
dotenv.config({ path: envFile });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL not found. Ensure .env.local or .env file has DATABASE_URL");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' 
      ? { 
          rejectUnauthorized: false, // AWS RDS uses self-signed certificates
          require: true // Still require SSL connection
        }
      : { rejectUnauthorized: false }
  },
});
