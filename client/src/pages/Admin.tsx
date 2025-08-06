import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Game, Category, User } from "@/types";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Redirect, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function Admin() {
  const [activeTab, setActiveTab] = useState("games");
  const [gameFile, setGameFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const { toast } = useToast();

  // Get user info to check if admin
  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
  });

  // Get all games for management
  const { data: games, isLoading: gamesLoading } = useQuery<Game[]>({
    queryKey: ["/api/games", { limit: 100 }],
    enabled: user?.isAdmin,
  });

  // Get all categories for management
  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    enabled: user?.isAdmin,
  });

  // Upload new game mutation
  const uploadGameMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/games", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to upload game");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Game uploaded successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/games"] });
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete game mutation
  const deleteGameMutation = useMutation({
    mutationFn: async (gameId: number) => {
      const response = await apiRequest("DELETE", `/api/games/${gameId}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete game");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Game deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/games"] });
      setDeleteDialogOpen(false);
      setSelectedGame(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Deletion failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: async (data: { name: string; description: string }) => {
      const response = await apiRequest("POST", "/api/categories", data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create category");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Category created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      resetCategoryForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Category creation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: async (categoryId: number) => {
      const response = await apiRequest("DELETE", `/api/categories/${categoryId}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete category");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setSelectedCategory(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Deletion failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    if (!gameFile) {
      toast({
        title: "Missing game file",
        description: "Please upload a game file (ZIP)",
        variant: "destructive",
      });
      return;
    }
    
    formData.append("gameFile", gameFile);
    if (thumbnailFile) {
      formData.append("thumbnail", thumbnailFile);
    }
    
    uploadGameMutation.mutate(formData);
  };

  // Handle category form submission
  const handleCategorySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    const description = (form.elements.namedItem("description") as HTMLTextAreaElement).value;
    
    createCategoryMutation.mutate({ name, description });
  };

  // Reset form after submission
  const resetForm = () => {
    const form = document.getElementById("gameForm") as HTMLFormElement;
    if (form) {
      form.reset();
      setGameFile(null);
      setThumbnailFile(null);
    }
  };

  // Reset category form
  const resetCategoryForm = () => {
    const form = document.getElementById("categoryForm") as HTMLFormElement;
    if (form) {
      form.reset();
    }
  };

  // Handle delete confirmation
  const confirmDelete = () => {
    if (selectedGame) {
      deleteGameMutation.mutate(selectedGame.id);
    }
  };

  // Confirm category delete
  const confirmCategoryDelete = () => {
    if (selectedCategory) {
      deleteCategoryMutation.mutate(selectedCategory.id);
    }
  };

  // Check if user is an admin
  if (userLoading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="flex justify-center">
          <Skeleton className="h-6 w-32" />
        </div>
      </div>
    );
  }

  if (!user || !user.isAdmin) {
    return <Redirect to="/" />;
  }

  return (
    <div className="bg-[#171c2a] min-h-screen">
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-title font-bold mb-8 text-white">Admin Dashboard</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="games">Manage Games</TabsTrigger>
            <TabsTrigger value="categories">Manage Categories</TabsTrigger>
          </TabsList>
          
          <TabsContent value="games" className="space-y-8">
            {/* Add New Game Form */}
            <div className="bg-[#232a40] p-6 rounded-xl border border-[#2d3754] shadow-md">
              <h2 className="text-xl font-title font-bold mb-4 text-white">Add New Game</h2>
              <form id="gameForm" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
                      Game Title
                    </label>
                    <Input
                      id="title"
                      name="title"
                      required
                      className="bg-[#1A2134] border-[#2d3754] text-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="categoryId" className="block text-sm font-medium text-gray-300 mb-1">
                      Category
                    </label>
                    <Select name="categoryId" required>
                      <SelectTrigger className="bg-[#1A2134] border-[#2d3754] text-white">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#232a40] border-[#2d3754] text-white">
                        {categories?.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
                    Description
                  </label>
                  <Textarea
                    id="description"
                    name="description"
                    required
                    className="min-h-[100px] bg-[#1A2134] border-[#2d3754] text-white"
                  />
                </div>
                
                <div>
                  <label htmlFor="instructions" className="block text-sm font-medium text-gray-300 mb-1">
                    Instructions (How to Play)
                  </label>
                  <Textarea
                    id="instructions"
                    name="instructions"
                    className="min-h-[80px] bg-[#1A2134] border-[#2d3754] text-white"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="gameFile" className="block text-sm font-medium text-gray-300 mb-1">
                      Game File (ZIP)
                    </label>
                    <Input
                      id="gameFile"
                      type="file"
                      accept=".zip"
                      className="bg-[#1A2134] border-[#2d3754] text-white"
                      onChange={(e) => setGameFile(e.target.files?.[0] || null)}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-300 mb-1">
                      Thumbnail Image
                    </label>
                    <Input
                      id="thumbnail"
                      type="file"
                      accept="image/*"
                      className="bg-[#1A2134] border-[#2d3754] text-white"
                      onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="flex items-center">
                    <Input
                      id="isFeatured"
                      name="isFeatured"
                      type="checkbox"
                      className="w-4 h-4 bg-[#1A2134] border-[#2d3754]"
                    />
                    <label htmlFor="isFeatured" className="ml-2 text-sm font-medium text-gray-300">
                      Featured Game
                    </label>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    className="bg-primary hover:bg-primary/90"
                    disabled={uploadGameMutation.isPending}
                  >
                    {uploadGameMutation.isPending ? "Uploading..." : "Upload Game"}
                  </Button>
                </div>
              </form>
            </div>
            
            {/* Games List */}
            <div className="bg-[#232a40] p-6 rounded-xl border border-[#2d3754] shadow-md">
              <h2 className="text-xl font-title font-bold mb-4 text-white">Games List</h2>
              {gamesLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : games && games.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-[#1A2134]">
                      <TableRow>
                        <TableHead className="text-gray-300">Title</TableHead>
                        <TableHead className="text-gray-300">Category</TableHead>
                        <TableHead className="text-gray-300">Status</TableHead>
                        <TableHead className="text-gray-300">Play Count</TableHead>
                        <TableHead className="text-right text-gray-300">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {games.map((game) => (
                        <TableRow key={game.id} className="hover:bg-[#1A2134] text-white">
                          <TableCell className="font-medium">{game.title}</TableCell>
                          <TableCell>{game.category?.name || "Unknown"}</TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                game.status === "published"
                                  ? "bg-green-500/20 text-green-500"
                                  : "bg-orange-500/20 text-orange-500"
                              }`}
                            >
                              {game.status}
                            </span>
                          </TableCell>
                          <TableCell>{game.playCount}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="border-[#2d3754] hover:bg-[#2d3754] text-white"
                              >
                                <Link href={`/games/${game.slug}`}>View</Link>
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  setSelectedGame(game);
                                  setDeleteDialogOpen(true);
                                }}
                                className="bg-red-500/30 hover:bg-red-500/50 text-white"
                              >
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-gray-400 text-center py-4">No games found.</p>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="categories" className="space-y-8">
            {/* Add New Category Form */}
            <div className="bg-[#232a40] p-6 rounded-xl border border-[#2d3754] shadow-md">
              <h2 className="text-xl font-title font-bold mb-4 text-white">Add New Category</h2>
              <form id="categoryForm" onSubmit={handleCategorySubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                    Category Name
                  </label>
                  <Input
                    id="name"
                    name="name"
                    required
                    className="bg-[#1A2134] border-[#2d3754] text-white"
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
                    Description
                  </label>
                  <Textarea
                    id="description"
                    name="description"
                    className="min-h-[80px] bg-[#1A2134] border-[#2d3754] text-white"
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    className="bg-primary hover:bg-primary/90"
                    disabled={createCategoryMutation.isPending}
                  >
                    {createCategoryMutation.isPending ? "Creating..." : "Create Category"}
                  </Button>
                </div>
              </form>
            </div>
            
            {/* Categories List */}
            <div className="bg-[#232a40] p-6 rounded-xl border border-[#2d3754] shadow-md">
              <h2 className="text-xl font-title font-bold mb-4 text-white">Categories List</h2>
              {categoriesLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : categories && categories.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-[#1A2134]">
                      <TableRow>
                        <TableHead className="text-gray-300">Name</TableHead>
                        <TableHead className="text-gray-300">Slug</TableHead>
                        <TableHead className="text-gray-300">Games</TableHead>
                        <TableHead className="text-right text-gray-300">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categories.map((category) => (
                        <TableRow key={category.id} className="hover:bg-[#1A2134] text-white">
                          <TableCell className="font-medium">{category.name}</TableCell>
                          <TableCell>{category.slug}</TableCell>
                          <TableCell>{category.gameCount}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setSelectedCategory(category);
                                confirmCategoryDelete();
                              }}
                              disabled={category.gameCount > 0}
                              className="bg-red-500/30 hover:bg-red-500/50 text-white"
                            >
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-gray-400 text-center py-4">No categories found.</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-[#232a40] text-white border-[#2d3754]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete the game "{selectedGame?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="border-[#2d3754] text-white hover:bg-[#2d3754]"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteGameMutation.isPending}
              className="bg-red-500/30 hover:bg-red-500/50 text-white"
            >
              {deleteGameMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}