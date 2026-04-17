import express from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import passport from '../auth/passport';
import { db } from '../db';
import { users, type User } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { isAuthenticated } from '../middleware/auth';
import { promisify } from 'node:util';

const router = express.Router();

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs (increased for development)
  message: { error: 'Too many authentication attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(80, 'Name must be less than 80 characters'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  phone: z.string()
    .regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number format')
    .transform(phone => {
      // Normalize phone number - remove spaces and ensure consistent format
      return phone.replace(/\s/g, '');
    }),
  city: z.string().min(2, 'City must be at least 2 characters').optional(),
  country: z.string().min(2, 'Country must be at least 2 characters').optional()
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

// Utility function to sanitize user data
const sanitizeUser = (user: User) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  username: user.username,
  phone: user.phone,
  city: user.city,
  country: user.country,
  avatarUrl: user.avatarUrl,
  isAdmin: user.isAdmin
});

// POST /api/auth/register
router.post('/register', authLimiter, async (req, res) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const { email, password, name, phone, username, city, country } = validatedData;
    console.log('Registration attempt - Phone number:', phone);

    // Check if user already exists with this email
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser) {
      if (existingUser.password) {
        return res.status(409).json({ error: 'User already exists with this email' });
      } else {
        // User exists but with social account, can't register with password
        return res.status(409).json({ error: 'An account with this email already exists. Please sign in with your social account.' });
      }
    }

    // Check if username is already taken
    const [existingUsername] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (existingUsername) {
      return res.status(409).json({ error: 'Username already taken. Please choose a different username.' });
    }

    // Check if phone number is already in use (if provided)
    if (phone) {
      console.log('Checking phone uniqueness for:', phone);
      const [existingPhone] = await db
        .select()
        .from(users)
        .where(eq(users.phone, phone))
        .limit(1);

      if (existingPhone) {
        console.log('Phone number already exists for user:', existingPhone.id);
        return res.status(409).json({ error: 'Phone number already registered with another account' });
      }
      console.log('Phone number is available');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const [newUser] = await db.insert(users).values({
      email,
      password: hashedPassword,
      name,
      phone,
      username,
      city,
      country,
    }).returning();

    // Auto-login after registration using Passport
    // req.login() triggers serializeUser → stores user.id in req.session.passport.user
    // req.session.userId is kept as fallback for isAuthenticated dual-check (see CLAUDE.md)
    await login(req, newUser);
    req.session.userId = newUser.id;
    await save(req);

    console.log('[Register] Session after login:', {
      sessionID: req.sessionID,
      passportUser: (req.session as any)?.passport?.user,
      userId: (req.session as any)?.userId,
    });

    return res.status(201).json({ user: sanitizeUser(newUser) });

  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ error: validationError.message });
    }

    // Handle database constraint violations
    if ((error as any).code === '23505') { // PostgreSQL unique constraint violation
      console.error('Unique constraint violation:', (error as any).detail);
      if ((error as any).detail?.includes('phone')) {
        return res.status(409).json({ error: 'Phone number already registered with another account' });
      } else if ((error as any).detail?.includes('email')) {
        return res.status(409).json({ error: 'User already exists with this email' });
      } else if ((error as any).detail?.includes('username')) {
        return res.status(409).json({ error: 'Username already taken. Please choose a different username.' });
      }
    }

    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Registration failed' });
  }
});

// Helper functions for promisified session operations
const regen = (req: express.Request) => new Promise<void>((res, rej) => req.session.regenerate(err => err ? rej(err) : res()));
const save = (req: express.Request) => new Promise<void>((res, rej) => req.session.save(err => err ? rej(err) : res()));
const login = (req: express.Request, user: any) => new Promise<void>((res, rej) => req.login(user, err => err ? rej(err) : res()));

// POST /api/auth/login
router.post('/login', authLimiter, async (req, res) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const { email, password } = validatedData;

    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user || !user.password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Use Passport login so serializeUser runs and req.session.passport.user is set.
    // req.session.userId is kept as fallback for isAuthenticated dual-check (see CLAUDE.md)
    await login(req, user);
    req.session.userId = user.id;
    await save(req);

    console.log('[Login] Session after login:', {
      sessionID: req.sessionID,
      passportUser: (req.session as any)?.passport?.user,
      userId: (req.session as any)?.userId,
    });

    return res.json({ user: sanitizeUser(user) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ error: validationError.message });
    }
    console.error("Login error:", error);
    return res.status(500).json({ message: "Login failed" });
  }
});

// POST /api/auth/logout - properly destroy session and clear cookie
router.post('/logout', (req, res) => {
  const sessionName = process.env.SESSION_NAME || 'gc_sid';

  req.session.destroy((err) => {
    if (err) {
      console.error('Session destroy error:', err);
      return res.status(500).json({ error: 'Failed to logout' });
    }

    // Clear cookie with environment-based configuration
    res.clearCookie(sessionName, {
      domain: process.env.COOKIE_DOMAIN || undefined,
      path: '/',
      httpOnly: true,
      secure: process.env.SECURE_COOKIES === 'true',
      sameSite: (process.env.SAME_SITE_COOKIES as 'lax' | 'strict' | 'none') || 'lax'
    });

    res.status(200).json({ message: 'Logged out successfully' });
  });
});

// GET /api/auth/me - reliably return user session
router.get('/me', async (req, res) => {
  try {
    console.log('[/api/auth/me] called:', {
      sessionID: req.sessionID,
      isAuthenticated: req.isAuthenticated(),
      passportUser: (req.session as any)?.passport?.user,
      sessionUserId: (req.session as any)?.userId,
      hasReqUser: !!req.user,
    });

    // Priority 1: Check session.userId (for local login and OAuth)
    const sessionUserId = (req.session as any)?.userId;
    if (sessionUserId) {
      const [user] = await db.select().from(users).where(eq(users.id, sessionUserId)).limit(1);
      if (user) {
        console.log('/api/auth/me - found user from session.userId:', user.id);
        return res.json({ user: sanitizeUser(user) });
      }
    }

    // Priority 2: Check Passport user (fallback for OAuth if not in session yet)
    if (req.user) {
      console.log('/api/auth/me - found user from passport:', (req.user as any).id);
      // Sync session.userId for future requests
      (req.session as any).userId = (req.user as any).id;
      await save(req);
      return res.json({ user: sanitizeUser(req.user as any) });
    }

    console.log('/api/auth/me - no user found, returning null');
    return res.json({ user: null });
  } catch (error) {
    console.error('Error in /me route:', error);
    return res.json({ user: null });
  }
});

// Google OAuth routes
router.get('/google', (req, res, next) => {
  // Check if Google OAuth is properly configured
  if (!process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID === 'temp-disabled' || process.env.GOOGLE_CLIENT_ID.includes('your-google')) {
    return res.redirect('/login?error=google_not_configured');
  }
  
  passport.authenticate('google', { 
    scope: ['openid', 'profile', 'email'],
    accessType: 'offline',
    prompt: 'consent'
  })(req, res, next);
});

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login?error=google_auth_failed' }),
  async (req, res) => {
    try {
      if (req.user) {
        const user = req.user as any;
        await regen(req);
        req.session.userId = user.id;
        await save(req);
      }
      return res.redirect('/');
    } catch (err) {
      console.error('Google OAuth callback error:', err);
      return res.redirect('/login?error=session_save_failed');
    }
  }
);

// Apple OAuth routes
router.get('/apple',
  passport.authenticate('apple')
);

router.post('/apple/callback',
  passport.authenticate('apple', { failureRedirect: '/login?error=apple_auth_failed' }),
  async (req, res) => {
    try {
      if (req.user) {
        const user = req.user as any;
        await regen(req);
        req.session.userId = user.id;
        await save(req);
      }
      return res.redirect('/');
    } catch (err) {
      console.error('Apple OAuth callback error:', err);
      return res.redirect('/login?error=session_save_failed');
    }
  }
);

// Apple can also use GET for callbacks in some cases
router.get('/apple/callback',
  passport.authenticate('apple', { failureRedirect: '/login?error=apple_auth_failed' }),
  async (req, res) => {
    try {
      if (req.user) {
        const user = req.user as any;
        await regen(req);
        req.session.userId = user.id;
        await save(req);
      }
      const redirectUrl = req.session?.returnTo || '/?auth=success';
      delete req.session?.returnTo;
      await save(req);
      res.redirect(redirectUrl);
    } catch (err) {
      console.error('Session save error after Apple auth (GET):', err);
      return res.redirect('/login?error=session_save_failed');
    }
  }
);

// PUT /api/auth/profile - Update user profile
router.put('/profile', isAuthenticated, async (req, res) => {
  try {
    const user = req.user as any;
    if (!user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const updateSchema = z.object({
      name: z.string().min(2, 'Name must be at least 2 characters').max(80, 'Name must be less than 80 characters').optional(),
      phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number format').optional(),
      city: z.string().min(2, 'City must be at least 2 characters').optional(),
      country: z.string().min(2, 'Country must be at least 2 characters').optional(),
    });

    const validatedData = updateSchema.parse(req.body);

    // Check if phone number is already in use (if provided and different from current)
    if (validatedData.phone && validatedData.phone !== user.phone) {
      const [existingPhone] = await db
        .select()
        .from(users)
        .where(eq(users.phone, validatedData.phone))
        .limit(1);

      if (existingPhone && existingPhone.id !== user.id) {
        return res.status(409).json({ error: 'Phone number already registered with another account' });
      }
    }

    // Update user profile
    const [updatedUser] = await db
      .update(users)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))
      .returning();

    res.json({ user: sanitizeUser(updatedUser) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ error: validationError.message });
    }

    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Profile update failed' });
  }
});

export { router as authRouter };