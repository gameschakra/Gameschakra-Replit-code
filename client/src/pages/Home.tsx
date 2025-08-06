import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Category, Game, Challenge } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import FeaturedGameCarousel from "@/components/games/FeaturedGameCarousel";
import GameCard from "@/components/games/GameCard";
import ActiveChallengeCard from "@/components/challenges/ActiveChallengeCard";
import UpcomingChallengeCard from "@/components/challenges/UpcomingChallengeCard";
import AdSense from "@/components/ads/AdSense";
import TestAdButton from "@/components/ads/TestAdButton";

export default function Home() {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  // Parse URL params
  useEffect(() => {
    const params = new URLSearchParams(location.split("?")[1]);
    const category = params.get("category");
    const section = params.get("section");
    const search = params.get("search");

    if (search) {
      setSearchQuery(search);
      setActiveSection("search");
    } else if (section) {
      setActiveSection(section);
    } else if (category) {
      setActiveSection("categories");
      // If category is a number, set it as selected category
      if (category !== "all" && !isNaN(Number(category))) {
        setSelectedCategory(Number(category));
      }
    }
  }, [location]);

  // Get categories for sidebar
  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Get featured games
  const { data: featuredGames, isLoading: featuredGamesLoading } = useQuery<Game[]>({
    queryKey: ["/api/games/featured", { limit: 100 }], // बढ़ाया गया limit
  });

  // Get games based on active section and filters
  const {
    data: games,
    isLoading: gamesLoading,
    refetch: refetchGames,
  } = useQuery<Game[]>({
    queryKey: [
      "/api/games",
      {
        limit: 100, // बढ़ाया गया limit ताकि सभी गेम्स दिखाई दें
        categoryId: selectedCategory,
        status: "published",
        search: activeSection === "search" ? searchQuery : undefined,
      },
    ],
  });

  // Get popular games
  const { data: popularGames, isLoading: popularGamesLoading } = useQuery<Game[]>({
    queryKey: ["/api/games/popular", { limit: 100 }], // बढ़ाया गया limit
    enabled: activeSection === "popular" || activeSection === "all",
  });

  // Get user's favorites
  const { data: favorites, isLoading: favoritesLoading } = useQuery({
    queryKey: ["/api/favorites"],
    enabled: activeSection === "favorites",
  });

  // Get user's recently played games
  const { data: recentlyPlayed, isLoading: recentlyPlayedLoading } = useQuery({
    queryKey: ["/api/recently-played", { limit: 100 }], // बढ़ाया गया limit
    enabled: activeSection === "recent",
  });
  
  // Get challenges
  const { data: activeChallenges, isLoading: activeChallengesLoading } = useQuery<Challenge[]>({
    queryKey: ["/api/challenges", { status: "active" }],
    enabled: activeSection === "active-challenges" || activeSection === "all",
  });
  
  const { data: upcomingChallenges, isLoading: upcomingChallengesLoading } = useQuery<Challenge[]>({
    queryKey: ["/api/challenges", { status: "upcoming" }],
    enabled: activeSection === "upcoming-challenges" || activeSection === "all",
  });
  
  const { data: completedChallenges, isLoading: completedChallengesLoading } = useQuery<Challenge[]>({
    queryKey: ["/api/challenges", { status: "completed" }],
    enabled: activeSection === "completed-challenges" || activeSection === "all",
  });

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActiveSection("search");
      refetchGames();
    }
  };

  // Render loading grid
  const renderLoadingGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <Skeleton className="w-full aspect-[4/3]" />
          <div className="p-4">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );

  // Get current games to display based on active section
  const getCurrentGames = () => {
    if (activeSection === "popular") return popularGames || [];
    if (activeSection === "featured") return featuredGames || [];
    if (activeSection === "favorites") {
      return Array.isArray(favorites) ? favorites.map((f: any) => f.game) : [];
    }
    if (activeSection === "recent") {
      return Array.isArray(recentlyPlayed) ? recentlyPlayed.map((r: any) => r.game) : [];
    }
    return games || []; // Default for all, categories, and search
  };

  // Check if current section is loading
  const isCurrentSectionLoading = () => {
    if (activeSection === "popular") return popularGamesLoading;
    if (activeSection === "featured") return featuredGamesLoading;
    if (activeSection === "favorites") return favoritesLoading;
    if (activeSection === "recent") return recentlyPlayedLoading;
    if (activeSection === "active-challenges") return activeChallengesLoading;
    if (activeSection === "upcoming-challenges") return upcomingChallengesLoading;
    if (activeSection === "completed-challenges") return completedChallengesLoading;
    return gamesLoading;
  };
  
  // Get current challenges based on active section
  const getCurrentChallenges = () => {
    if (activeSection === "active-challenges") return activeChallenges || [];
    if (activeSection === "upcoming-challenges") return upcomingChallenges || [];
    if (activeSection === "completed-challenges") return completedChallenges || [];
    return [];
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Calculate countdown for upcoming challenges
  const calculateCountdown = (startDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const diff = start.getTime() - now.getTime();
    
    if (diff <= 0) return "Starting soon";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''}, ${hours} hour${hours > 1 ? 's' : ''}`;
    } else {
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours} hour${hours > 1 ? 's' : ''}, ${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
  };
  
  // Calculate progress for active challenges
  const calculateProgress = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const totalDuration = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    
    if (elapsed <= 0) return 0;
    if (elapsed >= totalDuration) return 100;
    
    return Math.round((elapsed / totalDuration) * 100);
  };

  // Get current section title
  const getSectionTitle = () => {
    switch (activeSection) {
      case "all": return "All Games";
      case "popular": return "Popular Games";
      case "featured": return "Featured Games";
      case "new": return "New Games";
      case "trending": return "Trending Games";
      case "multiplayer": return "Multiplayer Games";
      case "favorites": return "My Favorites";
      case "recent": return "Recently Played";
      case "challenges": return "Community Challenges";
      case "active-challenges": return "Active Challenges";
      case "upcoming-challenges": return "Upcoming Challenges";
      case "completed-challenges": return "Completed Challenges";
      case "search": return `Search Results: "${searchQuery}"`;
      case "categories": 
        if (selectedCategory && categories) {
          const category = categories.find(c => c.id === selectedCategory);
          return category ? category.name : "Categories";
        }
        return "All Categories";
      default: return "Games";
    }
  };

  return (
    <section className="py-0 bg-background">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Featured carousel only on homepage */}
        {activeSection === "all" && (
          <>
            <FeaturedGameCarousel />
            
            {/* AdSense Display Ad - Only rendered when ads are available */}
            {false && (
              <AdSense 
                adClient="ca-pub-2067900913632539"
                adSlot="5962072398"
                responsive={true}
                adFormat="auto"
                className="w-full"
              />
            )}
            
            {/* Challenges Row - Active and Upcoming Side by Side */}
            {((activeChallenges && activeChallenges.length > 0) || (upcomingChallenges && upcomingChallenges.length > 0)) && (
              <div className="mt-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Active Challenges Section - Left Side */}
                  <div className={`${upcomingChallenges && upcomingChallenges.length > 0 ? 'lg:w-1/2' : 'w-full'}`}>
                    {activeChallenges && activeChallenges.length > 0 && (
                      <>
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="text-2xl font-title font-bold text-white flex items-center">
                            <span className="material-icons text-amber-500 mr-2">emoji_events</span>
                            Active Challenges
                          </h2>
                          <Link
                            href="/?section=active-challenges"
                            className="text-amber-500 hover:text-amber-400 text-sm font-medium flex items-center"
                            onClick={(e) => {e.preventDefault(); setActiveSection('active-challenges');}}
                          >
                            View All
                            <span className="material-icons ml-1 text-sm">arrow_forward</span>
                          </Link>
                        </div>
                        
                        {/* Horizontal scrollable active challenges */}
                        <div className="relative overflow-hidden">
                          <div className="overflow-x-auto flex space-x-4 pb-2 -mx-1 px-1">
                            {activeChallenges
                              .filter(challenge => challenge.status === "active")
                              .map((challenge) => (
                                <ActiveChallengeCard 
                                  key={challenge.id} 
                                  challenge={challenge as any} 
                                  calculateProgress={calculateProgress}
                                  calculateCountdown={calculateCountdown}
                                />
                            ))}
                            
                            {/* Navigation arrows for active challenges */}
                            {activeChallenges.length > 1 && (
                              <>
                                <div className="hidden md:flex absolute left-0 top-1/2 transform -translate-y-1/2 z-10">
                                  <Button variant="outline" size="icon" className="rounded-full bg-white/80 shadow-md">
                                    <span className="material-icons">chevron_left</span>
                                  </Button>
                                </div>
                                <div className="hidden md:flex absolute right-0 top-1/2 transform -translate-y-1/2 z-10">
                                  <Button variant="outline" size="icon" className="rounded-full bg-white/80 shadow-md">
                                    <span className="material-icons">chevron_right</span>
                                  </Button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  
                  {/* Upcoming Challenges Section - Right Side */}
                  <div className={`${activeChallenges && activeChallenges.length > 0 ? 'lg:w-1/2' : 'w-full'}`}>
                    {upcomingChallenges && upcomingChallenges.length > 0 && (
                      <>
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="text-2xl font-title font-bold text-white flex items-center">
                            <span className="material-icons text-blue-500 mr-2">schedule</span>
                            Upcoming Challenges
                          </h2>
                          <Link
                            href="/?section=upcoming-challenges"
                            className="text-blue-500 hover:text-blue-400 text-sm font-medium flex items-center"
                            onClick={(e) => {e.preventDefault(); setActiveSection('upcoming-challenges');}}
                          >
                            View All
                            <span className="material-icons ml-1 text-sm">arrow_forward</span>
                          </Link>
                        </div>
                        
                        {/* Horizontal scrollable upcoming challenges */}
                        <div className="relative overflow-hidden">
                          <div className="overflow-x-auto flex space-x-4 pb-2 -mx-1 px-1">
                            {upcomingChallenges
                              .filter(challenge => challenge.status === "upcoming")
                              .map((challenge) => (
                                <UpcomingChallengeCard 
                                  key={challenge.id} 
                                  challenge={challenge as any} 
                                  calculateCountdown={calculateCountdown}
                                />
                              ))}
                            
                            {/* Navigation arrows for upcoming challenges */}
                            {upcomingChallenges.length > 1 && (
                              <>
                                <div className="hidden md:flex absolute left-0 top-1/2 transform -translate-y-1/2 z-10">
                                  <Button variant="outline" size="icon" className="rounded-full bg-white/80 shadow-md">
                                    <span className="material-icons">chevron_left</span>
                                  </Button>
                                </div>
                                <div className="hidden md:flex absolute right-0 top-1/2 transform -translate-y-1/2 z-10">
                                  <Button variant="outline" size="icon" className="rounded-full bg-white/80 shadow-md">
                                    <span className="material-icons">chevron_right</span>
                                  </Button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        
        {/* Main content - sidebar layout */}
        <div className="flex flex-col md:flex-row gap-6 mt-6">
          {/* Categories Sidebar - Only visible on desktop */}
          <div className="hidden md:block w-56 lg:w-64 shrink-0">

            {/* Categories Navigation */}
            <div className="bg-gray-900/50 border border-gray-700/50 backdrop-blur-sm rounded-xl overflow-hidden">
              {/* Main Sections */}
              <div className="p-4">
                <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3 pl-2">Main</h3>
                <nav className="space-y-1">
                  <Link 
                    href="/" 
                    className={`flex items-center px-2 py-2 text-sm rounded-lg transition-colors ${activeSection === 'all' ? 'bg-amber-500/20 text-amber-400 font-medium' : 'text-gray-300 hover:bg-gray-800/70 hover:text-amber-500'}`}
                    onClick={(e) => {e.preventDefault(); setActiveSection('all'); setSelectedCategory(null)}}
                  >
                    <span className="material-icons mr-3 text-sm">home</span>
                    Home
                  </Link>
                  <Link 
                    href="/?section=new" 
                    className={`flex items-center px-2 py-2 text-sm rounded-lg transition-colors ${activeSection === 'new' ? 'bg-amber-500/20 text-amber-400 font-medium' : 'text-gray-300 hover:bg-gray-800/70 hover:text-amber-500'}`}
                    onClick={(e) => {e.preventDefault(); setActiveSection('new'); setSelectedCategory(null)}}
                  >
                    <span className="material-icons mr-3 text-sm">new_releases</span>
                    New Games
                  </Link>
                  <Link 
                    href="/?section=trending" 
                    className={`flex items-center px-2 py-2 text-sm rounded-lg transition-colors ${activeSection === 'trending' ? 'bg-amber-500/20 text-amber-400 font-medium' : 'text-gray-300 hover:bg-gray-800/70 hover:text-amber-500'}`}
                    onClick={(e) => {e.preventDefault(); setActiveSection('trending'); setSelectedCategory(null)}}
                  >
                    <span className="material-icons mr-3 text-sm">trending_up</span>
                    Trending Now
                  </Link>
                  <Link 
                    href="/?section=popular" 
                    className={`flex items-center px-2 py-2 text-sm rounded-lg transition-colors ${activeSection === 'popular' ? 'bg-amber-500/20 text-amber-400 font-medium' : 'text-gray-300 hover:bg-gray-800/70 hover:text-amber-500'}`}
                    onClick={(e) => {e.preventDefault(); setActiveSection('popular'); setSelectedCategory(null)}}
                  >
                    <span className="material-icons mr-3 text-sm">star</span>
                    Popular
                  </Link>
                  <Link 
                    href="/?section=featured" 
                    className={`flex items-center px-2 py-2 text-sm rounded-lg transition-colors ${activeSection === 'featured' ? 'bg-amber-500/20 text-amber-400 font-medium' : 'text-gray-300 hover:bg-gray-800/70 hover:text-amber-500'}`}
                    onClick={(e) => {e.preventDefault(); setActiveSection('featured'); setSelectedCategory(null)}}
                  >
                    <span className="material-icons mr-3 text-sm">verified</span>
                    Featured
                  </Link>
                  <Link 
                    href="/?section=multiplayer" 
                    className={`flex items-center px-2 py-2 text-sm rounded-lg transition-colors ${activeSection === 'multiplayer' ? 'bg-amber-500/20 text-amber-400 font-medium' : 'text-gray-300 hover:bg-gray-800/70 hover:text-amber-500'}`}
                    onClick={(e) => {e.preventDefault(); setActiveSection('multiplayer'); setSelectedCategory(null)}}
                  >
                    <span className="material-icons mr-3 text-sm">group</span>
                    Multiplayer
                  </Link>
                </nav>
              </div>
              
              {/* Challenges Section */}
              <div className="p-4 border-t border-gray-700/50">
                <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3 pl-2">Challenges</h3>
                <nav className="space-y-1">
                  <Link 
                    href="/?section=active-challenges" 
                    className={`flex items-center px-2 py-2 text-sm rounded-lg transition-colors ${activeSection === 'active-challenges' ? 'bg-amber-500/20 text-amber-400 font-medium' : 'text-gray-300 hover:bg-gray-800/70 hover:text-amber-500'}`}
                    onClick={(e) => {e.preventDefault(); setActiveSection('active-challenges'); setSelectedCategory(null)}}
                  >
                    <span className="material-icons mr-3 text-sm">emoji_events</span>
                    Active Challenges
                  </Link>
                  <Link 
                    href="/?section=upcoming-challenges" 
                    className={`flex items-center px-2 py-2 text-sm rounded-lg transition-colors ${activeSection === 'upcoming-challenges' ? 'bg-amber-500/20 text-amber-400 font-medium' : 'text-gray-300 hover:bg-gray-800/70 hover:text-amber-500'}`}
                    onClick={(e) => {e.preventDefault(); setActiveSection('upcoming-challenges'); setSelectedCategory(null)}}
                  >
                    <span className="material-icons mr-3 text-sm">schedule</span>
                    Upcoming Challenges
                  </Link>
                  <Link 
                    href="/?section=completed-challenges" 
                    className={`flex items-center px-2 py-2 text-sm rounded-lg transition-colors ${activeSection === 'completed-challenges' ? 'bg-amber-500/20 text-amber-400 font-medium' : 'text-gray-300 hover:bg-gray-800/70 hover:text-amber-500'}`}
                    onClick={(e) => {e.preventDefault(); setActiveSection('completed-challenges'); setSelectedCategory(null)}}
                  >
                    <span className="material-icons mr-3 text-sm">military_tech</span>
                    Completed Challenges
                  </Link>
                </nav>
              </div>
              
              {/* User Sections */}
              <div className="p-4 border-t border-gray-700/50">
                <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3 pl-2">Your Games</h3>
                <nav className="space-y-1">
                  <Link 
                    href="/?section=favorites" 
                    className={`flex items-center px-2 py-2 text-sm rounded-lg transition-colors ${activeSection === 'favorites' ? 'bg-amber-500/20 text-amber-400 font-medium' : 'text-gray-300 hover:bg-gray-800/70 hover:text-amber-500'}`}
                    onClick={(e) => {e.preventDefault(); setActiveSection('favorites'); setSelectedCategory(null)}}
                  >
                    <span className="material-icons mr-3 text-sm">favorite</span>
                    Favorites
                  </Link>
                  <Link 
                    href="/?section=recent" 
                    className={`flex items-center px-2 py-2 text-sm rounded-lg transition-colors ${activeSection === 'recent' ? 'bg-amber-500/20 text-amber-400 font-medium' : 'text-gray-300 hover:bg-gray-800/70 hover:text-amber-500'}`}
                    onClick={(e) => {e.preventDefault(); setActiveSection('recent'); setSelectedCategory(null)}}
                  >
                    <span className="material-icons mr-3 text-sm">history</span>
                    Recently Played
                  </Link>
                </nav>
              </div>
              
              {/* Categories */}
              <div className="p-4 border-t border-gray-700/50">
                <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3 pl-2">Categories</h3>
                {categoriesLoading ? (
                  <div className="space-y-2 px-2">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                  </div>
                ) : (
                  <nav className="space-y-1">
                    {categories?.map((category) => (
                      <Link
                        key={category.id}
                        href={`/?category=${category.id}`}
                        className={`flex items-center justify-between px-2 py-2 text-sm rounded-lg transition-colors ${
                          activeSection === 'categories' && selectedCategory === category.id
                            ? 'bg-amber-500/20 text-amber-400 font-medium'
                            : 'text-gray-300 hover:bg-gray-800/70 hover:text-amber-500'
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          setActiveSection('categories');
                          setSelectedCategory(category.id);
                        }}
                      >
                        <span>{category.name}</span>
                        {(category as any).gameCount > 0 && (
                          <span className="bg-gray-800 text-xs text-gray-300 px-2 py-0.5 rounded">
                            {(category as any).gameCount}
                          </span>
                        )}
                      </Link>
                    ))}
                  </nav>
                )}
              </div>
            </div>
          </div>
          
          {/* Main Content Area */}
          <div className="flex-1">
            {/* Mobile Search + Categories Dropdown */}
            <div className="md:hidden mb-5">
              <form onSubmit={handleSearch} className="mb-3">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search games..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-full text-sm bg-gray-800 border-gray-700 text-gray-200 focus:ring-2 focus:ring-amber-500/30 focus:outline-none"
                  />
                  <span className="material-icons absolute left-3 top-2.5 text-gray-500 text-sm">search</span>
                </div>
              </form>
              
              {/* Mobile Categories Accordion */}
              <Accordion type="single" collapsible className="bg-gray-900/50 border border-gray-700/50 backdrop-blur-sm rounded-xl overflow-hidden">
                <AccordionItem value="categories" className="border-b-0 px-3">
                  <AccordionTrigger className="py-3 text-sm text-gray-200 hover:text-amber-500 hover:no-underline">
                    <span className="flex items-center">
                      <span className="material-icons mr-2 text-amber-500 text-sm">category</span>
                      Categories
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pt-0 pb-3">
                    {categoriesLoading ? (
                      <div className="space-y-2 px-2">
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-5 w-full" />
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2 px-2">
                        {categories?.map((category) => (
                          <Button
                            key={category.id}
                            variant={activeSection === 'categories' && selectedCategory === category.id ? "default" : "outline"}
                            size="sm"
                            className={activeSection === 'categories' && selectedCategory === category.id ? 
                              "bg-amber-500 hover:bg-amber-600 text-black border-0" : 
                              "bg-gray-800 text-gray-300 hover:bg-gray-700 border-gray-700"}
                            onClick={() => {
                              setActiveSection('categories');
                              setSelectedCategory(category.id);
                            }}
                          >
                            {category.name}
                            {(category as any).gameCount > 0 && (
                              <span className="ml-1.5 bg-gray-700 text-xs text-gray-300 px-1.5 py-0.5 rounded-full">
                                {(category as any).gameCount}
                              </span>
                            )}
                          </Button>
                        ))}
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            {/* Section Header */}
            <div className="flex flex-wrap items-center justify-between mb-5">
              <h1 className="text-2xl font-title font-bold text-amber-500">{getSectionTitle()}</h1>
              
              {/* Desktop Search */}
              <form onSubmit={handleSearch} className="hidden md:block">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search games..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full min-w-[260px] pl-10 pr-4 py-2 rounded-full text-sm bg-gray-800 border-gray-700 text-gray-200 focus:ring-2 focus:ring-amber-500/30 focus:outline-none"
                  />
                  <span className="material-icons absolute left-3 top-2.5 text-gray-500 text-sm">search</span>
                </div>
              </form>
            </div>
            
            {/* Games or Challenges Grid */}
            {isCurrentSectionLoading() ? (
              renderLoadingGrid()
            ) : (
              <div>
                {activeSection.includes('challenges') ? (
                  // Challenges section
                  <div>
                    {getCurrentChallenges().length === 0 ? (
                      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 text-center">
                        <span className="material-icons text-5xl text-amber-500 mb-3">emoji_events</span>
                        <h3 className="text-xl font-title text-amber-400 mb-2">No challenges found</h3>
                        <p className="text-gray-400 mb-4">
                          {activeSection === "active-challenges" 
                            ? "There are no active challenges at the moment."
                            : activeSection === "upcoming-challenges"
                            ? "There are no upcoming challenges at the moment."
                            : "There are no completed challenges."}
                        </p>
                        <Button 
                          onClick={() => {setActiveSection('all'); setSelectedCategory(null);}}
                          className="bg-amber-500 hover:bg-amber-600 text-black"
                        >
                          Browse All Games
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {getCurrentChallenges().map((challenge: Challenge) => (
                          <Card key={challenge.id} className="challenge-thumbnail-fade-rtl overflow-hidden border border-gray-700 bg-gray-800">
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <CardTitle className="text-lg text-amber-400">{challenge.title}</CardTitle>
                                  <CardDescription className="line-clamp-1 text-sm text-gray-300">
                                    {challenge.description}
                                  </CardDescription>
                                </div>
                                <Badge className={
                                  challenge.status === 'active' 
                                    ? 'bg-green-900 text-green-300 hover:bg-green-900' 
                                    : challenge.status === 'upcoming' 
                                    ? 'bg-blue-900 text-blue-300 hover:bg-blue-900' 
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-700'
                                }>
                                  {challenge.status === 'active' 
                                    ? 'Active' 
                                    : challenge.status === 'upcoming' 
                                    ? 'Upcoming' 
                                    : 'Completed'}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="pb-3">
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2 text-sm text-gray-300">
                                  <span className="material-icons text-amber-500 text-sm">calendar_today</span>
                                  <span>
                                    {formatDate(challenge.startDate)} - {formatDate(challenge.endDate)}
                                  </span>
                                </div>
                                {(challenge as any).maxScore && (
                                  <div className="flex items-center gap-2 text-sm text-gray-300">
                                    <span className="material-icons text-amber-500 text-sm">leaderboard</span>
                                    <span>Max score: {(challenge as any).maxScore}</span>
                                  </div>
                                )}
                                {challenge.gameId && (
                                  <div className="flex items-center gap-2 text-sm text-gray-300">
                                    <span className="material-icons text-amber-500 text-sm">sports_esports</span>
                                    <span>Game: {(challenge as any).game?.title || "Game"}</span>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                            <CardFooter className="pt-0">
                              <Button 
                                className="w-full bg-amber-500 hover:bg-amber-600 text-black"
                                onClick={() => window.location.href = `/challenges/${challenge.slug}`}
                              >
                                {challenge.status === 'active' 
                                  ? 'Join Challenge' 
                                  : challenge.status === 'upcoming' 
                                  ? 'View Details' 
                                  : 'View Results'}
                              </Button>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  // Regular games section
                  <div>
                    {getCurrentGames().length === 0 ? (
                      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 text-center">
                        <span className="material-icons text-5xl text-amber-500 mb-3">videogame_asset</span>
                        <h3 className="text-xl font-title text-amber-400 mb-2">No games found</h3>
                        <p className="text-gray-400 mb-4">
                          {activeSection === "search" 
                            ? "Try a different search term or browse all games."
                            : activeSection === "favorites"
                            ? "You haven't added any favorites yet."
                            : activeSection === "recent"
                            ? "You haven't played any games yet."
                            : "There are no games in this section yet."}
                        </p>
                        <Button 
                          onClick={() => {setActiveSection('all'); setSelectedCategory(null);}}
                          className="bg-amber-500 hover:bg-amber-600 text-black"
                        >
                          Browse All Games
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {getCurrentGames().map((game: Game) => (
                          <div key={game.id} className="group hover:scale-105 transition-all duration-300">
                            <GameCard game={game} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
