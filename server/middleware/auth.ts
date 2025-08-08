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
    adminToken: req.headers['x-admin-token'] ? 'Present' : 'Not present'
  });
  
  // Remove hardcoded admin token bypass for security
  // Admin token should only be used for specific admin operations, not general auth bypass
  
  if (req.isAuthenticated()) {
    console.log('isAuthenticated middleware - AUTHENTICATED, user:', req.user);
    return next();
  }
  
  console.log('isAuthenticated middleware - NOT authenticated');
  res.status(401).json({ message: 'Authentication required' });
}

// Middleware to check if user is an admin
export function isAdmin(req: Request, res: Response, next: NextFunction) {
  console.log('isAdmin middleware - auth check:', {
    isAuthenticated: req.isAuthenticated(), 
    user: req.user ? `User: ${(req.user as any).id}` : 'No user',
    headers: req.headers.cookie, 
    session: req.session || 'No session'
  });
  
  // Remove hardcoded admin token bypass for security
  // Admin operations should go through proper authentication
  
  if (!req.isAuthenticated()) {
    console.log('isAdmin middleware - not authenticated');
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  const authReq = req as AuthenticatedRequest;
  if (!authReq.user.isAdmin) {
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
