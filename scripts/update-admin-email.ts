import { db } from "../server/db";
import { users } from "../shared/schema";
import { eq } from "drizzle-orm";

async function updateAdminEmail() {
  try {
    console.log("Updating admin email from admin@example.com to admin@gmail.com...");
    
    // Update the admin user email
    const [updatedUser] = await db
      .update(users)
      .set({ 
        email: 'admin@gmail.com',
        name: 'Administrator'
      })
      .where(eq(users.email, 'admin@example.com'))
      .returning();
    
    if (updatedUser) {
      console.log("✅ Admin email updated successfully!");
      console.log(`📧 New Email: ${updatedUser.email}`);
      console.log(`👤 Username: ${updatedUser.username}`);
      console.log(`🔑 Password: admin123 (unchanged)`);
    } else {
      console.log("❌ No admin user found with admin@example.com");
    }
    
  } catch (error) {
    console.error("❌ Error updating admin email:", error);
  } finally {
    process.exit(0);
  }
}

updateAdminEmail();