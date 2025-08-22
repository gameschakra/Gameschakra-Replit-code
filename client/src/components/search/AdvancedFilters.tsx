// SEARCH_REFACTOR: Advanced Filters component that works with /search page
import { useState } from "react";
import { useLocation, useSearch } from "wouter";
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

export default function AdvancedFilters() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  
  const [showFilters, setShowFilters] = useState(false);
  const [filterSort, setFilterSort] = useState(params.get("sort") || "");
  const [filterDate, setFilterDate] = useState(params.get("date") || "");
  const [filterRating, setFilterRating] = useState(params.get("rating") || "");

  // Reset filters
  const resetFilters = () => {
    setFilterSort("");
    setFilterDate("");
    setFilterRating("");
  };

  // Apply filters and navigate to search page
  const applyFilters = () => {
    const currentParams = new URLSearchParams(search);
    const q = currentParams.get("q") || "";
    
    const newParams = new URLSearchParams();
    if (q) newParams.set("q", q);
    if (filterSort) newParams.set("sort", filterSort);
    if (filterDate) newParams.set("date", filterDate);
    if (filterRating) newParams.set("rating", filterRating);
    
    navigate(`/search?${newParams.toString()}`);
    setShowFilters(false);
  };

  return (
    <Popover open={showFilters} onOpenChange={setShowFilters}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          className="px-3 text-white hover:bg-white/10 border border-white/20 h-10 w-10 flex items-center justify-center shrink-0"
        >
          <span className="material-icons text-xl">tune</span>
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
              onClick={applyFilters}
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}