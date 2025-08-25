import express, { Request, Response } from "express";
import { z } from "zod";
import { isAdmin } from "../middleware/auth";
import { logPlayEvent } from "../middleware/analytics";
import { AnalyticsService } from "../services/analyticsService";
import { db } from "../db";
import { analyticsEvents, analyticsDaily, gamePlayDaily } from "@shared/schema";

const router = express.Router();
const analyticsService = new AnalyticsService();

// Validation schemas
const dateRangeSchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
});

const playEventSchema = z.object({
  gameId: z.number().int().positive()
});

const playEndEventSchema = z.object({
  gameId: z.number().int().positive(),
  durationMs: z.number().int().min(0)
});

// Helper function to get date range with defaults
function getDateRange(req: Request) {
  const fromDate = req.query.from as string || getDateDaysAgo(7);
  const toDate = req.query.to as string || getCurrentDate();
  return { fromDate, toDate };
}

function getDateDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
}

function getCurrentDate(): string {
  return new Date().toISOString().split('T')[0];
}

// Public endpoints for tracking events
router.post('/play/start', async (req: Request, res: Response) => {
  try {
    const { gameId } = playEventSchema.parse(req.body);
    
    logPlayEvent('play_start', gameId, req, res);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error logging play start:', error);
    res.status(400).json({ error: 'Invalid request' });
  }
});

router.post('/play/end', async (req: Request, res: Response) => {
  try {
    const { gameId, durationMs } = playEndEventSchema.parse(req.body);
    
    logPlayEvent('play_end', gameId, req, res, durationMs);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error logging play end:', error);
    res.status(400).json({ error: 'Invalid request' });
  }
});

// Admin-only analytics endpoints
router.get('/summary', isAdmin, async (req: Request, res: Response) => {
  try {
    const { fromDate, toDate } = getDateRange(req);
    
    // Validate date range
    dateRangeSchema.parse({ from: fromDate, to: toDate });
    
    const summary = await analyticsService.getSummary(fromDate, toDate);
    
    res.json(summary);
  } catch (error) {
    console.error('Error getting analytics summary:', error);
    res.status(500).json({ error: 'Failed to get analytics summary' });
  }
});

router.get('/timeseries', isAdmin, async (req: Request, res: Response) => {
  try {
    const { fromDate, toDate } = getDateRange(req);
    const metric = req.query.metric as string || 'visits';
    
    if (!['visits', 'starts'].includes(metric)) {
      return res.status(400).json({ error: 'Invalid metric. Must be "visits" or "starts"' });
    }
    
    // Validate date range
    dateRangeSchema.parse({ from: fromDate, to: toDate });
    
    const timeseries = await analyticsService.getTimeSeries(metric as 'visits' | 'starts', fromDate, toDate);
    
    res.json(timeseries);
  } catch (error) {
    console.error('Error getting timeseries data:', error);
    res.status(500).json({ error: 'Failed to get timeseries data' });
  }
});

router.get('/top-games', isAdmin, async (req: Request, res: Response) => {
  try {
    const { fromDate, toDate } = getDateRange(req);
    const limit = parseInt(req.query.limit as string) || 20;
    
    // Validate date range
    dateRangeSchema.parse({ from: fromDate, to: toDate });
    
    const topGames = await analyticsService.getTopGames(fromDate, toDate, Math.min(limit, 100));
    
    res.json(topGames);
  } catch (error) {
    console.error('Error getting top games:', error);
    res.status(500).json({ error: 'Failed to get top games' });
  }
});

router.get('/devices', isAdmin, async (req: Request, res: Response) => {
  try {
    const { fromDate, toDate } = getDateRange(req);
    
    // Validate date range
    dateRangeSchema.parse({ from: fromDate, to: toDate });
    
    const deviceStats = await analyticsService.getDeviceStats(fromDate, toDate);
    
    res.json(deviceStats);
  } catch (error) {
    console.error('Error getting device stats:', error);
    res.status(500).json({ error: 'Failed to get device stats' });
  }
});

router.get('/referrers', isAdmin, async (req: Request, res: Response) => {
  try {
    const { fromDate, toDate } = getDateRange(req);
    const limit = parseInt(req.query.limit as string) || 20;
    
    // Validate date range
    dateRangeSchema.parse({ from: fromDate, to: toDate });
    
    const referrerStats = await analyticsService.getReferrerStats(fromDate, toDate, Math.min(limit, 100));
    
    res.json(referrerStats);
  } catch (error) {
    console.error('Error getting referrer stats:', error);
    res.status(500).json({ error: 'Failed to get referrer stats' });
  }
});

router.get('/online-now', isAdmin, async (req: Request, res: Response) => {
  try {
    // Get summary for current day to get online-now count
    const today = getCurrentDate();
    const summary = await analyticsService.getSummary(today, today);
    
    res.json({ onlineNow: summary.onlineNow });
  } catch (error) {
    console.error('Error getting online count:', error);
    res.status(500).json({ error: 'Failed to get online count' });
  }
});

// Manual aggregation endpoint (admin-only)
router.post('/aggregate', isAdmin, async (req: Request, res: Response) => {
  try {
    const day = req.query.day as string || getCurrentDate();
    
    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }
    
    await analyticsService.aggregateDaily(day);
    
    res.json({ success: true, message: `Analytics aggregated for ${day}` });
  } catch (error) {
    console.error('Error running manual aggregation:', error);
    res.status(500).json({ error: 'Failed to run aggregation' });
  }
});

// Development only: debug endpoints
if (process.env.NODE_ENV !== 'production') {
  // Seed test data
  router.post('/debug/seed', async (req: Request, res: Response) => {
    try {
      const hours = parseInt(req.query.hours as string) || 24;
      await analyticsService.debugSeed({ hours });
      res.json({ 
        success: true, 
        message: `Seeded analytics data for ${hours} hours` 
      });
    } catch (error: any) {
      console.error('Debug seed error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  });

  // Run aggregation for today
  router.post('/debug/aggregate', async (req: Request, res: Response) => {
    try {
      const day = req.query.day as string;
      const targetDate = day ? new Date(day) : new Date();
      
      await analyticsService.debugAggregateDay(targetDate);
      res.json({ 
        success: true, 
        message: `Aggregated data for ${targetDate.toISOString().split('T')[0]}` 
      });
    } catch (error: any) {
      console.error('Debug aggregate error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  });

  // Clear all analytics data (careful!)
  router.delete('/debug/clear', async (req: Request, res: Response) => {
    try {
      await db.delete(analyticsEvents);
      await db.delete(analyticsDaily);
      await db.delete(gamePlayDaily);
      
      res.json({ 
        success: true, 
        message: 'All analytics data cleared' 
      });
    } catch (error: any) {
      console.error('Debug clear error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  });
}

export default router;