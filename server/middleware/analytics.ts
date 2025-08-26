import { Request, Response, NextFunction } from 'express';
import CryptoJS from 'crypto-js';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { analyticsEvents } from '@shared/schema';
import { db } from '../db';

interface AnalyticsEvent {
  eventType: 'page_view' | 'play_start' | 'play_end';
  visitorId: string;
  sessionId: string;
  path: string;
  gameId?: number;
  durationMs?: number;
  device: string;
  referrerHost?: string;
  country?: string;
}

class AnalyticsQueue {
  private events: AnalyticsEvent[] = [];
  private isProcessing = false;

  add(event: AnalyticsEvent) {
    this.events.push(event);
    this.processQueue();
  }

  private async processQueue() {
    if (this.isProcessing || this.events.length === 0) return;
    
    this.isProcessing = true;
    const eventsToProcess = this.events.splice(0, 100); // Process up to 100 events at once

    try {
      if (eventsToProcess.length > 0) {
        await db.insert(analyticsEvents).values(eventsToProcess);
      }
    } catch (error) {
      console.error('Failed to insert analytics events:', error);
      // Put events back at the front of the queue
      this.events.unshift(...eventsToProcess);
    } finally {
      this.isProcessing = false;
      // Process remaining events if any
      if (this.events.length > 0) {
        setTimeout(() => this.processQueue(), 1000);
      }
    }
  }
}

const analyticsQueue = new AnalyticsQueue();

// Bot detection patterns
const BOT_PATTERNS = [
  /bot/i,
  /crawler/i,
  /spider/i,
  /slurp/i,
  /googlebot/i,
  /bingbot/i,
  /yandexbot/i,
  /facebookexternalhit/i,
  /twitterbot/i,
  /whatsapp/i,
  /linkedinbot/i,
  /telegrambot/i
];

function isBot(userAgent: string): boolean {
  if (!userAgent) return false;
  return BOT_PATTERNS.some(pattern => pattern.test(userAgent));
}

function detectDevice(userAgent: string): 'mobile' | 'desktop' {
  if (!userAgent) return 'desktop';
  return /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) 
    ? 'mobile' 
    : 'desktop';
}

function extractReferrerHost(referrer?: string): string | undefined {
  if (!referrer || referrer === '' || referrer.includes(process.env.VITE_BASE_URL || 'localhost')) {
    return undefined;
  }
  
  try {
    const url = new URL(referrer);
    return url.hostname;
  } catch {
    return undefined;
  }
}

// Extract country from headers (simplified approach using Accept-Language fallback)
function extractCountry(headers: any): string | undefined {
  // First try Cloudflare headers
  const cfCountry = headers['cf-ipcountry'] || headers['CF-IPCountry'];
  if (cfCountry && cfCountry !== 'XX') {
    return cfCountry.toUpperCase();
  }

  // Try X-Forwarded-For country header
  const xCountry = headers['x-country'] || headers['X-Country'];
  if (xCountry) {
    return xCountry.toUpperCase().substring(0, 2);
  }

  // Fallback to Accept-Language (rough approximation)
  const acceptLang = headers['accept-language'];
  if (acceptLang) {
    const match = acceptLang.match(/([a-z]{2}-[A-Z]{2}|[a-z]{2})/);
    if (match) {
      const lang = match[1];
      // Simple mapping of language codes to country codes
      const langToCountry: { [key: string]: string } = {
        'en-US': 'US', 'en-GB': 'GB', 'en-AU': 'AU', 'en-CA': 'CA',
        'fr-FR': 'FR', 'de-DE': 'DE', 'es-ES': 'ES', 'it-IT': 'IT',
        'ja-JP': 'JP', 'ko-KR': 'KR', 'zh-CN': 'CN', 'zh-TW': 'TW',
        'hi-IN': 'IN', 'pt-BR': 'BR', 'ru-RU': 'RU'
      };
      return langToCountry[lang] || lang.substring(0, 2).toUpperCase();
    }
  }

  return undefined;
}

function generateVisitorId(req: Request, res: Response): string {
  // Check for existing visitor ID cookie
  let visitorId = req.cookies?.['gc_vid'];
  
  if (!visitorId) {
    // Generate new visitor ID (privacy-friendly hash)
    const timestamp = Date.now().toString();
    const random = Math.random().toString();
    const ip = req.ip || req.connection.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';
    
    // Create hash from combination (no PII stored)
    visitorId = CryptoJS.SHA256(timestamp + random + ip + userAgent).toString().substring(0, 32);
    
    // Set cookie for 1 year
    res.cookie('gc_vid', visitorId, {
      maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
  }
  
  return visitorId;
}

function generateSessionId(req: Request, res: Response): string {
  // Check for existing session ID cookie
  let sessionId = req.cookies?.['gc_sid'];
  
  if (!sessionId) {
    // Generate new session ID
    sessionId = uuidv4();
    
    // Set cookie for 30 minutes sliding window
    res.cookie('gc_sid', sessionId, {
      maxAge: 30 * 60 * 1000, // 30 minutes
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
  } else {
    // Refresh session cookie expiry
    res.cookie('gc_sid', sessionId, {
      maxAge: 30 * 60 * 1000, // 30 minutes
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
  }
  
  return sessionId;
}

// Main analytics middleware
export function analyticsTracker(req: Request, res: Response, next: NextFunction) {
  // Skip if DNT header is set
  if (req.headers['dnt'] === '1') {
    return next();
  }

  // Skip if bot
  const userAgent = req.headers['user-agent'] || '';
  if (isBot(userAgent)) {
    return next();
  }

  // Skip in development unless specifically enabled
  if (process.env.NODE_ENV !== 'production' && !process.env.ENABLE_ANALYTICS_DEV) {
    return next();
  }

  // Only track GET requests for HTML pages (not API endpoints, assets)
  if (req.method !== 'GET' || 
      req.path.startsWith('/api/') ||
      req.path.startsWith('/assets/') ||
      req.path.includes('.js') ||
      req.path.includes('.css') ||
      req.path.includes('.png') ||
      req.path.includes('.jpg') ||
      req.path.includes('.ico')) {
    return next();
  }

  try {
    const visitorId = generateVisitorId(req, res);
    const sessionId = generateSessionId(req, res);
    const device = detectDevice(userAgent);
    const referrerHost = extractReferrerHost(req.headers.referer);
    const country = extractCountry(req.headers);

    // Create analytics event
    const event: AnalyticsEvent = {
      eventType: 'page_view',
      visitorId,
      sessionId,
      path: req.path,
      device,
      referrerHost,
      country
    };

    // Queue for batch insertion
    analyticsQueue.add(event);

  } catch (error) {
    console.error('Analytics tracking error:', error);
    // Don't break the request flow
  }

  next();
}

// Helper function to log play events  
export function logPlayEvent(eventType: 'play_start' | 'play_end', gameId: number | undefined, req: Request, res: Response, durationMs?: number, gcVid?: string) {
  // Skip if DNT header is set
  if (req.headers['dnt'] === '1') {
    return;
  }

  // Skip if bot
  const userAgent = req.headers['user-agent'] || '';
  if (isBot(userAgent)) {
    return;
  }

  try {
    // Guard log for invalid gameId
    if (gameId && typeof gameId !== 'number') {
      console.warn('[analytics] Dropping non-numeric gameId', gameId);
    }

    // Robust cookie parsing - handle missing req.cookies gracefully
    const rawCookie = (req.headers.cookie ?? '');
    // tiny helper to parse a single cookie out of header if req.cookies is undefined
    const getFromHeader = (name: string) =>
      rawCookie.split(';').map(s => s.trim()).find(s => s.startsWith(name + '='))?.split('=')[1];

    const cookies = (req as any).cookies ?? {};
    let visitorId = cookies.gc_vid || getFromHeader('gc_vid')
                  || (req.headers['x-gc-vid'] as string)
                  || gcVid;

    if (!visitorId) {
      visitorId = crypto.randomUUID().replace(/-/g, '');
      // set a non-HttpOnly cookie so frontend can reuse it
      try {
        res.cookie('gc_vid', visitorId, {
          domain: '.gameschakra.com', path: '/',
          httpOnly: false, secure: true, sameSite: 'none',
          maxAge: 1000 * 60 * 60 * 24 * 400
        });
      } catch (cookieError) {
        console.warn('[analytics] Failed to set gc_vid cookie:', cookieError);
      }
      console.warn('[analytics] gc_vid missing; generated new visitorId');
    }

    let sessionId = cookies.gc_sid || getFromHeader('gc_sid');
    if (!sessionId) {
      sessionId = generateSessionId(req, res);
    }

    const device = detectDevice(userAgent);
    const referrerHost = extractReferrerHost(req.headers.referer);
    const country = extractCountry(req.headers);

    const event: AnalyticsEvent = {
      eventType,
      visitorId,
      sessionId,
      path: req.path,
      gameId,
      durationMs,
      device,
      referrerHost,
      country
    };

    analyticsQueue.add(event);

  } catch (error) {
    console.error('Play event logging error:', error);
  }
}