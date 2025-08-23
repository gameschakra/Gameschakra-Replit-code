import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Game } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { PlaceholderImage } from "@/components/ui/placeholder-image";
import { getThumbnailSrc } from "@/lib/getThumbnailSrc";
import { useSwipeGesture } from "@/hooks/useSwipeGesture";

export default function FeaturedGameCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [totalSlides, setTotalSlides] = useState(3);
  const [isTransitioning, setIsTransitioning] = useState(false);
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
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : 0));
    setTimeout(() => setIsTransitioning(false), 500);
  };

  // Navigate to next slide
  const nextSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev < totalSlides - 1 ? prev + 1 : prev));
    setTimeout(() => setIsTransitioning(false), 500);
  };

  // Touch gesture support
  const swipeRef = useSwipeGesture<HTMLDivElement>({
    onSwipeLeft: nextSlide,
    onSwipeRight: prevSlide,
    threshold: 50,
    preventDefaultTouchmove: true
  });

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
          <Link href="/games" className="text-amber-400 hover:text-amber-300 inline-flex items-center gap-1">
            View All Games
            <span className="material-icons text-[16px]">arrow_forward</span>
          </Link>
        </div>
        
        {/* Carousel Container */}
        <div className="relative carousel-container" ref={swipeRef}>
          {/* Touch gesture overlay for mobile - pointer-events-none */}
          <div className="pointer-events-none absolute inset-0 z-10 touch-pan-y md:hidden" aria-hidden="true" />
          
          {/* Carousel Track */}
          <div 
            ref={carouselRef}
            className="flex transition-transform duration-500 ease-out carousel-track" 
            style={{ transform: `translateX(-${currentSlide * (100 / totalSlides)}%)` }}
          >
            {featuredGames.map((game) => {
              const href = `/games/${game.slug}`;
              
              return (
                <div key={game.id} className="min-w-full md:min-w-[50%] lg:min-w-[33.333%] px-3">
                  <div className="relative">
                    {/* Wrap the visual card with Link so entire card is tappable */}
                    <Link href={href} className="block group focus:outline-none">
                      <div className="relative rounded-xl overflow-hidden border border-border bg-black">
                        <img
                          src={getThumbnailSrc(game)}
                          alt={`${game.title} featured game`}
                          className="h-44 sm:h-56 w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                          loading="lazy"
                          draggable={false}
                        />

                        {/* Top/side gradient masks should NOT block taps */}
                        <div
                          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"
                          aria-hidden="true"
                        />

                        {/* Title & meta */}
                        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                          <h3 className="font-title font-semibold text-white text-base sm:text-lg drop-shadow">
                            {game.title}
                          </h3>
                          <div className="flex items-center mt-1 space-x-2">
                            <div className="flex items-center">
                              <span className="material-icons text-amber-500 text-sm">star</span>
                              <span className="material-icons text-amber-500 text-sm">star</span>
                              <span className="material-icons text-amber-500 text-sm">star</span>
                              <span className="material-icons text-amber-500 text-sm">star</span>
                              <span className="material-icons text-amber-500 text-sm">star_half</span>
                            </div>
                            <span className="text-xs text-gray-300">4.5</span>
                            <span className="text-xs text-gray-400 font-medium bg-gray-800/80 px-2 py-1 rounded-full ml-auto">
                              {game.category?.name || "Game"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>

                    {/* Play Now button – separate Link with higher z-index but DOES allow click */}
                    <div className="absolute bottom-3 right-3 z-10">
                      <Link href={href}>
                        <button
                          className="px-3 py-2 rounded-md bg-amber-500 text-black font-semibold shadow hover:bg-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                          aria-label={`Play ${game.title}`}
                        >
                          Play Now
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Navigation Arrows - Hidden on mobile for touch gestures */}
          <Button 
            variant="outline" 
            size="icon" 
            onClick={prevSlide}
            disabled={currentSlide === 0 || isTransitioning}
            className="hidden md:flex absolute top-1/2 left-2 transform -translate-y-1/2 bg-gray-900/70 backdrop-blur-sm rounded-full p-2 shadow-lg border border-gray-700 opacity-75 hover:opacity-100 transition-all duration-300 text-white hover:bg-gray-800/70 hover:text-white hover:border-amber-500/50 hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed focus-visible:ring-2 ring-amber-400/50 ring-offset-2 ring-offset-black outline-none"
          >
            <span className="material-icons">chevron_left</span>
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={nextSlide}
            disabled={currentSlide === totalSlides - 1 || isTransitioning}
            className="hidden md:flex absolute top-1/2 right-2 transform -translate-y-1/2 bg-gray-900/70 backdrop-blur-sm rounded-full p-2 shadow-lg border border-gray-700 opacity-75 hover:opacity-100 transition-all duration-300 text-white hover:bg-gray-800/70 hover:text-white hover:border-amber-500/50 hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed focus-visible:ring-2 ring-amber-400/50 ring-offset-2 ring-offset-black outline-none"
          >
            <span className="material-icons">chevron_right</span>
          </Button>
          
          {/* Dots - Show dots only if we have multiple slides */}
          {totalSlides > 1 && (
            <div className="flex justify-center mt-4 space-x-2">
              {[...Array(totalSlides)].map((_, index) => (
                <button 
                  key={index}
                  className={`w-3 h-3 md:w-2 md:h-2 rounded-full transition-all duration-300 focus-visible:ring-2 ring-amber-400/50 ring-offset-2 ring-offset-black outline-none ${
                    index === currentSlide 
                      ? 'bg-amber-500 opacity-80 scale-125 shadow-lg shadow-amber-500/50' 
                      : 'bg-gray-400 opacity-40 hover:bg-gray-300 hover:opacity-60 hover:scale-110'
                  }`}
                  onClick={() => {
                    if (!isTransitioning) {
                      setIsTransitioning(true);
                      setCurrentSlide(index);
                      setTimeout(() => setIsTransitioning(false), 500);
                    }
                  }}
                  disabled={isTransitioning}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
          
          {/* Mobile swipe indicator */}
          <div className="pointer-events-none md:hidden text-center mt-2 select-none" aria-hidden="true">
            <p className="text-xs text-gray-400 flex items-center justify-center">
              <span className="material-icons text-sm mr-1">swipe</span>
              Swipe to browse games
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
