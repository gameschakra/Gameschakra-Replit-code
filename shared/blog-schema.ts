import { relations, sql } from 'drizzle-orm';
import { text, integer, serial, timestamp, pgTable } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { users } from './schema';

// Blog Posts Table
export const blogPosts = pgTable('blog_posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  excerpt: text('excerpt'),
  content: text('content').notNull(),
  metaDescription: text('meta_description'),
  featuredImage: text('featured_image'),
  authorId: integer('author_id').notNull().references(() => users.id),
  status: text('status', { enum: ['draft', 'published'] }).notNull().default('draft'),
  publishedAt: timestamp('published_at', { mode: 'date' }),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
  tags: text('tags').array(),
  viewCount: integer('view_count').notNull().default(0),
});

// Blog Categories Table
export const blogCategories = pgTable('blog_categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
});

// Blog Tags Table
export const blogTags = pgTable('blog_tags', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
});

// Join Table for Blog Posts to Categories (Many-to-Many)
export const blogPostsToCategories = pgTable('blog_posts_to_categories', {
  id: serial('id').primaryKey(),
  postId: integer('post_id').notNull().references(() => blogPosts.id, { onDelete: 'cascade' }),
  categoryId: integer('category_id').notNull().references(() => blogCategories.id, { onDelete: 'cascade' }),
});

// Join Table for Blog Posts to Tags (Many-to-Many)
export const blogPostsToTags = pgTable('blog_posts_to_tags', {
  id: serial('id').primaryKey(),
  postId: integer('post_id').notNull().references(() => blogPosts.id, { onDelete: 'cascade' }),
  tagId: integer('tag_id').notNull().references(() => blogTags.id, { onDelete: 'cascade' }),
});

// Relations
export const blogPostsRelations = relations(blogPosts, ({ one, many }) => ({
  author: one(users, {
    fields: [blogPosts.authorId],
    references: [users.id],
  }),
  categories: many(blogPostsToCategories),
  tags: many(blogPostsToTags),
}));

export const blogCategoriesRelations = relations(blogCategories, ({ many }) => ({
  posts: many(blogPostsToCategories),
}));

export const blogTagsRelations = relations(blogTags, ({ many }) => ({
  posts: many(blogPostsToTags),
}));

export const blogPostsToCategoriesRelations = relations(blogPostsToCategories, ({ one }) => ({
  post: one(blogPosts, {
    fields: [blogPostsToCategories.postId],
    references: [blogPosts.id],
  }),
  category: one(blogCategories, {
    fields: [blogPostsToCategories.categoryId],
    references: [blogCategories.id],
  }),
}));

export const blogPostsToTagsRelations = relations(blogPostsToTags, ({ one }) => ({
  post: one(blogPosts, {
    fields: [blogPostsToTags.postId],
    references: [blogPosts.id],
  }),
  tag: one(blogTags, {
    fields: [blogPostsToTags.tagId],
    references: [blogTags.id],
  }),
}));

// Schemas
export const insertBlogPostSchema = createInsertSchema(blogPosts, {
  content: z.string().min(10, "Content must be at least 10 characters"),
  title: z.string().min(3, "Title must be at least 3 characters").max(200, "Title must be less than 200 characters"),
  excerpt: z.string().optional(),
}).omit({ id: true, createdAt: true, updatedAt: true, viewCount: true });

export const insertBlogCategorySchema = createInsertSchema(blogCategories, {
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be less than 50 characters"),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const insertBlogTagSchema = createInsertSchema(blogTags, {
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be less than 50 characters"),
}).omit({ id: true, createdAt: true, updatedAt: true });

// Types
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type InsertBlogCategory = z.infer<typeof insertBlogCategorySchema>;
export type InsertBlogTag = z.infer<typeof insertBlogTagSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;
export type BlogCategory = typeof blogCategories.$inferSelect;
export type BlogTag = typeof blogTags.$inferSelect;