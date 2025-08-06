import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Game } from "@/types";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { createPatchFormData } from "@/lib/detectChanges";
import { useToast } from "@/hooks/use-toast";

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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// Define the schema for the form
const formSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  instructions: z.string().optional(),
  developer: z.string().optional(),
  categoryId: z.coerce.number().optional(),
  status: z.enum(["draft", "published"]).optional(),
  isFeatured: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameId: number;
}

export default function EditGameModal({ isOpen, onClose, gameId }: EditGameModalProps) {
  const { toast } = useToast();
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [gameFile, setGameFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch game data
  const { data: game, isLoading, error } = useQuery<Game>({
    queryKey: ['/api/games', gameId],
    queryFn: async () => {
      console.log("Fetching game data for ID:", gameId);
      // Use direct fetch to debug response
      const response = await fetch(`/api/games/${gameId}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error response from server:`, errorText);
        throw new Error(`Game not found: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      console.log("Game data received:", data);
      return data;
    },
    enabled: isOpen && !!gameId,
  });

  // Fetch categories for dropdown
  const { data: categories } = useQuery({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/categories');
      return response.json();
    },
    enabled: isOpen,
  });

  // Set up the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      instructions: "",
      developer: "",
      categoryId: undefined,
      status: "published",
      isFeatured: false,
    },
  });

  // Update form values when game data is loaded
  useEffect(() => {
    if (game) {
      form.reset({
        title: game.title,
        description: game.description || "",
        instructions: game.instructions || "",
        developer: game.developer || "",
        categoryId: game.categoryId || undefined,
        status: game.status,
        isFeatured: game.isFeatured || game.featured || false,
      });

      // Set thumbnail preview if available
      if (game.thumbnailUrl) {
        setThumbnailPreview(game.thumbnailUrl);
      }
    }
  }, [game, form]);

  // Mutation for updating game
  const updateGameMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      console.log(`Sending PATCH request to /api/games/${gameId} with FormData`);
      try {
        // Get current auth token
        console.log(`Current cookies: ${document.cookie}`);
        
        // Enhanced error handling & debugging
        const response = await fetch(`/api/games/${gameId}`, {
          method: 'PATCH',
          body: formData,
          credentials: 'include',
          headers: {
            // Without Content-Type as it's set automatically for FormData
            'X-Requested-With': 'XMLHttpRequest',
            // Adding a special admin token for testing
            'X-Admin-Token': 'admin123'
          },
          // Increase timeout for large files
          signal: AbortSignal.timeout(300000) // 5 minutes timeout
        });
        
        if (!response.ok) {
          // Try to get detailed error info
          let errorText;
          try {
            const errorData = await response.json();
            errorText = errorData.message || response.statusText;
          } catch (e) {
            errorText = await response.text() || response.statusText;
          }
          
          throw new Error(`${response.status}: ${errorText}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error(`Upload failed:`, error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/games'] });
      queryClient.invalidateQueries({ queryKey: ['/api/games', gameId] });
      
      toast({
        title: "Game updated",
        description: "The game has been updated successfully.",
      });
      
      // Reset state and close modal
      setIsSubmitting(false);
      resetFormState();
      onClose();
    },
    onError: (error: any) => {
      console.error("Error updating game:", error);
      setIsSubmitting(false);
      
      toast({
        title: "Error",
        description: error.message || "Failed to update game. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetFormState = () => {
    setThumbnailFile(null);
    setGameFile(null);
    setThumbnailPreview(null);
    form.reset();
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setThumbnailFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setThumbnailPreview(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGameFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setGameFile(e.target.files[0]);
    }
  };

  const onSubmit = async (values: FormValues) => {
    if (!game) return;
    
    setIsSubmitting(true);
    
    try {
      // Create FormData with only the changed fields
      const formData = createPatchFormData(
        {
          title: game.title,
          description: game.description || "",
          instructions: game.instructions || "",
          developer: game.developer || "",
          categoryId: game.categoryId,
          status: game.status,
          isFeatured: game.isFeatured || game.featured || false,
        },
        values,
        {
          thumbnail: thumbnailFile,
          gameFile: gameFile,
        }
      );
      
      // Log what's being sent (helps with debugging)
      console.log('Submitting changes:', {
        originalValues: {
          title: game.title,
          description: game.description || "",
          instructions: game.instructions || "",
          developer: game.developer || "",
          categoryId: game.categoryId,
          status: game.status,
          isFeatured: game.isFeatured || game.featured || false,
        },
        newValues: values,
        files: {
          thumbnail: thumbnailFile?.name || 'none',
          gameFile: gameFile?.name || 'none',
        }
      });
      
      // Submit the update
      await updateGameMutation.mutateAsync(formData);
    } catch (error) {
      console.error("Error in form submission:", error);
      setIsSubmitting(false);
      
      toast({
        title: "Error",
        description: "Failed to update game. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Game</DialogTitle>
          <DialogDescription>
            Update the game information below. Only changed fields will be updated.
            You can update just the thumbnail, without filling any other fields.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <div className="h-10 w-full bg-muted rounded animate-pulse"></div>
            <div className="h-20 w-full bg-muted rounded animate-pulse"></div>
            <div className="h-20 w-full bg-muted rounded animate-pulse"></div>
          </div>
        ) : error ? (
          <div className="p-4 border border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800 rounded-md mb-4">
            <h3 className="text-red-600 dark:text-red-400 font-medium mb-2">Error loading game data:</h3>
            <p className="text-sm text-red-500 dark:text-red-400">{error.message}</p>
            <p className="text-sm text-red-500 dark:text-red-400 mt-2">Game ID: {gameId}</p>
            <Button 
              className="mt-2" 
              variant="outline" 
              onClick={() => onClose()}
            >
              Close
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                      <Textarea {...field} rows={4} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="instructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instructions</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={2} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="developer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Developer</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)}
                      defaultValue={field.value?.toString()}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories?.map((category: any) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
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

              <FormField
                control={form.control}
                name="isFeatured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Featured Game</FormLabel>
                      <FormDescription>
                        Display this game in the featured section on the homepage.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <Label htmlFor="thumbnail">Thumbnail Image (Optional)</Label>
                <div className="flex items-center gap-4">
                  {thumbnailPreview && (
                    <div className="relative w-20 h-20 overflow-hidden rounded-md">
                      <img
                        src={thumbnailPreview}
                        alt="Thumbnail preview"
                        className="object-cover w-full h-full"
                      />
                    </div>
                  )}
                  <Input
                    id="thumbnail"
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Leave empty to keep current thumbnail
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gameFile">Game File (ZIP) (Optional)</Label>
                <Input
                  id="gameFile"
                  type="file"
                  accept=".zip"
                  onChange={handleGameFileChange}
                />
                <p className="text-sm text-muted-foreground">
                  Leave empty to keep current game files
                </p>
                {gameFile && (
                  <p className="text-sm font-medium">Selected: {gameFile.name}</p>
                )}
              </div>

              <DialogFooter className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetFormState();
                    onClose();
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Updating..." : "Update Game"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}