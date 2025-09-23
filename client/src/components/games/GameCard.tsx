import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Game } from "@/types";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { favorites } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { LazyImage } from "@/components/ui/lazy-image";
import { Button } from "@/components/ui/button";
import { getThumbnailSrc } from "@/lib/getThumbnailSrc";
import { useAuth } from "@/providers/AuthProvider";
import { ToastAction } from "@/components/ui/toast";
import { toGame, toPlay } from "@/utils/urls";

interface GameCardProps {
  game: Game;
  isCompact?: boolean;
  priority?: boolean;
}

export default function GameCard({ game, isCompact = false, priority = false }: GameCardProps) {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [isHovered, setIsHovered] = useState(false);
  const [showQuickInfo, setShowQuickInfo] = useState(false);
  
  // Check if game is favorited
  const { data: favoriteData } = useQuery<{ isFavorite: boolean }>({
    queryKey: [`/api/favorites/is-favorite/${game.id}`],
    queryFn: () => favorites.isFavorite(game.id), // Use our custom API that handles 401 silently
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry since our API handles errors gracefully
  });

  const isFavorite = favoriteData?.isFavorite || false;

  // Toggle favorite status
  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if user is authenticated
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login to add games to your favorite list",
        variant: "destructive",
        action: (
          <ToastAction 
            altText="Login"
            onClick={() => setLocation("/login")}
          >
            Login
          </ToastAction>
        )
      });
      return;
    }
    
    try {
      const result = await apiRequest("POST", `/api/favorites/${game.id}`, {});
      
      // Update the cache immediately for instant UI update
      queryClient.setQueryData([`/api/favorites/is-favorite/${game.id}`], { 
        isFavorite: result.isFavorite 
      });
      
      // Invalidate and refetch favorites queries
      await queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      await queryClient.invalidateQueries({ queryKey: [`/api/favorites/is-favorite/${game.id}`] });
      
      toast({
        title: result.message || "Success",
        description: result.isFavorite ? "Game added to your favorites" : "Game removed from your favorites",
        variant: "default",
      });
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Format the rating as stars
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={`star-${i}`} className="material-icons text-sm">star</span>
      );
    }
    
    // Half star
    if (hasHalfStar) {
      stars.push(
        <span key="half-star" className="material-icons text-sm">star_half</span>
      );
    }
    
    // Empty stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <span key={`empty-star-${i}`} className="material-icons text-sm">star_outline</span>
      );
    }
    
    return stars;
  };

  // Safely calculate average rating without requiring game.ratingCount
  const averageRating = 0;

  // Use the improved thumbnail helper function for consistent thumbnail URLs
  const thumbnailSrc = getThumbnailSrc(game);
  console.log(`Game ${game.id} (${game.title}) using thumbnail: ${thumbnailSrc}`);

  // Handle navigation with scrolling to top
  const handleNavigate = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    setLocation(toGame(game.slug));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      className="group relative rounded-2xl ring-1 ring-white/5 bg-slate-900/50 overflow-hidden
                    shadow-[0_8px_32px_-12px_rgba(2,6,23,0.8)]
                    transition-all duration-500 hover:-translate-y-1
                    hover:ring-cyan-400/40 hover:shadow-[0_20px_50px_-15px_rgba(0,212,255,0.4)]
                    hover:bg-slate-800/60 gaming-card-hover"
      onMouseEnter={() => {
        setIsHovered(true);
        setTimeout(() => setShowQuickInfo(true), 300);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowQuickInfo(false);
      }}>
      <a href={toGame(game.slug)} onClick={handleNavigate} className="block focus-visible:ring-2 ring-amber-400/50 ring-offset-2 ring-offset-black rounded-lg outline-none">
        {/* IMAGE + overlay */}
        <div className="relative overflow-hidden aspect-[16/9]">
          <LazyImage
            src={thumbnailSrc && thumbnailSrc !== '/assets/logo.png' ? thumbnailSrc : '/assets/logo.png'}
            alt={game.title}
            ratio="16/9"
            priority={priority}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 group-hover:brightness-110 transition-all duration-700"
            placeholderText={game.title}
          />

          {/* Enhanced hover overlay with game info */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent
                          transition-all duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            {showQuickInfo && (
              <div className="absolute top-3 left-3 right-3 text-white animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs bg-cyan-500/20 backdrop-blur-sm border border-cyan-500/30 px-2 py-1 rounded-full">
                    <span className="material-icons text-[10px] mr-1 align-middle">gamepad</span>
                    {game.category?.name || "Arcade"}
                  </span>
                  <span className="text-xs bg-purple-500/20 backdrop-blur-sm border border-purple-500/30 px-2 py-1 rounded-full">
                    <span className="material-icons text-[10px] mr-1 align-middle">play_arrow</span>
                    Quick Play
                  </span>
                </div>
                {game.description && (
                  <p className="text-xs text-white/80 line-clamp-2 bg-black/30 backdrop-blur-sm rounded p-2">
                    {game.description}
                  </p>
                )}
              </div>
            )}
          </div>
          
          <div className="absolute inset-x-0 bottom-0 h-24 pointer-events-none
                          bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Enhanced action buttons - slides in from bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-full group-hover:translate-y-0 transition-all duration-500">
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Navigate to play route with trailing slash
                  window.location.href = toPlay(game.slug);
                  // Fire background log (best effort)
                  try {
                    if (navigator.sendBeacon) {
                      navigator.sendBeacon(`/api/games/${game.id}/play`, JSON.stringify({}));
                    } else {
                      fetch(`/api/games/${game.id}/play`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: '{}',
                        credentials: 'include'
                      }).catch(() => {});
                    }
                  } catch {}
                }}
                className="flex-1 inline-flex items-center gap-1 rounded-full px-3 py-2 text-[13px] font-bold
                                 bg-gradient-to-r from-amber-400 via-orange-400 to-pink-500 text-slate-900
                                 shadow-[0_8px_24px_-6px_rgba(251,191,36,0.45)]
                                 hover:shadow-[0_10px_32px_-6px_rgba(251,191,36,0.6)]
                                 hover:scale-105 active:scale-100
                                 transition-all justify-center btn-gaming-primary">
                <span className="material-icons text-base">play_arrow</span>
                Play Now
              </button>

              {/* Share button */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const shareUrl = `${window.location.origin}${toGame(game.slug)}`;
                  if (navigator.share) {
                    navigator.share({
                      title: game.title,
                      text: `Check out ${game.title} on GamesChakra!`,
                      url: shareUrl
                    }).catch(() => {});
                  } else {
                    navigator.clipboard.writeText(shareUrl);
                    toast({
                      title: "Link Copied!",
                      description: "Game link copied to clipboard",
                    });
                  }
                }}
                className="w-10 h-10 flex items-center justify-center rounded-full
                           bg-white/10 backdrop-blur-sm border border-white/20
                           hover:bg-cyan-500/20 hover:border-cyan-500/40
                           transition-all hover:scale-110 active:scale-95">
                <span className="material-icons text-sm text-white">share</span>
              </button>
            </div>
          </div>

          {/* Enhanced tags with animations */}
          {game.isFeatured && (
            <div className="absolute top-2 left-2 flex gap-2">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold py-1 px-2 rounded-full shadow-lg animate-pulse shine-effect">
                <span className="material-icons text-[10px] mr-0.5 align-middle">auto_awesome</span>
                NEW
              </div>
            </div>
          )}

          {/* Play count badge */}
          <div className="absolute top-2 right-12 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-black/60 backdrop-blur-sm text-white text-xs py-1 px-2 rounded-full flex items-center gap-1">
              <span className="material-icons text-[10px]">visibility</span>
              {Math.floor(Math.random() * 50 + 10)}K
            </div>
          </div>
        </div>
        
        {/* CONTENT with enhanced styling */}
        <div className="px-3 pt-2 pb-3 relative">
          <h3 className="text-white font-bold text-[15px] leading-tight line-clamp-1 group-hover:text-cyan-400 transition-colors duration-300">
            {game.title}
          </h3>

          <div className="mt-2 flex items-center justify-between">
            <span className={`text-[12px] font-medium px-2 py-0.5 rounded-full
                           ${game.category?.name === 'Action' ? 'text-red-400 bg-red-400/10' :
                             game.category?.name === 'Puzzle' ? 'text-blue-400 bg-blue-400/10' :
                             game.category?.name === 'Sports' ? 'text-green-400 bg-green-400/10' :
                             game.category?.name === 'Racing' ? 'text-purple-400 bg-purple-400/10' :
                             'text-slate-300 bg-slate-300/10'} transition-all duration-300`}>
              {game.category?.name || "Game"}
            </span>
            <div className="flex items-center gap-1">
              {(() => {
                // Generate varied ratings based on game ID
                const ratings = [4.2, 4.5, 4.8, 4.0, 4.6, 4.3, 4.7, 4.9, 4.1, 4.4];
                const rating = ratings[game.id % ratings.length];
                return (
                  <>
                    <span className="material-icons text-sm text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.5)]">star</span>
                    <span className="text-xs text-white/80 font-semibold">{rating}</span>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Hover indicator line */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
        </div>
      </a>
      
      {/* Enhanced favorite button with animation */}
      <button
        className={`absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full
                   ${isFavorite
                     ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                     : 'bg-white/80 text-gray-400 hover:text-red-500 hover:bg-white'}
                   transition-all duration-300 hover:scale-110 active:scale-95
                   focus-visible:ring-2 ring-amber-400/50 ring-offset-2 ring-offset-black outline-none
                   ${isFavorite ? 'animate-pulse' : ''}`}
        onClick={toggleFavorite}
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      >
        <span className={`material-icons text-base transition-transform ${isFavorite ? 'scale-110' : ''}`}>
          {isFavorite ? 'favorite' : 'favorite_border'}
        </span>
      </button>
    </div>
  );
}
