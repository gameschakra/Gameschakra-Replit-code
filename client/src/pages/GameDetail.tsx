import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link, useLocation } from "wouter";
import { Game } from "@/types";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getAverageRating, generateStarRating } from "@/lib/utils";
import GameCard from "@/components/games/GameCard";
import { LazyImage } from "@/components/ui/lazy-image";
import { updateMetaTags, resetMetaTags } from "@/lib/metaService";
import { generateGameSchema } from "@/lib/schemaGenerator";
import { 
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function GameDetail() {
  const { slug } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isEmbedDialogOpen, setIsEmbedDialogOpen] = useState(false);
  const embedCodeRef = useRef<HTMLInputElement>(null);

  // Get game details
  const {
    data: game,
    isLoading,
    isError,
  } = useQuery<Game>({
    queryKey: [`/api/games/${slug}`],
    enabled: !!slug,
  });

  // Get related games by the same category
  const { data: relatedGames, isLoading: relatedLoading } = useQuery<Game[]>({
    queryKey: ["/api/games", { categoryId: game?.categoryId, limit: 8 }],
    enabled: !!game?.categoryId,
  });

  // Check if game is favorited
  const { data: favoriteData } = useQuery<{ isFavorite: boolean }>({
    queryKey: [`/api/favorites/is-favorite/${game?.id}`],
    enabled: !!game?.id,
  });
  
  // Update favorite state when data changes
  useEffect(() => {
    if (favoriteData) {
      setIsFavorite(favoriteData.isFavorite);
    }
  }, [favoriteData]);

  // Track game play
  const trackPlayMutation = useMutation({
    mutationFn: async () => {
      if (!game) return null;
      const response = await apiRequest("POST", `/api/games/${game.id}/play`, {});
      return response.json();
    },
  });

  // Toggle favorite status
  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (!game) return null;
      const response = await apiRequest("POST", `/api/favorites/${game.id}`, {});
      return response.json();
    },
    onSuccess: (data) => {
      if (data) {
        setIsFavorite(data.isFavorite);
        queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
        toast({
          title: data.isFavorite ? "Added to favorites" : "Removed from favorites",
          description: data.message,
        });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Please sign in to add favorites",
        variant: "destructive",
      });
    },
  });

  // Track game play when component mounts
  useEffect(() => {
    if (game) {
      trackPlayMutation.mutate();
      
      // Update meta tags when game details are loaded
      updateMetaTags({
        title: game.title,
        description: game.description || `Play ${game.title} on GamesChakra - Free HTML5 Games!`,
        imageUrl: game.thumbnailPath ? `/api/thumbnails/${game.thumbnailPath}` : undefined,
        canonicalUrl: `https://gameschakra.com/games/${game.slug}`,
        type: 'game'
      });
      
      // Add structured data schema for SEO
      const imageUrl = game.thumbnailPath ? `https://gameschakra.com/api/thumbnails/${game.thumbnailPath}` : undefined;
      
      // Convert Game type to the type expected by schemaGenerator
      const gameForSchema = {
        ...game,
        thumbnailUrl: game.thumbnailPath,
        developer: 'GamesChakra',
        rating: 4.5,
        ratingCount: 100
      };
      
      const schemaData = generateGameSchema({
        game: gameForSchema as any,
        url: `https://gameschakra.com/games/${game.slug}`,
        imageUrl
      });
      
      // Add schema to the page
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = 'game-schema';
      script.textContent = JSON.stringify(schemaData);
      
      // Remove any existing schema
      const existingSchema = document.getElementById('game-schema');
      if (existingSchema) {
        existingSchema.remove();
      }
      
      document.head.appendChild(script);
    }
    
    // Reset meta tags and remove schema on unmount
    return () => {
      if (game) {
        resetMetaTags();
        const existingSchema = document.getElementById('game-schema');
        if (existingSchema) {
          existingSchema.remove();
        }
      }
    };
  }, [game]);

  // Handle favorite button click
  const handleToggleFavorite = () => {
    toggleFavoriteMutation.mutate();
  };

  // Fullscreen gameplay
  const handleFullscreen = () => {
    const iframe = document.getElementById("game-iframe") as HTMLIFrameElement;
    if (iframe) {
      if (iframe.requestFullscreen) {
        iframe.requestFullscreen();
      }
    }
  };
  
  // Open embed dialog
  const handleOpenEmbedDialog = () => {
    setIsEmbedDialogOpen(true);
  };
  
  // Copy embed code to clipboard
  const copyEmbedCode = () => {
    if (embedCodeRef.current) {
      embedCodeRef.current.select();
      document.execCommand('copy');
      toast({
        title: "Copied to clipboard",
        description: "Game embed code has been copied to your clipboard",
      });
    }
  };

  if (isError) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-md mx-auto bg-card rounded-lg p-8 border border-border shadow-lg">
            <span className="material-icons text-6xl text-muted-foreground mb-4">sports_esports</span>
            <h1 className="text-2xl font-title font-bold mb-4">Oops! Game Not Found</h1>
            <p className="mb-6 text-muted-foreground">This game is currently unavailable or may have been removed.</p>
            <Button asChild size="lg" className="font-medium">
              <Link href="/">
                <span className="material-icons mr-2">home</span>
                Browse Other Games
              </Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  if (isLoading || !game) {
    return (
      <section className="py-10 bg-background">
        <div className="container mx-auto px-4">
          <div className="mb-4 flex items-center">
            <Skeleton className="h-10 w-32" />
          </div>

          <div className="bg-card rounded-lg border border-border shadow-md overflow-hidden">
            <div className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Game Iframe Skeleton */}
                <div className="w-full md:w-3/4 bg-background rounded-lg overflow-hidden">
                  <div className="relative pb-[56.25%]">
                    <Skeleton className="absolute inset-0 w-full h-full" />
                  </div>
                </div>

                {/* Game Info Skeleton */}
                <div className="w-full md:w-1/4">
                  <div className="flex items-start justify-between">
                    <Skeleton className="h-8 w-3/4 mb-4" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-1/2 mb-6" />
                  <Skeleton className="h-4 w-1/4 mb-6" />
                  <Skeleton className="h-32 w-full mb-6" />
                  <Skeleton className="h-24 w-full mb-6" />
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Related Games Skeleton */}
          <div className="mt-10">
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="rounded-lg overflow-hidden border border-border">
                  <Skeleton className="w-full h-48" />
                  <div className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Calculate average rating - defaulting to 0 if properties don't exist
  const averageRating = getAverageRating(0, 0);

  // Filter out the current game from related games
  const filteredRelatedGames = relatedGames?.filter((relatedGame) => relatedGame.id !== game.id) || [];

  return (
    <section className="py-10 bg-background">
      <div className="container mx-auto px-4">
        <div className="mb-4 flex items-center">
          <Button variant="outline" asChild className="flex items-center gap-1 font-medium">
            <Link href="/">
              <span className="material-icons text-sm">arrow_back</span>
              <span>Back to games</span>
            </Link>
          </Button>
        </div>

        <div className="bg-card rounded-lg border border-border shadow-md overflow-hidden">
          <div className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Game Iframe Container */}
              <div className="w-full md:w-3/4 bg-black rounded-lg overflow-hidden shadow-lg">
                <div className="relative pb-[56.25%]">
                  <iframe
                    id="game-iframe"
                    src={`/api/games/${game.gameDir}/${game.entryFile}`}
                    title={`${game.title} - Play Game`}
                    className="absolute inset-0 w-full h-full border-0"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>

              {/* Game Info */}
              <div className="w-full md:w-1/4">
                <div className="flex items-start justify-between">
                  <h1 className="font-title font-bold text-2xl text-foreground">{game.title}</h1>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={isFavorite ? "text-primary" : "text-muted-foreground hover:text-primary"}
                    onClick={handleToggleFavorite}
                    aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                  >
                    <span className="material-icons text-2xl">
                      {isFavorite ? "favorite" : "favorite_border"}
                    </span>
                  </Button>
                </div>

                <div className="flex items-center mt-2">
                  <span className="flex items-center text-amber-500">
                    {generateStarRating(averageRating)}
                  </span>
                  <span className="text-muted-foreground ml-2 text-sm">
                    {averageRating.toFixed(1)} (0 ratings)
                  </span>
                </div>

                <div className="mt-4">
                  {game.categoryId && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {game.category?.name || "Game"}
                    </span>
                  )}
                </div>

                <div className="mt-6 space-y-5">
                  <div>
                    <h3 className="font-title font-semibold mb-2">Description</h3>
                    <p className="text-sm text-muted-foreground">
                      {game.description || "No description available."}
                    </p>
                  </div>

                  {game.instructions && (
                    <div>
                      <h3 className="font-title font-semibold mb-2">How to Play</h3>
                      <p className="text-sm text-muted-foreground">{game.instructions}</p>
                    </div>
                  )}

                  <div className="bg-accent/30 rounded-lg p-4">
                    <h3 className="font-title font-semibold mb-3 flex items-center">
                      <span className="material-icons mr-2 text-primary text-sm">info</span>
                      Game Stats
                    </h3>
                    <div className="text-sm text-muted-foreground space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="flex items-center">
                          <span className="material-icons mr-2 text-xs">visibility</span>
                          Total Plays:
                        </span>
                        <span className="font-medium text-foreground">
                          {game.playCount > 1000 ? `${(game.playCount / 1000).toFixed(1)}k` : game.playCount}
                        </span>
                      </div>
                      
                      {/* Add creator/uploader info */}
                      <div className="flex justify-between items-center">
                        <span className="flex items-center">
                          <span className="material-icons mr-2 text-xs">person</span>
                          Added by:
                        </span>
                        <span className="font-medium text-foreground">Admin</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="flex items-center">
                          <span className="material-icons mr-2 text-xs">calendar_today</span>
                          Added:
                        </span>
                        <span className="font-medium text-foreground">{new Date(game.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <Button onClick={handleFullscreen} size="lg" className="w-full flex items-center justify-center gap-2 font-bold text-white bg-primary hover:bg-primary/90">
                    <span className="material-icons">fullscreen</span>
                    <span>Play Fullscreen</span>
                  </Button>
                  
                  <Button onClick={handleOpenEmbedDialog} variant="outline" className="w-full flex items-center justify-center gap-2">
                    <span className="material-icons">code</span>
                    <span>Embed Game</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Games */}
        {!relatedLoading && filteredRelatedGames.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <span className="material-icons text-primary mr-2">videogame_asset</span>
                <h2 className="text-2xl font-title font-bold">More Games Like This</h2>
              </div>
              
              {game.categoryId && (
                <Button variant="outline" asChild className="flex items-center gap-1">
                  <Link href={`/category/${game.category?.slug || ''}`}>
                    <span className="material-icons text-sm">apps</span>
                    <span>View All {game.category?.name || 'Games'}</span>
                  </Link>
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredRelatedGames.slice(0, 4).map((relatedGame) => (
                <GameCard key={relatedGame.id} game={relatedGame} isCompact />
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Embed Dialog */}
      <Dialog open={isEmbedDialogOpen} onOpenChange={setIsEmbedDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="material-icons text-primary">code</span>
              Embed {game.title}
            </DialogTitle>
            <DialogDescription>
              Copy this code to embed the game on your website
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex items-center space-y-2 space-x-2">
            <Input
              ref={embedCodeRef}
              readOnly
              value={`<iframe src="https://gameschakra.com/api/games/${game.gameDir}/${game.entryFile}" width="800" height="600" frameborder="0" allowfullscreen></iframe>`}
              className="font-mono text-xs"
            />
            <Button type="button" onClick={copyEmbedCode} size="sm">
              <span className="material-icons text-sm mr-1">content_copy</span>
              Copy
            </Button>
          </div>
          
          <div className="pt-4">
            <h4 className="text-sm font-semibold mb-2">Preview</h4>
            <div className="border border-border rounded-md p-2 bg-accent/30">
              <div className="relative pb-[56.25%] bg-black rounded overflow-hidden">
                <iframe
                  src={`/api/games/${game.gameDir}/${game.entryFile}`}
                  title={`${game.title} - Embed Preview`}
                  className="absolute inset-0 w-full h-full border-0"
                ></iframe>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
