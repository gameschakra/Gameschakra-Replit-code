import { eq, sql, asc, desc, ilike, or, and, inArray } from "drizzle-orm";
import { db } from "../db";
import { 
  blogPosts, 
  blogCategories, 
  blogTags, 
  blogPostsToCategories, 
  blogPostsToTags,
  users 
} from "@shared/schema";

export type BlogPostFilters = {
  status?: 'draft' | 'published';
  categorySlug?: string;
  authorId?: number;
  searchQuery?: string;
  page?: number;
  limit?: number;
  orderBy?: 'newest' | 'oldest' | 'popular';
};

// Function to get all blog posts with filtering, pagination, and ordering
export async function getAllBlogPosts(filters: BlogPostFilters = {}) {
  try {
    const {
      status,
      categorySlug,
      authorId,
      searchQuery,
      page = 1,
      limit = 20,
      orderBy = 'newest',
    } = filters;

    // Start building the query
    let query = db
      .select({
        blogPosts,
        author: {
          id: users.id,
          username: users.username,
          email: users.email,
          avatarUrl: users.avatarUrl,
        },
      })
      .from(blogPosts)
      .leftJoin(users, eq(blogPosts.authorId, users.id));

    // Apply filters
    const conditions = [];

    if (status) {
      conditions.push(eq(blogPosts.status, status));
    }

    if (authorId) {
      conditions.push(eq(blogPosts.authorId, authorId));
    }

    if (searchQuery) {
      conditions.push(
        or(
          ilike(blogPosts.title, `%${searchQuery}%`),
          ilike(blogPosts.content, `%${searchQuery}%`),
          ilike(blogPosts.metaDescription, `%${searchQuery}%`)
        )
      );
    }

    // Apply category filter if provided
    if (categorySlug) {
      // First, get the category ID from the slug
      const [category] = await db
        .select()
        .from(blogCategories)
        .where(eq(blogCategories.slug, categorySlug));

      if (category) {
        // Then filter by posts related to this category
        const postsInCategory = await db
          .select({ postId: blogPostsToCategories.postId })
          .from(blogPostsToCategories)
          .where(eq(blogPostsToCategories.categoryId, category.id));

        if (postsInCategory.length > 0) {
          const postIds = postsInCategory.map((p) => p.postId);
          conditions.push(inArray(blogPosts.id, postIds));
        } else {
          // If no posts in this category, return empty result
          return { posts: [], total: 0, totalPages: 0 };
        }
      } else {
        // If category doesn't exist, return empty result
        return { posts: [], total: 0, totalPages: 0 };
      }
    }

    // Combine all conditions with AND
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply ordering
    if (orderBy === 'newest') {
      query = query.orderBy(desc(blogPosts.publishedAt), desc(blogPosts.createdAt));
    } else if (orderBy === 'oldest') {
      query = query.orderBy(asc(blogPosts.publishedAt), asc(blogPosts.createdAt));
    } else if (orderBy === 'popular') {
      query = query.orderBy(desc(blogPosts.viewCount));
    }

    // Count total posts for pagination
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(blogPosts)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    // Apply pagination
    const totalPages = Math.ceil(count / limit);
    const offset = (page - 1) * limit;
    query = query.limit(limit).offset(offset);

    // Execute the query
    const result = await query;

    // Map result to BlogPost type including author
    const posts = await Promise.all(
      result.map(async (row) => {
        // Get categories for this post
        const categoriesResult = await db
          .select({
            category: blogCategories,
          })
          .from(blogPostsToCategories)
          .leftJoin(
            blogCategories,
            eq(blogPostsToCategories.categoryId, blogCategories.id)
          )
          .where(eq(blogPostsToCategories.postId, row.blogPosts.id));

        const categories = categoriesResult.map((c) => c.category);

        // Get tags for this post
        const tagsResult = await db
          .select({
            tag: blogTags,
          })
          .from(blogPostsToTags)
          .leftJoin(blogTags, eq(blogPostsToTags.tagId, blogTags.id))
          .where(eq(blogPostsToTags.postId, row.blogPosts.id));

        const tags = tagsResult.map((t) => t.tag?.name || '').filter(Boolean);

        // Calculate reading time (rough estimate: 200 words per minute)
        const wordCount = row.blogPosts.content.split(/\s+/).length;
        const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));
        const readingTime = `${readingTimeMinutes} min read`;

        return {
          ...row.blogPosts,
          author: row.author,
          categories,
          tags,
          readingTime,
        };
      })
    );

    return {
      posts,
      total: count,
      totalPages,
    };
  } catch (error) {
    console.error("Error getting blog posts:", error);
    throw error;
  }
}

// Function to get a blog post by slug
export async function getBlogPostBySlug(slug: string) {
  try {
    const [post] = await db
      .select({
        blogPosts,
        author: {
          id: users.id,
          username: users.username,
          email: users.email,
          avatarUrl: users.avatarUrl,
        },
      })
      .from(blogPosts)
      .leftJoin(users, eq(blogPosts.authorId, users.id))
      .where(eq(blogPosts.slug, slug));

    if (!post) return null;

    // Get categories for this post
    const categoriesResult = await db
      .select({
        category: blogCategories,
      })
      .from(blogPostsToCategories)
      .leftJoin(
        blogCategories,
        eq(blogPostsToCategories.categoryId, blogCategories.id)
      )
      .where(eq(blogPostsToCategories.postId, post.blogPosts.id));

    const categories = categoriesResult.map((c) => c.category);

    // Get tags for this post
    const tagsResult = await db
      .select({
        tag: blogTags,
      })
      .from(blogPostsToTags)
      .leftJoin(blogTags, eq(blogPostsToTags.tagId, blogTags.id))
      .where(eq(blogPostsToTags.postId, post.blogPosts.id));

    const tags = tagsResult.map((t) => t.tag?.name || '').filter(Boolean);

    // Calculate reading time (rough estimate: 200 words per minute)
    const wordCount = post.blogPosts.content.split(/\s+/).length;
    const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));
    const readingTime = `${readingTimeMinutes} min read`;

    return {
      ...post.blogPosts,
      author: post.author,
      categories,
      tags,
      readingTime,
    };
  } catch (error) {
    console.error("Error getting blog post by slug:", error);
    throw error;
  }
}

// Function to get related posts
export async function getRelatedPosts(postId: number, limit: number = 3) {
  try {
    // Get categories of the current post
    const categoriesResult = await db
      .select({
        categoryId: blogPostsToCategories.categoryId,
      })
      .from(blogPostsToCategories)
      .where(eq(blogPostsToCategories.postId, postId));

    const categoryIds = categoriesResult.map((c) => c.categoryId);

    if (categoryIds.length === 0) {
      // If no categories, get the most recent posts
      return getRecentPosts(postId, limit);
    }

    // Get posts in the same categories
    const relatedPostIds = await db
      .select({
        postId: blogPostsToCategories.postId,
      })
      .from(blogPostsToCategories)
      .where(
        and(
          inArray(blogPostsToCategories.categoryId, categoryIds),
          sql`${blogPostsToCategories.postId} != ${postId}`
        )
      )
      .groupBy(blogPostsToCategories.postId);

    if (relatedPostIds.length === 0) {
      // If no related posts, get the most recent posts
      return getRecentPosts(postId, limit);
    }

    const postIds = relatedPostIds.map((p) => p.postId);

    // Get the actual posts
    const posts = await db
      .select({
        blogPosts,
        author: {
          id: users.id,
          username: users.username,
          email: users.email,
          avatarUrl: users.avatarUrl,
        },
      })
      .from(blogPosts)
      .leftJoin(users, eq(blogPosts.authorId, users.id))
      .where(
        and(
          inArray(blogPosts.id, postIds),
          eq(blogPosts.status, "published")
        )
      )
      .orderBy(desc(blogPosts.publishedAt))
      .limit(limit);

    return Promise.all(
      posts.map(async (post) => {
        // Get categories for this post
        const categoriesResult = await db
          .select({
            category: blogCategories,
          })
          .from(blogPostsToCategories)
          .leftJoin(
            blogCategories,
            eq(blogPostsToCategories.categoryId, blogCategories.id)
          )
          .where(eq(blogPostsToCategories.postId, post.blogPosts.id));

        const categories = categoriesResult.map((c) => c.category);

        return {
          ...post.blogPosts,
          author: post.author,
          categories,
        };
      })
    );
  } catch (error) {
    console.error("Error getting related posts:", error);
    throw error;
  }
}

// Helper function to get recent posts
async function getRecentPosts(excludePostId: number, limit: number) {
  const posts = await db
    .select({
      blogPosts,
      author: {
        id: users.id,
        username: users.username,
        email: users.email,
        avatarUrl: users.avatarUrl,
      },
    })
    .from(blogPosts)
    .leftJoin(users, eq(blogPosts.authorId, users.id))
    .where(
      and(
        sql`${blogPosts.id} != ${excludePostId}`,
        eq(blogPosts.status, "published")
      )
    )
    .orderBy(desc(blogPosts.publishedAt))
    .limit(limit);

  return Promise.all(
    posts.map(async (post) => {
      // Get categories for this post
      const categoriesResult = await db
        .select({
          category: blogCategories,
        })
        .from(blogPostsToCategories)
        .leftJoin(
          blogCategories,
          eq(blogPostsToCategories.categoryId, blogCategories.id)
        )
        .where(eq(blogPostsToCategories.postId, post.blogPosts.id));

      const categories = categoriesResult.map((c) => c.category);

      return {
        ...post.blogPosts,
        author: post.author,
        categories,
      };
    })
  );
}

// Function to increment view count
export async function incrementViewCount(slug: string) {
  try {
    await db
      .update(blogPosts)
      .set({
        viewCount: sql`${blogPosts.viewCount} + 1`,
      })
      .where(eq(blogPosts.slug, slug));
    return true;
  } catch (error) {
    console.error("Error incrementing view count:", error);
    throw error;
  }
}

// Function to create a new blog post
export async function createBlogPost(data: any) {
  try {
    const { categoryIds, ...postData } = data;

    // Create the blog post
    const [post] = await db.insert(blogPosts).values(postData).returning();

    // Associate categories if provided
    if (categoryIds && categoryIds.length > 0) {
      const categoriesToInsert = categoryIds.map((categoryId: number) => ({
        postId: post.id,
        categoryId,
      }));

      await db.insert(blogPostsToCategories).values(categoriesToInsert);
    }

    // Return the created post with categories
    return getBlogPostBySlug(post.slug);
  } catch (error) {
    console.error("Error creating blog post:", error);
    throw error;
  }
}

// Function to update a blog post
export async function updateBlogPost(id: number, data: any) {
  try {
    const { categoryIds, ...postData } = data;

    // Update the blog post
    const [post] = await db
      .update(blogPosts)
      .set(postData)
      .where(eq(blogPosts.id, id))
      .returning();

    if (!post) return null;

    // Update categories if provided
    if (categoryIds) {
      // Remove existing category associations
      await db
        .delete(blogPostsToCategories)
        .where(eq(blogPostsToCategories.postId, id));

      // Add new category associations
      if (categoryIds.length > 0) {
        const categoriesToInsert = categoryIds.map((categoryId: number) => ({
          postId: id,
          categoryId,
        }));

        await db.insert(blogPostsToCategories).values(categoriesToInsert);
      }
    }

    // Return the updated post with categories
    return getBlogPostBySlug(post.slug);
  } catch (error) {
    console.error("Error updating blog post:", error);
    throw error;
  }
}

// Function to delete a blog post
export async function deleteBlogPost(id: number) {
  try {
    // Check if post exists
    const [post] = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.id, id));

    if (!post) return false;

    // Delete category associations
    await db
      .delete(blogPostsToCategories)
      .where(eq(blogPostsToCategories.postId, id));

    // Delete tag associations
    await db
      .delete(blogPostsToTags)
      .where(eq(blogPostsToTags.postId, id));

    // Delete the blog post
    await db.delete(blogPosts).where(eq(blogPosts.id, id));

    return true;
  } catch (error) {
    console.error("Error deleting blog post:", error);
    throw error;
  }
}

// Function to get all blog categories
export async function getAllBlogCategories() {
  try {
    const categories = await db.select().from(blogCategories);

    // For each category, count the number of posts
    const result = await Promise.all(
      categories.map(async (category) => {
        const postCount = await db
          .select({ count: sql<number>`count(*)` })
          .from(blogPostsToCategories)
          .where(eq(blogPostsToCategories.categoryId, category.id));

        return {
          ...category,
          postCount: postCount[0].count,
        };
      })
    );

    // Sort by post count (descending)
    return result.sort((a, b) => b.postCount - a.postCount);
  } catch (error) {
    console.error("Error getting blog categories:", error);
    throw error;
  }
}

// Function to create a new blog category
export async function createBlogCategory(data: any) {
  try {
    // If slug is not provided, generate it from the name
    if (!data.slug && data.name) {
      data.slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    }

    const [category] = await db.insert(blogCategories).values(data).returning();
    return category;
  } catch (error) {
    console.error("Error creating blog category:", error);
    throw error;
  }
}

// Function to delete a blog category
export async function deleteBlogCategory(id: number) {
  try {
    // Check if category exists
    const [category] = await db
      .select()
      .from(blogCategories)
      .where(eq(blogCategories.id, id));

    if (!category) return false;

    // Delete category associations
    await db
      .delete(blogPostsToCategories)
      .where(eq(blogPostsToCategories.categoryId, id));

    // Delete the category
    await db.delete(blogCategories).where(eq(blogCategories.id, id));

    return true;
  } catch (error) {
    console.error("Error deleting blog category:", error);
    throw error;
  }
}

// Function to get all blog tags
export async function getAllBlogTags() {
  try {
    const tags = await db.select().from(blogTags);

    // For each tag, count the number of posts
    const result = await Promise.all(
      tags.map(async (tag) => {
        const postCount = await db
          .select({ count: sql<number>`count(*)` })
          .from(blogPostsToTags)
          .where(eq(blogPostsToTags.tagId, tag.id));

        return {
          ...tag,
          postCount: postCount[0].count,
        };
      })
    );

    // Sort by post count (descending)
    return result.sort((a, b) => b.postCount - a.postCount);
  } catch (error) {
    console.error("Error getting blog tags:", error);
    throw error;
  }
}

// Function to create a new blog tag
export async function createBlogTag(data: any) {
  try {
    // If slug is not provided, generate it from the name
    if (!data.slug && data.name) {
      data.slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    }

    const [tag] = await db.insert(blogTags).values(data).returning();
    return tag;
  } catch (error) {
    console.error("Error creating blog tag:", error);
    throw error;
  }
}

// Function to delete a blog tag
export async function deleteBlogTag(id: number) {
  try {
    // Check if tag exists
    const [tag] = await db
      .select()
      .from(blogTags)
      .where(eq(blogTags.id, id));

    if (!tag) return false;

    // Delete tag associations
    await db
      .delete(blogPostsToTags)
      .where(eq(blogPostsToTags.tagId, id));

    // Delete the tag
    await db.delete(blogTags).where(eq(blogTags.id, id));

    return true;
  } catch (error) {
    console.error("Error deleting blog tag:", error);
    throw error;
  }
}

// Function to get blog stats
export async function getBlogStats() {
  try {
    // Count total posts
    const [postCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(blogPosts);

    // Count published posts
    const [publishedCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(blogPosts)
      .where(eq(blogPosts.status, "published"));

    // Count draft posts
    const [draftCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(blogPosts)
      .where(eq(blogPosts.status, "draft"));

    // Count categories
    const [categoryCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(blogCategories);

    // Count tags
    const [tagCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(blogTags);

    // Get total views
    const [viewsResult] = await db
      .select({ sum: sql<number>`sum(${blogPosts.viewCount})` })
      .from(blogPosts);

    // Get most viewed post
    const [mostViewedPost] = await db
      .select({
        id: blogPosts.id,
        title: blogPosts.title,
        slug: blogPosts.slug,
        viewCount: blogPosts.viewCount,
      })
      .from(blogPosts)
      .orderBy(desc(blogPosts.viewCount))
      .limit(1);

    return {
      totalPosts: postCount.count,
      publishedPosts: publishedCount.count,
      draftPosts: draftCount.count,
      categories: categoryCount.count,
      tags: tagCount.count,
      totalViews: viewsResult.sum || 0,
      mostViewedPost: mostViewedPost || null,
    };
  } catch (error) {
    console.error("Error getting blog stats:", error);
    throw error;
  }
}