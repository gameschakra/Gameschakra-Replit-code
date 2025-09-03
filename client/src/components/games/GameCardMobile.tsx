import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Game } from "@/types";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { getThumbnailSrc } from "@/lib/getThumbnailSrc";
import { cn } from "@/lib/utils";

interface GameCardMobileProps {
  game: Game;
  priority?: boolean;
}

export default function GameCardMobile({ game, priority = false }: GameCardMobileProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // Check if game is favorited
  const { data: favoriteData } = useQuery<{ isFavorite: boolean }>({
    queryKey: [`/api/favorites/is-favorite/${game.id}`],
    enabled: false, // Don't auto-fetch, requires auth
  });

  const isFavorite = favoriteData?.isFavorite || false;

  // Toggle favorite status
  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
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
          <img 
            src={thumbnailSrc && thumbnailSrc !== '/assets/logo.png' ? thumbnailSrc : '/assets/logo.png'} 
            alt={game.title}
            className="w-full aspect-[4/3] object-cover"
            loading={priority ? "eager" : "lazy"}
          />
          
          {/* Gradient overlay on hover/focus */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300" />
          
          {/* Play Now button - slides up on hover/focus */}
          <button 
            className={cn(
              "absolute left-3 right-3 bottom-3 h-6 rounded-full font-medium shadow-lg text-xs",
              "bg-gradient-to-r from-yellow-300 via-orange-400 to-pink-500 text-slate-900",
              "transform translate-y-3 group-hover:translate-y-0 group-focus-within:translate-y-0",
              "transition-transform duration-300 active:scale-95",
              "focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:outline-none"
            )}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setLocation(`/games/${game.slug}`);
            }}
          >
            Play Now
          </button>
          
          {/* Favorite button */}
          <button 
            className={cn(
              "absolute top-2 right-2 grid place-items-center w-9 h-9 rounded-full transition-all duration-200",
              "bg-black/40 backdrop-blur border border-white/10 text-white/90",
              "hover:bg-black/60 active:scale-95 touch-manipulation",
              "focus-visible:ring-2 focus-visible:ring-[var(--gc-accent)]/50 focus-visible:outline-none"
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
            <span className="text-[var(--gc-warn)]">★★★★☆</span>
            <span className="text-[var(--gc-text-2)] font-medium">4.0</span>
          </div>
        </div>
      </div>
    </article>
  );
}