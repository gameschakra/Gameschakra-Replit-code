import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Game } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { PlaceholderImage } from "@/components/ui/placeholder-image";
import { getThumbnailSrc } from "@/lib/getThumbnailSrc";

export default function FeaturedGameCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [totalSlides, setTotalSlides] = useState(3);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Get featured games
  const { data: featuredGames, isLoading } = useQuery<Game[]>({
    queryKey: ["/api/games/featured"],
  });

  // Update the number of slides based on screen size
  useEffect(() => {
    const updateTotalSlides = () => {
      if (window.innerWidth < 768) {
        setTotalSlides(featuredGames?.length || 3);
      } else if (window.innerWidth < 1024) {
        setTotalSlides(Math.ceil((featuredGames?.length || 3) / 2));
      } else {
        setTotalSlides(Math.ceil((featuredGames?.length || 3) / 3));
      }
    };

    updateTotalSlides();
    window.addEventListener("resize", updateTotalSlides);

    return () => {
      window.removeEventListener("resize", updateTotalSlides);
    };
  }, [featuredGames]);

  // Navigate to previous slide
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : 0));
  };

  // Navigate to next slide
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev < totalSlides - 1 ? prev + 1 : prev));
  };

  // Update the carousel position when current slide changes
  useEffect(() => {
    if (carouselRef.current) {
      let slideSize = 100;
      if (window.innerWidth >= 1024) {
        slideSize = 33.333;
      } else if (window.innerWidth >= 768) {
        slideSize = 50;
      }
      
      carouselRef.current.style.transform = `translateX(-${currentSlide * slideSize}%)`;
    }
  }, [currentSlide]);

  if (isLoading) {
    return (
      <section className="relative bg-gradient-to-r from-gray-900 to-black py-12 overflow-hidden">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-title font-bold text-white mb-8">Featured Games</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="bg-gray-800/50 rounded-lg overflow-hidden shadow-lg backdrop-blur-sm border border-gray-700">
                <Skeleton className="h-64 w-full bg-gray-700/50" />
                <div className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2 bg-gray-700/50" />
                  <Skeleton className="h-4 w-full mb-2 bg-gray-700/50" />
                  <Skeleton className="h-4 w-2/3 bg-gray-700/50" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!featuredGames || featuredGames.length === 0) {
    return null;
  }

  return (
    <section className="relative bg-gradient-to-r from-gray-900 to-black py-8 mb-4 overflow-hidden">
      <div className="absolute inset-0 bg-[url('/assets/hero-pattern.png')] opacity-5"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-title font-bold text-white">Featured Games</h2>
          <Link href="/games" className="text-amber-500 hover:text-amber-400 flex items-center text-sm font-medium">
            View All Games <span className="material-icons text-base ml-1">arrow_forward</span>
          </Link>
        </div>
        
        {/* Carousel Container */}
        <div className="relative">
          {/* Carousel Track */}
          <div 
            ref={carouselRef}
            className="flex transition-transform duration-500" 
            style={{ transform: `translateX(-${currentSlide * (100 / totalSlides)}%)` }}
          >
            {featuredGames.map((game) => (
              <div key={game.id} className="min-w-full md:min-w-[50%] lg:min-w-[33.333%] px-3">
                <Link href={`/games/${game.slug}`} className="block h-full">
                  <div className="bg-gradient-to-b from-gray-800/70 to-gray-900/70 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700/50 transform transition-transform hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(251,191,36,0.15)] h-full group">
                    <div className="relative pb-[56.25%]">
                      {/* Use the improved thumbnail helper for consistent image URLs */}
                      {(() => {
                        // Import the shared thumbnail helper
                        // Using the getThumbnailSrc helper for consistency across components
                        const thumbnailSrc = getThumbnailSrc(game);
                        
                        return thumbnailSrc ? (
                          <img 
                            src={thumbnailSrc} 
                            alt={`${game.title} featured game`} 
                            className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                            draggable={false}
                          />
                        ) : (
                          <div className="absolute inset-0 w-full h-full">
                            <PlaceholderImage 
                              text="Featured Game" 
                              className="w-full h-full"
                            />
                          </div>
                        );
                      })()}
                      
                      {/* GC_FIX: Play overlay with proper pointer events */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center pointer-events-none">
                        <div className="bg-amber-500 rounded-full p-4 transform scale-75 group-hover:scale-100 transition-transform duration-300 pointer-events-auto">
                          <span className="material-icons text-black text-3xl select-none">play_arrow</span>
                        </div>
                      </div>
                    
                    {/* Game title overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
                      <div className="p-4 text-white">
                        <h3 className="font-title font-bold text-xl">{game.title}</h3>
                        <div className="flex items-center mt-1 space-x-2">
                          <div className="flex items-center">
                            <span className="material-icons text-amber-500 text-sm">star</span>
                            <span className="material-icons text-amber-500 text-sm">star</span>
                            <span className="material-icons text-amber-500 text-sm">star</span>
                            <span className="material-icons text-amber-500 text-sm">star</span>
                            <span className="material-icons text-amber-500 text-sm">star_half</span>
                          </div>
                          <span className="text-xs text-gray-300">4.5</span>
                        </div>
                      </div>
                      </div>
                    </div>
                    <div className="p-4 flex justify-between items-center pointer-events-none">
                      <span className="text-xs text-gray-400 font-medium bg-gray-800/80 px-3 py-1 rounded-full">
                        {game.category?.name || "Game"}
                      </span>
                      {/* GC_FIX: Remove duplicate Play Now link - entire card is now clickable */}
                      <span className="text-amber-500 flex items-center text-sm font-medium">
                        Play Now <span className="material-icons text-base ml-1">arrow_forward</span>
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
          
          {/* Navigation Arrows */}
          <Button 
            variant="outline" 
            size="icon" 
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-gray-900/70 backdrop-blur-sm rounded-full p-2 shadow-lg border border-gray-700 opacity-75 hover:opacity-100 transition-opacity text-white hover:bg-gray-800/70 hover:text-white hover:border-amber-500/50"
          >
            <span className="material-icons">chevron_left</span>
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={nextSlide}
            disabled={currentSlide === totalSlides - 1}
            className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-gray-900/70 backdrop-blur-sm rounded-full p-2 shadow-lg border border-gray-700 opacity-75 hover:opacity-100 transition-opacity text-white hover:bg-gray-800/70 hover:text-white hover:border-amber-500/50"
          >
            <span className="material-icons">chevron_right</span>
          </Button>
          
          {/* Dots - Show dots only if we have multiple slides */}
          {totalSlides > 1 && (
            <div className="flex justify-center mt-4 space-x-2">
              {[...Array(totalSlides)].map((_, index) => (
                <button 
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${index === currentSlide ? 'bg-amber-500' : 'bg-gray-600 hover:bg-gray-500'}`}
                  onClick={() => setCurrentSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
