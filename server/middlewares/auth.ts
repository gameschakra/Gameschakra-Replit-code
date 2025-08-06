import { Request, Response, NextFunction } from "express";

/**
 * Middleware to check if a user is authenticated
 * This middleware will check if req.isAuthenticated() returns true
 * If authenticated, it will call next()
 * If not authenticated, it will return 401 Unauthorized
 */
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  
  return res.status(401).json({ error: "Unauthorized" });
}

/**
 * Middleware to check if a user is an admin
 * This middleware will check if req.isAuthenticated() returns true AND req.user.isAdmin is true
 * If authenticated and admin, it will call next()
 * If not authenticated, it will return 401 Unauthorized
 * If authenticated but not admin, it will return 403 Forbidden
 */
export function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  
  if (!req.user?.isAdmin) {
    return res.status(403).json({ error: "Forbidden - Admin access required" });
  }
  
  return next();
}