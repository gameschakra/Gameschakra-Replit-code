import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Game } from "@/types";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { LazyImage } from "@/components/ui/lazy-image";
import { Button } from "@/components/ui/button";
import { getThumbnailSrc } from "@/lib/getThumbnailSrc";

interface GameCardProps {
  game: Game;
  isCompact?: boolean;
  priority?: boolean;
}

export default function GameCard({ game, isCompact = false, priority = false }: GameCardProps) {
  const { toast } = useToast();
  
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

  const [, setLocation] = useLocation();

  // Handle navigation with scrolling to top
  const handleNavigate = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    setLocation(`/games/${game.slug}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="group relative rounded-2xl ring-1 ring-white/5 bg-slate-900/50 overflow-hidden
                    shadow-[0_8px_32px_-12px_rgba(2,6,23,0.8)]
                    transition-all duration-300 hover:-translate-y-0.5
                    hover:ring-cyan-300/30 hover:shadow-[0_12px_40px_-10px_rgba(56,189,248,0.35)]">
      <a href={`/games/${game.slug}`} onClick={handleNavigate} className="block focus-visible:ring-2 ring-amber-400/50 ring-offset-2 ring-offset-black rounded-lg outline-none">
        {/* IMAGE + overlay */}
        <div className="relative overflow-hidden aspect-[16/9]">
          {thumbnailSrc && thumbnailSrc !== '/assets/logo.png' ? (
            <img 
              src={thumbnailSrc} 
              alt={game.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
          ) : (
            <img 
              src="/assets/logo.png"
              alt={game.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
          )}
          
          <div className="absolute inset-x-0 bottom-0 h-24 pointer-events-none
                          bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Play Now Button - slides in from bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
            <button className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-semibold
                               bg-gradient-to-r from-amber-400 via-orange-400 to-pink-500 text-slate-900
                               shadow-[0_8px_24px_-6px_rgba(251,191,36,0.45)]
                               hover:shadow-[0_10px_32px_-6px_rgba(251,191,36,0.6)] transition-all w-full justify-center">
              ▶︎ Play Now
            </button>
          </div>

          {/* New or trending tag */}
          {game.isFeatured && (
            <div className="absolute top-2 left-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold py-1 px-2 rounded shadow-lg animate-pulse">
              New
            </div>
          )}
        </div>
        
        {/* CONTENT (no overlap ever) */}
        <div className="px-3 pt-2 pb-3">
          <h3 className="text-white/90 font-semibold text-[15px] leading-tight line-clamp-1">
            {game.title}
          </h3>

          <div className="mt-2 flex items-center justify-between">
            <span className="text-[12px] text-slate-300/90">
              {game.category?.name || "Game"}
            </span>
            <div className="flex items-center gap-1 text-amber-400">
              <span className="material-icons text-sm">star</span>
              <span className="text-xs text-slate-300/90">4.0</span>
            </div>
          </div>
        </div>
      </a>
      
      {/* Favorite button */}
      <button 
        className={`absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full ${isFavorite ? 'bg-white text-primary' : 'bg-white/80 text-gray-400 hover:text-primary'} transition-colors shadow-sm hover:shadow-md focus-visible:ring-2 ring-amber-400/50 ring-offset-2 ring-offset-black outline-none`}
        onClick={toggleFavorite}
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      >
        <span className="material-icons text-base">
          {isFavorite ? 'favorite' : 'favorite_border'}
        </span>
      </button>
    </div>
  );
}
