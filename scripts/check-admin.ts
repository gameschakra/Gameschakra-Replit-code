import { db } from "../server/db";
import { users } from "../shared/schema";
import { eq, or } from "drizzle-orm";

async function checkAdminUsers() {
  try {
    console.log("Checking for admin users...");
    
    // Check for admin users
    const adminUsers = await db.select({
      id: users.id,
      email: users.email,
      username: users.username,
      name: users.name,
      isAdmin: users.isAdmin
    }).from(users).where(eq(users.isAdmin, true));
    
    console.log("Found admin users:", adminUsers.length);
    adminUsers.forEach(user => {
      console.log(`- ID: ${user.id}, Email: ${user.email}, Username: ${user.username}, Name: ${user.name}`);
    });

    // Check for specific admin email
    const adminByEmail = await db.select({
      id: users.id,
      email: users.email,
      username: users.username,
      name: users.name,
      isAdmin: users.isAdmin
    }).from(users).where(eq(users.email, 'admin@gmail.com'));
    if (adminByEmail.length > 0) {
      console.log("Found admin@gmail.com:", adminByEmail[0]);
    } else {
      console.log("No admin@gmail.com found");
    }
    
  } catch (error) {
    console.error("Error checking admin users:", error);
  } finally {
    process.exit(0);
  }
}

checkAdminUsers();