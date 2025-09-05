import { useState } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";

interface SearchPillMobileProps {
  className?: string;
  onFocus?: () => void;
  autoFocus?: boolean;
}

export default function SearchPillMobile({ 
  className, 
  onFocus, 
  autoFocus = false 
}: SearchPillMobileProps) {
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setLocation(`/?section=search&search=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleClear = () => {
    setQuery("");
  };

  return (
    <form onSubmit={handleSubmit} className={cn("w-full", className)}>
      <div className={cn(
        "relative flex items-center gap-2 rounded-full",
        "bg-white/5 border border-white/10 px-3 py-2",
        "focus-within:border-[var(--gc-accent)]/50 focus-within:bg-white/8",
        "transition-all duration-200"
      )}>
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        
        <input
          type="text"
          placeholder="Search games..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={onFocus}
          autoFocus={autoFocus}
          className={cn(
            "flex-1 bg-transparent text-[14px] text-slate-200 placeholder-slate-400",
            "focus:outline-none focus:placeholder-slate-500",
            "touch-manipulation"
          )}
        />
        
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className={cn(
              "p-1 rounded-full bg-white/10 text-slate-400 hover:text-slate-300 shrink-0",
              "transition-colors duration-200 touch-manipulation active:scale-90",
              "focus-visible:ring-2 focus-visible:ring-[var(--gc-accent)]/50 focus-visible:outline-none"
            )}
            aria-label="Clear search"
          >
            <X className="w-3 h-3" />
          </button>
        )}
        
        {/* Submit button (invisible but functional for keyboard users) */}
        <button 
          type="submit" 
          className="sr-only"
          tabIndex={-1}
        >
          Search
        </button>
      </div>
    </form>
  );
}