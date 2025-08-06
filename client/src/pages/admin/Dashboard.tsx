import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Game, Category, User } from "@/types";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Redirect, Link, useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import EditGameModal from "@/components/admin/EditGameModal";
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

export default function Dashboard() {
  const [location] = useLocation();
  const activeTabFromUrl = location.includes("/admin/categories") ? "categories" : 
                          location.includes("/admin/challenges") ? "challenges" : 
                          location.includes("/admin/blog") ? "blog" : "games";
  
  const [activeTab, setActiveTab] = useState(activeTabFromUrl);
  const [gameFile, setGameFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedChallenge, setSelectedChallenge] = useState<any | null>(null);
  const [editGameId, setEditGameId] = useState<number | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
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
  
  // Get challenges for management
  const { data: challenges, isLoading: challengesLoading } = useQuery<any[]>({
    queryKey: ["/api/challenges"],
    enabled: user?.isAdmin,
  });

  // Upload new game mutation
  const uploadGameMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      console.log('Uploading game with FormData', {
        title: formData.get('title'),
        categoryId: formData.get('categoryId'),
        description: formData.get('description'),
        hasGameFile: formData.has('gameFile'),
        hasThumbnail: formData.has('thumbnail')
      });
      // Use apiRequest with relative path, which ensures credentials: 'include' and proper error handling
      return apiRequest("POST", "/api/games", formData, { isFormData: true });
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

  // Toggle game status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: "draft" | "published" }) => {
      // apiRequest already parses the JSON response for us
      return apiRequest("POST", `/api/games/${id}/update-status`, { status });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/games"] });
      toast({
        title: "Success",
        description: `Game ${data.status === "published" ? "published" : "unpublished"} successfully`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Delete game mutation
  const deleteGameMutation = useMutation({
    mutationFn: async (gameId: number) => {
      // apiRequest already parses the JSON response for us
      return apiRequest("DELETE", `/api/games/${gameId}`);
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
      // apiRequest already parses the JSON response for us
      return apiRequest("POST", "/api/categories", data);
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
      // apiRequest already parses the JSON response for us
      return apiRequest("DELETE", `/api/categories/${categoryId}`);
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
  
  // Create challenge mutation
  const createChallengeMutation = useMutation({
    mutationFn: async (data: any) => {
      // apiRequest already parses the JSON response for us
      return apiRequest("POST", "/api/challenges", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Challenge created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/challenges"] });
      // Reset challenge form
      const form = document.getElementById("challengeForm") as HTMLFormElement;
      if (form) form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Challenge creation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Update challenge status mutation
  const updateChallengeStatusMutation = useMutation({
    mutationFn: async ({ 
      id, 
      status 
    }: { 
      id: number; 
      status: "upcoming" | "active" | "completed"; 
    }) => {
      // apiRequest already parses the JSON response for us
      return apiRequest("POST", `/api/challenges/${id}/update-status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/challenges"] });
      toast({
        title: "Success",
        description: "Challenge status updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Delete challenge mutation
  const deleteChallengeMutation = useMutation({
    mutationFn: async (challengeId: number) => {
      // apiRequest already parses the JSON response for us
      return apiRequest("DELETE", `/api/challenges/${challengeId}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Challenge deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/challenges"] });
      setSelectedChallenge(null);
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
  
  // Confirm challenge delete
  const confirmChallengeDelete = () => {
    if (selectedChallenge) {
      deleteChallengeMutation.mutate(selectedChallenge.id);
    }
  };
  
  // Handle challenge form submission
  const handleChallengeSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const challengeData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      gameId: formData.get('gameId') ? Number(formData.get('gameId')) : null,
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string,
      rules: formData.get('rules') as string,
      prizes: JSON.parse(formData.get('prizes') as string || '{}'),
      maxScore: formData.get('maxScore') ? Number(formData.get('maxScore')) : null,
      status: formData.get('status') as "upcoming" | "active" | "completed" || "upcoming"
    };
    
    createChallengeMutation.mutate(challengeData);
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
        
        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="games">Manage Games</TabsTrigger>
            <TabsTrigger value="categories">Manage Categories</TabsTrigger>
            <TabsTrigger value="challenges">Manage Challenges</TabsTrigger>
            <TabsTrigger value="blog">Manage Blog</TabsTrigger>
            <TabsTrigger value="analytics">
              <Link href="/admin/analytics" className="inline-block w-full">Analytics</Link>
            </TabsTrigger>
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
                
                <div className="flex items-center space-x-6 mb-4">
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
                  
                  <div className="flex items-center">
                    <Input
                      id="statusDraft"
                      name="status"
                      type="checkbox"
                      value="draft"
                      defaultChecked={true}
                      className="w-4 h-4 bg-[#1A2134] border-[#2d3754]"
                    />
                    <label htmlFor="statusDraft" className="ml-2 text-sm font-medium text-gray-300">
                      Save as Draft
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
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  console.log("Edit button clicked for game ID:", game.id);
                                  setEditGameId(game.id);
                                  setShowEditModal(true);
                                }}
                                className="border-[#2d3754] hover:bg-[#2d3754] text-white"
                              >
                                Edit
                              </Button>
                              <Button
                                variant={game.status === "published" ? "default" : "outline"}
                                size="sm"
                                onClick={() => {
                                  // Toggle the game status between draft and published
                                  const newStatus = game.status === "published" ? "draft" : "published";
                                  toggleStatusMutation.mutate({ 
                                    id: game.id, 
                                    status: newStatus
                                  });
                                }}
                                className={`${game.status === "published" 
                                  ? "bg-green-500/30 hover:bg-green-500/50" 
                                  : "border-[#2d3754] hover:bg-[#2d3754]"} text-white`}
                              >
                                {game.status === "published" ? "Unpublish" : "Publish"}
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

          <TabsContent value="challenges" className="space-y-8">
            {/* Add New Challenge Form */}
            <div className="bg-[#232a40] p-6 rounded-xl border border-[#2d3754] shadow-md">
              <h2 className="text-xl font-title font-bold mb-4 text-white">Create New Challenge</h2>
              <form id="challengeForm" onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                // For debugging
                console.log("Form data being submitted:", {
                  title: formData.get('title'),
                  description: formData.get('description'),
                  gameId: formData.get('gameId'),
                  startDate: formData.get('startDate'),
                  endDate: formData.get('endDate'),
                  rules: formData.get('rules'),
                  prizes: formData.get('prizes'),
                  maxScore: formData.get('maxScore')
                });
                
                const title = formData.get('title') as string;
                // Generate slug from title
                const slug = title.toLowerCase()
                  .replace(/[^\w\s-]/g, '') // Remove special chars
                  .replace(/\s+/g, '-')     // Replace spaces with -
                  .replace(/-+/g, '-');     // Replace multiple - with single -
                
                const challengeData = {
                  title: title,
                  description: formData.get('description') as string,
                  gameId: formData.get('gameId') === "none" ? null : Number(formData.get('gameId')),
                  startDate: formData.get('startDate') as string,
                  endDate: formData.get('endDate') as string,
                  rules: formData.get('rules') as string,
                  prizes: JSON.parse(formData.get('prizes') as string),
                  maxScore: formData.get('maxScore') ? Number(formData.get('maxScore')) : null,
                  slug: slug
                };
                
                // Call API to create challenge
                fetch('/api/challenges', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(challengeData),
                  credentials: 'include'
                })
                .then(response => {
                  if (!response.ok) {
                    throw new Error('Failed to create challenge');
                  }
                  return response.json();
                })
                .then(data => {
                  toast({
                    title: "Success",
                    description: "Challenge created successfully",
                  });
                  // Reset form
                  (e.target as HTMLFormElement).reset();
                  // Refresh challenges list
                  queryClient.invalidateQueries({ queryKey: ['/api/challenges'] });
                })
                .catch(error => {
                  console.error("Error creating challenge:", error);
                  
                  // Try to get more detailed error message if available
                  if (error.response) {
                    error.response.json().then((data: any) => {
                      console.error("Server error details:", data);
                      toast({
                        title: "Failed to create challenge",
                        description: data.message ? JSON.stringify(data.message) : error.message,
                        variant: "destructive",
                      });
                    }).catch(() => {
                      toast({
                        title: "Failed to create challenge",
                        description: error.message,
                        variant: "destructive",
                      });
                    });
                  } else {
                    toast({
                      title: "Failed to create challenge",
                      description: error.message,
                      variant: "destructive",
                    });
                  }
                });
              }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
                      Challenge Title
                    </label>
                    <Input
                      id="title"
                      name="title"
                      required
                      className="bg-[#1A2134] border-[#2d3754] text-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="gameId" className="block text-sm font-medium text-gray-300 mb-1">
                      Game (Optional)
                    </label>
                    <Select name="gameId">
                      <SelectTrigger className="bg-[#1A2134] border-[#2d3754] text-white">
                        <SelectValue placeholder="Select a game" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#232a40] border-[#2d3754] text-white">
                        <SelectItem value="none">None</SelectItem>
                        {games?.map((game) => (
                          <SelectItem key={game.id} value={game.id.toString()}>
                            {game.title}
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
                  <label htmlFor="rules" className="block text-sm font-medium text-gray-300 mb-1">
                    Rules
                  </label>
                  <Textarea
                    id="rules"
                    name="rules"
                    className="min-h-[80px] bg-[#1A2134] border-[#2d3754] text-white"
                    placeholder="Enter rules for the challenge"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-300 mb-1">
                      Start Date
                    </label>
                    <Input
                      id="startDate"
                      name="startDate"
                      type="date"
                      required
                      className="bg-[#1A2134] border-[#2d3754] text-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-300 mb-1">
                      End Date
                    </label>
                    <Input
                      id="endDate"
                      name="endDate"
                      type="date"
                      required
                      className="bg-[#1A2134] border-[#2d3754] text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="prizes" className="block text-sm font-medium text-gray-300 mb-1">
                      Prizes (JSON format)
                    </label>
                    <Textarea
                      id="prizes"
                      name="prizes"
                      defaultValue={JSON.stringify({
                        "first": "1st Prize",
                        "second": "2nd Prize",
                        "third": "3rd Prize"
                      }, null, 2)}
                      className="min-h-[120px] bg-[#1A2134] border-[#2d3754] text-white font-mono text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="maxScore" className="block text-sm font-medium text-gray-300 mb-1">
                      Maximum Score (Optional)
                    </label>
                    <Input
                      id="maxScore"
                      name="maxScore"
                      type="number"
                      className="bg-[#1A2134] border-[#2d3754] text-white"
                      placeholder="e.g. 10000"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    className="bg-primary hover:bg-primary/90"
                  >
                    Create Challenge
                  </Button>
                </div>
              </form>
            </div>
            
            {/* Challenges List */}
            <div className="bg-[#232a40] p-6 rounded-xl border border-[#2d3754] shadow-md">
              <h2 className="text-xl font-title font-bold mb-4 text-white">Challenges List</h2>
              
              {/* Challenges table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-[#1A2134]">
                    <TableRow>
                      <TableHead className="text-gray-300">Title</TableHead>
                      <TableHead className="text-gray-300">Status</TableHead>
                      <TableHead className="text-gray-300">Dates</TableHead>
                      <TableHead className="text-gray-300">Participants</TableHead>
                      <TableHead className="text-right text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {challengesLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          <div className="flex justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : challenges && challenges.length > 0 ? (
                      challenges.map((challenge) => (
                        <TableRow key={challenge.id} className="hover:bg-[#1A2134] text-white">
                          <TableCell className="font-medium">{challenge.title}</TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                challenge.status === "upcoming"
                                  ? "bg-blue-500/20 text-blue-500"
                                  : challenge.status === "active"
                                  ? "bg-green-500/20 text-green-500"
                                  : "bg-purple-500/20 text-purple-500"
                              }`}
                            >
                              {challenge.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="text-xs">
                              <div>Start: {new Date(challenge.startDate).toLocaleDateString()}</div>
                              <div>End: {new Date(challenge.endDate).toLocaleDateString()}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {/* Will be implemented with participants count */}
                            <span className="text-gray-400">N/A</span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="border-[#2d3754] hover:bg-[#2d3754] text-white"
                              >
                                <Link href={`/challenges/${challenge.slug}`}>View</Link>
                              </Button>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => {
                                  // Update challenge status
                                  const newStatus = 
                                    challenge.status === "upcoming" ? "active" : 
                                    challenge.status === "active" ? "completed" : "upcoming";
                                  
                                  fetch(`/api/challenges/${challenge.id}/update-status`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ status: newStatus }),
                                    credentials: 'include'
                                  })
                                  .then(response => {
                                    if (!response.ok) throw new Error('Failed to update status');
                                    return response.json();
                                  })
                                  .then(() => {
                                    toast({
                                      title: "Success",
                                      description: `Challenge status updated to ${newStatus}`,
                                    });
                                    queryClient.invalidateQueries({ queryKey: ['/api/challenges'] });
                                  })
                                  .catch(error => {
                                    toast({
                                      title: "Failed to update status",
                                      description: error.message,
                                      variant: "destructive",
                                    });
                                  });
                                }}
                                className="bg-primary hover:bg-primary/90 text-white"
                              >
                                {challenge.status === "upcoming" 
                                  ? "Mark Active" 
                                  : challenge.status === "active" 
                                  ? "Mark Completed" 
                                  : "Reset to Upcoming"}
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  // Delete challenge
                                  if (confirm(`Are you sure you want to delete "${challenge.title}"?`)) {
                                    fetch(`/api/challenges/${challenge.id}`, {
                                      method: 'DELETE',
                                      credentials: 'include'
                                    })
                                    .then(response => {
                                      if (!response.ok) throw new Error('Failed to delete challenge');
                                      return response.json();
                                    })
                                    .then(() => {
                                      toast({
                                        title: "Success",
                                        description: "Challenge deleted successfully",
                                      });
                                      queryClient.invalidateQueries({ queryKey: ['/api/challenges'] });
                                    })
                                    .catch(error => {
                                      toast({
                                        title: "Failed to delete challenge",
                                        description: error.message,
                                        variant: "destructive",
                                      });
                                    });
                                  }
                                }}
                                className="bg-red-500/30 hover:bg-red-500/50 text-white"
                              >
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4 text-gray-400">
                          No challenges found. Create your first challenge above.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="blog" className="space-y-8">
            {/* Add New Blog Post Form */}
            <div className="bg-[#232a40] p-6 rounded-xl border border-[#2d3754] shadow-md">
              <h2 className="text-xl font-title font-bold mb-4 text-white">Create New Blog Post</h2>
              <Button variant="default" className="bg-primary hover:bg-primary/90" asChild>
                <Link href="/admin/blog/create">Create New Post</Link>
              </Button>
            </div>
            
            {/* Blog Posts List */}
            <div className="bg-[#232a40] p-6 rounded-xl border border-[#2d3754] shadow-md">
              <h2 className="text-xl font-title font-bold mb-4 text-white">Blog Posts</h2>
              <div className="flex justify-between items-center mb-6">
                <Button variant="outline" className="border-[#2d3754] hover:bg-[#2d3754] text-white" asChild>
                  <Link href="/blog">View Blog</Link>
                </Button>
                <Button variant="default" className="bg-primary hover:bg-primary/90" asChild>
                  <Link href="/admin/blog/categories">Manage Categories</Link>
                </Button>
              </div>
              
              {/* Blog posts table would go here */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-[#1A2134]">
                    <TableRow>
                      <TableHead className="text-gray-300">Title</TableHead>
                      <TableHead className="text-gray-300">Category</TableHead>
                      <TableHead className="text-gray-300">Status</TableHead>
                      <TableHead className="text-gray-300">Published Date</TableHead>
                      <TableHead className="text-right text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* We'll add the dynamic blog posts data fetching in the next iteration */}
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4 text-gray-400">
                        Loading blog posts...
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
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

      {/* Edit Game Modal */}
      {showEditModal && editGameId && (
        <EditGameModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          gameId={editGameId}
        />
      )}
    </div>
  );
}