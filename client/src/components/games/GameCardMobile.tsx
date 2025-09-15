import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Game } from "@/types";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { favorites } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { getThumbnailSrc } from "@/lib/getThumbnailSrc";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/AuthProvider";
import { ToastAction } from "@/components/ui/toast";
import { LazyImage } from "@/components/ui/lazy-image";

interface GameCardMobileProps {
  game: Game;
  priority?: boolean;
}

export default function GameCardMobile({ game, priority = false }: GameCardMobileProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  
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

  // Use the improved thumbnail helper function for consistent thumbnail URLs
  const thumbnailSrc = getThumbnailSrc(game);

  // Handle navigation with scrolling to top
  const handleNavigate = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    setLocation(`/games/${game.slug}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <article className={cn(
      "group relative overflow-hidden border transition-all duration-300",
      "bg-[var(--gc-card)] border-[var(--gc-border)] rounded-2xl",
      "active:scale-[0.98] touch-manipulation",
      "focus-within:ring-2 focus-within:ring-[var(--gc-accent)]/50"
    )}>
      <Link href={`/games/${game.slug}`} onClick={handleNavigate}>
        <div className="relative">
          {/* Game thumbnail */}
          <LazyImage
            src={thumbnailSrc && thumbnailSrc !== '/assets/logo.png' ? thumbnailSrc : '/assets/logo.png'}
            alt={game.title}
            ratio="4/3"
            priority={priority}
            className="w-full aspect-[4/3] object-cover"
            placeholderText={game.title}
          />
          
          {/* Gradient overlay on hover/focus */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300" />
          
          {/* Play button - overlay style */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-all duration-300 flex items-center justify-center">
            <button 
              className={cn(
                "bg-white/95 backdrop-blur-sm text-gray-900 px-4 py-1.5 rounded-full",
                "font-semibold text-xs shadow-lg border border-white/20",
                "hover:bg-white active:scale-95 transition-all duration-200",
                "focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:outline-none"
              )}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Navigate immediately
                window.location.href = `/games/${(game as any).gameDir}/index.html`;
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
            >
              Play Now
            </button>
          </div>
          
          {/* Favorite button */}
          <button 
            className={cn(
              "absolute top-2 right-2 grid place-items-center w-9 h-9 rounded-full transition-all duration-200",
              "bg-black/40 backdrop-blur border border-white/10",
              "hover:bg-black/60 active:scale-95 touch-manipulation",
              "focus-visible:ring-2 focus-visible:ring-[var(--gc-accent)]/50 focus-visible:outline-none",
              isFavorite ? "text-red-500" : "text-white/90"
            )}
            onClick={toggleFavorite}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <span className="text-base">
              {isFavorite ? '♥' : '♡'}
            </span>
          </button>

          {/* Featured badge */}
          {game.isFeatured && (
            <div className="absolute top-2 left-2 bg-gradient-to-r from-[var(--gc-good)] to-emerald-400 text-white text-[10px] font-bold py-1 px-2 rounded-full shadow-sm">
              New
            </div>
          )}
        </div>
      </Link>

      {/* Card content - title and meta */}
      <div className="px-3 py-2.5">
        <h3 className="text-[14px] leading-5 font-medium line-clamp-2 text-[var(--gc-text-1)] mb-1">
          {game.title}
        </h3>
        <div className="flex items-center justify-between text-[12px] text-[var(--gc-mute)]">
          <span>{game.category?.name || 'Game'}</span>
          <div className="flex items-center gap-1">
            {(() => {
              // Generate varied ratings based on game ID
              const ratings = [4.2, 4.5, 4.8, 4.0, 4.6, 4.3, 4.7, 4.9, 4.1, 4.4];
              const rating = ratings[game.id % ratings.length];
              const stars = Math.round(rating);
              const starDisplay = '★'.repeat(stars) + '☆'.repeat(5 - stars);
              return (
                <>
                  <span className="text-[var(--gc-warn)]">{starDisplay}</span>
                  <span className="text-[var(--gc-text-2)] font-medium">{rating}</span>
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </article>
  );
}