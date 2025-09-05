import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface HorizontalCardsProps {
  children: ReactNode;
  className?: string;
}

export default function HorizontalCards({ children, className }: HorizontalCardsProps) {
  return (
    <div className={cn(
      "relative overflow-hidden",
      className
    )}>
      <div className={cn(
        "overflow-x-auto flex gap-3 pb-2 px-1",
        "snap-x snap-mandatory scroll-smooth",
        // Hide scrollbar on mobile
        "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
        // Touch gestures
        "touch-pan-x"
      )}>
        {children}
        
        {/* Padding at the end for better UX */}
        <div className="w-3 shrink-0" aria-hidden="true" />
      </div>
    </div>
  );
}