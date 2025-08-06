import express, { Request, Response } from "express";
import { storage } from "../storage";
import { z } from "zod";
import { InsertGameAnalytics, InsertTrafficSource } from "@shared/schema";
import { getDateDaysAgo, getCurrentDate } from "../utils";
import { processRequestForAnalytics } from "../services/deviceDetectionService";

const router = express.Router();

/**
 * Admin middleware - ensures only admin users can access certain endpoints
 */
function isAdmin(req: Request, res: Response, next: express.NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!req.user.isAdmin) {
    return res.status(403).json({ error: "Forbidden" });
  }

  next();
}

/**
 * Record a game play event
 */
router.post('/record-play', async (req: Request, res: Response) => {
  try {
    const { gameId, playDuration, score, completed, level, actions } = req.body;
    
    // Add user info if authenticated
    const userId = req.isAuthenticated() ? req.user.id : null;
    
    // Get device & traffic info
    const deviceInfo = processRequestForAnalytics(req);
    
    // Create game analytics entry
    const analytics = await storage.addGameAnalytics({
      gameId,
      userId,
      sessionId: deviceInfo.sessionId,
      deviceType: deviceInfo.deviceType,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      playDuration,
      level,
      score,
      completed,
      actions
    });
    
    // Record traffic source
    await storage.addTrafficSource({
      gameId,
      userId,
      sessionId: deviceInfo.sessionId,
      source: deviceInfo.source,
      referrer: deviceInfo.referrer
    });
    
    // Increment game play count
    await storage.incrementGamePlayCount(gameId);
    
    // If user is authenticated, add to recently played
    if (userId) {
      await storage.addRecentlyPlayed({
        userId,
        gameId
      });
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error recording play:", error);
    res.status(500).json({ error: "Failed to record play data" });
  }
});

/**
 * Get analytics dashboard data
 */
router.get('/dashboard', isAdmin, async (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || getDateDaysAgo(30);
    const endDate = req.query.endDate as string || getCurrentDate();
    
    // Get traffic sources for all games
    const trafficSources = await storage.getTrafficSources(undefined, startDate, endDate);
    
    // Aggregate traffic source data
    const sources: Record<string, number> = {};
    const referrers: Record<string, number> = {};
    
    trafficSources.forEach(source => {
      // Aggregate by source type
      sources[source.source] = (sources[source.source] || 0) + 1;
      
      // Aggregate by referrer if available
      if (source.referrer) {
        referrers[source.referrer] = (referrers[source.referrer] || 0) + 1;
      }
    });
    
    // Get all games for analytics
    const games = await storage.getGames();
    
    // Get game analytics
    const gamesAnalytics = await Promise.all(
      games.map(async game => {
        const analytics = await storage.getGameAnalytics(game.id, startDate, endDate);
        
        // Calculate total plays and by device
        const totalPlays = analytics.length;
        const deviceBreakdown: Record<string, number> = {};
        const browserBreakdown: Record<string, number> = {};
        const osBreakdown: Record<string, number> = {};
        
        analytics.forEach(a => {
          if (a.deviceType) {
            deviceBreakdown[a.deviceType] = (deviceBreakdown[a.deviceType] || 0) + 1;
          }
          
          if (a.browser) {
            browserBreakdown[a.browser] = (browserBreakdown[a.browser] || 0) + 1;
          }
          
          if (a.os) {
            osBreakdown[a.os] = (osBreakdown[a.os] || 0) + 1;
          }
        });
        
        return {
          id: game.id,
          title: game.title,
          slug: game.slug,
          totalPlays,
          deviceBreakdown,
          browserBreakdown,
          osBreakdown
        };
      })
    );
    
    // Sort games by total plays
    const topGames = [...gamesAnalytics].sort((a, b) => b.totalPlays - a.totalPlays);
    
    // Aggregate device data across all games
    const deviceAnalytics: Record<string, number> = {};
    const browserAnalytics: Record<string, number> = {};
    const osAnalytics: Record<string, number> = {};
    
    gamesAnalytics.forEach(game => {
      Object.entries(game.deviceBreakdown).forEach(([key, value]) => {
        deviceAnalytics[key] = (deviceAnalytics[key] || 0) + value;
      });
      
      Object.entries(game.browserBreakdown).forEach(([key, value]) => {
        browserAnalytics[key] = (browserAnalytics[key] || 0) + value;
      });
      
      Object.entries(game.osBreakdown).forEach(([key, value]) => {
        osAnalytics[key] = (osAnalytics[key] || 0) + value;
      });
    });
    
    res.json({
      trafficData: {
        sources,
        referrers
      },
      deviceData: {
        devices: deviceAnalytics,
        browsers: browserAnalytics,
        os: osAnalytics
      },
      topGames: topGames.slice(0, 10),
      totalGamePlays: gamesAnalytics.reduce((acc, game) => acc + game.totalPlays, 0),
      startDate,
      endDate
    });
  } catch (error) {
    console.error("Error fetching analytics dashboard:", error);
    res.status(500).json({ error: "Failed to fetch analytics data" });
  }
});

/**
 * Get analytics for a specific game
 */
router.get('/games/:id', isAdmin, async (req: Request, res: Response) => {
  try {
    const gameId = parseInt(req.params.id);
    const startDate = req.query.startDate as string || getDateDaysAgo(30);
    const endDate = req.query.endDate as string || getCurrentDate();
    
    // Get game details
    const game = await storage.getGameById(gameId);
    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }
    
    // Get game analytics
    const analytics = await storage.getGameAnalytics(gameId, startDate, endDate);
    
    // Get traffic sources
    const trafficSources = await storage.getTrafficSources(gameId, startDate, endDate);
    
    // Aggregate data by device, browser, OS
    const deviceBreakdown: Record<string, number> = {};
    const browserBreakdown: Record<string, number> = {};
    const osBreakdown: Record<string, number> = {};
    const sourcesBreakdown: Record<string, number> = {};
    const referrersBreakdown: Record<string, number> = {};
    const playByDate: Record<string, number> = {};
    
    // Analyze game analytics
    analytics.forEach(a => {
      if (a.deviceType) {
        deviceBreakdown[a.deviceType] = (deviceBreakdown[a.deviceType] || 0) + 1;
      }
      
      if (a.browser) {
        browserBreakdown[a.browser] = (browserBreakdown[a.browser] || 0) + 1;
      }
      
      if (a.os) {
        osBreakdown[a.os] = (osBreakdown[a.os] || 0) + 1;
      }
      
      if (a.playDate) {
        playByDate[a.playDate] = (playByDate[a.playDate] || 0) + 1;
      }
    });
    
    // Analyze traffic sources
    trafficSources.forEach(s => {
      sourcesBreakdown[s.source] = (sourcesBreakdown[s.source] || 0) + 1;
      
      if (s.referrer) {
        referrersBreakdown[s.referrer] = (referrersBreakdown[s.referrer] || 0) + 1;
      }
    });
    
    // Calculate completed rates, average scores, etc.
    const totalPlays = analytics.length;
    const completedPlays = analytics.filter(a => a.completed).length;
    const completionRate = totalPlays > 0 ? (completedPlays / totalPlays) * 100 : 0;
    
    // Calculate average score (if applicable)
    const scores = analytics.filter(a => a.score !== null && a.score !== undefined).map(a => a.score!);
    const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    
    // Calculate average play duration
    const durations = analytics.filter(a => a.playDuration !== null && a.playDuration !== undefined).map(a => a.playDuration!);
    const averageDuration = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
    
    res.json({
      game,
      analytics: {
        totalPlays,
        completedPlays,
        completionRate,
        averageScore,
        averageDuration,
        deviceBreakdown,
        browserBreakdown,
        osBreakdown,
        sourcesBreakdown,
        referrersBreakdown,
        playByDate
      },
      startDate,
      endDate
    });
  } catch (error) {
    console.error("Error fetching game analytics:", error);
    res.status(500).json({ error: "Failed to fetch game analytics" });
  }
});

export default router;