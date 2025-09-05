import { useState } from "react";
import { cn } from "@/lib/utils";
import { Category } from "@/types";

interface CategoryChipsProps {
  categories: Category[];
  selectedCategory?: number | null;
  onCategorySelect?: (categoryId: number | null) => void;
  className?: string;
}

export default function CategoryChips({
  categories,
  selectedCategory,
  onCategorySelect,
  className
}: CategoryChipsProps) {
  
  const handleCategoryClick = (categoryId: number | null) => {
    onCategorySelect?.(categoryId);
  };

  return (
    <div className={cn("w-full", className)}>
      <ul className={cn(
        "flex gap-2 overflow-x-auto py-2 px-1 scrollbar-hide",
        "snap-x snap-proximity scroll-smooth",
        // Hide scrollbar on mobile
        "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      )}>
        {/* All Games chip */}
        <li className="snap-start shrink-0">
          <button
            onClick={() => handleCategoryClick(null)}
            className={cn(
              "px-3 py-1.5 rounded-full border text-[13px] font-medium transition-all duration-200",
              "touch-manipulation active:scale-95 whitespace-nowrap",
              "focus-visible:ring-2 focus-visible:ring-[var(--gc-accent)]/50 focus-visible:outline-none",
              selectedCategory === null
                ? "bg-[var(--gc-accent)]/15 border-[var(--gc-accent)]/30 text-[var(--gc-accent)] shadow-sm"
                : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20"
            )}
          >
            All Games
          </button>
        </li>
        
        {/* Category chips */}
        {categories?.map((category) => (
          <li key={category.id} className="snap-start shrink-0">
            <button
              onClick={() => handleCategoryClick(category.id)}
              className={cn(
                "px-3 py-1.5 rounded-full border text-[13px] font-medium transition-all duration-200",
                "touch-manipulation active:scale-95 whitespace-nowrap",
                "focus-visible:ring-2 focus-visible:ring-[var(--gc-accent)]/50 focus-visible:outline-none",
                selectedCategory === category.id
                  ? "bg-[var(--gc-accent)]/15 border-[var(--gc-accent)]/30 text-[var(--gc-accent)] shadow-sm"
                  : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20"
              )}
              data-active={selectedCategory === category.id}
            >
              {category.name}
            </button>
          </li>
        ))}
        
        {/* Padding at the end for better UX */}
        <li className="w-4 shrink-0" aria-hidden="true" />
      </ul>
    </div>
  );
}