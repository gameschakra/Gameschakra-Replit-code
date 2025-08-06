// User Types
export interface User {
  id: number;
  username: string;
  email: string;
  isAdmin: boolean;
  avatarUrl?: string;
  createdAt?: string;
}

// Game Types
export interface Game {
  id: number;
  title: string;
  slug: string;
  description: string;
  instructions?: string;
  developer?: string;
  thumbnailUrl: string;
  thumbnailPath?: string; // Added for consistency with server-side model
  thumbnailHash?: string; // Added for direct hash reference
  categoryId: number;
  userId: number;
  status: "draft" | "published";
  featured: boolean;
  isFeatured?: boolean; // For compatibility with backend
  playCount: number;
  rating: number;
  ratingCount?: number; // For rating calculation
  createdAt: string;
  updatedAt: string;
  category?: Category;
  user?: User;
}

// Category Types
export interface Category {
  id: number;
  name: string;
  slug: string;
  createdAt?: string;
  updatedAt?: string;
}

// Blog Post Types
export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  status: 'draft' | 'published';
  authorId: number;
  featuredImage?: string;
  metaTitle?: string;
  metaDescription?: string;
  viewCount: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  author?: User;
  categories?: BlogCategory[];
  tags?: BlogTag[];
}

export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BlogTag {
  id: number;
  name: string;
  slug: string;
  createdAt?: string;
  updatedAt?: string;
}

// Challenge Types
export interface Challenge {
  id: number;
  title: string;
  slug: string;
  description: string;
  startDate: string;
  endDate: string;
  prizePool?: string;
  gameId?: number;
  status: 'upcoming' | 'active' | 'ended';
  createdAt: string;
  updatedAt: string;
  game?: Game;
}