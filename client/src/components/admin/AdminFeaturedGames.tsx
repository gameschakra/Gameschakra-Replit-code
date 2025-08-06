import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Game } from "@/types";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "@hello-pangea/dnd";

export default function AdminFeaturedGames() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  // Get all featured games
  const {
    data: featuredGames,
    isLoading: featuredLoading,
    refetch: refetchFeatured,
  } = useQuery<Game[]>({
    queryKey: ["/api/games/featured", { limit: 20 }],
  });

  // Get all published games
  const {
    data: publishedGames,
    isLoading: publishedLoading,
    refetch: refetchPublished,
  } = useQuery<Game[]>({
    queryKey: ["/api/games", { status: "published" }],
  });

  // Toggle featured status mutation
  const toggleFeaturedMutation = useMutation({
    mutationFn: async ({ id, isFeatured }: { id: number; isFeatured: boolean }) => {
      const response = await apiRequest("PUT", `/api/games/${id}`, { isFeatured });
      return response.json();
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

  // Handle featured toggle
  const handleFeaturedToggle = (id: number, currentFeatured: boolean) => {
    toggleFeaturedMutation.mutate({ id, isFeatured: !currentFeatured });
  };

  // Filter non-featured games based on search term
  const filteredGames = publishedGames
    ? publishedGames
        .filter((game) => !game.isFeatured)
        .filter(
          (game) =>
            game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (game.description && game.description.toLowerCase().includes(searchTerm.toLowerCase()))
        )
    : [];

  // Handle drag end
  const handleDragEnd = (result: DropResult) => {
    // Dropping outside the list
    if (!result.destination) {
      return;
    }

    // Reordering logic would go here
    // This would need a backend API to support ordering of featured games
    toast({
      description: "Reordering featured games not implemented yet.",
    });
  };

  if (featuredLoading || publishedLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-medium mb-4">Current Featured Games</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-40 w-full rounded-md" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-8 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4">Other Games</h3>
          <Skeleton className="h-10 w-full max-w-sm mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-40 w-full rounded-md" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-8 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Featured Games Section */}
      <div>
        <h3 className="text-lg font-medium mb-4">Current Featured Games</h3>
        {featuredGames && featuredGames.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400 mb-4">No featured games yet.</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Select games from the list below to feature them on the homepage.
            </p>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="featured-games" direction="horizontal">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                >
                  {featuredGames?.map((game, index) => (
                    <Draggable key={game.id} draggableId={game.id.toString()} index={index}>
                      {(provided) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="cursor-grab active:cursor-grabbing"
                        >
                          <CardHeader>
                            <CardTitle className="text-base truncate">{game.title}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="relative h-40 rounded-md overflow-hidden">
                              <img
                                src={game.thumbnailUrl || "https://via.placeholder.com/300x200?text=Game"}
                                alt={game.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </CardContent>
                          <CardFooter className="flex justify-between">
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                            >
                              <a href={`/games/${game.slug}`} target="_blank" rel="noopener noreferrer">
                                Preview
                              </a>
                            </Button>
                            <div className="flex items-center space-x-1">
                              <span className="text-sm text-gray-500 dark:text-gray-400">Featured</span>
                              <Switch
                                checked={game.isFeatured}
                                onCheckedChange={() => handleFeaturedToggle(game.id, game.isFeatured)}
                              />
                            </div>
                          </CardFooter>
                        </Card>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>

      {/* Other Games Section */}
      <div>
        <h3 className="text-lg font-medium mb-4">Other Games</h3>
        <div className="mb-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search games..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full max-w-sm pl-9"
            />
            <span className="material-icons absolute left-2 top-2 text-gray-400">search</span>
          </div>
        </div>
        
        {filteredGames.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm ? "No games match your search." : "No more games available to feature."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredGames.map((game) => (
              <Card key={game.id}>
                <CardHeader>
                  <CardTitle className="text-base truncate">{game.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative h-40 rounded-md overflow-hidden">
                    <img
                      src={game.thumbnailUrl || "https://via.placeholder.com/300x200?text=Game"}
                      alt={game.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <a href={`/games/${game.slug}`} target="_blank" rel="noopener noreferrer">
                      Preview
                    </a>
                  </Button>
                  <div className="flex items-center space-x-1">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Feature</span>
                    <Switch
                      checked={game.isFeatured}
                      onCheckedChange={() => handleFeaturedToggle(game.id, game.isFeatured)}
                    />
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
