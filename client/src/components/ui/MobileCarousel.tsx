import { useState, useRef, useEffect, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MobileCarouselProps {
  children: ReactNode[];
  className?: string;
  showDots?: boolean;
  showSwipeHint?: boolean;
  cardWidth?: "76vw" | "70vw" | "full";
}

interface CarouselDotsProps {
  count: number;
  active: number;
  className?: string;
}

function CarouselDots({ count, active, className }: CarouselDotsProps) {
  return (
    <div className={cn("flex justify-center gap-[6px] py-2", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "rounded-full transition-all duration-300 cursor-pointer",
            // 10px dots with !important
            "!w-[10px] !h-[10px] !min-w-0 !min-h-0",
            // Reset any default button/padding styles
            "!p-0 !m-0 !border-0 !outline-none",
            index === active
              ? "bg-amber-500 !scale-125"
              : "bg-white/30 hover:bg-white/40"
          )}
          onClick={() => scrollToIndex(index)}
          role="button"
          tabIndex={0}
          aria-label={`Go to slide ${index + 1}`}
        />
      ))}
    </div>
  );
}

export default function MobileCarousel({
  children,
  className,
  showDots = true,
  showSwipeHint = true,
  cardWidth = "76vw"
}: MobileCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showHint, setShowHint] = useState(showSwipeHint);
  const scrollRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  // Hide swipe hint after 2 seconds
  useEffect(() => {
    if (showHint) {
      const timer = setTimeout(() => {
        setShowHint(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showHint]);

  // Handle scroll to update current index
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      const scrollLeft = scrollContainer.scrollLeft;
      const containerWidth = scrollContainer.clientWidth;
      const newIndex = Math.round(scrollLeft / containerWidth);
      setCurrentIndex(Math.max(0, Math.min(newIndex, children.length - 1)));
    };

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, [children.length]);

  // Touch event handlers for swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && currentIndex < children.length - 1) {
      scrollToIndex(currentIndex + 1);
    }
    
    if (isRightSwipe && currentIndex > 0) {
      scrollToIndex(currentIndex - 1);
    }

    // Reset touch positions
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  const scrollToIndex = (index: number) => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const containerWidth = scrollContainer.clientWidth;
    scrollContainer.scrollTo({
      left: index * containerWidth,
      behavior: 'smooth'
    });
  };

  const getCardWidthClass = () => {
    switch (cardWidth) {
      case "76vw": return "w-[76vw]";
      case "70vw": return "w-[70vw]";
      case "full": return "w-full";
      default: return "w-[76vw]";
    }
  };

  return (
    <div className={cn("relative", className)}>
      {/* Swipe hint */}
      {showHint && (
        <div className={cn(
          "absolute top-4 left-1/2 transform -translate-x-1/2 z-10",
          "bg-black/60 backdrop-blur text-white text-xs px-3 py-1 rounded-full",
          "animate-pulse"
        )}>
          Swipe to browse
        </div>
      )}

      {/* Carousel container */}
      <div
        ref={scrollRef}
        className={cn(
          "flex overflow-x-auto gap-3 pb-2 px-3",
          "snap-x snap-mandatory scroll-smooth",
          "scrollbar-hide touch-pan-x",
          // Hide scrollbar
          "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        )}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children.map((child, index) => (
          <div 
            key={index}
            className={cn(
              "shrink-0 snap-start",
              index === 0 ? "w-[76vw]" : getCardWidthClass()
            )}
          >
            {child}
          </div>
        ))}
      </div>

      {/* Dots indicator */}
      {showDots && children.length > 1 && (
        <CarouselDots 
          count={children.length} 
          active={currentIndex}
        />
      )}
    </div>
  );
}