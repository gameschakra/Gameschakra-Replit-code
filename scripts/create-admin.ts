import { db } from "../server/db";
import { users } from "../shared/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123";
const ADMIN_EMAIL = "admin@example.com";

async function createAdminUser() {
  console.log("Checking if admin user exists...");
  
  // Check if admin user already exists
  const existingAdmin = await db.select().from(users).where(eq(users.username, ADMIN_USERNAME));
  
  if (existingAdmin.length > 0) {
    console.log("Admin user already exists.");
    return;
  }
  
  console.log("Creating admin user...");
  
  // Hash the password
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
  
  // Insert admin user
  const [adminUser] = await db.insert(users).values({
    username: ADMIN_USERNAME,
    password: hashedPassword,
    email: ADMIN_EMAIL,
    isAdmin: true,
    avatarUrl: null,
    createdAt: new Date()
  }).returning();
  
  console.log(`Admin user created successfully with username: ${adminUser.username}`);
  console.log("You can now login with username 'admin' and password 'admin123'");
}

createAdminUser()
  .then(() => {
    console.log("Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error creating admin user:", error);
    process.exit(1);
  });