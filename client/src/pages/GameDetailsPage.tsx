import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Game } from "@/types";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { getThumbnailSrc } from "@/lib/getThumbnailSrc";
import GameCard from "@/components/games/GameCard";

export default function GameDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const [, setLocation] = useLocation();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPlayButton, setShowPlayButton] = useState(true);
  const gameFrameRef = useRef<HTMLIFrameElement>(null);
  const isMobile = window.innerWidth <= 768;

  // Fetch game details
  const { data: game, isLoading, error } = useQuery<Game>({
    queryKey: [`/api/games/${slug}`],
    staleTime: 1000 * 60, // 1 minute
  });
  
  // Fetch similar games
  const { data: similarGames = [], isLoading: similarLoading } = useQuery<Game[]>({
    queryKey: ['/api/games', { 
      limit: 3, 
      categoryId: game?.categoryId, 
      excludeId: game?.id 
    }],
    enabled: !!game?.categoryId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch user favorites status
  const { data: favoriteData } = useQuery<{ isFavorite: boolean }>({
    queryKey: [game ? `/api/favorites/is-favorite/${game.id}` : null],
    enabled: !!game,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const isFavorite = favoriteData?.isFavorite || false;

  // Handle play game - track analytics and enable fullscreen on mobile
  const handlePlayGame = async () => {
    if (!game) return;
    
    // Record play count
    try {
      await apiRequest("POST", `/api/games/${game.id}/play`, {});
      setShowPlayButton(false);
      
      // If on mobile, automatically go fullscreen after a short delay
      if (isMobile && gameFrameRef.current) {
        // Small delay to ensure iframe is loaded
        setTimeout(() => {
          try {
            if (gameFrameRef.current) {
              gameFrameRef.current.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
              });
              setIsFullscreen(true);
            }
          } catch (err) {
            console.error("Fullscreen error:", err);
          }
        }, 500);
      }
    } catch (error) {
      console.error("Error recording play:", error);
    }
  };

  // Toggle favorite status
  const toggleFavorite = async () => {
    if (!game) return;
    
    try {
      const response = await apiRequest("POST", `/api/favorites/${game.id}`, {});
      const result = await response.json();
      
      // Invalidate favorites query
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      queryClient.invalidateQueries({ queryKey: [`/api/favorites/is-favorite/${game.id}`] });
      
      toast({
        title: result.message,
        description: result.isFavorite ? "Game added to your favorites" : "Game removed from your favorites",
        variant: "default",
      });
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast({
        title: "Error",
        description: "Please sign in to add favorites",
        variant: "destructive",
      });
    }
  };

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    } else if (gameFrameRef.current) {
      gameFrameRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    }
  };

  // Detect fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Auto fullscreen on mobile when game starts
  useEffect(() => {
    if (isMobile && !showPlayButton && gameFrameRef.current) {
      // Small delay to ensure the iframe is fully loaded
      const timer = setTimeout(() => {
        try {
          if (document.fullscreenElement) return; // Already in fullscreen mode
          
          // Try to request fullscreen on the iframe first
          gameFrameRef.current?.requestFullscreen().catch(err => {
            console.error(`Error attempting iframe fullscreen: ${err}`);
            
            // If that fails, try to make the document fullscreen
            try {
              document.documentElement.requestFullscreen();
            } catch (docErr) {
              console.error(`Error attempting document fullscreen: ${docErr}`);
            }
          });
          
          setIsFullscreen(true);
        } catch (err) {
          console.error(`Error attempting to enable fullscreen: ${err}`);
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isMobile, showPlayButton]);

  // Handle back to home
  const handleBack = () => {
    setLocation("/");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-2/3">
            <Skeleton className="w-full aspect-video rounded-lg" />
          </div>
          <div className="w-full md:w-1/3">
            <Skeleton className="h-10 w-3/4 mb-4" />
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-6 w-2/3 mb-6" />
            <div className="flex gap-2 mb-6">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !game) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 text-center">
          <span className="material-icons text-5xl text-amber-500 mb-4">error_outline</span>
          <h2 className="text-2xl font-title text-amber-400 mb-4">Game Not Found</h2>
          <p className="text-gray-400 mb-6">
            The game you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={handleBack} className="bg-amber-500 hover:bg-amber-600 text-black">
            Back to Games
          </Button>
        </div>
      </div>
    );
  }

  // Format date for display
  const formattedDate = new Date(game.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Get the correct iframe src
  const iframeSrc = game.entryFile 
    ? `/api/games/${game.gameDir}/${game.entryFile}`
    : "";

  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 md:py-8">
      {/* Back button and actions - Mobile & Desktop */}
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <Button 
          variant="ghost" 
          className="flex items-center text-gray-300 hover:text-amber-500" 
          onClick={handleBack}
        >
          <span className="material-icons mr-2">arrow_back</span>
          Back
        </Button>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-300 hover:text-amber-500"
            onClick={toggleFavorite}
          >
            <span className="material-icons">
              {isFavorite ? 'favorite' : 'favorite_border'}
            </span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-300 hover:text-amber-500"
            onClick={() => {
              navigator.share({
                title: game.title,
                text: `Check out ${game.title} on GamesChakra!`,
                url: window.location.href,
              }).catch(err => {
                console.error('Error sharing:', err);
              });
            }}
          >
            <span className="material-icons">share</span>
          </Button>
        </div>
      </div>
      
      {/* Main Content - Mobile */}
      <div className="block md:hidden">
        <h1 className="text-2xl font-title font-bold text-white mb-2">{game.title}</h1>
        
        {/* Game View (Mobile) */}
        <div className="relative w-full aspect-[16/9] bg-gray-900 rounded-lg overflow-hidden mb-4">
          {showPlayButton ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-transparent to-black/50">
              <div className="text-center p-4 relative z-10">
                <Button 
                  className="w-36 h-36 rounded-full bg-amber-500 hover:bg-amber-600 text-black font-bold shadow-lg hover:shadow-xl transition-all"
                  onClick={handlePlayGame}
                >
                  <span className="material-icons text-5xl">play_arrow</span>
                </Button>
                <p className="text-white mt-4 text-lg font-medium">Tap to Play</p>
              </div>
              <img 
                src={getThumbnailSrc(game)} 
                alt={game.title}
                className="absolute inset-0 w-full h-full object-cover opacity-60"
              />
            </div>
          ) : (
            <>
              <iframe
                ref={gameFrameRef}
                src={iframeSrc}
                className="w-full h-full border-0"
                title={game.title}
                allow="fullscreen; accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                loading="lazy"
              />
              <Button
                className="absolute bottom-4 right-4 bg-black/50 hover:bg-black/70 rounded-full w-10 h-10 p-0 flex items-center justify-center"
                onClick={toggleFullscreen}
              >
                <span className="material-icons text-white">
                  {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
                </span>
              </Button>
            </>
          )}
        </div>
        
        {/* Game Info */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 mb-4">
            {game.category && (
              <Badge variant="outline" className="border-amber-500 text-amber-400">
                {game.category.name}
              </Badge>
            )}
            <Badge className="bg-amber-500/20 text-amber-400">
              {game.playCount || 0} Plays
            </Badge>
            <Badge variant="outline" className="border-gray-600 text-gray-400">
              Added {formattedDate}
            </Badge>
          </div>
          
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="bg-gray-800 border border-gray-700">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="instructions">How to Play</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="mt-4">
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="pt-4">
                  <p className="text-gray-300">{game.description || "No description available."}</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="instructions" className="mt-4">
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="pt-4">
                  <p className="text-gray-300">{game.instructions || "No instructions available."}</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="details" className="mt-4">
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="pt-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Developer:</span>
                      <span className="text-gray-300">{game.developer || "Unknown"}</span>
                    </div>
                    <Separator className="bg-gray-700" />
                    <div className="flex justify-between">
                      <span className="text-gray-400">Added:</span>
                      <span className="text-gray-300">{formattedDate}</span>
                    </div>
                    <Separator className="bg-gray-700" />
                    <div className="flex justify-between">
                      <span className="text-gray-400">Plays:</span>
                      <span className="text-gray-300">{game.playCount || 0}</span>
                    </div>
                    <Separator className="bg-gray-700" />
                    <div className="flex justify-between">
                      <span className="text-gray-400">Category:</span>
                      <span className="text-gray-300">{game.category?.name || "Uncategorized"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Main Content - Desktop */}
      <div className="hidden md:flex flex-col lg:flex-row gap-8">
        {/* Game View (Desktop) */}
        <div className="w-full lg:w-2/3">
          <div className="relative w-full aspect-[16/9] bg-gray-900 rounded-lg overflow-hidden">
            {showPlayButton ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-transparent to-black/50">
                <div className="text-center p-4 relative z-10">
                  <Button 
                    className="w-36 h-36 rounded-full bg-amber-500 hover:bg-amber-600 text-black font-bold shadow-lg hover:shadow-xl transition-all"
                    onClick={handlePlayGame}
                  >
                    <span className="material-icons text-5xl">play_arrow</span>
                  </Button>
                  <p className="text-white mt-4 text-lg font-medium">Click to Play</p>
                </div>
                <img 
                  src={getThumbnailSrc(game)} 
                  alt={game.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-60"
                />
              </div>
            ) : (
              <>
                <iframe
                  ref={gameFrameRef}
                  src={iframeSrc}
                  className="w-full h-full border-0"
                  title={game.title}
                  allow="fullscreen; accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                  loading="lazy"
                />
                <Button
                  className="absolute bottom-4 right-4 bg-black/50 hover:bg-black/70 rounded-full w-10 h-10 p-0 flex items-center justify-center"
                  onClick={toggleFullscreen}
                >
                  <span className="material-icons text-white">
                    {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
                  </span>
                </Button>
              </>
            )}
          </div>
          
          {/* Similar Games - Desktop Only */}
          <div className="mt-8">
            <h2 className="text-xl font-title font-bold text-white mb-4">Similar Games</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
              {similarLoading ? (
                <>
                  <div className="aspect-[4/3] bg-gray-800 rounded-lg animate-pulse"></div>
                  <div className="aspect-[4/3] bg-gray-800 rounded-lg animate-pulse"></div>
                  <div className="aspect-[4/3] bg-gray-800 rounded-lg animate-pulse"></div>
                </>
              ) : similarGames.length > 0 ? (
                similarGames.map((similarGame) => (
                  <GameCard key={similarGame.id} game={similarGame} />
                ))
              ) : (
                <div className="col-span-3 py-4 text-center text-gray-400">
                  No similar games found
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Game Info - Desktop */}
        <div className="w-full lg:w-1/3">
          <h1 className="text-2xl font-title font-bold text-white mb-2">{game.title}</h1>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {game.category && (
              <Badge variant="outline" className="border-amber-500 text-amber-400">
                {game.category.name}
              </Badge>
            )}
            <Badge className="bg-amber-500/20 text-amber-400">
              {game.playCount || 0} Plays
            </Badge>
          </div>
          
          <div className="flex items-center gap-4 mb-6">
            <Button 
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-medium"
              onClick={toggleFavorite}
            >
              <span className="material-icons mr-2">
                {isFavorite ? 'favorite' : 'favorite_border'}
              </span>
              {isFavorite ? 'Favorited' : 'Add to Favorites'}
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center border-gray-600 text-gray-300 hover:text-amber-500 hover:border-amber-500"
              onClick={() => {
                navigator.share({
                  title: game.title,
                  text: `Check out ${game.title} on GamesChakra!`,
                  url: window.location.href,
                }).catch(err => {
                  console.error('Error sharing:', err);
                });
              }}
            >
              <span className="material-icons mr-2">share</span>
              Share
            </Button>
          </div>
          
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="bg-gray-800 border border-gray-700">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="instructions">How to Play</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="mt-4">
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="pt-6">
                  <p className="text-gray-300">{game.description || "No description available."}</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="instructions" className="mt-4">
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="pt-6">
                  <p className="text-gray-300">{game.instructions || "No instructions available."}</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="details" className="mt-4">
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="pt-6">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Developer:</span>
                      <span className="text-gray-300">{game.developer || "Unknown"}</span>
                    </div>
                    <Separator className="bg-gray-700" />
                    <div className="flex justify-between">
                      <span className="text-gray-400">Added:</span>
                      <span className="text-gray-300">{formattedDate}</span>
                    </div>
                    <Separator className="bg-gray-700" />
                    <div className="flex justify-between">
                      <span className="text-gray-400">Plays:</span>
                      <span className="text-gray-300">{game.playCount || 0}</span>
                    </div>
                    <Separator className="bg-gray-700" />
                    <div className="flex justify-between">
                      <span className="text-gray-400">Category:</span>
                      <span className="text-gray-300">{game.category?.name || "Uncategorized"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          {/* Developer Info Card */}
          <Card className="mt-6 bg-gray-800 border border-gray-700">
            <CardContent className="pt-6">
              <h3 className="font-medium text-lg text-white mb-2">About the Developer</h3>
              <p className="text-gray-300 text-sm mb-4">
                {game.developer ? `${game.developer} is the creator of this game.` : "No developer information available."}
              </p>
              {game.developer && (
                <Button variant="outline" className="w-full text-gray-300 border-gray-600 hover:text-amber-500 hover:border-amber-500">
                  <span className="material-icons mr-2 text-sm">person</span>
                  View All Games by {game.developer}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}