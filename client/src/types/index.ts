// Blog types
export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  metaDescription: string | null;
  featuredImage: string | null;
  authorId: number;
  status: 'draft' | 'published';
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  tags: string[] | null;
  viewCount: number | null;
  // Relations
  author?: {
    id: number;
    username: string;
    email: string;
    avatarUrl: string | null;
  };
  categories?: {
    id: number;
    name: string;
    slug: string;
    description: string | null;
  }[];
  readingTime?: string;
}

export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  postCount?: number;
}

export interface BlogTag {
  id: number;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
  postCount?: number;
}

// Game types
export interface Game {
  id: number;
  title: string;
  slug: string;
  description: string;
  instructions: string | null;
  thumbnailUrl: string | null;
  gameDir: string;
  entryFile: string;
  width: number;
  height: number;
  status: 'pending' | 'approved' | 'rejected';
  uploaderId: number | null;
  createdAt: Date;
  updatedAt: Date;
  categoryIds?: number[];
  featured: boolean;
  views: number;
  likes: number;
  plays: number;
  uploader?: {
    id: number;
    username: string;
  };
}

export interface GameCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  createdAt: Date;
  updatedAt: Date;
  gameCount?: number;
}

// User types
export interface User {
  id: number;
  username: string;
  email: string;
  avatarUrl: string | null;
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Challenge types
export interface Challenge {
  id: number;
  title: string;
  slug: string;
  description: string;
  rules: string;
  prize: string | null;
  thumbnailUrl: string | null;
  startDate: Date;
  endDate: Date;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  categoryId: number | null;
  createdAt: Date;
  updatedAt: Date;
  category?: GameCategory;
  participantCount?: number;
  submissionCount?: number;
  isParticipating?: boolean;
  hasSubmitted?: boolean;
}