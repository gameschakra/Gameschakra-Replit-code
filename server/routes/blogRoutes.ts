import express, { Request, Response } from "express";
import slugify from "slugify";
import {
  getAllBlogPosts,
  getBlogPostBySlug,
  getRelatedPosts,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  incrementViewCount,
  getAllBlogCategories,
  createBlogCategory,
  deleteBlogCategory,
  getAllBlogTags,
  createBlogTag,
  deleteBlogTag,
  getBlogStats,
} from "../services/blogService";
import { insertBlogPostSchema, insertBlogCategorySchema, insertBlogTagSchema } from "@shared/schema";
import { isAuthenticated, isAdmin } from "../middleware/auth";

export function setupBlogRoutes(router: express.Router) {
  // Public blog routes - accessible to all
  router.get("/blog/posts", async (req: Request, res: Response) => {
    try {
      const { 
        status, 
        category, 
        author, 
        search, 
        page, 
        limit, 
        order 
      } = req.query;

      const filters: any = {};
      
      if (status) filters.status = status as string;
      if (category) filters.categorySlug = category as string;
      if (author) filters.authorId = parseInt(author as string);
      if (search) filters.searchQuery = search as string;
      if (page) filters.page = parseInt(page as string);
      if (limit) filters.limit = parseInt(limit as string);
      if (order) filters.orderBy = order as 'newest' | 'oldest' | 'popular';

      const result = await getAllBlogPosts(filters);
      res.json(result);
    } catch (error) {
      console.error("Error getting blog posts:", error);
      res.status(500).json({ error: "Failed to get blog posts" });
    }
  });

  router.get("/blog/posts/:slug", async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      const post = await getBlogPostBySlug(slug);
      
      if (!post) {
        return res.status(404).json({ error: "Blog post not found" });
      }

      // Increment view count
      await incrementViewCount(slug);
      
      res.json(post);
    } catch (error) {
      console.error("Error getting blog post:", error);
      res.status(500).json({ error: "Failed to get blog post" });
    }
  });

  router.get("/blog/posts/:slug/related", async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      const { limit } = req.query;
      
      const post = await getBlogPostBySlug(slug);
      
      if (!post) {
        return res.status(404).json({ error: "Blog post not found" });
      }
      
      const relatedPosts = await getRelatedPosts(
        post.id, 
        limit ? parseInt(limit as string) : 3
      );
      
      res.json(relatedPosts);
    } catch (error) {
      console.error("Error getting related posts:", error);
      res.status(500).json({ error: "Failed to get related posts" });
    }
  });

  router.get("/blog/categories", async (req: Request, res: Response) => {
    try {
      const categories = await getAllBlogCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error getting blog categories:", error);
      res.status(500).json({ error: "Failed to get blog categories" });
    }
  });

  router.get("/blog/tags", async (req: Request, res: Response) => {
    try {
      const tags = await getAllBlogTags();
      res.json(tags);
    } catch (error) {
      console.error("Error getting blog tags:", error);
      res.status(500).json({ error: "Failed to get blog tags" });
    }
  });

  router.get("/blog/stats", isAdmin, async (req: Request, res: Response) => {
    try {
      const stats = await getBlogStats();
      res.json(stats);
    } catch (error) {
      console.error("Error getting blog stats:", error);
      res.status(500).json({ error: "Failed to get blog stats" });
    }
  });

  // Admin blog routes - restricted access
  router.post("/blog/posts", isAdmin, async (req: Request, res: Response) => {
    try {
      console.log("Blog post request body:", req.body);
      
      // Create a validated data object with values from FormData or JSON
      const formData: any = {
        title: req.body.title,
        // If slug is not provided, it will be generated from title later
        slug: req.body.slug || undefined,
        excerpt: req.body.excerpt || '',
        content: req.body.content,
        // Default to draft if status is not provided
        status: req.body.status || 'draft',
        tags: req.body.tags ? (Array.isArray(req.body.tags) ? req.body.tags : [req.body.tags]) : undefined,
        featuredImage: req.body.featuredImage || req.body.image || '',
        metaDescription: req.body.seoDescription || req.body.metaDescription || '',
        // Make sure authorId is set properly from authenticated user
        authorId: req.user ? (req.user as { id: number }).id : undefined
      };
      
      // Handle categoryIds
      formData.categoryIds = [];
      
      // Support different ways the category might be specified
      if (req.body.categoryIds) {
        // If categoryIds is provided directly
        if (typeof req.body.categoryIds === 'string') {
          try {
            formData.categoryIds = JSON.parse(req.body.categoryIds);
          } catch (e) {
            console.error("Error parsing categoryIds:", e);
          }
        } else if (Array.isArray(req.body.categoryIds)) {
          formData.categoryIds = req.body.categoryIds;
        }
      } else if (req.body.category) {
        // Handle if a single category is provided instead
        if (typeof req.body.category === 'number') {
          formData.categoryIds = [req.body.category];
        } else if (typeof req.body.category === 'string' && !isNaN(parseInt(req.body.category))) {
          formData.categoryIds = [parseInt(req.body.category)];
        }
      }
      
      console.log("Processed form data:", formData);
      
      // Validate title and content are present
      if (!formData.title || !formData.content) {
        throw new Error("Title and content are required fields");
      }

      // Set default title if not provided
      if (!formData.title) {
        formData.title = "Untitled Post";
      }

      // Generate slug if not provided
      if (!formData.slug) {
        formData.slug = slugify(formData.title, { lower: true });
      }
      
      // Validate form data against schema
      const validatedData = insertBlogPostSchema.parse(formData);
      
      // Set publishedAt date if status is published
      if (validatedData.status === "published" && !validatedData.publishedAt) {
        validatedData.publishedAt = new Date();
      }
      
      console.log("Final validated data:", validatedData);
      const post = await createBlogPost(validatedData);
      res.status(201).json(post);
    } catch (error: any) {
      console.error("Error creating blog post:", error);
      
      // More detailed error logging
      if (error instanceof Error) {
        console.error("Error details:", error.message);
        if ('issues' in error) {
          console.error("Validation issues:", error.issues);
        }
      }
      
      res.status(400).json({ 
        error: "Failed to create blog post", 
        details: error instanceof Error ? error.message : 'Unknown error',
        issues: error instanceof Error && 'issues' in error ? error.issues : undefined
      });
    }
  });

  router.put("/blog/posts/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      console.log("Blog post update request body:", req.body);
      
      // Create a validated data object with values from FormData or JSON
      const formData: any = {
        title: req.body.title,
        // If slug is not provided, it will be generated from title later
        slug: req.body.slug || undefined,
        excerpt: req.body.excerpt || '',
        content: req.body.content,
        // Default to draft if status is not provided
        status: req.body.status || 'draft',
        tags: req.body.tags ? (Array.isArray(req.body.tags) ? req.body.tags : [req.body.tags]) : undefined,
        featuredImage: req.body.featuredImage || req.body.image || '',
        metaDescription: req.body.seoDescription || req.body.metaDescription || '',
        // Make sure authorId is set properly from authenticated user
        authorId: req.user ? (req.user as { id: number }).id : undefined
      };
      
      // Handle categoryIds
      formData.categoryIds = [];
      
      // Support different ways the category might be specified
      if (req.body.categoryIds) {
        // If categoryIds is provided directly
        if (typeof req.body.categoryIds === 'string') {
          try {
            formData.categoryIds = JSON.parse(req.body.categoryIds);
          } catch (e) {
            console.error("Error parsing categoryIds:", e);
          }
        } else if (Array.isArray(req.body.categoryIds)) {
          formData.categoryIds = req.body.categoryIds;
        }
      } else if (req.body.category) {
        // Handle if a single category is provided instead
        if (typeof req.body.category === 'number') {
          formData.categoryIds = [req.body.category];
        } else if (typeof req.body.category === 'string' && !isNaN(parseInt(req.body.category))) {
          formData.categoryIds = [parseInt(req.body.category)];
        }
      }
      
      // Validate title and content are present
      if (!formData.title || !formData.content) {
        throw new Error("Title and content are required fields");
      }
      
      console.log("Processed update form data:", formData);
      
      const validatedData = insertBlogPostSchema.parse(formData);
      
      // Generate slug if not provided
      if (!validatedData.slug) {
        validatedData.slug = slugify(validatedData.title, { lower: true });
      }
      
      // Set publishedAt date if status is published and publishedAt is not set
      if (validatedData.status === "published" && !validatedData.publishedAt) {
        validatedData.publishedAt = new Date();
      }
      
      const post = await updateBlogPost(parseInt(id), validatedData);
      
      if (!post) {
        return res.status(404).json({ error: "Blog post not found" });
      }
      
      res.json(post);
    } catch (error: any) {
      console.error("Error updating blog post:", error);
      
      // More detailed error logging
      if (error instanceof Error) {
        console.error("Error details:", error.message);
        if ('issues' in error) {
          console.error("Validation issues:", error.issues);
        }
      }
      
      res.status(400).json({ 
        error: "Failed to update blog post",
        details: error instanceof Error ? error.message : 'Unknown error',
        issues: error instanceof Error && 'issues' in error ? error.issues : undefined
      });
    }
  });

  router.delete("/blog/posts/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const success = await deleteBlogPost(parseInt(id));
      
      if (!success) {
        return res.status(404).json({ error: "Blog post not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting blog post:", error);
      res.status(500).json({ error: "Failed to delete blog post" });
    }
  });

  router.post("/blog/categories", isAdmin, async (req: Request, res: Response) => {
    try {
      const validatedData = insertBlogCategorySchema.parse(req.body);
      
      // Generate slug if not provided
      if (!validatedData.slug) {
        validatedData.slug = slugify(validatedData.name, { lower: true });
      }
      
      const category = await createBlogCategory(validatedData);
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating blog category:", error);
      res.status(400).json({ error: "Failed to create blog category" });
    }
  });

  router.delete("/blog/categories/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const success = await deleteBlogCategory(parseInt(id));
      
      if (!success) {
        return res.status(404).json({ error: "Blog category not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting blog category:", error);
      res.status(500).json({ error: "Failed to delete blog category" });
    }
  });

  router.post("/blog/tags", isAdmin, async (req: Request, res: Response) => {
    try {
      const validatedData = insertBlogTagSchema.parse(req.body);
      
      // Generate slug if not provided
      if (!validatedData.slug) {
        validatedData.slug = slugify(validatedData.name, { lower: true });
      }
      
      const tag = await createBlogTag(validatedData);
      res.status(201).json(tag);
    } catch (error) {
      console.error("Error creating blog tag:", error);
      res.status(400).json({ error: "Failed to create blog tag" });
    }
  });

  router.delete("/blog/tags/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const success = await deleteBlogTag(parseInt(id));
      
      if (!success) {
        return res.status(404).json({ error: "Blog tag not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting blog tag:", error);
      res.status(500).json({ error: "Failed to delete blog tag" });
    }
  });
}