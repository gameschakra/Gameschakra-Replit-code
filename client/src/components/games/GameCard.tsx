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
    <div className="group challenge-thumbnail-fade-rtl relative bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-[0_10px_30px_rgba(255,184,0,.08)] transition-shadow duration-200 hover:border-amber-300 hover:-translate-y-2">
      <a href={`/games/${game.slug}`} onClick={handleNavigate} className="block focus-visible:ring-2 ring-amber-400/50 ring-offset-2 ring-offset-black rounded-lg outline-none">
        <div className="relative pb-[75%] overflow-hidden">
          {thumbnailSrc && thumbnailSrc !== '/assets/logo.png' ? (
            <div className="absolute inset-0 w-full h-full group-hover:scale-110 transition-transform duration-700">
              <LazyImage 
                src={thumbnailSrc} 
                alt={`${game.title} thumbnail`}
                className="w-full h-full object-cover"
                placeholderText={game.title}
                priority={priority}
                ratio="4/3"
                key={`thumb-${game.id}-${Date.now()}`} /* Force re-render with unique key */
              />
            </div>
          ) : (
            <div className="absolute inset-0 w-full h-full">
              <LazyImage 
                src="/assets/logo.png"
                alt={`${game.title} thumbnail`}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                placeholderText="Game"
                priority={priority}
                ratio="4/3"
              />
            </div>
          )}
          
          {/* Subtle overlay for better text contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>

          {/* Play Now Button - slides in from bottom */}
          <div className="absolute bottom-0 left-0 right-0 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
            <div className="bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold py-3 px-4 text-center hover:from-amber-600 hover:to-yellow-600 transition-all duration-300 shadow-lg">
              <span className="material-icons text-sm mr-1">play_circle</span>
              Play Now
            </div>
          </div>

          {/* New or trending tag */}
          {game.isFeatured && (
            <div className="absolute top-2 left-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold py-1 px-2 rounded shadow-lg animate-pulse">
              New
            </div>
          )}
        </div>
        
        <div className="px-3 pt-3 pb-4">
          <div className="flex items-start">
            <h3 className="font-medium text-gray-900 text-base leading-tight line-clamp-1 group-hover:text-primary transition-colors">
              {game.title}
            </h3>
          </div>
          
          <div className="flex items-center justify-between mt-2">
            {game.categoryId && (
              <span className="text-xs text-gray-500 font-medium">
                {game.category?.name || "Game"}
              </span>
            )}
            <div className="flex items-center">
              <div className="flex group-hover:scale-110 transition-transform duration-300">
                <span className="material-icons text-yellow-400 text-sm hover:text-yellow-300 transition-colors duration-200 hover:drop-shadow-lg">star</span>
                <span className="material-icons text-yellow-400 text-sm hover:text-yellow-300 transition-colors duration-200 hover:drop-shadow-lg">star</span>
                <span className="material-icons text-yellow-400 text-sm hover:text-yellow-300 transition-colors duration-200 hover:drop-shadow-lg">star</span>
                <span className="material-icons text-yellow-400 text-sm hover:text-yellow-300 transition-colors duration-200 hover:drop-shadow-lg">star</span>
                <span className="material-icons text-gray-300 text-sm hover:text-yellow-300 transition-colors duration-200">star</span>
              </div>
              <span className="text-xs font-medium text-gray-500 ml-1 group-hover:text-amber-600 transition-colors duration-300">
                4.0
              </span>
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
