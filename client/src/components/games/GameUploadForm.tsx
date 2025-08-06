import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Category } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

interface GameUploadFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const gameFormSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters" }),
  description: z.string().optional(),
  instructions: z.string().optional(),
  categoryId: z.string().min(1, { message: "Please select a category" }),
  developer: z.string().optional(),
  status: z.enum(["draft", "published"]),
  isFeatured: z.boolean().default(false),
});

type GameFormValues = z.infer<typeof gameFormSchema>;

export default function GameUploadForm({ open, onOpenChange }: GameUploadFormProps) {
  const { toast } = useToast();
  const [gameFile, setGameFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Load categories
  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Default form values
  const defaultValues: Partial<GameFormValues> = {
    title: "",
    description: "",
    instructions: "",
    categoryId: "",
    developer: "",
    status: "draft",
    isFeatured: false,
  };

  // Initialize form
  const form = useForm<GameFormValues>({
    resolver: zodResolver(gameFormSchema),
    defaultValues,
  });

  // Game upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("POST", "/api/games", data, true);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/games"] });
      queryClient.invalidateQueries({ queryKey: ["/api/games/featured"] });
      toast({
        title: "Game uploaded successfully",
        description: "Your game is now processing and will be available soon.",
        variant: "default",
      });
      onOpenChange(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Failed to upload game",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (values: GameFormValues) => {
    if (!gameFile) {
      toast({
        title: "Missing game file",
        description: "Please upload a ZIP file containing your game",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 100MB)
    const maxSizeMB = 100;
    const fileSizeMB = gameFile.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      toast({
        title: "File too large",
        description: `ZIP file is ${fileSizeMB.toFixed(2)}MB. Maximum allowed size is ${maxSizeMB}MB.`,
        variant: "destructive",
      });
      return;
    }

    // Create form data
    const formData = new FormData();
    
    // Add form values
    formData.append("title", values.title);
    if (values.description) formData.append("description", values.description);
    if (values.instructions) formData.append("instructions", values.instructions);
    formData.append("categoryId", Number(values.categoryId).toString()); // Ensure it's converted to number first
    if (values.developer) formData.append("developer", values.developer);
    formData.append("status", values.status);
    formData.append("isFeatured", values.isFeatured ? "true" : "false"); // Ensure proper boolean conversion
    
    // Add files
    formData.append("gameFile", gameFile);
    if (thumbnail) formData.append("thumbnail", thumbnail);
    
    // Submit
    uploadMutation.mutate(formData);
  };

  // Reset the form
  const resetForm = () => {
    form.reset(defaultValues);
    setGameFile(null);
    setThumbnail(null);
    setThumbnailPreview(null);
  };

  // Handle game file upload
  const handleGameFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.name.endsWith('.zip') || file.type === 'application/zip') {
        setGameFile(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a ZIP file containing your game",
          variant: "destructive",
        });
      }
    }
  };

  // Handle thumbnail upload
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setThumbnail(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onload = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle drag events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.zip') || file.type === 'application/zip') {
        setGameFile(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a ZIP file containing your game",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload New Game</DialogTitle>
          <DialogDescription>
            Upload your HTML5 game as a ZIP file and provide the necessary details.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Game Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Game Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter game title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe your game" rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Category and Developer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories?.map(category => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                      <Input placeholder="Developer name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* How to Play */}
            <FormField
              control={form.control}
              name="instructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>How to Play Instructions</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Instructions for players" rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Game File Upload */}
            <div 
              className={`border-2 border-dashed rounded-lg p-6 text-center ${
                isDragging ? 'border-primary bg-primary/10' : 'border-gray-300 dark:border-gray-600'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="space-y-2">
                <div className="flex justify-center">
                  <span className="material-icons text-gray-400 text-4xl">
                    {gameFile ? 'check_circle' : 'cloud_upload'}
                  </span>
                </div>
                <div className="text-gray-700 dark:text-gray-300 font-medium">
                  {gameFile ? `Selected: ${gameFile.name}` : 'Upload Game ZIP File'}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {gameFile 
                    ? `${(gameFile.size / (1024 * 1024)).toFixed(2)} MB - Click below to change file`
                    : 'Drag and drop your game zip file, or click to browse'}
                </p>
                <div>
                  <label className="inline-block bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded-lg cursor-pointer transition-colors">
                    <span>{gameFile ? 'Change File' : 'Browse Files'}</span>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept=".zip" 
                      onChange={handleGameFileChange}
                    />
                  </label>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  Your ZIP file <span className="text-primary">must contain an index.html</span> file either in the root directory or in a subdirectory. This is required for the game to function properly.
                </div>
              </div>
            </div>
            
            {/* Thumbnail Upload */}
            <div>
              <FormLabel className="block text-sm font-medium mb-1">Game Thumbnail</FormLabel>
              <div className="mt-1 flex items-center space-x-4">
                <div className="flex-shrink-0 h-24 w-40 bg-gray-200 dark:bg-gray-700 rounded-md overflow-hidden">
                  {thumbnailPreview ? (
                    <img 
                      src={thumbnailPreview} 
                      alt="Thumbnail preview" 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <span className="material-icons text-4xl">image</span>
                    </div>
                  )}
                </div>
                <label className="bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded-lg cursor-pointer transition-colors">
                  <span>{thumbnailPreview ? 'Change Image' : 'Upload Image'}</span>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleThumbnailChange}
                  />
                </label>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Recommended size: 500x281 pixels (16:9 ratio)
              </p>
            </div>
            
            {/* Game Options */}
            <div className="flex items-center space-x-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Switch 
                        checked={field.value === "published"} 
                        onCheckedChange={(checked) => 
                          field.onChange(checked ? "published" : "draft")
                        } 
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">Publish immediately</FormLabel>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="isFeatured"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Switch 
                        checked={field.value} 
                        onCheckedChange={field.onChange} 
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">Feature this game</FormLabel>
                  </FormItem>
                )}
              />
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={uploadMutation.isPending}
              >
                {uploadMutation.isPending ? 'Uploading...' : 'Upload Game'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
