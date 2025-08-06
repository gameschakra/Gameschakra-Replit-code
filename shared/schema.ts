import { pgTable, text, serial, integer, boolean, timestamp, foreignKey, pgEnum, jsonb, date, time } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Re-export blog models
export * from "./blog-schema";

// Users Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Game Status Enum
export const gameStatusEnum = pgEnum("game_status", ["draft", "published"]);

// Categories Table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  imageUrl: text("image_url"),
  gameCount: integer("game_count").default(0).notNull(),
});

// Games Table
export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  instructions: text("instructions"),
  categoryId: integer("category_id").references(() => categories.id),
  thumbnailUrl: text("thumbnail_url"),
  gameDir: text("game_dir").notNull(),
  entryFile: text("entry_file").default("index.html").notNull(),
  developer: text("developer"),
  status: gameStatusEnum("status").default("draft").notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  playCount: integer("play_count").default(0).notNull(),
  rating: integer("rating").default(0),
  ratingCount: integer("rating_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Favorites Table
export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  gameId: integer("game_id").notNull().references(() => games.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Recently Played Table
export const recentlyPlayed = pgTable("recently_played", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  gameId: integer("game_id").notNull().references(() => games.id, { onDelete: "cascade" }),
  playedAt: timestamp("played_at").defaultNow().notNull(),
});

// Challenge Status Enum
export const challengeStatusEnum = pgEnum("challenge_status", ["upcoming", "active", "completed"]);

// Challenges Table - for weekly game competitions
export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  gameId: integer("game_id").references(() => games.id, { onDelete: "set null" }),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  status: challengeStatusEnum("status").default("upcoming").notNull(),
  rules: text("rules"),
  prizes: jsonb("prizes"),
  maxScore: integer("max_score").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Challenge Participants Table
export const challengeParticipants = pgTable("challenge_participants", {
  id: serial("id").primaryKey(),
  challengeId: integer("challenge_id").notNull().references(() => challenges.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

// Challenge Submissions Table
export const challengeSubmissions = pgTable("challenge_submissions", {
  id: serial("id").primaryKey(),
  challengeId: integer("challenge_id").notNull().references(() => challenges.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  score: integer("score").notNull(),
  screenshot: text("screenshot"),
  comment: text("comment"),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
});

// Game Analytics Table for storing detailed play statistics
export const gameAnalytics = pgTable("game_analytics", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").notNull().references(() => games.id, { onDelete: "cascade" }),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  sessionId: text("session_id").notNull(),
  deviceType: text("device_type"), // desktop, mobile, tablet
  browser: text("browser"),
  os: text("os"),
  playDuration: integer("play_duration"), // in seconds
  level: integer("level"), // game level if applicable
  score: integer("score"), // game score if applicable
  completed: boolean("completed").default(false), // if player completed the game
  actions: jsonb("actions"), // store custom game actions as JSON
  playDate: date("play_date").defaultNow().notNull(),
  playTime: time("play_time").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Traffic Source Table
export const trafficSources = pgTable("traffic_sources", {
  id: serial("id").primaryKey(),
  source: text("source").notNull(), // direct, search, social, referral, etc.
  referrer: text("referrer"), // referring website if any
  gameId: integer("game_id").references(() => games.id, { onDelete: "set null" }),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  sessionId: text("session_id").notNull(),
  visitDate: date("visit_date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Define relations after all tables are defined
// User relations
export const usersRelations = relations(users, ({ many }) => ({
  favorites: many(favorites),
  recentlyPlayed: many(recentlyPlayed),
  challengeParticipants: many(challengeParticipants),
  challengeSubmissions: many(challengeSubmissions),
  gameAnalytics: many(gameAnalytics),
  trafficSources: many(trafficSources),
}));

// Category relations
export const categoriesRelations = relations(categories, ({ many }) => ({
  games: many(games),
}));

// Game relations
export const gamesRelations = relations(games, ({ one, many }) => ({
  category: one(categories, {
    fields: [games.categoryId],
    references: [categories.id],
  }),
  favorites: many(favorites),
  recentlyPlayed: many(recentlyPlayed),
  challenges: many(challenges),
  analytics: many(gameAnalytics),
  trafficSources: many(trafficSources),
}));

// Favorites relations
export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, {
    fields: [favorites.userId],
    references: [users.id],
  }),
  game: one(games, {
    fields: [favorites.gameId],
    references: [games.id],
  }),
}));

// Recently Played relations
export const recentlyPlayedRelations = relations(recentlyPlayed, ({ one }) => ({
  user: one(users, {
    fields: [recentlyPlayed.userId],
    references: [users.id],
  }),
  game: one(games, {
    fields: [recentlyPlayed.gameId],
    references: [games.id],
  }),
}));

// Challenge relations
export const challengesRelations = relations(challenges, ({ one, many }) => ({
  game: one(games, {
    fields: [challenges.gameId],
    references: [games.id],
  }),
  participants: many(challengeParticipants),
  submissions: many(challengeSubmissions),
}));

// Challenge Participants relations
export const challengeParticipantsRelations = relations(challengeParticipants, ({ one }) => ({
  challenge: one(challenges, {
    fields: [challengeParticipants.challengeId],
    references: [challenges.id],
  }),
  user: one(users, {
    fields: [challengeParticipants.userId],
    references: [users.id],
  }),
}));

// Challenge Submissions relations
export const challengeSubmissionsRelations = relations(challengeSubmissions, ({ one }) => ({
  challenge: one(challenges, {
    fields: [challengeSubmissions.challengeId],
    references: [challenges.id],
  }),
  user: one(users, {
    fields: [challengeSubmissions.userId],
    references: [users.id],
  }),
}));

// Game Analytics relations
export const gameAnalyticsRelations = relations(gameAnalytics, ({ one }) => ({
  game: one(games, {
    fields: [gameAnalytics.gameId],
    references: [games.id],
  }),
  user: one(users, {
    fields: [gameAnalytics.userId],
    references: [users.id],
  }),
}));

// Traffic Sources relations
export const trafficSourcesRelations = relations(trafficSources, ({ one }) => ({
  game: one(games, {
    fields: [trafficSources.gameId],
    references: [games.id],
  }),
  user: one(users, {
    fields: [trafficSources.userId],
    references: [users.id],
  }),
}));

// Schema for inserting users
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// Schema for inserting categories
export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  gameCount: true,
});

// Schema for inserting games
export const insertGameSchema = createInsertSchema(games).omit({
  id: true,
  slug: true,
  playCount: true,
  rating: true,
  ratingCount: true,
  createdAt: true,
  updatedAt: true,
});

// Schema for inserting favorites
export const insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
  createdAt: true,
});

// Schema for inserting recently played
export const insertRecentlyPlayedSchema = createInsertSchema(recentlyPlayed).omit({
  id: true,
  playedAt: true,
});

// Schema for inserting challenges
export const insertChallengeSchema = createInsertSchema(challenges).omit({
  id: true,
  status: true,
  createdAt: true,
});

// Schema for inserting challenge participants
export const insertChallengeParticipantSchema = createInsertSchema(challengeParticipants).omit({
  id: true,
  joinedAt: true,
});

// Schema for inserting challenge submissions
export const insertChallengeSubmissionSchema = createInsertSchema(challengeSubmissions).omit({
  id: true,
  submittedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Game = typeof games.$inferSelect;
export type InsertGame = z.infer<typeof insertGameSchema>;

export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;

export type RecentlyPlayed = typeof recentlyPlayed.$inferSelect;
export type InsertRecentlyPlayed = z.infer<typeof insertRecentlyPlayedSchema>;

export type Challenge = typeof challenges.$inferSelect;
export type InsertChallenge = z.infer<typeof insertChallengeSchema>;

export type ChallengeParticipant = typeof challengeParticipants.$inferSelect;
export type InsertChallengeParticipant = z.infer<typeof insertChallengeParticipantSchema>;

export type ChallengeSubmission = typeof challengeSubmissions.$inferSelect;
export type InsertChallengeSubmission = z.infer<typeof insertChallengeSubmissionSchema>;

// Schema for inserting game analytics
export const insertGameAnalyticsSchema = createInsertSchema(gameAnalytics).omit({
  id: true,
  playDate: true,
  playTime: true,
  createdAt: true,
});

// Schema for inserting traffic sources
export const insertTrafficSourceSchema = createInsertSchema(trafficSources).omit({
  id: true,
  visitDate: true,
  createdAt: true,
});

export type GameAnalytics = typeof gameAnalytics.$inferSelect;
export type InsertGameAnalytics = z.infer<typeof insertGameAnalyticsSchema>;

export type TrafficSource = typeof trafficSources.$inferSelect;
export type InsertTrafficSource = z.infer<typeof insertTrafficSourceSchema>;
