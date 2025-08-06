import express, { Request, Response } from "express";
import { storage } from "../storage";
import { isAuthenticated, isAdmin } from "../middleware/auth";
import { z } from "zod";
import { insertChallengeSchema, insertChallengeParticipantSchema, insertChallengeSubmissionSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";

// Set up multer for screenshot uploads
const screenshotStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), 'uploads', 'challenge-screenshots');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: screenshotStorage,
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB max file size for screenshots
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

const router = express.Router();

// Get all challenges (optionally filtered by status)
router.get("/", async (req: Request, res: Response) => {
  try {
    const status = req.query.status as "upcoming" | "active" | "completed" | undefined;
    const challenges = await storage.getChallenges(status);
    
    // Enhance the response with participant count for each challenge
    const enhancedChallenges = await Promise.all(challenges.map(async (challenge) => {
      const participants = await storage.getChallengeParticipants(challenge.id);
      // Each challenge now already includes the game data from the storage.getChallenges join
      return {
        ...challenge,
        participantCount: participants.length
      };
    }));
    
    res.json(enhancedChallenges);
  } catch (error: any) {
    console.error('Error fetching challenges:', error);
    res.status(500).json({ message: `Error fetching challenges: ${error.message}` });
  }
});

// Get challenge by slug
router.get("/:slug", async (req: Request, res: Response) => {
  try {
    const challenge = await storage.getChallengeBySlug(req.params.slug);
    
    if (!challenge) {
      return res.status(404).json({ message: "Challenge not found" });
    }
    
    // Get associated game if there is one
    let game = null;
    if (challenge.gameId) {
      game = await storage.getGameById(challenge.gameId);
    }
    
    // Get participant count
    const participants = await storage.getChallengeParticipants(challenge.id);
    
    // Get top submissions (limited to top 10)
    const leaderboard = await storage.getChallengeLeaderboard(challenge.id, 10);
    
    // Check if the current user is participating (if logged in)
    let isParticipating = false;
    let userSubmission = null;
    
    if (req.user && 'id' in req.user) {
      isParticipating = await storage.isUserParticipating(challenge.id, req.user.id);
      userSubmission = await storage.getUserChallengeSubmission(challenge.id, req.user.id);
    }
    
    res.json({
      challenge,
      game,
      participants: participants.length,
      leaderboard,
      isParticipating,
      userSubmission
    });
  } catch (error: any) {
    res.status(500).json({ message: `Error fetching challenge: ${error.message}` });
  }
});

// Create a new challenge (admin only)
router.post("/", isAdmin, async (req: Request, res: Response) => {
  try {
    // Parse and validate challenge data
    const challengeData = insertChallengeSchema.parse(req.body);
    
    // Create the challenge
    const challenge = await storage.createChallenge(challengeData);
    
    res.status(201).json(challenge);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors });
    }
    res.status(500).json({ message: `Error creating challenge: ${error.message}` });
  }
});

// Update a challenge (admin only)
router.put("/:id", isAdmin, async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    
    // Validate challenge data
    const challengeData = insertChallengeSchema.partial().parse(req.body);
    
    // Update the challenge
    const challenge = await storage.updateChallenge(id, challengeData);
    
    if (!challenge) {
      return res.status(404).json({ message: "Challenge not found" });
    }
    
    res.json(challenge);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors });
    }
    res.status(500).json({ message: `Error updating challenge: ${error.message}` });
  }
});

// Delete a challenge (admin only)
router.delete("/:id", isAdmin, async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    
    // Delete the challenge
    const success = await storage.deleteChallenge(id);
    
    if (!success) {
      return res.status(404).json({ message: "Challenge not found" });
    }
    
    res.json({ message: "Challenge deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: `Error deleting challenge: ${error.message}` });
  }
});

// Update challenge status manually (admin only)
router.post("/:id/update-status", isAdmin, async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;
    
    if (!status || !["upcoming", "active", "completed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }
    
    // Update challenge status
    const challenge = await storage.updateChallengeStatus(id, status as "upcoming" | "active" | "completed");
    
    if (!challenge) {
      return res.status(404).json({ message: "Challenge not found" });
    }
    
    res.json(challenge);
  } catch (error: any) {
    res.status(500).json({ message: `Error updating challenge status: ${error.message}` });
  }
});

// Get all participants for a challenge
router.get("/:id/participants", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    
    // Get challenge participants
    const participants = await storage.getChallengeParticipants(id);
    
    res.json(participants);
  } catch (error: any) {
    res.status(500).json({ message: `Error fetching challenge participants: ${error.message}` });
  }
});

// Join a challenge (requires authentication)
router.post("/:id/join", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const challengeId = Number(req.params.id);
    
    if (!req.user || !('id' in req.user)) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const userId = req.user.id;
    
    // Check if the challenge exists
    const challenge = await storage.getChallengeById(challengeId);
    
    if (!challenge) {
      return res.status(404).json({ message: "Challenge not found" });
    }
    
    // Check if challenge is active or upcoming
    if (challenge.status === "completed") {
      return res.status(400).json({ message: "Cannot join a completed challenge" });
    }
    
    // Add participant
    const participant = await storage.addChallengeParticipant({
      challengeId,
      userId
    });
    
    res.status(201).json(participant);
  } catch (error: any) {
    res.status(500).json({ message: `Error joining challenge: ${error.message}` });
  }
});

// Leave a challenge (requires authentication)
router.post("/:id/leave", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const challengeId = Number(req.params.id);
    
    if (!req.user || !('id' in req.user)) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const userId = req.user.id;
    
    // Check if the challenge exists
    const challenge = await storage.getChallengeById(challengeId);
    
    if (!challenge) {
      return res.status(404).json({ message: "Challenge not found" });
    }
    
    // Check if challenge is active or upcoming
    if (challenge.status === "completed") {
      return res.status(400).json({ message: "Cannot leave a completed challenge" });
    }
    
    // Check if user already submitted to this challenge
    const submission = await storage.getUserChallengeSubmission(challengeId, userId);
    
    if (submission) {
      return res.status(400).json({ message: "Cannot leave a challenge you've already submitted to" });
    }
    
    // Remove participant
    const success = await storage.removeChallengeParticipant(challengeId, userId);
    
    if (!success) {
      return res.status(404).json({ message: "You are not participating in this challenge" });
    }
    
    res.json({ message: "Left challenge successfully" });
  } catch (error: any) {
    res.status(500).json({ message: `Error leaving challenge: ${error.message}` });
  }
});

// Get leaderboard for a challenge
router.get("/:id/leaderboard", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    
    // Get challenge leaderboard
    const leaderboard = await storage.getChallengeLeaderboard(id);
    
    res.json(leaderboard);
  } catch (error: any) {
    res.status(500).json({ message: `Error fetching challenge leaderboard: ${error.message}` });
  }
});

// Submit a score to a challenge (requires authentication)
router.post("/:id/submit", isAuthenticated, upload.single('screenshot'), async (req: Request, res: Response) => {
  try {
    const challengeId = Number(req.params.id);
    
    if (!req.user || !('id' in req.user)) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const userId = req.user.id;
    
    // Check if the challenge exists
    const challenge = await storage.getChallengeById(challengeId);
    
    if (!challenge) {
      return res.status(404).json({ message: "Challenge not found" });
    }
    
    // Check if challenge is active
    if (challenge.status !== "active") {
      return res.status(400).json({ 
        message: challenge.status === "upcoming" 
          ? "Challenge has not started yet" 
          : "Challenge has already ended" 
      });
    }
    
    // Check if user is participating
    const isParticipating = await storage.isUserParticipating(challengeId, userId);
    
    if (!isParticipating) {
      return res.status(400).json({ message: "You must join the challenge before submitting a score" });
    }
    
    // Get screenshot path if provided
    let screenshotPath = null;
    if (req.file) {
      screenshotPath = path.relative(path.join(process.cwd(), 'uploads'), req.file.path);
    }
    
    // Parse data from request
    const { score, comment } = req.body;
    
    // Validate score is a positive number
    const scoreNumber = Number(score);
    if (isNaN(scoreNumber) || scoreNumber < 0) {
      return res.status(400).json({ message: "Score must be a positive number" });
    }
    
    // Add submission
    const submission = await storage.addChallengeSubmission({
      challengeId,
      userId,
      score: scoreNumber,
      screenshot: screenshotPath,
      comment: comment || null
    });
    
    res.status(201).json(submission);
  } catch (error: any) {
    res.status(500).json({ message: `Error submitting to challenge: ${error.message}` });
  }
});

export default router;