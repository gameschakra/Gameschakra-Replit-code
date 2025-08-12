import express, { Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import * as fileService from "./services/fileService";
import { THUMBNAILS_DIR } from "./services/fileService";
import * as thumbnailService from "./services/thumbnailService";
import * as thumbnailManager from "./services/thumbnailManager";
import * as gameService from "./services/gameService";
import { isAdmin, isAuthenticated, loadUser } from "./middleware/auth";
import { z } from "zod";
import { 
  insertUserSchema, insertGameSchema, insertCategorySchema, 
  insertFavoriteSchema, insertRecentlyPlayedSchema 
} from "@shared/schema";
import challengeRoutes from "./routes/challengeRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";
import { setupBlogRoutes } from "./routes/blogRoutes";
import { generateSitemap } from "./utils/sitemapGenerator";
import { scheduleStatusUpdates, ensureChallengeDirectories } from "./routes/challengeUtils";

const memoryStorage = multer.memoryStorage();
// Enhanced multer configuration with better error handling
const upload = multer({ 
  storage: memoryStorage,
  limits: { 
    fileSize: 50 * 1024 * 1024, // 50MB max file size
    files: 2, // At most 2 files (game zip and thumbnail)
    fieldSize: 25 * 1024 * 1024 // Maximum field value size (25MB)
  }
});

export async function registerRoutes(app: express.Express): Promise<Server> {
  // Health check endpoint (before other middleware)
  app.get('/api/health', async (req: Request, res: Response) => {
    const startTime = Date.now();
    
    // Basic health info
    const healthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      port: process.env.PORT || '3000',
      database: { status: 'unknown', responseTime: 0 },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
      },
      disk: {
        uploads: 'unknown',
        migrations: 'unknown'
      }
    };

    // Test database connection
    try {
      const dbStart = Date.now();
      await storage.getCategories(); // Simple query to test DB
      healthCheck.database = {
        status: 'connected',
        responseTime: Date.now() - dbStart
      };
    } catch (error) {
      healthCheck.database = {
        status: 'disconnected',
        responseTime: Date.now() - startTime,
        error: error.message
      };
      healthCheck.status = 'unhealthy';
    }

    // Check file system
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      
      // Check uploads directory
      try {
        await fs.access('uploads');
        healthCheck.disk.uploads = 'accessible';
      } catch {
        healthCheck.disk.uploads = 'inaccessible';
      }
      
      // Check migrations directory
      try {
        await fs.access('migrations/meta/_journal.json');
        healthCheck.disk.migrations = 'found';
      } catch {
        healthCheck.disk.migrations = 'missing';
        if (healthCheck.status === 'healthy') {
          healthCheck.status = 'degraded';
        }
      }
    } catch (error) {
      healthCheck.disk = { error: 'filesystem_check_failed' };
    }

    // Set appropriate status code
    const statusCode = healthCheck.status === 'healthy' ? 200 : 
                      healthCheck.status === 'degraded' ? 200 : 503;
    
    res.status(statusCode).json(healthCheck);
  });

  // Configure CORS headers for all requests - consistent approach for both dev & prod
  app.use((req, res, next) => {
    // Get the origin from request headers or default to an empty string
    const origin = req.headers.origin || '';
    
    // Always set the specific requesting origin for CORS
    // This is crucial for credentials to work - we can't use wildcard * with credentials
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (process.env.NODE_ENV !== 'production') {
      // In development, if there's no origin header, allow all origins 
      // (needed for some tests and tools like curl)
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
    
    // Set complete CORS headers
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Expose-Headers', 'Set-Cookie, Content-Disposition');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
    
    // Respond immediately to preflight OPTIONS requests
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    
    next();
  });

  // Configure session with PostgreSQL store for persistent sessions
  // Detect whether we're running in Replit development or production environment
  const isReplitDev = process.env.REPL_ID && process.env.REPL_OWNER && !process.env.REPL_SLUG;
  const isProduction = process.env.NODE_ENV === 'production';
  
  console.log(`Setting up session for environment: ${isReplitDev ? 'Replit Dev' : isProduction ? 'Production' : 'Development'}`);
  console.log(`Session config: secure=${isProduction}, sameSite=${isProduction ? 'strict' : 'lax'}, domain=${isProduction ? process.env.COOKIE_DOMAIN || 'not set' : 'localhost'}`);
  
  // Session configuration - using memory store for now (simplifies development)
  // Later we can implement PostgreSQL session store when needed
  
  const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET || "gamehub-secret",
    resave: false, // Don't save session if unmodified 
    saveUninitialized: false, // Don't create session until something is stored
    cookie: {
      secure: isProduction, // Use HTTPS in production
      sameSite: isProduction ? 'none' : 'lax', // 'none' required for cross-origin HTTPS behind proxy
      httpOnly: true, // Prevent XSS
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
      domain: isProduction ? process.env.COOKIE_DOMAIN || '.gameschakra.com' : undefined
    },
    name: 'gamehub.sid',
    rolling: true, // Extend session on activity
    proxy: true, // Trust reverse proxy for secure cookies
    // Add session store validation
    genid: () => {
      return crypto.randomUUID();
    }
  });
  
  // Apply session middleware
  app.use(sessionMiddleware);

  // Configure passport
  app.use(passport.initialize());
  app.use(passport.session());

  // User serialization
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return done(null, false); // User not found, invalidate session
      }
      done(null, user);
    } catch (err) {
      console.error('Session deserialization error:', err);
      done(err, null);
    }
  });

  // Local strategy for username/password login
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Incorrect username" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: "Incorrect password" });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  // Create user loader middleware
  app.use(loadUser);

  // API ROUTES
  const api = express.Router();
  
  // Middleware to ensure all API responses have proper JSON Content-Type headers
  api.use((req: Request, res: Response, next) => {
    // Override res.json to always set Content-Type header
    const originalJson = res.json;
    res.json = function(this: Response, body?: any) {
      this.setHeader('Content-Type', 'application/json; charset=utf-8');
      return originalJson.call(this, body);
    };
    
    // Override res.status().json() chain to maintain Content-Type
    const originalStatus = res.status;
    res.status = function(this: Response, code: number) {
      const statusRes = originalStatus.call(this, code);
      const originalStatusJson = statusRes.json;
      statusRes.json = function(body?: any) {
        statusRes.setHeader('Content-Type', 'application/json; charset=utf-8');
        return originalStatusJson.call(statusRes, body);
      };
      return statusRes;
    };
    
    next();
  });

  // Authentication Routes
  api.post("/auth/register", async (req: Request, res: Response) => {
    try {
      const registrationSchema = insertUserSchema.extend({
        confirmPassword: z.string()
      }).refine(data => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"]
      });

      const validatedData = registrationSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        // Content-Type header is now set by middleware
        return res.status(400).json({ message: "Username is already taken" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);

      // Create user
      const newUser = await storage.createUser({
        username: validatedData.username,
        password: hashedPassword,
        email: validatedData.email,
        isAdmin: validatedData.isAdmin || false,
        avatarUrl: validatedData.avatarUrl
      });

      // Remove password from response
      const { password, ...userWithoutPassword } = newUser;

      // Log the user in
      req.session.userId = newUser.id;
      req.session.isAdmin = newUser.isAdmin;

      res.setHeader('Content-Type', 'application/json');
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      res.setHeader('Content-Type', 'application/json');
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: `Registration failed: ${error.message}` });
    }
  });

  api.post("/auth/login", (req: Request, res: Response, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        console.error('Login authentication error:', err);
        return next(err);
      }
      if (!user) {
        console.log('Login failed:', info?.message || 'Invalid credentials');
        // Content-Type header is now set by middleware
        return res.status(401).json({ message: info?.message || 'Invalid credentials' });
      }
      req.login(user, (err) => {
        if (err) {
          console.error('Login session error:', err);
          return next(err);
        }
        
        // Set session data
        req.session.userId = user.id;
        req.session.isAdmin = user.isAdmin;
        
        // Remove password from response
        const { password, ...userWithoutPassword } = user;
        
        console.log('Login successful for user:', user.username);
        // Content-Type header is now set by middleware
        return res.json(userWithoutPassword);
      });
    })(req, res, next);
  });

  api.post("/auth/logout", (req: Request, res: Response) => {
    // Access our environment detection variables
    const isReplitDev = process.env.REPL_ID && process.env.REPL_OWNER && !process.env.REPL_SLUG;
    const isProduction = process.env.NODE_ENV === 'production';
    
    console.log('Logout request received, environment:', { isReplitDev, isProduction });
    
    req.logout(() => {
      req.session.destroy((err) => {
        if (err) {
          console.error('Session destruction error during logout:', err);
          return res.status(500).json({ message: "Logout failed" });
        }
        
        // Clear the session cookie with settings that match our environment-specific session settings
        res.clearCookie('gamehub.sid', {
          path: '/',
          httpOnly: true,
          secure: false, // Fixed to match our session cookie settings
          sameSite: 'lax', // Fixed to match our session cookie settings
        });
        
        console.log('Logout successful, cleared cookie with consistent settings');
        res.json({ message: "Logged out successfully" });
      });
    });
  });

  api.get("/auth/user", (req: Request, res: Response) => {
    console.log('Auth check - isAuthenticated:', req.isAuthenticated());
    console.log('Auth check - session:', req.session);
    console.log('Auth check - cookies:', req.headers.cookie);
    
    res.setHeader('Content-Type', 'application/json');
    
    if (req.user) {
      const { password, ...userWithoutPassword } = req.user;
      return res.json(userWithoutPassword);
    }
    res.status(401).json({ message: "Not authenticated" });
  });
  
  // Debug route for session debugging
  api.get("/auth/debug-session", (req: Request, res: Response) => {
    return res.json({
      isAuthenticated: req.isAuthenticated(),
      hasSession: !!req.session,
      hasCookies: !!req.headers.cookie,
      sessionID: req.sessionID,
      // Don't send the full session object to avoid leaking sensitive data
    });
  });

  // Category Routes
  api.get("/categories", async (req: Request, res: Response) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Full categories error:", error);
      res.status(500).json({ 
        message: `Error fetching categories: ${error?.message || 'Unknown error'}`,
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  });

  api.get("/categories/:slug", async (req: Request, res: Response) => {
    try {
      const category = await storage.getCategoryBySlug(req.params.slug);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: `Error fetching category: ${error.message}` });
    }
  });

  api.post("/categories", isAdmin, async (req: Request, res: Response) => {
    try {
      const validatedData = insertCategorySchema.parse(req.body);
      const category = await gameService.createCategory(validatedData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: `Error creating category: ${error.message}` });
    }
  });

  api.put("/categories/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const validatedData = insertCategorySchema.partial().parse(req.body);
      const updatedCategory = await gameService.updateCategory(id, validatedData);
      
      if (!updatedCategory) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json(updatedCategory);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: `Error updating category: ${error.message}` });
    }
  });

  api.delete("/categories/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const success = await gameService.deleteCategory(id);
      
      if (!success) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json({ message: "Category deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: `Error deleting category: ${error.message}` });
    }
  });

  // GC_FIX: Enhanced game routes with improved search/filter functionality
  api.get("/games", async (req: Request, res: Response) => {
    try {
      const { 
        limit = 50,
        offset = 0, 
        category, 
        categoryId: directCategoryId,
        status, 
        featured, 
        search,
        sort = "newest", // GC_FIX: Add default sort
        rating,
        date
      } = req.query;
      
      // Parse categoryId from either 'category' or 'categoryId' params
      const categoryId = directCategoryId ? Number(directCategoryId) : 
                        (category ? Number(category) : undefined);
      
      const isFeatured = featured === "true" ? true : 
                        featured === "false" ? false : 
                        undefined;
      
      const games = await storage.getGames({
        limit: Number(limit),
        offset: Number(offset),
        categoryId,
        status: status as "draft" | "published" | undefined,
        featured: isFeatured,
        search: search as string,
        sort: sort as string, // GC_FIX: Pass sort parameter
        rating: rating as string,
        dateFilter: date as string
      });
      
      res.json(games);
    } catch (error) {
      res.status(500).json({ message: `Error fetching games: ${error.message}` });
    }
  });

  api.get("/games/featured", async (req: Request, res: Response) => {
    try {
      console.log(`[routes] Fetching featured games at ${new Date().toISOString()}`);
      const limit = req.query.limit ? Number(req.query.limit) : 3;
      
      const featuredGames = await storage.getFeaturedGames(limit);
      
      console.log(`[routes] Found ${featuredGames.length} featured games`);
      if (featuredGames.length === 0) {
        console.log(`[routes] No featured games found, getting recent games instead`);
        // If no featured games, return some published games instead
        const publishedGames = await storage.getGames({
          limit: limit,
          status: "published"
        });
        
        console.log(`[routes] Returning ${publishedGames.length} recent games as fallback`);
        return res.json(publishedGames);
      }
      
      res.json(featuredGames);
    } catch (error: unknown) {
      const err = error as Error;
      console.error(`[routes] Error fetching featured games: ${err.message}`);
      res.status(500).json({ message: `Error fetching featured games: ${err.message}` });
    }
  });

  api.get("/games/popular", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 4;
      const popularGames = await storage.getPopularGames(limit);
      res.json(popularGames);
    } catch (error) {
      res.status(500).json({ message: `Error fetching popular games: ${error.message}` });
    }
  });

  // Get game by ID (for admin editing)
  api.get("/games/:id(\\d+)", async (req: Request, res: Response) => {
    try {
      console.log(`[routes] Fetching game by ID: ${req.params.id}`);
      const id = Number(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid game ID" });
      }
      
      const game = await storage.getGameById(id);
      if (!game) {
        console.log(`[routes] Game not found with ID: ${id}`);
        return res.status(404).json({ message: "Game not found" });
      }
      
      console.log(`[routes] Found game: ${game.title} (ID: ${game.id})`);
      res.json(game);
    } catch (error) {
      console.error(`[routes] Error fetching game by ID: ${error.message}`);
      res.status(500).json({ message: `Error fetching game: ${error.message}` });
    }
  });

  // Get game by slug (for public view)
  api.get("/games/:slug([^0-9].*)", async (req: Request, res: Response) => {
    try {
      const game = await storage.getGameBySlug(req.params.slug);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      
      // Get related games from same category
      const relatedGames = await storage.getGames({
        limit: 4,
        categoryId: game.categoryId,
        excludeId: game.id // Exclude current game
      });

      res.json({
        ...game,
        relatedGames
      });
    } catch (error) {
      res.status(500).json({ message: `Error fetching game: ${error.message}` });
    }
  });

  api.post("/games", isAdmin, upload.fields([
    { name: 'gameFile', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]), async (req: Request, res: Response) => {
    // Set longer timeout for large file uploads
    req.setTimeout(300000); // 5 minutes timeout for large uploads
    
    try {
      console.log('Game upload request received');
      console.log('Authentication status on upload:', {
        isAuthenticated: req.isAuthenticated(),
        user: req.user ? `User: ${(req.user as any).username} (ID: ${(req.user as any).id})` : 'No user found',
        session: req.session ? 'Session exists' : 'No session',
        cookie: req.headers.cookie ? 'Has cookies' : 'No cookies'
      });
      
      // Double-check authentication before proceeding
      if (!req.isAuthenticated() || !req.user) {
        console.error('User not authenticated when trying to upload game');
        return res.status(401).json({ message: "Authentication required" });
      }
      
      // Check if files property exists
      if (!req.files) {
        console.error('No files property in request');
        return res.status(400).json({ message: "No files uploaded" });
      }
      
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      console.log('Uploaded files fieldnames:', Object.keys(files));
      
      if (!files.gameFile || !files.gameFile[0]) {
        console.error('Game file is missing');
        return res.status(400).json({ message: "Game file is required" });
      }
      
      // Log file details
      console.log('Game file details:', {
        originalname: files.gameFile[0].originalname,
        mimetype: files.gameFile[0].mimetype,
        size: `${(files.gameFile[0].size / (1024 * 1024)).toFixed(2)} MB`,
        hasBuffer: !!files.gameFile[0].buffer
      });
      
      // Check if buffer exists and is valid
      if (!files.gameFile[0].buffer || !(files.gameFile[0].buffer instanceof Buffer)) {
        console.error('Game file buffer is invalid');
        return res.status(400).json({ message: "Game file is corrupted" });
      }
      
      const gameZipBuffer = files.gameFile[0].buffer;
      
      // Thumbnail is optional
      let thumbnailBuffer = undefined;
      if (files.thumbnail && files.thumbnail[0] && files.thumbnail[0].buffer) {
        console.log('Thumbnail file details:', {
          originalname: files.thumbnail[0].originalname,
          mimetype: files.thumbnail[0].mimetype,
          size: `${(files.thumbnail[0].size / (1024 * 1024)).toFixed(2)} MB`,
          hasBuffer: !!files.thumbnail[0].buffer
        });
        thumbnailBuffer = files.thumbnail[0].buffer;
      }
      
      console.log('Parsing game data from request body');
      
      // Parse and convert types before validation
      const parsedBody = {
        ...req.body,
        categoryId: req.body.categoryId ? Number(req.body.categoryId) : null,
        isFeatured: req.body.isFeatured === "true" || req.body.isFeatured === true || req.body.featured === "true" || req.body.featured === true,
        // If status checkbox is checked, set status to draft, otherwise default to published
        status: req.body.status === "draft" ? "draft" : "published",
      };
      
      // Validate and parse game data
      const gameData = insertGameSchema
        .omit({ gameDir: true, entryFile: true })
        .parse(parsedBody);
      
      console.log('Creating game with parsed data');
      // Create the game
      const game = await gameService.createGame(gameData, gameZipBuffer, thumbnailBuffer);
      
      console.log('Game created successfully with ID:', game.id);
      
      // GC_FIX: Return game with fresh thumbnailUrl for immediate dashboard update
      const responseGame = {
        ...game,
        thumbnailUrl: game.thumbnailUrl ? `${game.thumbnailUrl}?t=${Date.now()}` : null
      };
      
      res.status(201).json(responseGame);
    } catch (error: any) {
      console.error('Error in POST /games:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      
      // Detailed error response
      res.status(500).json({ 
        message: `Error creating game: ${error.message}`,
        stack: process.env.NODE_ENV === 'production' ? undefined : error.stack
      });
    }
  });

  api.put("/games/:id", isAdmin, upload.fields([
    { name: 'gameFile', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]), async (req: Request, res: Response) => {
    // Set longer timeout for large file uploads
    req.setTimeout(300000); // 5 minutes timeout for large uploads
    
    try {
      console.log('Game update request received for ID:', req.params.id);
      const id = Number(req.params.id);
      
      // Check if req.files exists
      if (!req.files) {
        console.log('No files in update request - this is OK for updates');
      }
      
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      
      // Get file buffers if provided
      let gameZipBuffer: Buffer | undefined = undefined;
      let thumbnailBuffer: Buffer | undefined = undefined;
      
      if (files?.gameFile?.[0]?.buffer) {
        console.log('Game file included in update:', {
          originalname: files.gameFile[0].originalname,
          mimetype: files.gameFile[0].mimetype,
          size: files.gameFile[0].size
        });
        gameZipBuffer = files.gameFile[0].buffer;
      }
      
      if (files?.thumbnail?.[0]?.buffer) {
        console.log('Thumbnail included in update:', {
          originalname: files.thumbnail[0].originalname,
          mimetype: files.thumbnail[0].mimetype,
          size: files.thumbnail[0].size
        });
        thumbnailBuffer = files.thumbnail[0].buffer;
      }
      
      console.log('Parsing game update data');
      
      // Parse and convert types before validation
      const parsedBody = {
        ...req.body,
        categoryId: req.body.categoryId ? Number(req.body.categoryId) : null,
        isFeatured: req.body.isFeatured === "true" || req.body.isFeatured === true || req.body.featured === "true" || req.body.featured === true,
        // If status checkbox is checked, set status to draft, otherwise default to published
        status: req.body.status === "draft" ? "draft" : "published",
      };
      
      console.log('Converted update body data:', parsedBody);
      
      // Validate and parse game data
      const gameData = insertGameSchema
        .omit({ gameDir: true, entryFile: true })
        .partial()
        .parse(parsedBody);
      
      console.log('Updating game with parsed data:', gameData);
      // Update the game
      const updatedGame = await gameService.updateGame(id, gameData, gameZipBuffer, thumbnailBuffer);
      
      if (!updatedGame) {
        console.error('Game not found for update:', id);
        return res.status(404).json({ message: "Game not found" });
      }
      
      console.log('Game updated successfully:', updatedGame.id);
      
      // GC_FIX: Return game with fresh thumbnailUrl for immediate dashboard update  
      const responseGame = {
        ...updatedGame,
        thumbnailUrl: updatedGame.thumbnailUrl ? `${updatedGame.thumbnailUrl}?t=${Date.now()}` : null
      };
      
      res.json(responseGame);
    } catch (error: any) {
      console.error('Error in PUT /games/:id:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      
      res.status(500).json({ 
        message: `Error updating game: ${error.message}`,
        stack: process.env.NODE_ENV === 'production' ? undefined : error.stack
      });
    }
  });
  
  // PATCH endpoint for partial updates
  api.patch("/games/:id", isAdmin, upload.fields([
    { name: 'gameFile', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]), async (req: Request, res: Response) => {
    // Set longer timeout for large file uploads
    req.setTimeout(300000); // 5 minutes timeout for large uploads
    
    try {
      console.log('[routes] PATCH request received for game ID:', req.params.id);
      console.log('[routes] Authentication status:', {
        isAuthenticated: req.isAuthenticated(),
        user: req.user ? `User: ${(req.user as any).username} (ID: ${(req.user as any).id})` : 'No user',
        session: req.session ? 'Has session' : 'No session',
        cookies: req.headers.cookie || 'No cookies'
      });
      
      const id = Number(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid game ID" });
      }
      
      // Check if game exists
      const existingGame = await storage.getGameById(id);
      if (!existingGame) {
        return res.status(404).json({ message: "Game not found" });
      }
      
      console.log('[routes] Found existing game for PATCH:', existingGame.title);
      
      // Prepare file buffers
      let gameZipBuffer: Buffer | undefined = undefined;
      let thumbnailBuffer: Buffer | undefined = undefined;
      
      // Check if req.files exists
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      if (files) {
        if (files.gameFile?.[0]?.buffer) {
          console.log('[routes] Game file included in PATCH:', {
            originalname: files.gameFile[0].originalname,
            mimetype: files.gameFile[0].mimetype,
            size: `${(files.gameFile[0].size / (1024 * 1024)).toFixed(2)} MB`
          });
          gameZipBuffer = files.gameFile[0].buffer;
        }
        
        if (files.thumbnail?.[0]?.buffer) {
          console.log('[routes] Thumbnail included in PATCH:', {
            originalname: files.thumbnail[0].originalname,
            mimetype: files.thumbnail[0].mimetype,
            size: `${(files.thumbnail[0].size / (1024 * 1024)).toFixed(2)} MB`
          });
          thumbnailBuffer = files.thumbnail[0].buffer;
        }
      }
      
      // Parse the updates with type handling
      const updates: Record<string, any> = {};
      
      if (req.body.title !== undefined) {
        updates.title = req.body.title;
      }
      
      if (req.body.description !== undefined) {
        updates.description = req.body.description;
      }
      
      if (req.body.instructions !== undefined) {
        updates.instructions = req.body.instructions;
      }
      
      if (req.body.developer !== undefined) {
        updates.developer = req.body.developer;
      }
      
      if (req.body.categoryId !== undefined) {
        updates.categoryId = parseInt(req.body.categoryId, 10);
      }
      
      if (req.body.isFeatured !== undefined) {
        updates.isFeatured = req.body.isFeatured === "true" || req.body.isFeatured === true;
      }
      
      if (req.body.status !== undefined) {
        updates.status = req.body.status === "draft" ? "draft" : "published";
      }
      
      console.log('[routes] PATCH updates:', updates);
      
      // Only proceed if there are updates to be made
      if (Object.keys(updates).length === 0 && !thumbnailBuffer && !gameZipBuffer) {
        return res.status(400).json({ message: "No updates provided" });
      }
      
      // Validate the update data using Zod schema
      const gameData = insertGameSchema
        .omit({ gameDir: true, entryFile: true })
        .partial()
        .parse(updates);
      
      console.log('[routes] Validated PATCH data:', gameData);
      
      // Perform the update
      const updatedGame = await gameService.updateGame(id, gameData, gameZipBuffer, thumbnailBuffer);
      
      if (!updatedGame) {
        return res.status(404).json({ message: "Game not found after update" });
      }
      
      console.log('[routes] Game successfully updated with PATCH:', updatedGame.id);
      
      // GC_FIX: Return game with fresh thumbnailUrl for immediate dashboard update  
      const responseGame = {
        ...updatedGame,
        thumbnailUrl: updatedGame.thumbnailUrl ? `${updatedGame.thumbnailUrl}?t=${Date.now()}` : null
      };
      
      res.json(responseGame);
    } catch (error: any) {
      console.error('[routes] Error in PATCH /games/:id:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      
      res.status(500).json({ 
        message: `Error updating game: ${error.message}`,
        stack: process.env.NODE_ENV === 'production' ? undefined : error.stack
      });
    }
  });

  api.delete("/games/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      console.log(`[routes] Processing delete request for game ID: ${req.params.id}`);
      const id = Number(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid game ID" });
      }
      
      const success = await gameService.deleteGame(id);
      
      if (!success) {
        return res.status(404).json({ message: "Game not found or could not be deleted" });
      }
      
      console.log(`[routes] Game ID: ${id} successfully deleted`);
      res.json({ message: "Game deleted successfully" });
    } catch (error: unknown) {
      const err = error as Error;
      console.error(`[routes] Error deleting game: ${err.message}`);
      res.status(500).json({ message: `Error deleting game: ${err.message}` });
    }
  });

  // Play Game
  // Update game status endpoint (admin only)
  api.post("/games/:id/update-status", isAdmin, async (req: Request, res: Response) => {
    try {
      const gameId = Number(req.params.id);
      const { status } = req.body;
      
      if (!status || (status !== "draft" && status !== "published")) {
        return res.status(400).json({ message: "Invalid status value" });
      }
      
      console.log(`Updating game ${gameId} status to ${status}`);
      
      const updatedGame = await gameService.updateGame(gameId, { status });
      
      if (!updatedGame) {
        return res.status(404).json({ message: "Game not found" });
      }
      
      res.json({ 
        message: `Game status updated to ${status}`,
        game: updatedGame
      });
    } catch (error: unknown) {
      const err = error instanceof Error ? error.message : String(error);
      console.error(`Error updating game status: ${err}`);
      res.status(500).json({ message: `Error updating game status: ${err}` });
    }
  });
  
  // Update game thumbnail endpoint (admin only)
  api.post("/games/:id/update-thumbnail", isAdmin, upload.single('thumbnail'), async (req: Request, res: Response) => {
    try {
      const gameId = Number(req.params.id);
      
      if (!req.file || !req.file.buffer) {
        return res.status(400).json({ message: "Thumbnail image is required" });
      }
      
      console.log(`Updating thumbnail for game ${gameId}`);
      
      const thumbnailBuffer = req.file.buffer;
      const updatedGame = await gameService.updateGameThumbnail(gameId, thumbnailBuffer);
      
      if (!updatedGame) {
        return res.status(404).json({ message: "Game not found" });
      }
      
      res.json({ 
        message: "Game thumbnail updated successfully",
        game: updatedGame
      });
    } catch (error: unknown) {
      const err = error instanceof Error ? error.message : String(error);
      console.error(`Error updating game thumbnail: ${err}`);
      res.status(500).json({ message: `Error updating game thumbnail: ${err}` });
    }
  });
  
  // Partial Game Update Endpoint (PATCH)
  api.patch("/games/:id", isAdmin, upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'gameFile', maxCount: 1 }
  ]), async (req: Request, res: Response) => {
    // Set longer timeout for large file uploads
    req.setTimeout(300000); // 5 minutes timeout for large uploads
    
    try {
      console.log('Game partial update request received for ID:', req.params.id);
      const id = Number(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid game ID" });
      }
      
      // Get the current game to make sure it exists
      const currentGame = await storage.getGameById(id);
      if (!currentGame) {
        return res.status(404).json({ message: "Game not found" });
      }
      
      // Check if files were uploaded
      let thumbnailBuffer: Buffer | undefined = undefined;
      let gameZipBuffer: Buffer | undefined = undefined;
      
      if (req.files) {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        
        // Process thumbnail if uploaded
        if (files.thumbnail && files.thumbnail[0] && files.thumbnail[0].buffer) {
          console.log('Thumbnail included in partial update:', {
            originalname: files.thumbnail[0].originalname,
            mimetype: files.thumbnail[0].mimetype,
            size: files.thumbnail[0].size
          });
          
          // Validate thumbnail file
          const filetype = files.thumbnail[0].mimetype;
          if (!filetype.startsWith('image/')) {
            return res.status(400).json({ message: "Thumbnail must be an image file" });
          }
          
          // Size validation (max 2MB)
          if (files.thumbnail[0].size > 2 * 1024 * 1024) {
            return res.status(400).json({ message: "Thumbnail size must be less than 2MB" });
          }
          
          thumbnailBuffer = files.thumbnail[0].buffer;
        }
        
        // Process game file if uploaded
        if (files.gameFile && files.gameFile[0] && files.gameFile[0].buffer) {
          console.log('Game file included in partial update:', {
            originalname: files.gameFile[0].originalname,
            mimetype: files.gameFile[0].mimetype,
            size: files.gameFile[0].size
          });
          
          // Validate game file type
          if (!files.gameFile[0].originalname.endsWith('.zip')) {
            return res.status(400).json({ message: "Game file must be a ZIP archive" });
          }
          
          // Size validation (max 50MB)
          if (files.gameFile[0].size > 50 * 1024 * 1024) {
            return res.status(400).json({ message: "Game file size must be less than 50MB" });
          }
          
          gameZipBuffer = files.gameFile[0].buffer;
        }
      }
      
      // Parse text fields from request body
      // Only pick fields that are allowed to be updated
      const allowedFields = ['title', 'description', 'instructions', 'categoryId', 'developer', 'isFeatured', 'status'];
      
      // Parse and convert types for the fields that were actually sent
      const updates: Record<string, any> = {};
      
      // Process each field individually if it was provided
      if (req.body.title !== undefined) {
        updates.title = req.body.title;
      }
      
      if (req.body.description !== undefined) {
        updates.description = req.body.description;
      }
      
      if (req.body.instructions !== undefined) {
        updates.instructions = req.body.instructions;
      }
      
      if (req.body.developer !== undefined) {
        updates.developer = req.body.developer;
      }
      
      if (req.body.categoryId !== undefined) {
        updates.categoryId = req.body.categoryId ? Number(req.body.categoryId) : null;
      }
      
      if (req.body.isFeatured !== undefined) {
        updates.isFeatured = req.body.isFeatured === "true" || req.body.isFeatured === true;
      }
      
      if (req.body.status !== undefined) {
        updates.status = req.body.status === "draft" ? "draft" : "published";
      }
      
      console.log('Partial update data:', updates);
      
      // Only proceed if there are updates to be made
      if (Object.keys(updates).length === 0 && !thumbnailBuffer && !gameZipBuffer) {
        return res.status(400).json({ message: "No updates provided" });
      }
      
      // Validate the update data using Zod schema
      const gameData = insertGameSchema
        .omit({ gameDir: true, entryFile: true })
        .partial()
        .parse(updates);
      
      console.log('Validated update data:', gameData);
      
      // Perform the update
      const updatedGame = await gameService.updateGame(id, gameData, gameZipBuffer, thumbnailBuffer);
      
      if (!updatedGame) {
        return res.status(404).json({ message: "Game not found after update" });
      }
      
      console.log('Game successfully updated with partial data:', updatedGame.id);
      res.json(updatedGame);
    } catch (error: any) {
      console.error('Error in PATCH /games/:id:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      
      res.status(500).json({ 
        message: `Error updating game: ${error.message}`,
        stack: process.env.NODE_ENV === 'production' ? undefined : error.stack
      });
    }
  });
  
  api.post("/games/:id/play", async (req: Request, res: Response) => {
    try {
      const gameId = Number(req.params.id);
      const userId = req.session.userId;
      
      await gameService.trackGamePlay(gameId, userId);
      
      res.json({ message: "Play recorded successfully" });
    } catch (error) {
      res.status(500).json({ message: `Error recording play: ${error.message}` });
    }
  });

  // Favorites Routes
  api.get("/favorites", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const favorites = await storage.getFavoritesByUserId(userId);
      res.json(favorites);
    } catch (error) {
      res.status(500).json({ message: `Error fetching favorites: ${error.message}` });
    }
  });

  api.post("/favorites/:gameId", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const gameId = Number(req.params.gameId);
      
      // Check if game exists
      const game = await storage.getGameById(gameId);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      
      const isFavorite = await gameService.toggleGameFavorite(userId, gameId);
      
      res.json({ 
        message: isFavorite ? "Game added to favorites" : "Game removed from favorites",
        isFavorite
      });
    } catch (error) {
      res.status(500).json({ message: `Error toggling favorite: ${error.message}` });
    }
  });

  api.get("/favorites/is-favorite/:gameId", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const gameId = Number(req.params.gameId);
      
      const isFavorite = await storage.isGameFavorite(userId, gameId);
      
      res.json({ isFavorite });
    } catch (error) {
      res.status(500).json({ message: `Error checking favorite status: ${error.message}` });
    }
  });

  // Recently Played Routes
  api.get("/recently-played", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const limit = req.query.limit ? Number(req.query.limit) : 3;
      
      const recentlyPlayed = await storage.getRecentlyPlayedByUserId(userId, limit);
      
      res.json(recentlyPlayed);
    } catch (error) {
      res.status(500).json({ message: `Error fetching recently played: ${error.message}` });
    }
  });

  // Serve game files directly
  api.use('/games', express.static(fileService.GAMES_DIR, {
    index: false, // Don't auto-serve index.html
    dotfiles: 'ignore', // Don't serve .dot files
    maxAge: '1d' // Cache assets for 1 day
  }));
  
  // This is a fallback route - the static middleware above should handle most requests
  api.get("/games/:gameDir/:entryFile(*)", async (req: Request, res: Response) => {
    try {
      const { gameDir, entryFile } = req.params;
      
      console.log(`Attempting to serve game file: ${gameDir}/${entryFile}`);
      
      // Get the file path directly without checking the database
      // We've already validated the game when the request was made to play it
      const filePath = fileService.getGameFilePath(gameDir, entryFile);
      
      console.log(`Full file path: ${filePath}`);
      
      // Check if the file exists
      try {
        await fs.promises.access(filePath);
        // Send the file
        res.sendFile(filePath);
      } catch (fileError) {
        console.error(`File not found at path: ${filePath}`, fileError);
        return res.status(404).json({ message: "Game file not found" });
      }
    } catch (error: any) {
      console.error(`Error serving game file:`, error);
      res.status(500).json({ message: `Error serving game file: ${error.message}` });
    }
  });

  // GC_FIX: canonical thumbnail redirect
  api.get('/games/:id/thumbnail', async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ message: 'Invalid id' });

    const projectRoot = process.cwd(); // Use process.cwd() for correct project root
    const canonicalAbs = path.join(projectRoot, 'uploads', 'thumbnails', `game_${id}.jpg`);
    try {
      await fs.promises.access(canonicalAbs);
      // Redirect to public URL under /uploads (served by Nginx alias)
      return res.redirect(302, `/uploads/thumbnails/game_${id}.jpg`);
    } catch {
      // fallback: if DB thumbnail_url exists and file exists => redirect there
      const game = await storage.getGameById(id);
      if (game?.thumbnailUrl) {
        const abs = path.isAbsolute(game.thumbnailUrl)
          ? game.thumbnailUrl
          : path.join(projectRoot, game.thumbnailUrl);
        try {
          await fs.promises.access(abs);
          return res.redirect(302, `/${game.thumbnailUrl.replace(/^\//, '')}`);
        } catch {}
      }
      return res.status(404).json({ message: 'Thumbnail not found' });
    }
  });

  // Thumbnails route - using the enhanced JSON-based thumbnailManager service
  api.get("/thumbnails/:thumbnailPath", async (req: Request, res: Response) => {
    try {
      // Clean up path parameter to handle malformed URLs
      let thumbnailPath = req.params.thumbnailPath;
      
      // Split the path and get just the filename without query params
      if (thumbnailPath.includes('?')) {
        thumbnailPath = thumbnailPath.split('?')[0];
      }
      if (thumbnailPath.includes('&')) {
        thumbnailPath = thumbnailPath.split('&')[0];
      }
      
      // GC_FIX: Check uploads directory first for direct thumbnails
      const uploadsPath = path.join(process.cwd(), 'uploads', 'thumbnails', thumbnailPath);
      try {
        await fs.promises.access(uploadsPath);
        // Set cache-busting headers for uploaded thumbnails
        res.set('Cache-Control', 'no-store');
        res.set('Access-Control-Allow-Origin', '*');
        return res.sendFile(uploadsPath);
      } catch (err) {
        // File doesn't exist in uploads, continue to legacy system
      }
      
      // Explicitly parse gameId, ensuring it's a valid number
      let gameId: number | null = null;
      if (req.query.gameId) {
        const parsedId = parseInt(req.query.gameId as string);
        if (!isNaN(parsedId) && parsedId > 0) {
          gameId = parsedId;
        }
      }
      
      // Get game name if available
      const gameName = req.query.gameName 
        ? decodeURIComponent(req.query.gameName as string) 
        : null;
      
      console.log(`Thumbnail request: ${thumbnailPath}, Game ID: ${gameId}, Game Name: ${gameName}`);
      
      // Use the new thumbnailManager service for more robust handling
      const thumbnailFile = thumbnailManager.getGameThumbnail(gameId, gameName, thumbnailPath);
      console.log(`Using thumbnail file: ${thumbnailFile} for game ${gameId} (${gameName})`);
      
      const filePath = thumbnailManager.getThumbnailPath(thumbnailFile);
      
      // Set no-cache headers and CORS headers to ensure proper functioning
      thumbnailManager.setNoCacheHeaders(res);
      res.set('Access-Control-Allow-Origin', '*');
      res.set('Access-Control-Allow-Methods', 'GET');
      res.set('Access-Control-Allow-Headers', 'Content-Type');
      
      // Send the thumbnail file
      res.sendFile(filePath);
    } catch (error) {
      console.error("Error in thumbnail route:", error);
      
      // Send a more descriptive error and use a default image as fallback
      res.status(404).sendFile(path.join(process.cwd(), 'public', 'images', 'games', thumbnailManager.getGameThumbnail(34, "Hopping Crowns", null)));
    }
  });

  // Mount API routes
  // Mount the challenge routes
  api.use("/challenges", challengeRoutes);
  api.use("/analytics", analyticsRoutes);
  
  // Setup blog routes
  setupBlogRoutes(api);
  
  app.use("/api", api);

  // Serve sitemap.xml
  app.get('/sitemap.xml', async (req: Request, res: Response) => {
    try {
      // Get the base URL from the request
      const protocol = req.headers['x-forwarded-proto'] || req.protocol;
      const host = req.headers.host;
      const baseUrl = `${protocol}://${host}`;
      
      // Generate sitemap XML
      const sitemap = await generateSitemap(baseUrl);
      
      // Set appropriate headers
      res.header('Content-Type', 'application/xml');
      res.send(sitemap);
    } catch (error) {
      console.error('Error generating sitemap:', error);
      res.status(500).send('Error generating sitemap');
    }
  });

  // Create HTTP server
  // Ensure challenge directories exist
  ensureChallengeDirectories();
  
  // Schedule periodic challenge status updates
  scheduleStatusUpdates();
  
  const httpServer = createServer(app);

  return httpServer;
}
