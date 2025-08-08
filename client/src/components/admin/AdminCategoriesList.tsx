import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Category } from "@/types";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { PlaceholderImage } from "@/components/ui/placeholder-image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Category form schema - matches backend requirements
const categorySchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }).trim(),
  slug: z.string().optional().default(""), // Make slug optional for form validation
  description: z.string().optional().default(""),
  imageUrl: z.string().url({ message: "Must be a valid URL" }).optional().or(z.literal("")),
}).transform((data) => {
  // Always generate slug from name if slug is empty or invalid
  let finalSlug = data.slug?.trim() || "";
  if (!finalSlug || finalSlug === "") {
    finalSlug = data.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "")
      .trim();
  }
  
  // Validate the final slug format
  if (!/^[a-z0-9-]+$/.test(finalSlug)) {
    throw new Error("Generated slug contains invalid characters");
  }
  
  return {
    ...data,
    slug: finalSlug
  };
});

type CategoryFormValues = z.infer<typeof categorySchema>;

export default function AdminCategoriesList() {
  const { toast } = useToast();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState<number | null>(null);

  // Get all categories
  const {
    data: categories,
    isLoading,
    refetch,
  } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Category form (for both add and edit)
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      imageUrl: "",
    },
  });

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: async (data: CategoryFormValues) => {
      console.log('Creating category with data:', data); // Debug log
      const response = await apiRequest("POST", "/api/categories", data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Category created",
        description: "The category has been successfully created.",
      });
      setShowAddDialog(false);
      form.reset();
    },
    onError: (error: any) => {
      console.error('Category creation error:', error);
      let errorMessage = "Please try again later";
      
      // Handle validation errors from backend
      if (error.message) {
        try {
          const parsed = JSON.parse(error.message);
          if (Array.isArray(parsed)) {
            errorMessage = parsed.map((err: any) => `${err.path?.[0] || 'Field'}: ${err.message}`).join(', ');
          } else {
            errorMessage = error.message;
          }
        } catch {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Category creation failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CategoryFormValues }) => {
      const response = await apiRequest("PUT", `/api/categories/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Category updated",
        description: "The category has been successfully updated.",
      });
      setShowEditDialog(false);
      setEditingCategory(null);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Failed to update category",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    },
  });

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/categories/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Category deleted",
        description: "The category has been successfully deleted.",
      });
      setShowDeleteDialog(false);
      setDeletingCategoryId(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to delete category",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    },
  });

  // Handle add category
  const handleAddCategory = () => {
    form.reset({
      name: "",
      slug: "",
      description: "",
      imageUrl: "",
    });
    setShowAddDialog(true);
  };

  // Handle edit category
  const handleEditCategory = (category: Category) => {
    form.reset({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      imageUrl: category.imageUrl || "",
    });
    setEditingCategory(category);
    setShowEditDialog(true);
  };

  // Handle delete category
  const handleDeleteCategory = (id: number) => {
    setDeletingCategoryId(id);
    setShowDeleteDialog(true);
  };

  // Handle form submission for add category
  const onAddSubmit = (data: CategoryFormValues) => {
    console.log('=== CATEGORY CREATION DEBUG ===');
    console.log('Form data after schema validation:', data);
    console.log('Slug from schema:', data.slug);
    console.log('===============================');
    
    // The schema transform already handled slug generation and validation
    // Just clean up the data before sending
    const cleanData = {
      name: data.name.trim(),
      slug: data.slug, // Already generated by schema
      description: data.description?.trim() || "",
      imageUrl: data.imageUrl?.trim() || ""
    };
    
    createCategoryMutation.mutate(cleanData);
  };

  // Handle form submission for edit category
  const onEditSubmit = (data: CategoryFormValues) => {
    if (editingCategory) {
      console.log('Edit category data after schema validation:', data);
      
      // The schema transform already handled slug generation and validation
      const cleanData = {
        name: data.name.trim(),
        slug: data.slug, // Already generated by schema
        description: data.description?.trim() || "",
        imageUrl: data.imageUrl?.trim() || ""
      };
      
      console.log('Updating category data:', cleanData);
      updateCategoryMutation.mutate({ id: editingCategory.id, data: cleanData });
    }
  };

  // Confirm category deletion
  const confirmDelete = () => {
    if (deletingCategoryId) {
      deleteCategoryMutation.mutate(deletingCategoryId);
    }
  };

  // Generate slug from name
  const generateSlug = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "") // Remove special characters except spaces and hyphens
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, "") // Remove leading/trailing hyphens
      .trim();
    
    form.setValue("slug", slug);
    return slug;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full rounded-md" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-6">
        <Button onClick={handleAddCategory}>
          <span className="material-icons mr-1">add</span>
          Add Category
        </Button>
      </div>

      {categories && categories.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400 mb-4">No categories found.</p>
          <Button onClick={handleAddCategory}>Create your first category</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
          {categories?.map((category) => (
            <Card key={category.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{category.name}</CardTitle>
                    <CardDescription>{category.slug}</CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <span className="material-icons">more_vert</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditCategory(category)}>
                        <span className="material-icons mr-2 text-primary">edit</span>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-500 focus:text-red-500"
                        onClick={() => handleDeleteCategory(category.id)}
                      >
                        <span className="material-icons mr-2">delete</span>
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative h-32 rounded-md overflow-hidden mb-3">
                  {category.imageUrl ? (
                    <img
                      src={category.imageUrl}
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <PlaceholderImage
                      text={category.name}
                      className="w-full h-full"
                    />
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {category.description || "No description available."}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {category.gameCount} {category.gameCount === 1 ? "game" : "games"}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                >
                  <a href={`/?category=${category.id}`}>View Games</a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Add Category Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
            <DialogDescription>
              Create a new category to organize your games.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onAddSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g. Arcade Games, Puzzle Games"
                        onChange={(e) => {
                          field.onChange(e);
                          // Always auto-generate slug from name
                          if (e.target.value) {
                            generateSlug(e.target.value);
                          } else {
                            form.setValue("slug", "");
                          }
                        }}
                        onBlur={field.onBlur}
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
                    <FormLabel>Slug (URL-friendly name)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="e.g. arcade-games, puzzle-games"
                        onChange={(e) => {
                          // Allow manual editing of slug
                          const value = e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9-]/g, "-")
                            .replace(/-+/g, "-")
                            .replace(/^-+|-+$/g, "");
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <p className="text-xs text-gray-500 mt-1">
                      Auto-generated from name. Used in URLs: /category/{form.watch("slug") || "category-name"}
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="A short description of the category"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="https://example.com/image.jpg"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createCategoryMutation.isPending}
                >
                  {createCategoryMutation.isPending ? "Creating..." : "Create Category"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update the category information.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. Arcade, Puzzle" />
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
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. arcade, puzzle" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="A short description of the category"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="https://example.com/image.jpg"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateCategoryMutation.isPending}
                >
                  {updateCategoryMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this category? This may affect games assigned to this category.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteCategoryMutation.isPending}
            >
              {deleteCategoryMutation.isPending ? "Deleting..." : "Delete Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
