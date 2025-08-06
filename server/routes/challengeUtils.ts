import fs from 'fs';
import path from 'path';
import { storage } from '../storage';

/**
 * Auto-update challenge statuses based on dates
 * This function can be called periodically to ensure challenge statuses
 * stay in sync with their date ranges
 */
export async function updateChallengeStatuses(): Promise<void> {
  try {
    // Get all challenges
    const challenges = await storage.getChallenges();
    const now = new Date();
    
    for (const challenge of challenges) {
      const startDate = new Date(challenge.startDate);
      const endDate = new Date(challenge.endDate);
      
      let newStatus: "upcoming" | "active" | "completed" | null = null;
      
      // Determine what the status should be based on current date
      if (now < startDate) {
        newStatus = "upcoming";
      } else if (now >= startDate && now <= endDate) {
        newStatus = "active";
      } else if (now > endDate) {
        newStatus = "completed";
      }
      
      // Only update if status needs to change
      if (newStatus && newStatus !== challenge.status) {
        console.log(`Updating challenge ${challenge.id} status from ${challenge.status} to ${newStatus}`);
        await storage.updateChallengeStatus(challenge.id, newStatus);
      }
    }
    
    console.log(`Challenge statuses checked and updated at ${new Date().toISOString()}`);
  } catch (error) {
    console.error('Error updating challenge statuses:', error);
  }
}

/**
 * Set up a schedule to update challenge statuses every hour
 */
export function scheduleStatusUpdates(): NodeJS.Timeout {
  console.log('Scheduling challenge status updates every hour');
  // Run immediately once at startup
  updateChallengeStatuses();
  
  // Then schedule hourly updates
  return setInterval(updateChallengeStatuses, 60 * 60 * 1000); // Every hour
}

/**
 * Ensure the challenge screenshots directory exists
 */
export function ensureChallengeDirectories(): void {
  const screenshotsDir = path.join(process.cwd(), 'uploads', 'challenge-screenshots');
  
  if (!fs.existsSync(screenshotsDir)) {
    console.log('Creating challenge screenshots directory');
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }
}

/**
 * Get relative path to a challenge screenshot for serving through API
 */
export function getChallengeScreenshotPath(filename: string): string {
  return path.join('challenge-screenshots', filename);
}