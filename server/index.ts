// Load environment variables first
import * as dotenv from 'dotenv';

// Load appropriate env file based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
dotenv.config({ path: envFile });

// Validate critical environment variables
const requiredEnvVars = ['DATABASE_URL', 'SESSION_SECRET'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ FATAL: ${envVar} is required`);
    process.exit(1);
  }
}

if (process.env.NODE_ENV === 'production' && process.env.SESSION_SECRET === 'your-secret-key-change-this-in-production') {
  console.error('❌ FATAL: Must change SESSION_SECRET in production');
  process.exit(1);
}

import express, { type Request, Response, NextFunction } from "express";
import cookieParser from 'cookie-parser';
import { registerRoutes } from "./routes";
import { scheduleSitemapGeneration } from "./utils/sitemapGenerator";
import * as cron from 'node-cron';
import { AnalyticsService } from './services/analyticsService';
import path from "path";
import * as fileService from "./services/fileService";
import { log, warn, error } from "./logger";

const app = express();

// Trust proxy configuration - we are behind Nginx/HTTPS
app.set('trust proxy', 1);
log('🔧 Trust proxy enabled for production');

// Configure middleware with production-optimized limits
const bodyLimit = process.env.BODY_PARSER_LIMIT || '50mb';
app.use(express.json({ limit: bodyLimit }));
app.use(express.urlencoded({ extended: true, limit: bodyLimit }));
app.use(cookieParser());

// Serve static files from public directory (for ads.txt, sitemap.xml, etc.)
app.use(express.static('public', {
  dotfiles: 'ignore',
  maxAge: '1d'
}));

// Serve static game files directly from uploads directory
app.use('/api/games', express.static(fileService.GAMES_DIR, {
  index: false, // Don't auto-serve index.html
  dotfiles: 'ignore', // Don't serve .dot files
  maxAge: '1d' // Cache assets for 1 day
}));

// Configure global server timeout for file uploads
app.use((req, res, next) => {
  const timeout = parseInt(process.env.REQUEST_TIMEOUT || '300000'); // Default 5 minutes
  req.setTimeout(timeout);
  next();
});

// Configure CORS for cross-domain requests with credentials
app.use((req, res, next) => {
  // Log the request details for debugging
  console.log(`[CORS] Request from ${req.headers.origin || 'unknown origin'} to ${req.method} ${req.path}`);
  console.log(`[CORS] Request cookies: ${req.headers.cookie || 'no cookies'}`);
  
  // SECURE CORS Configuration
  const origin = req.headers.origin;
  // Production origins should be set via CORS_ORIGIN environment variable
  const allowedOrigins = process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
    : process.env.NODE_ENV === 'production' 
      ? [] // No default origins in production - must be explicitly set
      : ['http://localhost:3000', 'http://127.0.0.1:5000', 'http://localhost:5000'];
  
  if (process.env.NODE_ENV === 'production') {
    // Production: strict origin checking
    if (allowedOrigins.length === 0) {
      console.warn('[CORS] WARNING: No allowed origins configured for production! Set CORS_ORIGIN environment variable.');
    }

    // Handle same-origin requests (no Origin header) OR allowed origins
    if (!origin) {
      // Same-origin request (browser doesn't send Origin header)
      const effectiveOrigin = allowedOrigins[0] || 'https://gameschakra.com';
      res.setHeader('Access-Control-Allow-Origin', effectiveOrigin);
      console.log(`[CORS] Same-origin request (no Origin header), using: ${effectiveOrigin}`);
    } else if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      console.log(`[CORS] Allowed origin: ${origin}`);
    } else {
      console.log(`[CORS] Blocked origin: ${origin} (allowed: ${allowedOrigins.join(', ')})`);
      // Don't set CORS headers for unauthorized origins
    }
  } else {
    // Development: more permissive for localhost testing
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      console.log(`[CORS] Dev mode - allowing origin: ${origin}`);
    } else {
      // Allow all origins in development for testing
      res.setHeader('Access-Control-Allow-Origin', '*');
      console.log('[CORS] Dev mode - allowing all origins (no origin header)');
    }
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Expose-Headers', 'Set-Cookie, Content-Disposition');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('[CORS] Handling OPTIONS preflight request');
    return res.status(204).end();
  }
  
  // Set Content Security Policy to allow AdSense, Google Tag Manager, OAuth domains and other needed resources
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com https://partner.googleadservices.com https://tpc.googlesyndication.com https://www.googletagservices.com https://adservice.google.com https://www.google.com https://www.gstatic.com https://cse.google.com https://www.googletagmanager.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "img-src 'self' data: https: http:; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "frame-src 'self' https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://www.google.com https://accounts.google.com https://appleid.apple.com; " + 
    "connect-src 'self' https://*.googlesyndication.com https://*.google.com https://*.doubleclick.net https://www.google-analytics.com https://www.googletagmanager.com https://adservice.google.com https://pagead2.googlesyndication.com https://*.adtrafficquality.google https://*.g.doubleclick.net https://ep1.adtrafficquality.google https://accounts.google.com https://appleid.apple.com;"
  );
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Setup static serving or dev middleware based on environment
  if (process.env.NODE_ENV !== "production") {
    // Only import vite in development
    try {
      const { attachVite } = await import("./vite.js");
      await attachVite(app);
      log('🔧 Vite development middleware enabled');
    } catch (err) {
      error('❌ Failed to setup Vite dev middleware:', err);
      process.exit(1);
    }
  } else {
    // Production static file serving - NO vite imports
    const root = process.cwd();

    // Mount uploads explicitly
    app.use('/images/games', express.static(path.join(root, 'uploads', 'thumbnails'), {
      fallthrough: true,
      maxAge: '7d',
      setHeaders(res) { res.setHeader('Cache-Control', 'public, max-age=604800, immutable'); }
    }));

    app.use('/games', express.static(path.join(root, 'uploads', 'games'), {
      fallthrough: true,
      setHeaders(res) { res.setHeader('Cross-Origin-Opener-Policy', 'same-origin'); }
    }));

    // Serve built client
    app.use(express.static(path.join(root, 'dist', 'public'), { maxAge: '7d' }));

    // SPA fallback
    app.use('*', (_req, res) => {
      res.sendFile(path.join(root, 'dist', 'public', 'index.html'));
    });

    log('📦 Production static file serving enabled');
  }

  // Serve the app on the configured port and host
  const port = parseInt(process.env.PORT || '5000');
  const host = process.env.HOST || (process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1');
  
  server.listen(port, host, () => {
    log(`🚀 GameHub Pro serving on ${host}:${port}`);
    log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    log(`🗄️  Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
    log(`🔐 Trust Proxy: ${process.env.TRUST_PROXY === 'true' ? 'Enabled' : 'Disabled'}`);
    log(`🍪 Cookie Domain: ${process.env.COOKIE_DOMAIN || 'default'}`);
    log(`🌐 CORS Origins: ${process.env.CORS_ORIGIN || 'development defaults'}`);
    log(`🔑 Google OAuth: ${process.env.GOOGLE_CLIENT_ID ? 'Configured' : 'Not configured'}`);
    
    // Generate sitemap on server start and schedule regeneration
    const sitemapInterval = scheduleSitemapGeneration();
    
    // Initialize analytics service
    const analyticsService = new AnalyticsService();
    
    // Schedule nightly analytics aggregation at 2:00 AM
    const analyticsJob = cron.schedule('0 2 * * *', async () => {
      try {
        log('🔄 Running nightly analytics aggregation...');
        
        // Aggregate yesterday's data
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const targetDate = yesterday.toISOString().split('T')[0];
        
        await analyticsService.aggregateDaily(targetDate);
        
        // Clean old events (keep 60 days)
        await analyticsService.cleanOldEvents(60);
        
        log('✅ Nightly analytics aggregation completed');
      } catch (error) {
        error('❌ Analytics aggregation failed:', error);
      }
    }, {
      scheduled: true,
      timezone: process.env.TZ || 'UTC'
    });
    
    log('📊 Analytics cron job scheduled for 2:00 AM daily');
    
    // Clean up interval on server close
    server.on('close', () => {
      clearInterval(sitemapInterval);
      analyticsJob.stop();
      log('Sitemap generation stopped');
      log('Analytics cron job stopped');
    });
  });
})();
