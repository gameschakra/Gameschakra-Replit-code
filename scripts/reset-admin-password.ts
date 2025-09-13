import { db } from "../server/db";
import { users } from "../shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

async function resetAdminPassword() {
  try {
    console.log("Resetting admin password...");
    
    // New password
    const newPassword = "admin";
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    // Update admin password
    await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.email, 'admin@gmail.com'));
    
    console.log("✅ Admin password reset successfully!");
    console.log("Email: admin@gmail.com");
    console.log("Password: admin");
    
  } catch (error) {
    console.error("❌ Error resetting admin password:", error);
  } finally {
    process.exit(0);
  }
}

resetAdminPassword();