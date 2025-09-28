import "express-session";

declare module "express-session" {
  interface SessionData {
    userId?: number;
    user?: {
      id: number;
      email: string;
      name: string;
      username: string;
      phone?: string;
      isAdmin: boolean;
    };
  }
}