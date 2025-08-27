import express, { Request, Response } from "express";
import { z } from "zod";
import crypto from "crypto";
import { isAdmin } from "../middleware/auth";
import { logPlayEvent } from "../middleware/analytics";
import { AnalyticsService } from "../services/analyticsService";
import { db } from "../db";
import { analyticsEvents, analyticsDaily, gamePlayDaily, games } from "@shared/schema";
import { eq } from "drizzle-orm";

const router = express.Router();
const analyticsService = new AnalyticsService();

// Validation schemas
const dateRangeSchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
});

const playEventSchema = z.object({
  gameId: z.number().int().positive().optional(),
  gameSlug: z.string().min(1).optional(),
  gcVid: z.string().optional()
}).refine(v => v.gameId || v.gameSlug, {
  message: "Either gameId or gameSlug is required"
});

const playEndEventSchema = z.object({
  gameId: z.number().int().positive().optional(),
  gameSlug: z.string().min(1).optional(),
  durationMs: z.number().int().min(0),
  gcVid: z.string().optional()
}).refine(v => v.gameId || v.gameSlug, {
  message: "Either gameId or gameSlug is required"
});

async function resolveGameId(input: { gameId?: number; gameSlug?: string }): Promise<number | null> {
  // Priority 1: gameId (number) - verify it exists in games table
  if (input.gameId && typeof input.gameId === 'number') {
    const rows = await db.select({ id: games.id }).from(games).where(eq(games.id, input.gameId)).limit(1);
    if (rows.length > 0) return input.gameId;
  }
  
  // Priority 2: gameSlug (string) - lookup by slug
  if (input.gameSlug && typeof input.gameSlug === 'string') {
    const rows = await db.select({ id: games.id }).from(games).where(eq(games.slug, input.gameSlug)).limit(1);
    if (rows.length > 0) return rows[0].id;
  }
  
  return null;
}

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

// Helper function to get visitor/session IDs with fallbacks
function getVisitorSessionIds(req: Request): { visitorId: string, sessionId: string } {
  const randomFallbackId = () => crypto.randomUUID().replace(/-/g, '').slice(0, 32);
  
  const visitorId = req.cookies?.gc_vid 
                 ?? req.headers['x-visitor-id'] as string
                 ?? (req as any).session?.visitorId
                 ?? randomFallbackId();
  
  const sessionId = req.cookies?.gc_sid
                 ?? req.headers['x-session-id'] as string  
                 ?? (req as any).session?.sessionId
                 ?? randomFallbackId();
                 
  return { visitorId, sessionId };
}

// Public endpoints for tracking events
router.post('/page-view', async (req: Request, res: Response) => {
  res.type('application/json');
  try {
    const { visitorId, sessionId } = getVisitorSessionIds(req);
    const path = req.body.path || req.path;
    const referrer = req.body.referrer || req.headers.referer || req.headers.referrer;
    
    // Parse referrer host
    let referrerHost: string | undefined;
    if (referrer && typeof referrer === 'string') {
      try {
        const url = new URL(referrer);
        referrerHost = url.hostname;
      } catch {
        referrerHost = undefined;
      }
    }
    
    // Device detection
    const userAgent = req.headers['user-agent'] || '';
    const device = /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) 
      ? 'mobile' 
      : 'desktop';
    
    // Create page view event
    const event = {
      eventType: 'page_view' as const,
      visitorId,
      sessionId,
      path,
      referrerHost,
      device,
      ts: new Date()
    };
    
    // Insert into database
    await db.insert(analyticsEvents).values(event);
    
    return res.json({ success: true });
  } catch (error) {
    console.error('Error logging page view:', error);
    return res.json({ success: true }); // Always return success to not break user flow
  }
});

router.post('/play/start', async (req: Request, res: Response) => {
  res.type('application/json');
  try {
    const parsed = playEventSchema.parse(req.body);
    const resolvedId = await resolveGameId(parsed);
    const { visitorId, sessionId } = getVisitorSessionIds(req);
    
    if (!resolvedId) {
      console.warn('[analytics] play/start could not resolve gameId/gameSlug', { 
        payload: { gameId: parsed.gameId, gameSlug: parsed.gameSlug },
        visitorId: visitorId.slice(0, 8) + '...'
      });
      // Don't insert invalid game events, but return success
      return res.json({ success: true });
    }
    
    // Create play start event
    const event = {
      eventType: 'play_start' as const,
      visitorId,
      sessionId,
      path: req.path,
      gameId: resolvedId,
      device: /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(req.headers['user-agent'] || '') ? 'mobile' : 'desktop',
      ts: new Date()
    };
    
    await db.insert(analyticsEvents).values(event);
    return res.json({ success: true });
    
  } catch (error) {
    console.error('Error logging play start:', error);
    return res.json({ success: true }); // Always return success
  }
});

router.post('/play/end', async (req: Request, res: Response) => {
  res.type('application/json');
  try {
    const parsed = playEndEventSchema.parse(req.body);
    const resolvedId = await resolveGameId(parsed);
    const { visitorId, sessionId } = getVisitorSessionIds(req);
    
    if (!resolvedId) {
      console.warn('[analytics] play/end could not resolve gameId/gameSlug', { 
        payload: { gameId: parsed.gameId, gameSlug: parsed.gameSlug },
        visitorId: visitorId.slice(0, 8) + '...'
      });
      // Don't insert invalid game events, but return success
      return res.json({ success: true });
    }
    
    if (parsed.durationMs < 0) {
      console.warn('[analytics] play/end invalid duration:', parsed.durationMs);
      return res.json({ success: true }); // Return success, don't break flow
    }
    
    // Create play end event
    const event = {
      eventType: 'play_end' as const,
      visitorId,
      sessionId,
      path: req.path,
      gameId: resolvedId,
      durationMs: parsed.durationMs,
      device: /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(req.headers['user-agent'] || '') ? 'mobile' : 'desktop',
      ts: new Date()
    };
    
    await db.insert(analyticsEvents).values(event);
    return res.json({ success: true });
    
  } catch (error) {
    console.error('Error logging play end:', error);
    return res.json({ success: true }); // Always return success
  }
});

// Public analytics endpoints (no auth required)
router.get('/summary', async (req: Request, res: Response) => {
  res.type('application/json');
  try {
    const { fromDate, toDate } = getDateRange(req);
    dateRangeSchema.parse({ from: fromDate, to: toDate });
    const summary = await analyticsService.getSummary(fromDate, toDate);
    res.json(summary);
  } catch (error) {
    console.error('Error getting analytics summary:', error);
    res.status(500).json({ error: 'Failed to get analytics summary' });
  }
});

router.get('/top-games', async (req: Request, res: Response) => {
  res.type('application/json');
  try {
    const { fromDate, toDate } = getDateRange(req);
    const limit = parseInt(req.query.limit as string) || 20;
    dateRangeSchema.parse({ from: fromDate, to: toDate });
    const topGames = await analyticsService.getTopGames(fromDate, toDate, Math.min(limit, 100));
    res.json(topGames);
  } catch (error) {
    console.error('Error getting top games:', error);
    res.status(500).json({ error: 'Failed to get top games' });
  }
});

router.get('/timeseries', async (req: Request, res: Response) => {
  res.type('application/json');
  try {
    const { fromDate, toDate } = getDateRange(req);
    const metric = req.query.metric as string || 'visits';
    if (!['visits', 'starts'].includes(metric)) {
      return res.status(400).json({ error: 'Invalid metric. Must be "visits" or "starts"' });
    }
    dateRangeSchema.parse({ from: fromDate, to: toDate });
    const timeseries = await analyticsService.getTimeSeries(metric as 'visits' | 'starts', fromDate, toDate);
    res.json(timeseries);
  } catch (error) {
    console.error('Error getting timeseries data:', error);
    res.status(500).json({ error: 'Failed to get timeseries data' });
  }
});

router.get('/devices', async (req: Request, res: Response) => {
  res.type('application/json');
  try {
    const { fromDate, toDate } = getDateRange(req);
    dateRangeSchema.parse({ from: fromDate, to: toDate });
    const deviceStats = await analyticsService.getDeviceStats(fromDate, toDate);
    res.json(deviceStats);
  } catch (error) {
    console.error('Error getting device stats:', error);
    res.status(500).json({ error: 'Failed to get device stats' });
  }
});

router.get('/referrers', async (req: Request, res: Response) => {
  res.type('application/json');
  try {
    const { fromDate, toDate } = getDateRange(req);
    const limit = parseInt(req.query.limit as string) || 20;
    dateRangeSchema.parse({ from: fromDate, to: toDate });
    const referrerStats = await analyticsService.getReferrerStats(fromDate, toDate, Math.min(limit, 100));
    res.json(referrerStats);
  } catch (error) {
    console.error('Error getting referrer stats:', error);
    res.status(500).json({ error: 'Failed to get referrer stats' });
  }
});

// Admin-only analytics endpoints
router.get('/admin/summary', isAdmin, async (req: Request, res: Response) => {
  res.type('application/json');
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

router.get('/admin/timeseries', isAdmin, async (req: Request, res: Response) => {
  res.type('application/json');
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

router.get('/admin/top-games', isAdmin, async (req: Request, res: Response) => {
  res.type('application/json');
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

router.get('/admin/devices', isAdmin, async (req: Request, res: Response) => {
  res.type('application/json');
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

router.get('/admin/referrers', isAdmin, async (req: Request, res: Response) => {
  res.type('application/json');
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

router.get('/admin/online-now', isAdmin, async (req: Request, res: Response) => {
  res.type('application/json');
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
router.post('/admin/aggregate', isAdmin, async (req: Request, res: Response) => {
  res.type('application/json');
  try {
    const day = String(req.query.day || '').trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) {
      return res.status(400).json({ error: 'Invalid or missing day' });
    }
    await analyticsService.aggregateDaily(day);
    return res.json({ success: true, day, message: `Aggregated analytics for ${day}` });
  } catch (e) {
    console.error('aggregate error', e);
    return res.status(500).json({ error: 'Aggregation failed' });
  }
});

// Development only: debug endpoints
if (process.env.NODE_ENV !== 'production') {
  // Seed test data
  router.post('/debug/seed', async (req: Request, res: Response) => {
    res.type('application/json');
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
    res.type('application/json');
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
    res.type('application/json');
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