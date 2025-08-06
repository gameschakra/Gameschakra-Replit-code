import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Helmet } from "react-helmet";
import { Loader2, ArrowLeft, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Custom Components
import { CreateCategoryForm } from "@/components/blog/CreateCategoryForm";

// UI Components
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

// Tiptap editor
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import PageLayout from "@/components/layout/PageLayout";

// Form validation schema
const blogPostSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters").regex(/^[a-z0-9-]+$/, {
    message: "Slug can only contain lowercase letters, numbers and hyphens",
  }),
  excerpt: z.string().min(10, "Excerpt must be at least 10 characters"),
  content: z.string().min(50, "Content must be at least 50 characters"),
  status: z.enum(["draft", "published"]),
  featuredImage: z.string().optional(),
  categoryIds: z.array(z.number()).min(1, "Select at least one category"),
  tags: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.string().optional(),
});

type BlogPostFormValues = z.infer<typeof blogPostSchema>;

export default function BlogCreate() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [featuredImagePreview, setFeaturedImagePreview] = useState<string | null>(null);
  const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);

  // Get categories for dropdown
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['/api/blog/categories'],
    queryFn: async () => {
      const res = await fetch('/api/blog/categories');
      if (!res.ok) throw new Error('Failed to fetch categories');
      return res.json();
    },
  });

  // Form setup
  const form = useForm<BlogPostFormValues>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      status: "draft",
      featuredImage: "",
      categoryIds: [],
      tags: "",
      seoTitle: "",
      seoDescription: "",
      seoKeywords: "",
    },
  });

  // Set up TipTap editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: "<p>Write your blog post content here...</p>",
    onUpdate: ({ editor }) => {
      form.setValue('content', editor.getHTML(), { shouldValidate: true });
    },
  });

  // Handle title change to generate slug
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    form.setValue('title', title);
    
    // Generate slug from title if slug field hasn't been manually edited
    if (!form.getValues('slug')) {
      const slug = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      
      form.setValue('slug', slug, { shouldValidate: true });
    }
  };

  // Handle featured image change
  const handleFeaturedImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFeaturedImageFile(file);
      const imageUrl = URL.createObjectURL(file);
      setFeaturedImagePreview(imageUrl);
    }
  };

  // Create blog post mutation
  const createPostMutation = useMutation<any, Error, Record<string, any>>({
    mutationFn: async (data: Record<string, any>) => {
      const response = await fetch('/api/blog/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include', // Include cookies for authentication
        mode: 'cors',          // Allow cross-origin requests with credentials
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error Response:", errorData);
        throw new Error(errorData.details || errorData.error || 'Failed to create blog post');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Success',
        description: 'Blog post created successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/blog/posts'] });
      navigate('/admin/blog');
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Handle form submission
  const onSubmit = async (values: BlogPostFormValues) => {
    // Log form values to help with debugging
    console.log("Submitting form with values:", values);
    
    // Validate required fields explicitly
    if (!values.title) {
      toast({
        title: "Validation Error",
        description: "Title is required",
        variant: "destructive",
      });
      return;
    }
    
    if (!values.content) {
      toast({
        title: "Validation Error", 
        description: "Content is required",
        variant: "destructive",
      });
      return;
    }
    
    // Try using a JSON approach instead of FormData
    // since we're having issues with FormData processing
    const postData = {
      title: values.title,
      slug: values.slug,
      excerpt: values.excerpt,
      content: values.content,
      status: values.status,
      categoryIds: values.categoryIds,
      // Also send category for backward compatibility if we have categoryIds
      category: values.categoryIds.length > 0 ? values.categoryIds[0] : undefined,
      tags: values.tags,
      seoTitle: values.seoTitle,
      seoDescription: values.seoDescription,
      seoKeywords: values.seoKeywords,
      // For now we'll skip featuredImage until we fix the multipart handling
      // featuredImage will need to be handled separately
    };
    
    // Log the data we're sending
    console.log("Sending blog post data:", postData);
    
    // Use JSON approach for now until we fix the FormData issue
    createPostMutation.mutate(postData);
  };

  // Return to admin dashboard
  const handleCancel = () => {
    navigate('/admin/blog');
  };

  return (
    <PageLayout>
      <Helmet>
        <title>Create Blog Post | Admin Dashboard | GamesChakra</title>
        <meta name="description" content="Create a new blog post for GamesChakra" />
      </Helmet>

      <div className="container py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Create New Blog Post</h1>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="media">Media</TabsTrigger>
                <TabsTrigger value="categories">Categories & Tags</TabsTrigger>
                <TabsTrigger value="seo">SEO</TabsTrigger>
              </TabsList>
              
              {/* Content Tab */}
              <TabsContent value="content" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Post Content</CardTitle>
                    <CardDescription>
                      Write your blog post content here.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Post Title</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter post title"
                              {...field}
                              onChange={handleTitleChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="slug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Post Slug (URL)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="enter-post-slug"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="excerpt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Post Excerpt</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Write a brief excerpt of your post (appears in blog listings)"
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Post Content</FormLabel>
                          <FormControl>
                            <div className="border rounded-md min-h-[400px] p-3">
                              <EditorContent editor={editor} className="min-h-[380px]" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Post Status</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select post status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="draft">Draft</SelectItem>
                              <SelectItem value="published">Published</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Media Tab */}
              <TabsContent value="media" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Featured Image</CardTitle>
                    <CardDescription>
                      Upload a featured image for your blog post. This image will be displayed in the blog listing and at the top of your post.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                      <Input
                        id="featuredImage"
                        type="file"
                        accept="image/*"
                        onChange={handleFeaturedImageChange}
                      />
                    </div>
                    
                    {featuredImagePreview && (
                      <div className="mt-4">
                        <p className="text-sm mb-2">Preview:</p>
                        <div className="border rounded-md overflow-hidden">
                          <img 
                            src={featuredImagePreview} 
                            alt="Featured image preview" 
                            className="max-w-full max-h-64 object-contain" 
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Categories and Tags Tab */}
              <TabsContent value="categories" className="space-y-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div>
                      <CardTitle>Categories & Tags</CardTitle>
                      <CardDescription>
                        Assign categories and tags to make your post more discoverable.
                      </CardDescription>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          New Category
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create New Category</DialogTitle>
                          <DialogDescription>
                            Add a new category to organize your blog posts.
                          </DialogDescription>
                        </DialogHeader>
                        <CreateCategoryForm onSuccess={() => {
                          // Refresh categories
                          queryClient.invalidateQueries({ queryKey: ['/api/blog/categories'] });
                        }} />
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="categoryIds"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categories</FormLabel>
                          <div className="space-y-2">
                            {categoriesLoading ? (
                              <div className="flex items-center">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                <span>Loading categories...</span>
                              </div>
                            ) : categories?.length > 0 ? (
                              <div className="grid grid-cols-2 gap-2">
                                {categories.map((category: any) => (
                                  <div key={category.id} className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      id={`category-${category.id}`}
                                      value={category.id}
                                      checked={field.value.includes(category.id)}
                                      onChange={(e) => {
                                        const checked = e.target.checked;
                                        const categoryId = Number(e.target.value);
                                        
                                        let newCategories = [...field.value];
                                        if (checked) {
                                          newCategories.push(categoryId);
                                        } else {
                                          newCategories = newCategories.filter(id => id !== categoryId);
                                        }
                                        
                                        field.onChange(newCategories);
                                      }}
                                      className="rounded border-gray-600 bg-transparent text-primary"
                                    />
                                    <label htmlFor={`category-${category.id}`}>
                                      {category.name}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div>
                                <p className="text-sm text-muted-foreground mb-4">
                                  No categories found. Create a category below.
                                </p>
                                <CreateCategoryForm onSuccess={() => {
                                  // Refresh categories
                                  queryClient.invalidateQueries({ queryKey: ['/api/blog/categories'] });
                                }} />
                              </div>
                            )}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="tags"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tags</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter tags separated by commas (e.g. gaming, esports, tips)"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* SEO Tab */}
              <TabsContent value="seo" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>SEO Settings</CardTitle>
                    <CardDescription>
                      Optimize your post for search engines.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="seoTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SEO Title</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="SEO optimized title (defaults to post title if empty)"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="seoDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SEO Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Meta description for search engines (defaults to excerpt if empty)"
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="seoKeywords"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SEO Keywords</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter keywords separated by commas (e.g. gaming, tutorials, esports)"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-end gap-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createPostMutation.isPending}
              >
                {createPostMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {createPostMutation.isPending ? "Creating..." : "Create Post"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </PageLayout>
  );
}

// Using the imported CreateCategoryForm component