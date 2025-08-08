import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Game } from "@/types";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import GameUploadForm from "@/components/games/GameUploadForm";
import EditGameModal from "./EditGameModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table,
} from "@/components/ui/table";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";

export default function AdminGamesList() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editGameId, setEditGameId] = useState<number | null>(null);
  const [deleteGameId, setDeleteGameId] = useState<number | null>(null);
  const [repairGameId, setRepairGameId] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRepairDialog, setShowRepairDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const gamesPerPage = 10;

  // Get all games for admin
  const {
    data: games,
    isLoading,
    refetch,
  } = useQuery<Game[]>({
    queryKey: ["/api/games", { limit: 100 }], // Get a larger batch for admin
  });

  // Toggle game status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: "draft" | "published" }) => {
      // apiRequest already handles the JSON parsing
      return apiRequest("PUT", `/api/games/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/games"] });
      toast({
        title: "Game status updated",
        description: "The game status has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update game status",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    },
  });

  // Toggle featured status mutation
  const toggleFeaturedMutation = useMutation({
    mutationFn: async ({ id, featured, isFeatured }: { id: number; featured: boolean; isFeatured?: boolean }) => {
      // apiRequest already handles the JSON parsing
      return apiRequest("PUT", `/api/games/${id}`, { featured, isFeatured });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/games"] });
      queryClient.invalidateQueries({ queryKey: ["/api/games/featured"] });
      toast({
        title: "Featured status updated",
        description: "The game featured status has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update featured status",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    },
  });

  // Delete game mutation
  const deleteGameMutation = useMutation({
    mutationFn: async (id: number) => {
      // Use apiRequest directly - it handles the JSON parsing for us
      return apiRequest("DELETE", `/api/games/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/games"] });
      queryClient.invalidateQueries({ queryKey: ["/api/games/featured"] });
      toast({
        title: "Game deleted",
        description: "The game has been successfully deleted.",
      });
      setShowDeleteDialog(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to delete game",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    },
  });
  
  // Update thumbnail mutation
  const updateThumbnailMutation = useMutation({
    mutationFn: async ({ id, thumbnailFile }: { id: number; thumbnailFile: File }) => {
      const formData = new FormData();
      formData.append('thumbnail', thumbnailFile);
      
      return apiRequest('POST', `/api/games/${id}/update-thumbnail`, formData, { isFormData: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/games"] });
      queryClient.invalidateQueries({ queryKey: ["/api/games/featured"] });
      toast({
        title: "Thumbnail updated",
        description: "The game thumbnail has been successfully updated.",
      });
      setShowRepairDialog(false);
      setRepairGameId(null);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    onError: (error) => {
      toast({
        title: "Failed to update thumbnail",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    },
  });

  // Handle game status toggle
  const handleStatusToggle = (id: number, currentStatus: string) => {
    const newStatus = currentStatus === "draft" ? "published" : "draft";
    toggleStatusMutation.mutate({ id, status: newStatus });
  };

  // Handle featured toggle
  const handleFeaturedToggle = (id: number, currentFeatured: boolean) => {
    toggleFeaturedMutation.mutate({ 
      id, 
      featured: !currentFeatured,
      isFeatured: !currentFeatured // Also include isFeatured for backend compatibility
    });
  };

  // Handle game deletion
  const handleDelete = (id: number) => {
    setDeleteGameId(id);
    setShowDeleteDialog(true);
  };

  // Confirm game deletion
  const confirmDelete = () => {
    if (deleteGameId) {
      deleteGameMutation.mutate(deleteGameId);
    }
  };

  // Handle game edit
  const handleEdit = (id: number) => {
    console.log("Edit button clicked for game ID:", id);
    setEditGameId(id);
    setShowEditModal(true);
    console.log("State after update - editGameId:", id, "showEditModal:", true);
  };
  
  // Handle thumbnail repair
  const handleRepairThumbnail = (id: number) => {
    setRepairGameId(id);
    setShowRepairDialog(true);
  };
  
  // Handle thumbnail file selection
  const handleThumbnailFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && repairGameId) {
      const file = e.target.files[0];
      updateThumbnailMutation.mutate({ id: repairGameId, thumbnailFile: file });
    }
  };

  // Filter games based on search term
  const filteredGames = games
    ? games.filter(
        (game) =>
          game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (game.description && game.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : [];

  // Paginate games
  const paginatedGames = filteredGames.slice(
    (currentPage - 1) * gamesPerPage,
    currentPage * gamesPerPage
  );

  // Calculate total pages
  const totalPages = Math.ceil(filteredGames.length / gamesPerPage);

  if (isLoading) {
    return (
      <div>
        <div className="relative mb-4">
          <Skeleton className="h-10 w-full max-w-sm" />
        </div>
        <div className="overflow-x-auto border rounded-lg">
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    );
  }
  
  // Error boundary for when games fail to load
  if (!games && !isLoading) {
    return (
      <div className="text-center py-8">
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">
            Failed to Load Games
          </h3>
          <p className="text-red-600 dark:text-red-300 mb-4">
            There was an error loading the games list. This might be due to a network issue or server problem.
          </p>
          <Button onClick={() => refetch()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search games..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 pl-9"
          />
          <span className="material-icons absolute left-2 top-2 text-gray-400">search</span>
        </div>
      </div>

      <div className="overflow-x-auto border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Game</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Plays</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedGames.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">No games found.</p>
                </TableCell>
              </TableRow>
            ) : (
              paginatedGames.map((game) => (
                <TableRow key={game.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-16">
                        <img
                          className="h-10 w-16 object-cover rounded"
                          src={game.thumbnailUrl || "https://via.placeholder.com/80x50?text=Game"}
                          alt={`${game.title} thumbnail`}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium">{game.title}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Added on {new Date(game.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {game.categoryId ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                        {game.category?.name || "Category"}
                      </span>
                    ) : (
                      <span className="text-gray-400">None</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">{game.playCount}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <span className="text-amber-500 flex items-center">
                        <span className="material-icons text-xs">star</span>
                        <span className="ml-1">
                          {game.rating ? game.rating.toFixed(1) : "0.0"}
                        </span>
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={game.status === "published"}
                        onCheckedChange={() => handleStatusToggle(game.id, game.status)}
                      />
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        {game.status === "published" ? "Published" : "Draft"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={game.featured || game.isFeatured}
                        onCheckedChange={() => handleFeaturedToggle(game.id, game.featured || game.isFeatured || false)}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <span className="material-icons">more_vert</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(game.id)}>
                          <span className="material-icons mr-2 text-primary">edit</span>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleRepairThumbnail(game.id)}>
                          <span className="material-icons mr-2 text-amber-500">image</span>
                          Repair Thumbnail
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <a href={`/games/${game.slug}`} target="_blank" rel="noopener noreferrer">
                            <span className="material-icons mr-2 text-gray-500">visibility</span>
                            Preview
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-500 focus:text-red-500"
                          onClick={() => handleDelete(game.id)}
                        >
                          <span className="material-icons mr-2">delete</span>
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing <span className="font-medium">{(currentPage - 1) * gamesPerPage + 1}</span> to{" "}
            <span className="font-medium">
              {Math.min(currentPage * gamesPerPage, filteredGames.length)}
            </span>{" "}
            of <span className="font-medium">{filteredGames.length}</span> results
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            {[...Array(totalPages)].map((_, i) => (
              <Button
                key={i}
                variant={currentPage === i + 1 ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this game? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleteGameMutation.isPending}>
              {deleteGameMutation.isPending ? "Deleting..." : "Delete Game"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Game Modal */}
      {showEditModal && editGameId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Debug: Edit Modal Opened</h2>
            <p>Game ID: {editGameId}</p>
            <div className="mt-4 flex justify-end">
              <Button onClick={() => setShowEditModal(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* Thumbnail Repair Dialog */}
      <AlertDialog open={showRepairDialog} onOpenChange={setShowRepairDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Repair Game Thumbnail</AlertDialogTitle>
            <AlertDialogDescription>
              Upload a new thumbnail image to replace the missing or broken one.
              <div className="mt-4">
                <Input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/*"
                  onChange={handleThumbnailFileChange}
                  className="mt-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Recommended size: 300x200 pixels. Max size: 2MB.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowRepairDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={updateThumbnailMutation.isPending}
              onClick={() => {
                if (fileInputRef.current && fileInputRef.current.files && fileInputRef.current.files[0] && repairGameId) {
                  updateThumbnailMutation.mutate({ 
                    id: repairGameId, 
                    thumbnailFile: fileInputRef.current.files[0] 
                  });
                } else {
                  toast({
                    title: "No file selected",
                    description: "Please select an image file first.",
                    variant: "destructive",
                  });
                }
              }}
            >
              {updateThumbnailMutation.isPending ? "Uploading..." : "Upload Thumbnail"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
