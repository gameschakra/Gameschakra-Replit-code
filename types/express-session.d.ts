import "express-session";

declare module "express-session" {
  interface SessionData {
    user?: {
      id: number;
      email: string;
      role?: string;
      name?: string;
      username?: string;
      phone?: string;
      isAdmin?: boolean;
    };
  }
}