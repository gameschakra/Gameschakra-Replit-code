import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';
import { User as UserType } from '@shared/schema';

// Instead of extending the Express.User interface which causes circular reference,
// we'll just declare that we know the structure of req.user
interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    username: string;
    email: string;
    isAdmin: boolean;
    [key: string]: any;
  }
}

// Middleware to check if user is authenticated - with enhanced logs
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  console.log('isAuthenticated middleware - auth check:', {
    authHeader: req.headers.authorization,
    cookies: req.headers.cookie, 
    method: req.method,
    path: req.path,
    origin: req.headers.origin,
    contentType: req.headers['content-type'],
    session: req.session ? {
      id: req.sessionID,
      cookie: req.session.cookie
    } : 'No session',
  });

  if (req.isAuthenticated()) {
    console.log('isAuthenticated middleware - AUTHENTICATED, user:', req.user);
    return next();
  }

  // Fallback: check session.userId (set by local login which bypasses passport.login())
  const sessionUserId = (req.session as any)?.userId;
  if (sessionUserId) {
    console.log('isAuthenticated middleware - AUTHENTICATED via session.userId:', sessionUserId);
    return next();
  }

  console.log('isAuthenticated middleware - NOT authenticated');
  res.status(401).json({ message: 'Authentication required' });
}

// Middleware to check if user is an admin
export async function isAdmin(req: Request, res: Response, next: NextFunction) {
  console.log('isAdmin middleware - auth check:', {
    isAuthenticated: req.isAuthenticated(),
    user: req.user ? `User: ${(req.user as any).id}` : 'No user',
    sessionUserId: (req.session as any)?.userId,
    headers: req.headers.cookie,
  });

  // Check both passport authentication AND session.userId
  const sessionUserId = (req.session as any)?.userId;

  if (!req.isAuthenticated() && !sessionUserId) {
    console.log('isAdmin middleware - not authenticated (no passport user or session userId)');
    return res.status(401).json({ message: 'Authentication required' });
  }

  // If we have session.userId but no req.user, load the user
  let user = req.user as any;
  if (!user && sessionUserId) {
    try {
      const { db } = await import('../db');
      const { users } = await import('../../shared/schema');
      const { eq } = await import('drizzle-orm');

      const [dbUser] = await db.select().from(users).where(eq(users.id, sessionUserId)).limit(1);
      if (dbUser) {
        user = dbUser;
        req.user = dbUser;
      }
    } catch (err) {
      console.error('isAdmin middleware - failed to load user from session:', err);
    }
  }

  if (!user) {
    console.log('isAdmin middleware - user not found');
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (!user.isAdmin) {
    console.log('isAdmin middleware - not admin user');
    return res.status(403).json({ message: 'Admin access required' });
  }

  console.log('isAdmin middleware - admin access granted');
  return next();
}

// Middleware to load user data if session exists
export async function loadUser(req: Request, res: Response, next: NextFunction) {
  // This middleware is redundant when using Passport's serializeUser/deserializeUser
  // as Passport will already load the user and attach it to req.user
  next();
}
