import { 
  users, categories, games, favorites, recentlyPlayed, 
  challenges, challengeParticipants, challengeSubmissions,
  gameAnalytics, trafficSources,
  type User, type InsertUser, type Category, type InsertCategory,
  type Game, type InsertGame, type Favorite, type InsertFavorite,
  type RecentlyPlayed, type InsertRecentlyPlayed,
  type Challenge, type InsertChallenge, type ChallengeParticipant, type InsertChallengeParticipant,
  type ChallengeSubmission, type InsertChallengeSubmission,
  type GameAnalytics, type InsertGameAnalytics, type TrafficSource, type InsertTrafficSource
} from "@shared/schema";
import { formatDate } from "./utils";
import { db } from "./db";
import { eq, desc, sql, and, inArray, like, asc, ne } from "drizzle-orm";

// Define storage interface
export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Categories
  getCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;
  incrementCategoryGameCount(id: number): Promise<void>;
  decrementCategoryGameCount(id: number): Promise<void>;

  // Games
  getGames(options?: {
    limit?: number;
    offset?: number;
    categoryId?: number;
    status?: "draft" | "published";
    featured?: boolean;
    search?: string;
    excludeId?: number;
  }): Promise<Game[]>;
  getGameById(id: number): Promise<Game | undefined>;
  getGameBySlug(slug: string): Promise<Game | undefined>;
  createGame(game: InsertGame): Promise<Game>;
  updateGame(id: number, game: Partial<InsertGame>): Promise<Game | undefined>;
  deleteGame(id: number): Promise<boolean>;
  incrementGamePlayCount(id: number): Promise<void>;
  getFeaturedGames(limit?: number): Promise<Game[]>;
  getPopularGames(limit?: number): Promise<Game[]>;

  // Favorites
  getFavoritesByUserId(userId: number): Promise<(Favorite & { game: Game })[]>;
  isGameFavorite(userId: number, gameId: number): Promise<boolean>;
  addFavorite(favorite: InsertFavorite): Promise<Favorite>;
  removeFavorite(userId: number, gameId: number): Promise<boolean>;

  // Recently Played
  getRecentlyPlayedByUserId(userId: number, limit?: number): Promise<(RecentlyPlayed & { game: Game })[]>;
  addRecentlyPlayed(recentlyPlayed: InsertRecentlyPlayed): Promise<RecentlyPlayed>;

  // Challenges
  getChallenges(status?: "upcoming" | "active" | "completed"): Promise<Challenge[]>;
  getChallengeById(id: number): Promise<Challenge | undefined>;
  getChallengeBySlug(slug: string): Promise<Challenge | undefined>;
  createChallenge(challenge: InsertChallenge): Promise<Challenge>;
  updateChallenge(id: number, challenge: Partial<InsertChallenge>): Promise<Challenge | undefined>;
  deleteChallenge(id: number): Promise<boolean>;
  updateChallengeStatus(id: number, status: "upcoming" | "active" | "completed"): Promise<Challenge | undefined>;

  // Challenge Participants
  getChallengeParticipants(challengeId: number): Promise<(ChallengeParticipant & { user: User })[]>;
  isUserParticipating(challengeId: number, userId: number): Promise<boolean>;
  addChallengeParticipant(participant: InsertChallengeParticipant): Promise<ChallengeParticipant>;
  removeChallengeParticipant(challengeId: number, userId: number): Promise<boolean>;

  // Challenge Submissions
  getChallengeSubmissions(challengeId: number): Promise<(ChallengeSubmission & { user: User })[]>;
  getUserChallengeSubmission(challengeId: number, userId: number): Promise<ChallengeSubmission | undefined>;
  addChallengeSubmission(submission: InsertChallengeSubmission): Promise<ChallengeSubmission>;
  updateChallengeSubmission(id: number, submission: Partial<InsertChallengeSubmission>): Promise<ChallengeSubmission | undefined>;
  getChallengeLeaderboard(challengeId: number, limit?: number): Promise<(ChallengeSubmission & { user: User })[]>;

  // Game Analytics
  addGameAnalytics(analytics: InsertGameAnalytics): Promise<GameAnalytics>;
  getGameAnalytics(gameId: number, startDate?: string, endDate?: string): Promise<GameAnalytics[]>;

  // Traffic Sources
  addTrafficSource(source: InsertTrafficSource): Promise<TrafficSource>;
  getTrafficSources(gameId?: number, startDate?: string, endDate?: string): Promise<TrafficSource[]>;
}

// Memory storage implementation (for development fallback)
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private games: Map<number, Game>;
  private favorites: Map<number, Favorite[]>;
  private recentlyPlayed: Map<number, RecentlyPlayed[]>;
  private challenges: Map<number, Challenge>;
  private challengeParticipants: Map<number, ChallengeParticipant[]>;
  private challengeSubmissions: Map<number, ChallengeSubmission[]>;
  private gameAnalytics: Map<number, GameAnalytics[]>;
  private trafficSources: Map<number, TrafficSource[]>;
  private currentId: { [key: string]: number };

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.games = new Map();
    this.favorites = new Map();
    this.recentlyPlayed = new Map();
    this.challenges = new Map();
    this.challengeParticipants = new Map();
    this.challengeSubmissions = new Map();
    this.gameAnalytics = new Map();
    this.trafficSources = new Map();
    this.currentId = { 
      users: 1, 
      categories: 1, 
      games: 1, 
      favorites: 1, 
      recentlyPlayed: 1,
      challenges: 1,
      challengeParticipants: 1,
      challengeSubmissions: 1,
      gameAnalytics: 1,
      trafficSources: 1
    };
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId.users++;
    const timestamp = new Date();
    const user: User = { ...insertUser, id, createdAt: timestamp };
    this.users.set(id, user);
    return user;
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(category => category.slug === slug);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.currentId.categories++;
    const category: Category = { ...insertCategory, id, gameCount: 0 };
    this.categories.set(id, category);
    return category;
  }

  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined> {
    const existing = this.categories.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...category };
    this.categories.set(id, updated);
    return updated;
  }

  async deleteCategory(id: number): Promise<boolean> {
    return this.categories.delete(id);
  }

  async incrementCategoryGameCount(id: number): Promise<void> {
    const category = this.categories.get(id);
    if (category) {
      category.gameCount += 1;
      this.categories.set(id, category);
    }
  }

  async decrementCategoryGameCount(id: number): Promise<void> {
    const category = this.categories.get(id);
    if (category && category.gameCount > 0) {
      category.gameCount -= 1;
      this.categories.set(id, category);
    }
  }

  // Games
  async getGames(options?: {
    limit?: number;
    offset?: number;
    categoryId?: number;
    status?: "draft" | "published";
    featured?: boolean;
    search?: string;
    excludeId?: number;
  }): Promise<Game[]> {
    let result = Array.from(this.games.values());

    if (options?.categoryId) {
      result = result.filter(game => game.categoryId === options.categoryId);
    }

    if (options?.status) {
      result = result.filter(game => game.status === options.status);
    }

    if (options?.featured !== undefined) {
      result = result.filter(game => game.isFeatured === options.featured);
    }

    if (options?.search) {
      const search = options.search.toLowerCase();
      result = result.filter(
        game => game.title.toLowerCase().includes(search) || 
        (game.description && game.description.toLowerCase().includes(search))
      );
    }

    if (options?.excludeId) {
      result = result.filter(game => game.id !== options.excludeId);
    }

    // Sort by updatedAt
    result.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

    // Apply pagination
    if (options?.offset) {
      result = result.slice(options.offset);
    }

    if (options?.limit) {
      result = result.slice(0, options.limit);
    }

    return result;
  }

  async getGameById(id: number): Promise<Game | undefined> {
    return this.games.get(id);
  }

  async getGameBySlug(slug: string): Promise<Game | undefined> {
    return Array.from(this.games.values()).find(game => game.slug === slug);
  }

  async createGame(insertGame: InsertGame): Promise<Game> {
    const id = this.currentId.games++;
    const timestamp = new Date();
    const slug = this.generateSlug(insertGame.title);

    const game: Game = {
      ...insertGame,
      id,
      slug,
      playCount: 0,
      rating: 0,
      ratingCount: 0,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    this.games.set(id, game);

    // Increment category game count
    if (game.categoryId) {
      await this.incrementCategoryGameCount(game.categoryId);
    }

    return game;
  }

  async updateGame(id: number, game: Partial<InsertGame>): Promise<Game | undefined> {
    const existing = this.games.get(id);
    if (!existing) return undefined;

    // Handle category change
    if (game.categoryId && game.categoryId !== existing.categoryId) {
      if (existing.categoryId) {
        await this.decrementCategoryGameCount(existing.categoryId);
      }
      if (game.categoryId) {
        await this.incrementCategoryGameCount(game.categoryId);
      }
    }

    const updated: Game = {
      ...existing,
      ...game,
      updatedAt: new Date()
    };

    this.games.set(id, updated);
    return updated;
  }

  async deleteGame(id: number): Promise<boolean> {
    const game = this.games.get(id);
    if (!game) return false;

    // Decrement category game count
    if (game.categoryId) {
      await this.decrementCategoryGameCount(game.categoryId);
    }

    return this.games.delete(id);
  }

  async incrementGamePlayCount(id: number): Promise<void> {
    const game = this.games.get(id);
    if (game) {
      game.playCount += 1;
      this.games.set(id, game);
    }
  }

  async getFeaturedGames(limit?: number): Promise<Game[]> {
    let result = Array.from(this.games.values())
      .filter(game => game.isFeatured && game.status === "published")
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

    if (limit) {
      result = result.slice(0, limit);
    }

    return result;
  }

  async getPopularGames(limit?: number): Promise<Game[]> {
    let result = Array.from(this.games.values())
      .filter(game => game.status === "published")
      .sort((a, b) => b.playCount - a.playCount);

    if (limit) {
      result = result.slice(0, limit);
    }

    return result;
  }

  // Favorites
  async getFavoritesByUserId(userId: number): Promise<(Favorite & { game: Game })[]> {
    const userFavorites = this.favorites.get(userId) || [];
    return userFavorites.map(favorite => {
      const game = this.games.get(favorite.gameId)!;
      return { ...favorite, game };
    });
  }

  async isGameFavorite(userId: number, gameId: number): Promise<boolean> {
    const userFavorites = this.favorites.get(userId) || [];
    return userFavorites.some(favorite => favorite.gameId === gameId);
  }

  async addFavorite(insertFavorite: InsertFavorite): Promise<Favorite> {
    const id = this.currentId.favorites++;
    const timestamp = new Date();

    const favorite: Favorite = {
      ...insertFavorite,
      id,
      createdAt: timestamp
    };

    const userFavorites = this.favorites.get(favorite.userId) || [];
    userFavorites.push(favorite);
    this.favorites.set(favorite.userId, userFavorites);

    return favorite;
  }

  async removeFavorite(userId: number, gameId: number): Promise<boolean> {
    const userFavorites = this.favorites.get(userId) || [];
    const index = userFavorites.findIndex(
      favorite => favorite.userId === userId && favorite.gameId === gameId
    );

    if (index !== -1) {
      userFavorites.splice(index, 1);
      this.favorites.set(userId, userFavorites);
      return true;
    }

    return false;
  }

  // Recently Played
  async getRecentlyPlayedByUserId(userId: number, limit?: number): Promise<(RecentlyPlayed & { game: Game })[]> {
    let userRecentlyPlayed = this.recentlyPlayed.get(userId) || [];

    // Sort by playedAt descending
    userRecentlyPlayed.sort((a, b) => b.playedAt.getTime() - a.playedAt.getTime());

    if (limit) {
      userRecentlyPlayed = userRecentlyPlayed.slice(0, limit);
    }

    return userRecentlyPlayed.map(recentlyPlayed => {
      const game = this.games.get(recentlyPlayed.gameId)!;
      return { ...recentlyPlayed, game };
    });
  }

  async addRecentlyPlayed(insertRecentlyPlayed: InsertRecentlyPlayed): Promise<RecentlyPlayed> {
    const id = this.currentId.recentlyPlayed++;
    const timestamp = new Date();

    const recentlyPlayed: RecentlyPlayed = {
      ...insertRecentlyPlayed,
      id,
      playedAt: timestamp
    };

    const userRecentlyPlayed = this.recentlyPlayed.get(recentlyPlayed.userId) || [];

    // Remove previous entry for the same game
    const filteredRecentlyPlayed = userRecentlyPlayed.filter(
      item => item.gameId !== recentlyPlayed.gameId
    );

    // Add new entry
    filteredRecentlyPlayed.push(recentlyPlayed);
    this.recentlyPlayed.set(recentlyPlayed.userId, filteredRecentlyPlayed);

    return recentlyPlayed;
  }

  // Helper function to generate a slug from a title
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  // Challenges
  async getChallenges(status?: "upcoming" | "active" | "completed"): Promise<Challenge[]> {
    let result = Array.from(this.challenges.values());

    if (status) {
      result = result.filter(challenge => challenge.status === status);
    }

    // Sort by startDate ascending for upcoming, and endDate descending for active/completed
    if (status === "upcoming") {
      result.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    } else {
      result.sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime());
    }

    return result;
  }

  async getChallengeById(id: number): Promise<Challenge | undefined> {
    return this.challenges.get(id);
  }

  async getChallengeBySlug(slug: string): Promise<Challenge | undefined> {
    return Array.from(this.challenges.values()).find(challenge => challenge.slug === slug);
  }

  async createChallenge(insertChallenge: InsertChallenge): Promise<Challenge> {
    const id = this.currentId.challenges++;
    const slug = this.generateSlug(insertChallenge.title);
    const timestamp = new Date();

    // Determine status based on dates
    const now = new Date();
    let status: "upcoming" | "active" | "completed" = "upcoming";

    if (new Date(insertChallenge.startDate) <= now && new Date(insertChallenge.endDate) >= now) {
      status = "active";
    } else if (new Date(insertChallenge.endDate) < now) {
      status = "completed";
    }

    const challenge: Challenge = {
      ...insertChallenge,
      id,
      slug,
      status,
      createdAt: timestamp
    };

    this.challenges.set(id, challenge);
    return challenge;
  }

  async updateChallenge(id: number, challenge: Partial<InsertChallenge>): Promise<Challenge | undefined> {
    const existing = this.challenges.get(id);
    if (!existing) return undefined;

    const updated: Challenge = {
      ...existing,
      ...challenge
    };

    // Update status based on dates if dates are updated
    if (challenge.startDate || challenge.endDate) {
      const startDate = challenge.startDate || existing.startDate;
      const endDate = challenge.endDate || existing.endDate;
      const now = new Date();

      if (new Date(startDate) <= now && new Date(endDate) >= now) {
        updated.status = "active";
      } else if (new Date(endDate) < now) {
        updated.status = "completed";
      } else {
        updated.status = "upcoming";
      }
    }

    this.challenges.set(id, updated);
    return updated;
  }

  async deleteChallenge(id: number): Promise<boolean> {
    return this.challenges.delete(id);
  }

  async updateChallengeStatus(id: number, status: "upcoming" | "active" | "completed"): Promise<Challenge | undefined> {
    const challenge = this.challenges.get(id);
    if (!challenge) return undefined;

    challenge.status = status;
    this.challenges.set(id, challenge);
    return challenge;
  }

  // Challenge Participants
  async getChallengeParticipants(challengeId: number): Promise<(ChallengeParticipant & { user: User })[]> {
    const participants = this.challengeParticipants.get(challengeId) || [];

    return participants.map(participant => {
      const user = this.users.get(participant.userId)!;
      return { ...participant, user };
    });
  }

  async isUserParticipating(challengeId: number, userId: number): Promise<boolean> {
    const participants = this.challengeParticipants.get(challengeId) || [];
    return participants.some(participant => participant.userId === userId);
  }

  async addChallengeParticipant(insertParticipant: InsertChallengeParticipant): Promise<ChallengeParticipant> {
    // Check if already participating
    if (await this.isUserParticipating(insertParticipant.challengeId, insertParticipant.userId)) {
      const existingParticipants = this.challengeParticipants.get(insertParticipant.challengeId) || [];
      const existingParticipant = existingParticipants.find(
        p => p.challengeId === insertParticipant.challengeId && p.userId === insertParticipant.userId
      );
      return existingParticipant!;
    }

    const id = this.currentId.challengeParticipants++;
    const timestamp = new Date();

    const participant: ChallengeParticipant = {
      ...insertParticipant,
      id,
      joinedAt: timestamp
    };

    const challengeParticipants = this.challengeParticipants.get(participant.challengeId) || [];
    challengeParticipants.push(participant);
    this.challengeParticipants.set(participant.challengeId, challengeParticipants);

    return participant;
  }

  async removeChallengeParticipant(challengeId: number, userId: number): Promise<boolean> {
    const participants = this.challengeParticipants.get(challengeId) || [];
    const index = participants.findIndex(
      participant => participant.challengeId === challengeId && participant.userId === userId
    );

    if (index !== -1) {
      participants.splice(index, 1);
      this.challengeParticipants.set(challengeId, participants);
      return true;
    }

    return false;
  }

  // Challenge Submissions
  async getChallengeSubmissions(challengeId: number): Promise<(ChallengeSubmission & { user: User })[]> {
    const submissions = this.challengeSubmissions.get(challengeId) || [];

    return submissions.map(submission => {
      const user = this.users.get(submission.userId)!;
      return { ...submission, user };
    });
  }

  async getUserChallengeSubmission(challengeId: number, userId: number): Promise<ChallengeSubmission | undefined> {
    const submissions = this.challengeSubmissions.get(challengeId) || [];
    return submissions.find(
      submission => submission.challengeId === challengeId && submission.userId === userId
    );
  }

  async addChallengeSubmission(insertSubmission: InsertChallengeSubmission): Promise<ChallengeSubmission> {
    const id = this.currentId.challengeSubmissions++;
    const timestamp = new Date();

    const submission: ChallengeSubmission = {
      ...insertSubmission,
      id,
      submittedAt: timestamp
    };

    const challengeSubmissions = this.challengeSubmissions.get(submission.challengeId) || [];

    // Remove any existing submission from the same user
    const filteredSubmissions = challengeSubmissions.filter(
      s => s.userId !== submission.userId
    );

    // Add the new submission
    filteredSubmissions.push(submission);
    this.challengeSubmissions.set(submission.challengeId, filteredSubmissions);

    return submission;
  }

  async updateChallengeSubmission(id: number, submission: Partial<InsertChallengeSubmission>): Promise<ChallengeSubmission | undefined> {
    // Find the challenge ID associated with this submission
    let foundChallengeId: number | undefined;
    let foundSubmission: ChallengeSubmission | undefined;

    for (const [challengeId, submissions] of this.challengeSubmissions.entries()) {
      const found = submissions.find(s => s.id === id);
      if (found) {
        foundChallengeId = challengeId;
        foundSubmission = found;
        break;
      }
    }

    if (!foundChallengeId || !foundSubmission) return undefined;

    // Update the submission
    const updated: ChallengeSubmission = {
      ...foundSubmission,
      ...submission,
      id,
      challengeId: foundSubmission.challengeId,
      userId: foundSubmission.userId,
      submittedAt: foundSubmission.submittedAt
    };

    const submissions = this.challengeSubmissions.get(foundChallengeId) || [];
    const index = submissions.findIndex(s => s.id === id);

    if (index !== -1) {
      submissions[index] = updated;
      this.challengeSubmissions.set(foundChallengeId, submissions);
    }

    return updated;
  }

  async getChallengeLeaderboard(challengeId: number, limit?: number): Promise<(ChallengeSubmission & { user: User })[]> {
    const submissions = this.challengeSubmissions.get(challengeId) || [];

    // Sort by score descending
    let result = submissions
      .sort((a, b) => b.score - a.score)
      .map(submission => {
        const user = this.users.get(submission.userId)!;
        return { ...submission, user };
      });

    if (limit) {
      result = result.slice(0, limit);
    }

    return result;
  }

  // Game Analytics
  async addGameAnalytics(analytics: InsertGameAnalytics): Promise<GameAnalytics> {
    const id = this.currentId.gameAnalytics++;
    const timestamp = new Date();
    const today = new Date();

    const gameAnalytic: GameAnalytics = {
      ...analytics,
      id,
      playDate: formatDate(today),
      playTime: today.toTimeString().split(' ')[0],
      createdAt: timestamp
    };

    const gameAnalytics = this.gameAnalytics.get(gameAnalytic.gameId) || [];
    gameAnalytics.push(gameAnalytic);
    this.gameAnalytics.set(gameAnalytic.gameId, gameAnalytics);

    return gameAnalytic;
  }

  async getGameAnalytics(gameId: number, startDate?: string, endDate?: string): Promise<GameAnalytics[]> {
    const gameAnalytics = this.gameAnalytics.get(gameId) || [];

    if (!startDate && !endDate) {
      return gameAnalytics;
    }

    const start = startDate ? new Date(startDate) : new Date(0);
    const end = endDate ? new Date(endDate) : new Date();

    return gameAnalytics.filter(ga => {
      const date = new Date(ga.playDate);
      return date >= start && date <= end;
    });
  }

  // Traffic Sources
  async addTrafficSource(source: InsertTrafficSource): Promise<TrafficSource> {
    const id = this.currentId.trafficSources++;
    const timestamp = new Date();
    const today = new Date();

    const trafficSource: TrafficSource = {
      ...source,
      id,
      visitDate: formatDate(today),
      createdAt: timestamp
    };

    const trafficSources = this.trafficSources.get(trafficSource.gameId || 0) || [];
    trafficSources.push(trafficSource);
    this.trafficSources.set(trafficSource.gameId || 0, trafficSources);

    return trafficSource;
  }

  async getTrafficSources(gameId?: number, startDate?: string, endDate?: string): Promise<TrafficSource[]> {
    let allTrafficSources: TrafficSource[] = [];

    if (gameId) {
      allTrafficSources = this.trafficSources.get(gameId) || [];
    } else {
      for (const sources of this.trafficSources.values()) {
        allTrafficSources = allTrafficSources.concat(sources);
      }
    }

    if (!startDate && !endDate) {
      return allTrafficSources;
    }

    const start = startDate ? new Date(startDate) : new Date(0);
    const end = endDate ? new Date(endDate) : new Date();

    return allTrafficSources.filter(ts => {
      const date = new Date(ts.visitDate);
      return date >= start && date <= end;
    });
  }
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(categories.name);
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
    return category;
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db.insert(categories).values(insertCategory).returning();
    return category;
  }

  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined> {
    const [updated] = await db
      .update(categories)
      .set(category)
      .where(eq(categories.id, id))
      .returning();
    return updated;
  }

  async deleteCategory(id: number): Promise<boolean> {
    const result = await db.delete(categories).where(eq(categories.id, id));
    return !!result;
  }

  async incrementCategoryGameCount(id: number): Promise<void> {
    await db
      .update(categories)
      .set({ gameCount: sql`${categories.gameCount} + 1` })
      .where(eq(categories.id, id));
  }

  async decrementCategoryGameCount(id: number): Promise<void> {
    await db
      .update(categories)
      .set({ gameCount: sql`GREATEST(${categories.gameCount} - 1, 0)` })
      .where(eq(categories.id, id));
  }

  // Games
  async getGames(options?: {
    limit?: number;
    offset?: number;
    categoryId?: number;
    status?: "draft" | "published";
    featured?: boolean;
    search?: string;
    excludeId?: number;
  }): Promise<Game[]> {
    let query = db.select().from(games);

    // Apply filters
    const conditions = [];

    if (options?.categoryId) {
      conditions.push(eq(games.categoryId, options.categoryId));
    }

    if (options?.status) {
      conditions.push(eq(games.status, options.status));
    }

    if (options?.featured !== undefined) {
      conditions.push(eq(games.isFeatured, options.featured));
    }

    if (options?.search) {
      conditions.push(sql`(${games.title} ILIKE ${`%${options.search}%`} OR ${games.description} ILIKE ${`%${options.search}%`})`);
    }

    if (options?.excludeId) {
      conditions.push(ne(games.id, options.excludeId));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    query = query.orderBy(desc(games.updatedAt));

    // Apply pagination
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.offset(options.offset);
    }

    return await query;
  }

  async getGameById(id: number): Promise<Game | undefined> {
    const [game] = await db.select().from(games).where(eq(games.id, id));
    return game;
  }

  async getGameBySlug(slug: string): Promise<Game | undefined> {
    const [game] = await db.select().from(games).where(eq(games.slug, slug));
    return game;
  }

  async createGame(insertGame: InsertGame): Promise<Game> {
    // Generate slug from title
    const slug = this.generateSlug(insertGame.title);

    const now = new Date();
    const [game] = await db
      .insert(games)
      .values({
        ...insertGame,
        slug,
        createdAt: now,
        updatedAt: now
      })
      .returning();

    // Increment category game count if a category is specified
    if (game.categoryId) {
      await this.incrementCategoryGameCount(game.categoryId);
    }

    return game;
  }

  async updateGame(id: number, game: Partial<InsertGame>): Promise<Game | undefined> {
    // Get the current game to check for category changes
    const currentGame = await this.getGameById(id);
    if (!currentGame) return undefined;

    // Handle category change
    if (game.categoryId && game.categoryId !== currentGame.categoryId) {
      // Decrement the count for the old category
      if (currentGame.categoryId) {
        await this.decrementCategoryGameCount(currentGame.categoryId);
      }

      // Increment the count for the new category
      await this.incrementCategoryGameCount(game.categoryId);
    }

    // Update the game
    const [updated] = await db
      .update(games)
      .set({
        ...game,
        updatedAt: new Date()
      })
      .where(eq(games.id, id))
      .returning();

    return updated;
  }

  async deleteGame(id: number): Promise<boolean> {
    try {
      console.log(`[storage] Starting deletion process for game ID: ${id}`);
      
      // Get the current game to handle category counts
      const game = await this.getGameById(id);
      if (!game) {
        console.log(`[storage] Game with ID ${id} not found`);
        return false;
      }
      
      // Use a transaction to ensure data integrity
      return await db.transaction(async (tx) => {
        console.log(`[storage] Beginning transaction for deleting game ID: ${id}`);
        
        // Step 1: Delete related records that might not have ON DELETE CASCADE
        // These deletes will be handled by PostgreSQL if foreign keys have ON DELETE CASCADE
        // but we're doing this explicitly to be safe
        
        try {
          // Step 1.1: Delete favorites
          console.log(`[storage] Deleting favorites for game ID: ${id}`);
          await tx.delete(favorites).where(eq(favorites.gameId, id));
          
          // Step 1.2: Delete recently played records
          console.log(`[storage] Deleting recently played records for game ID: ${id}`);
          await tx.delete(recentlyPlayed).where(eq(recentlyPlayed.gameId, id));
          
          // Step 1.3: Delete game analytics
          console.log(`[storage] Deleting game analytics for game ID: ${id}`);
          await tx.delete(gameAnalytics).where(eq(gameAnalytics.gameId, id));
          
          // Step 1.4: Update traffic sources (set gameId to null)
          console.log(`[storage] Updating traffic sources for game ID: ${id}`);
          await tx.update(trafficSources)
            .set({ gameId: null })
            .where(eq(trafficSources.gameId, id));
          
          // Step 1.5: Update challenges (set gameId to null)
          console.log(`[storage] Updating challenges for game ID: ${id}`);
          await tx.update(challenges)
            .set({ gameId: null })
            .where(eq(challenges.gameId, id));
        } catch (error: unknown) {
          const err = error as Error;
          console.error(`[storage] Error deleting related records: ${err.message}`);
          throw error; // Re-throw to trigger transaction rollback
        }
        
        // Step 2: Decrement category game count if a category is specified
        if (game.categoryId) {
          console.log(`[storage] Decrementing game count for category ID: ${game.categoryId}`);
          try {
            await this.decrementCategoryGameCount(game.categoryId);
          } catch (error: unknown) {
            const err = error as Error;
            console.error(`[storage] Error decrementing category count: ${err.message}`);
            // Continue with deletion even if category update fails
          }
        }
        
        // Step 3: Delete the game record
        console.log(`[storage] Deleting game record with ID: ${id}`);
        const result = await tx.delete(games).where(eq(games.id, id));
        
        console.log(`[storage] Game deletion transaction completed successfully for ID: ${id}`);
        return true;
      });
    } catch (error: unknown) {
      const err = error as Error;
      console.error(`[storage] Game deletion failed for ID: ${id}: ${err.message}`);
      return false;
    }
  }

  async incrementGamePlayCount(id: number): Promise<void> {
    await db
      .update(games)
      .set({ playCount: sql`${games.playCount} + 1` })
      .where(eq(games.id, id));
  }

  async getFeaturedGames(limit?: number): Promise<Game[]> {
    let query = db
      .select()
      .from(games)
      .where(and(
        eq(games.isFeatured, true),
        eq(games.status, "published")
      ))
      .orderBy(desc(games.updatedAt));

    if (limit) {
      query = query.limit(limit);
    }

    return await query;
  }

  async getPopularGames(limit?: number): Promise<Game[]> {
    let query = db
      .select()
      .from(games)
      .where(eq(games.status, "published"))
      .orderBy(desc(games.playCount));

    if (limit) {
      query = query.limit(limit);
    }

    return await query;
  }

  // Favorites
  async getFavoritesByUserId(userId: number): Promise<(Favorite & { game: Game })[]> {
    const result = await db
      .select({
        favorite: favorites,
        game: games
      })
      .from(favorites)
      .innerJoin(games, eq(favorites.gameId, games.id))
      .where(eq(favorites.userId, userId))
      .orderBy(desc(favorites.createdAt));

    return result.map(row => ({ ...row.favorite, game: row.game }));
  }

  async isGameFavorite(userId: number, gameId: number): Promise<boolean> {
    const [favorite] = await db
      .select()
      .from(favorites)
      .where(and(
        eq(favorites.userId, userId),
        eq(favorites.gameId, gameId)
      ));

    return !!favorite;
  }

  async addFavorite(insertFavorite: InsertFavorite): Promise<Favorite> {
    const [favorite] = await db
      .insert(favorites)
      .values(insertFavorite)
      .returning();

    return favorite;
  }

  async removeFavorite(userId: number, gameId: number): Promise<boolean> {
    const result = await db
      .delete(favorites)
      .where(and(
        eq(favorites.userId, userId),
        eq(favorites.gameId, gameId)
      ));

    return !!result;
  }

  // Recently Played
  async getRecentlyPlayedByUserId(userId: number, limit?: number): Promise<(RecentlyPlayed & { game: Game })[]> {
    let query = db
      .select({
        recentlyPlayed: recentlyPlayed,
        game: games
      })
      .from(recentlyPlayed)
      .innerJoin(games, eq(recentlyPlayed.gameId, games.id))
      .where(eq(recentlyPlayed.userId, userId))
      .orderBy(desc(recentlyPlayed.playedAt));

    if (limit) {
      query = query.limit(limit);
    }

    const result = await query;
    return result.map(row => ({ ...row.recentlyPlayed, game: row.game }));
  }

  async addRecentlyPlayed(insertRecentlyPlayed: InsertRecentlyPlayed): Promise<RecentlyPlayed> {
    // Remove previous entry for the same user and game
    await db
      .delete(recentlyPlayed)
      .where(and(
        eq(recentlyPlayed.userId, insertRecentlyPlayed.userId),
        eq(recentlyPlayed.gameId, insertRecentlyPlayed.gameId)
      ));

    // Add new entry
    const [result] = await db
      .insert(recentlyPlayed)
      .values(insertRecentlyPlayed)
      .returning();

    return result;
  }

  // Helper function to generate a slug from a title
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  // Challenges
  async getChallenges(status?: "upcoming" | "active" | "completed"): Promise<(Challenge & { game?: Game })[]> {
    let query = db
      .select({
        challenge: challenges,
        game: games
      })
      .from(challenges)
      .leftJoin(games, eq(challenges.gameId, games.id));

    if (status) {
      query = query.where(eq(challenges.status, status));
    }

    // Sort by dates
    if (status === "upcoming") {
      query = query.orderBy(challenges.startDate);
    } else {
      query = query.orderBy(desc(challenges.endDate));
    }

    const result = await query;
    return result.map(row => ({
      ...row.challenge,
      game: row.game || undefined
    }));
  }

  async getChallengeById(id: number): Promise<Challenge | undefined> {
    const [challenge] = await db.select().from(challenges).where(eq(challenges.id, id));
    return challenge;
  }

  async getChallengeBySlug(slug: string): Promise<Challenge | undefined> {
    const [challenge] = await db.select().from(challenges).where(eq(challenges.slug, slug));
    return challenge;
  }

  async createChallenge(insertChallenge: InsertChallenge): Promise<Challenge> {
    const slug = this.generateSlug(insertChallenge.title);
    const timestamp = new Date();

    // Determine status based on dates
    const now = new Date();
    let status: "upcoming" | "active" | "completed" = "upcoming";

    if (new Date(insertChallenge.startDate) <= now && new Date(insertChallenge.endDate) >= now) {
      status = "active";
    } else if (new Date(insertChallenge.endDate) < now) {
      status = "completed";
    }

    const [challenge] = await db
      .insert(challenges)
      .values({
        ...insertChallenge,
        slug,
        status,
        createdAt: timestamp
      })
      .returning();

    return challenge;
  }

  async updateChallenge(id: number, challenge: Partial<InsertChallenge>): Promise<Challenge | undefined> {
    const current = await this.getChallengeById(id);
    if (!current) return undefined;

    // Update status based on dates if dates are updated
    let status = current.status;
    if (challenge.startDate || challenge.endDate) {
      const startDate = challenge.startDate || current.startDate;
      const endDate = challenge.endDate || current.endDate;
      const now = new Date();

      if (new Date(startDate) <= now && new Date(endDate) >= now) {
        status = "active";
      } else if (new Date(endDate) < now) {
        status = "completed";
      } else {
        status = "upcoming";
      }
    }

    const [updated] = await db
      .update(challenges)
      .set({
        ...challenge,
        status
      })
      .where(eq(challenges.id, id))
      .returning();

    return updated;
  }

  async deleteChallenge(id: number): Promise<boolean> {
    const result = await db.delete(challenges).where(eq(challenges.id, id));
    return !!result;
  }

  async updateChallengeStatus(id: number, status: "upcoming" | "active" | "completed"): Promise<Challenge | undefined> {
    const [updated] = await db
      .update(challenges)
      .set({ status })
      .where(eq(challenges.id, id))
      .returning();

    return updated;
  }

  // Challenge Participants
  async getChallengeParticipants(challengeId: number): Promise<(ChallengeParticipant & { user: User })[]> {
    const result = await db
      .select({
        participant: challengeParticipants,
        user: users
      })
      .from(challengeParticipants)
      .innerJoin(users, eq(challengeParticipants.userId, users.id))
      .where(eq(challengeParticipants.challengeId, challengeId))
      .orderBy(desc(challengeParticipants.joinedAt));

    return result.map(row => ({ ...row.participant, user: row.user }));
  }

  async isUserParticipating(challengeId: number, userId: number): Promise<boolean> {
    const [participant] = await db
      .select()
      .from(challengeParticipants)
      .where(and(
        eq(challengeParticipants.challengeId, challengeId),
        eq(challengeParticipants.userId, userId)
      ));

    return !!participant;
  }

  async addChallengeParticipant(insertParticipant: InsertChallengeParticipant): Promise<ChallengeParticipant> {
    // Check if already participating
    const isParticipating = await this.isUserParticipating(
      insertParticipant.challengeId,
      insertParticipant.userId
    );

    if (isParticipating) {
      const [existing] = await db
        .select()
        .from(challengeParticipants)
        .where(and(
          eq(challengeParticipants.challengeId, insertParticipant.challengeId),
          eq(challengeParticipants.userId, insertParticipant.userId)
        ));

      return existing;
    }

    const [participant] = await db
      .insert(challengeParticipants)
      .values(insertParticipant)
      .returning();

    return participant;
  }

  async removeChallengeParticipant(challengeId: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(challengeParticipants)
      .where(and(
        eq(challengeParticipants.challengeId, challengeId),
        eq(challengeParticipants.userId, userId)
      ));

    return !!result;
  }

  // Challenge Submissions
  async getChallengeSubmissions(challengeId: number): Promise<(ChallengeSubmission & { user: User })[]> {
    const result = await db
      .select({
        submission: challengeSubmissions,
        user: users
      })
      .from(challengeSubmissions)
      .innerJoin(users, eq(challengeSubmissions.userId, users.id))
      .where(eq(challengeSubmissions.challengeId, challengeId))
      .orderBy(desc(challengeSubmissions.score));

    return result.map(row => ({ ...row.submission, user: row.user }));
  }

  async getUserChallengeSubmission(challengeId: number, userId: number): Promise<ChallengeSubmission | undefined> {
    const [submission] = await db
      .select()
      .from(challengeSubmissions)
      .where(and(
        eq(challengeSubmissions.challengeId, challengeId),
        eq(challengeSubmissions.userId, userId)
      ));

    return submission;
  }

  async addChallengeSubmission(insertSubmission: InsertChallengeSubmission): Promise<ChallengeSubmission> {
    // Check if user already submitted
    const existing = await this.getUserChallengeSubmission(
      insertSubmission.challengeId,
      insertSubmission.userId
    );

    if (existing) {
      // Update existing submission
      const [updated] = await db
        .update(challengeSubmissions)
        .set({
          score: insertSubmission.score,
          screenshot: insertSubmission.screenshot,
          comment: insertSubmission.comment,
          submittedAt: new Date()
        })
        .where(eq(challengeSubmissions.id, existing.id))
        .returning();

      return updated;
    }

    // Create new submission
    const [submission] = await db
      .insert(challengeSubmissions)
      .values(insertSubmission)
      .returning();

    return submission;
  }

  async updateChallengeSubmission(id: number, submission: Partial<InsertChallengeSubmission>): Promise<ChallengeSubmission | undefined> {
    const [updated] = await db
      .update(challengeSubmissions)
      .set(submission)
      .where(eq(challengeSubmissions.id, id))
      .returning();

    return updated;
  }

  async getChallengeLeaderboard(challengeId: number, limit?: number): Promise<(ChallengeSubmission & { user: User })[]> {
    let query = db
      .select({
        submission: challengeSubmissions,
        user: users
      })
      .from(challengeSubmissions)
      .innerJoin(users, eq(challengeSubmissions.userId, users.id))
      .where(eq(challengeSubmissions.challengeId, challengeId))
      .orderBy(desc(challengeSubmissions.score));

    if (limit) {
      query = query.limit(limit);
    }

    const result = await query;
    return result.map(row => ({ ...row.submission, user: row.user }));
  }

  // Game Analytics
  async addGameAnalytics(analytics: InsertGameAnalytics): Promise<GameAnalytics> {
    const [result] = await db
      .insert(gameAnalytics)
      .values(analytics)
      .returning();

    return result;
  }

  async getGameAnalytics(gameId: number, startDate?: string, endDate?: string): Promise<GameAnalytics[]> {
    let query = db
      .select()
      .from(gameAnalytics)
      .where(eq(gameAnalytics.gameId, gameId));

    if (startDate) {
      query = query.where(
        sql`${gameAnalytics.playDate} >= ${startDate}`
      );
    }

    if (endDate) {
      query = query.where(
        sql`${gameAnalytics.playDate} <= ${endDate}`
      );
    }

    return await query;
  }

  // Traffic Sources
  async addTrafficSource(source: InsertTrafficSource): Promise<TrafficSource> {
    const [result] = await db
      .insert(trafficSources)
      .values(source)
      .returning();

    return result;
  }

  async getTrafficSources(gameId?: number, startDate?: string, endDate?: string): Promise<TrafficSource[]> {
    let query = db.select().from(trafficSources);

    const conditions = [];

    if (gameId) {
      conditions.push(eq(trafficSources.gameId, gameId));
    }

    if (startDate) {
      conditions.push(sql`${trafficSources.visitDate} >= ${startDate}`);
    }

    if (endDate) {
      conditions.push(sql`${trafficSources.visitDate} <= ${endDate}`);
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query.orderBy(desc(trafficSources.createdAt));
  }
}

// Always use DatabaseStorage since we have PostgreSQL setup
export const storage = new DatabaseStorage();