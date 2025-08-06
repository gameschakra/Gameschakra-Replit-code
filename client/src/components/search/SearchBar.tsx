import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Game } from "@/types";

type SuggestionType = {
  id: number;
  title: string;
  slug: string;
  thumbnailPath: string;
};

interface SearchBarProps {
  isMobile?: boolean;
  onClose?: () => void;
}

export default function SearchBar({ isMobile = false, onClose }: SearchBarProps) {
  const [location, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionType[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filterRating, setFilterRating] = useState<string>("");
  const [filterDate, setFilterDate] = useState<string>("");
  const [filterSort, setFilterSort] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Get games for suggestions
  const { data: games } = useQuery<Game[]>({
    queryKey: ["/api/games"],
    enabled: true,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Update suggestions based on search query
  useEffect(() => {
    if (searchQuery.trim().length >= 2 && games) {
      const filtered = games
        .filter((game) =>
          game.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 5)
        .map((game) => ({
          id: game.id,
          title: game.title,
          slug: game.slug,
          thumbnailPath: game.thumbnailPath || "",
        }));
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [searchQuery, games]);

  // Handle search form submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      let searchUrl = `/?search=${encodeURIComponent(searchQuery)}`;
      
      // Add filters to URL if they are set
      const filters = [];
      if (filterRating) filters.push(`rating=${filterRating}`);
      if (filterDate) filters.push(`date=${filterDate}`);
      if (filterSort) filters.push(`sort=${filterSort}`);
      
      if (filters.length > 0) {
        searchUrl += `&${filters.join("&")}`;
      }
      
      navigate(searchUrl);
      setShowSuggestions(false);
      if (onClose) onClose();
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (slug: string) => {
    navigate(`/games/${slug}`);
    setShowSuggestions(false);
    setSearchQuery("");
    if (onClose) onClose();
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current && 
        !popoverRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Reset filters
  const resetFilters = () => {
    setFilterRating("");
    setFilterDate("");
    setFilterSort("");
    setShowFilters(false);
  };

  return (
    <div className={cn("relative", isMobile ? "w-full" : "w-full max-w-md")}>
      <form onSubmit={handleSearch} className="relative flex">
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search games..."
            className="w-full pl-10 pr-4 py-2 bg-white/10 border-white/20 text-white focus:ring-2 focus:ring-amber-500/30 focus:outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowSuggestions(searchQuery.trim().length >= 2 && suggestions.length > 0)}
          />
          <span className="material-icons absolute left-3 top-2.5 text-white/50 text-sm">search</span>
        </div>
        
        <Popover open={showFilters} onOpenChange={setShowFilters}>
          <PopoverTrigger asChild>
            <Button 
              type="button"
              variant="ghost" 
              className="ml-1 px-2 text-white hover:bg-white/10 border border-white/20"
            >
              <span className="material-icons">tune</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[95vw] md:w-80 bg-gray-800 border border-gray-700 p-4 text-white">
            <div className="space-y-4">
              <h3 className="font-semibold text-amber-400">Advanced Filters</h3>
              
              <div className="space-y-2">
                <label className="text-sm text-gray-300">Sort By</label>
                <Select value={filterSort} onValueChange={setFilterSort}>
                  <SelectTrigger className="bg-gray-700 border-gray-600">
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600 max-w-[90vw]">
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="popular">Most Played</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm text-gray-300">Release Date</label>
                <Select value={filterDate} onValueChange={setFilterDate}>
                  <SelectTrigger className="bg-gray-700 border-gray-600">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600 max-w-[90vw]">
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm text-gray-300">Rating</label>
                <Select value={filterRating} onValueChange={setFilterRating}>
                  <SelectTrigger className="bg-gray-700 border-gray-600">
                    <SelectValue placeholder="Select rating" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600 max-w-[90vw]">
                    <SelectItem value="5">5 Stars</SelectItem>
                    <SelectItem value="4">4+ Stars</SelectItem>
                    <SelectItem value="3">3+ Stars</SelectItem>
                    <SelectItem value="all">All Ratings</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-between pt-2">
                <Button 
                  type="button"
                  variant="ghost" 
                  onClick={resetFilters}
                  className="text-gray-300 hover:text-white"
                >
                  Reset
                </Button>
                <Button 
                  type="button"
                  className="bg-amber-500 hover:bg-amber-600 text-black"
                  onClick={() => setShowFilters(false)}
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </form>
      
      {/* Auto-suggestions dropdown */}
      {showSuggestions && (
        <div 
          ref={popoverRef}
          className="absolute z-50 top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg overflow-hidden max-w-full"
        >
          <div className="p-1">
            {suggestions.map((suggestion) => (
              <div 
                key={suggestion.id}
                className="flex items-center p-2 hover:bg-gray-700 rounded cursor-pointer"
                onClick={() => handleSuggestionClick(suggestion.slug)}
              >
                {suggestion.thumbnailPath && (
                  <div className="w-10 h-10 bg-gray-700 rounded overflow-hidden mr-3 flex-shrink-0">
                    <img 
                      src={`/api/thumbnails/${suggestion.thumbnailPath}`} 
                      alt={suggestion.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-game.png';
                      }}
                    />
                  </div>
                )}
                <div className="flex-1 truncate">{suggestion.title}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}