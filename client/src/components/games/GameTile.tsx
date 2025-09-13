import { useState } from "react";
import { Link } from "wouter";
import { Game } from "@/types";
import { cn } from "@/lib/utils";
import { LazyImage } from "@/components/ui/lazy-image";
import { getThumbnailSrc } from "@/lib/getThumbnailSrc";
import { Play } from "lucide-react";

interface GameTileProps {
  game: Game;
  size?: "small" | "medium" | "hero";
  badge?: "updated" | "top-rated" | "new";
  className?: string;
}

export function GameTile({ game, size = "small", badge, className }: GameTileProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const sizeClasses = {
    small: "aspect-[4/3]",
    medium: "aspect-[16/9]", 
    hero: "aspect-[16/7]"
  };
  
  const badgeClasses = {
    updated: "bg-gradient-to-r from-orange-500 to-red-500",
    "top-rated": "bg-gradient-to-r from-green-500 to-cyan-500", 
    new: "bg-gradient-to-r from-purple-500 to-fuchsia-500"
  };
  
  const badgeLabels = {
    updated: "Updated",
    "top-rated": "Top Rated",
    new: "New"
  };
  
  const thumbnailSrc = getThumbnailSrc(game);

  return (
    <Link href={`/games/${game.slug}`}>
      <div className={cn(
        "group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300",
        "hover:scale-[1.02] hover:shadow-[0_12px_40px_-10px_rgba(56,189,248,0.4)]",
        sizeClasses[size],
        className
      )}>
        {/* Game Image */}
        <div className="absolute inset-0">
          <LazyImage
            src={thumbnailSrc}
            alt={game.title}
            className={cn(
              "w-full h-full object-cover transition-all duration-700",
              "group-hover:scale-105",
              !imageLoaded && "opacity-0"
            )}
            onLoad={() => setImageLoaded(true)}
            placeholderText={game.title}
          />
          
          {/* Shimmer loading effect */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 animate-pulse" />
          )}
        </div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Glass Panel */}
        <div className={cn(
          "absolute inset-0 bg-white/6 backdrop-blur-md border border-white/10",
          "opacity-0 group-hover:opacity-100 transition-all duration-300"
        )} />
        
        {/* Badge */}
        {badge && (
          <div className={cn(
            "absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-semibold text-white shadow-lg",
            badgeClasses[badge]
          )}>
            {badgeLabels[badge]}
          </div>
        )}
        
        {/* Play Button */}
        <div className={cn(
          "absolute inset-0 flex items-center justify-center",
          "opacity-0 group-hover:opacity-100 transition-all duration-300"
        )}>
          <div className={cn(
            "flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full",
            "text-slate-900 font-semibold text-sm shadow-lg",
            "transform translate-y-2 group-hover:translate-y-0 transition-all duration-300"
          )}>
            <Play className="w-4 h-4 fill-current" />
            Play
          </div>
        </div>
        
        {/* Game Title */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className={cn(
            "text-white font-semibold leading-tight",
            size === "hero" ? "text-2xl md:text-3xl" : size === "medium" ? "text-lg" : "text-base",
            "drop-shadow-lg"
          )}>
            {game.title}
          </h3>
          {size !== "small" && (
            <p className="text-white/80 text-sm mt-1 line-clamp-2 drop-shadow-md">
              {game.description || `Play ${game.title} online for free`}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}