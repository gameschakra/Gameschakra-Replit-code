import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Category, Game, Challenge } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SearchBar from "@/components/search/SearchBar";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import FeaturedGameCarousel from "@/components/games/FeaturedGameCarousel";
import GameCard from "@/components/games/GameCard";
import GameCardMobile from "@/components/games/GameCardMobile";
import FeaturedCardMobile from "@/components/games/FeaturedCardMobile";
import ActiveChallengeCard from "@/components/challenges/ActiveChallengeCard";
import UpcomingChallengeCard from "@/components/challenges/UpcomingChallengeCard";
import AdSense from "@/components/ads/AdSense";
import TestAdButton from "@/components/ads/TestAdButton";
import { toItemsArray } from "@/lib/normalize";
import CategoryLink from "@/components/categories/CategoryLink";
import CategoryChips from "@/components/categories/CategoryChips";
import SearchPillMobile from "@/components/search/SearchPillMobile";
import MobileCarousel from "@/components/ui/MobileCarousel";
import Panel from "@/components/ui/Panel";
import HorizontalCards from "@/components/ui/HorizontalCards";
import { ColorIcon } from "@/components/ui/ColorIcon";
import { Home as HomeIcon, Sparkles, TrendingUp, Star, Award, Users, Trophy, Calendar, Heart, History, Medal } from "lucide-react";
import { useRecentlyPlayed } from "@/hooks/useRecentlyPlayed";
// GC_SEO: Import new centralized SEO utilities
import { 
  applyMeta, 
  injectJsonLd, 
  clearJsonLd, 
  generateItemListJsonLd, 
  getBaseUrl,
  resetToDefaults,
  truncateDescription 
} from "@/lib/seo";

export default function Home() {
  const [location] = useLocation();
  const [activeSection, setActiveSection] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  // Parse URL params and handle SEO
  useEffect(() => {
    const params = new URLSearchParams(location.split("?")[1]);
    const category = params.get("category");
    const section = params.get("section");
    const search = params.get("search");

    if (search) {
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
        search: activeSection === "search" ? new URLSearchParams(location.split("?")[1]).get("search") : undefined,
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

  // Get user's recently played games - now works for all users
  const { recentGames: recentlyPlayed, isLoading: recentlyPlayedLoading } = useRecentlyPlayed();
  
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

  // GC_SEO: Handle SEO for different page states
  useEffect(() => {
    const baseUrl = getBaseUrl();
    const searchQuery = new URLSearchParams(location.split("?")[1]).get("search");
    
    if (activeSection === "search" && searchQuery) {
      // GC_SEO: Search results page SEO
      const canonicalUrl = `${baseUrl}/search?q=${encodeURIComponent(searchQuery)}`;
      const description = `Search results for "${searchQuery}" on GamesChakra. Find and play free online games.`;
      
      applyMeta({
        title: `Search "${searchQuery}" – GamesChakra`,
        description,
        canonical: canonicalUrl,
        og: {
          'og:type': 'website',
          'og:title': `Search "${searchQuery}" – GamesChakra`,
          'og:description': description,
          'og:url': canonicalUrl
        },
        twitter: {
          'twitter:card': 'summary_large_image',
          'twitter:title': `Search "${searchQuery}" – GamesChakra`,
          'twitter:description': description
        }
      });
      
      // Add ItemList JSON-LD for search results when games are loaded
      const currentGames = getCurrentGames();
      if (currentGames.length > 0) {
        const gamesForJsonLd = currentGames.slice(0, 50).map(game => ({
          name: game.title,
          url: `/games/${game.slug}`,
          image: game.thumbnailUrl || game.thumbnailPath ? 
            `/api/games/${game.gameDir}/${game.thumbnailPath || game.thumbnailUrl}` : 
            undefined
        }));
        
        const itemListJsonLd = generateItemListJsonLd(
          gamesForJsonLd,
          `Search Results for "${searchQuery}"`
        );
        
        injectJsonLd('gc-itemlist', itemListJsonLd);
      }
    } else if (activeSection === "all" || !activeSection) {
      // GC_SEO: Home page SEO
      applyMeta({
        title: 'Free Online HTML5 Games – Play Now | GamesChakra',
        description: 'Play hundreds of free HTML5 games online. Action, adventure, racing, puzzle, and many more categories. No downloads required, play instantly in your browser!',
        canonical: '/',
        og: {
          'og:type': 'website',
          'og:image': '/assets/logo.png'
        },
        twitter: {
          'twitter:card': 'summary_large_image',
          'twitter:image': '/assets/logo.png'
        }
      });
      
      // Clear any search-specific JSON-LD
      clearJsonLd(['gc-itemlist']);
    } else {
      // GC_SEO: Other sections - just clear search JSON-LD
      clearJsonLd(['gc-itemlist']);
    }
    
    // Cleanup on unmount
    return () => {
      if (activeSection === "search") {
        clearJsonLd(['gc-itemlist']);
      }
    };
  }, [activeSection, location, games]);


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
    let gamesToShow: Game[] = [];
    
    if (activeSection === "popular") gamesToShow = toItemsArray<Game>(popularGames);
    else if (activeSection === "featured") gamesToShow = toItemsArray<Game>(featuredGames);
    else if (activeSection === "favorites") {
      gamesToShow = Array.isArray(favorites) ? favorites.map((f: any) => f.game) : [];
    }
    else if (activeSection === "recent") {
      gamesToShow = Array.isArray(recentlyPlayed) ? recentlyPlayed.map((r: any) => r.game) : [];
    }
    else {
      gamesToShow = toItemsArray<Game>(games); // Default for all, categories, and search
    }
    
    // Apply category filter if selectedCategory is set
    if (selectedCategory !== null && gamesToShow.length > 0) {
      gamesToShow = gamesToShow.filter(game => game.categoryId === selectedCategory);
    }
    
    return gamesToShow;
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
      case "search": return `Search Results: "${new URLSearchParams(location.split("?")[1]).get("search") || ""}"`;
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
    <>
      
      <main className="min-h-dvh bg-[var(--gc-bg-1)] [background:var(--gc-grad-hero)] md:min-h-screen md:gc-bg">
        {/* Desktop Container */}
        <div className="hidden md:block container mx-auto px-4 sm:px-6 py-0">
          {/* Desktop content - keep existing */}
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
                          <h2 className="flex items-center gap-2 text-white/90 font-semibold text-[22px] tracking-tight">
                            <span className="inline-flex w-8 h-8 items-center justify-center rounded-full bg-amber-500/90 text-white shadow-md">
                              <span className="material-icons text-[16px]">emoji_events</span>
                            </span>
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
                          <h2 className="flex items-center gap-2 text-white/90 font-semibold text-[22px] tracking-tight">
                            <span className="inline-flex w-8 h-8 items-center justify-center rounded-full bg-blue-500/90 text-white shadow-md">
                              <span className="material-icons text-[16px]">schedule</span>
                            </span>
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
                    className={`flex items-center px-2 py-2 text-sm rounded-lg transition-all duration-300 group focus-visible:ring-2 ring-amber-400/50 ring-offset-2 ring-offset-black outline-none ${activeSection === 'all' ? 'bg-amber-500/20 text-amber-400 font-medium shadow-lg shadow-amber-500/10' : 'text-gray-300 hover:bg-gray-800/70 hover:text-amber-500 hover:shadow-md hover:shadow-amber-500/5'}`}
                    onClick={(e) => {e.preventDefault(); setActiveSection('all'); setSelectedCategory(null)}}
                  >
                    <ColorIcon icon={HomeIcon} gradient="amber" size="sm" active={activeSection === 'all'} className="mr-3" />
                    Home
                  </Link>
                  <Link 
                    href="/?section=new" 
                    className={`flex items-center px-2 py-2 text-sm rounded-lg transition-colors ${activeSection === 'new' ? 'bg-amber-500/20 text-amber-400 font-medium' : 'text-gray-300 hover:bg-gray-800/70 hover:text-amber-500'}`}
                    onClick={(e) => {e.preventDefault(); setActiveSection('new'); setSelectedCategory(null)}}
                  >
                    <ColorIcon icon={Sparkles} gradient="violet" size="sm" active={activeSection === 'new'} className="mr-3" />
                    New Games
                  </Link>
                  <Link 
                    href="/?section=trending" 
                    className={`flex items-center px-2 py-2 text-sm rounded-lg transition-colors ${activeSection === 'trending' ? 'bg-amber-500/20 text-amber-400 font-medium' : 'text-gray-300 hover:bg-gray-800/70 hover:text-amber-500'}`}
                    onClick={(e) => {e.preventDefault(); setActiveSection('trending'); setSelectedCategory(null)}}
                  >
                    <ColorIcon icon={TrendingUp} gradient="rose" size="sm" active={activeSection === 'trending'} className="mr-3" />
                    Trending Now
                  </Link>
                  <Link 
                    href="/?section=popular" 
                    className={`flex items-center px-2 py-2 text-sm rounded-lg transition-colors ${activeSection === 'popular' ? 'bg-amber-500/20 text-amber-400 font-medium' : 'text-gray-300 hover:bg-gray-800/70 hover:text-amber-500'}`}
                    onClick={(e) => {e.preventDefault(); setActiveSection('popular'); setSelectedCategory(null)}}
                  >
                    <ColorIcon icon={Star} gradient="sky" size="sm" active={activeSection === 'popular'} className="mr-3" />
                    Popular
                  </Link>
                  <Link 
                    href="/?section=featured" 
                    className={`flex items-center px-2 py-2 text-sm rounded-lg transition-colors ${activeSection === 'featured' ? 'bg-amber-500/20 text-amber-400 font-medium' : 'text-gray-300 hover:bg-gray-800/70 hover:text-amber-500'}`}
                    onClick={(e) => {e.preventDefault(); setActiveSection('featured'); setSelectedCategory(null)}}
                  >
                    <ColorIcon icon={Award} gradient="fuchsia" size="sm" active={activeSection === 'featured'} className="mr-3" />
                    Featured
                  </Link>
                  <Link 
                    href="/?section=multiplayer" 
                    className={`flex items-center px-2 py-2 text-sm rounded-lg transition-colors ${activeSection === 'multiplayer' ? 'bg-amber-500/20 text-amber-400 font-medium' : 'text-gray-300 hover:bg-gray-800/70 hover:text-amber-500'}`}
                    onClick={(e) => {e.preventDefault(); setActiveSection('multiplayer'); setSelectedCategory(null)}}
                  >
                    <ColorIcon icon={Users} gradient="emerald" size="sm" active={activeSection === 'multiplayer'} className="mr-3" />
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
                    <ColorIcon icon={Trophy} gradient="orange" size="sm" active={activeSection === 'active-challenges'} className="mr-3" />
                    Active Challenges
                  </Link>
                  <Link 
                    href="/?section=upcoming-challenges" 
                    className={`flex items-center px-2 py-2 text-sm rounded-lg transition-colors ${activeSection === 'upcoming-challenges' ? 'bg-amber-500/20 text-amber-400 font-medium' : 'text-gray-300 hover:bg-gray-800/70 hover:text-amber-500'}`}
                    onClick={(e) => {e.preventDefault(); setActiveSection('upcoming-challenges'); setSelectedCategory(null)}}
                  >
                    <ColorIcon icon={Calendar} gradient="cyan" size="sm" active={activeSection === 'upcoming-challenges'} className="mr-3" />
                    Upcoming Challenges
                  </Link>
                  <Link 
                    href="/?section=completed-challenges" 
                    className={`flex items-center px-2 py-2 text-sm rounded-lg transition-colors ${activeSection === 'completed-challenges' ? 'bg-amber-500/20 text-amber-400 font-medium' : 'text-gray-300 hover:bg-gray-800/70 hover:text-amber-500'}`}
                    onClick={(e) => {e.preventDefault(); setActiveSection('completed-challenges'); setSelectedCategory(null)}}
                  >
                    <ColorIcon icon={Medal} gradient="violet" size="sm" active={activeSection === 'completed-challenges'} className="mr-3" />
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
                    <ColorIcon icon={Heart} gradient="rose" size="sm" active={activeSection === 'favorites'} className="mr-3" />
                    Favorites
                  </Link>
                  <Link 
                    href="/?section=recent" 
                    className={`flex items-center px-2 py-2 text-sm rounded-lg transition-colors ${activeSection === 'recent' ? 'bg-amber-500/20 text-amber-400 font-medium' : 'text-gray-300 hover:bg-gray-800/70 hover:text-amber-500'}`}
                    onClick={(e) => {e.preventDefault(); setActiveSection('recent'); setSelectedCategory(null)}}
                  >
                    <ColorIcon icon={History} gradient="emerald" size="sm" active={activeSection === 'recent'} className="mr-3" />
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
                      <CategoryLink
                        key={category.id}
                        category={category as any}
                        variant="sidebar"
                      />
                    ))}
                  </nav>
                )}
              </div>
            </div>
          </div>
          
          {/* Main Content Area */}
          <div className="flex-1" data-section="all-games">
            {/* SEARCH_REFACTOR: Mobile Search + Categories Dropdown */}
            <div className="md:hidden mb-5">
              <div className="mb-3">
                <SearchBar placeholder="Search games..." size="sm" />
              </div>
              
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
                          <CategoryLink
                            key={category.id}
                            category={category as any}
                            variant="pill"
                          />
                        ))}
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            {/* Section Header */}
            <div className="flex flex-wrap items-center justify-between mb-5">
              <div>
                <h1 className="text-[22px] font-semibold text-white/90 tracking-tight mb-1">{getSectionTitle()}</h1>
                {activeSection === 'categories' && (
                  <p className="text-sm text-gray-400">Filter by Category</p>
                )}
              </div>
              
              {/* SEARCH_REFACTOR: Desktop Search */}
              <div className="hidden md:block">
                <SearchBar placeholder="Search games..." size="sm" className="min-w-[260px]" />
              </div>
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
                        {getCurrentGames().map((game: Game, index: number) => (
                          <div key={game.id} className="transform transition-all duration-500 hover:z-10">
                            <GameCard game={game} priority={index === 0} />
                            {/* Quick actions on hover */}
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                              <button 
                                onClick={(e) => {e.preventDefault(); /* Add to favorites logic */}}
                                className="bg-white/90 hover:bg-white text-gray-700 p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm"
                                title="Add to favorites"
                              >
                                <span className="material-icons text-sm">favorite_border</span>
                              </button>
                            </div>
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
        
        {/* Mobile Layout */}
        <div className="md:hidden">
          {/* Featured Carousel - Mobile */}
          {activeSection === "all" && featuredGames && (
            <section className="px-3 pt-3">
              <h2 className="text-[18px] font-semibold text-[var(--gc-text-1)] mb-3">Featured Games</h2>
              <MobileCarousel showSwipeHint>
                {toItemsArray<Game>(featuredGames).slice(0, 5).map((game) => (
                  <FeaturedCardMobile
                    key={game.id}
                    id={game.id}
                    title={game.title}
                    slug={game.slug}
                    imageUrl={game.thumbnailUrl || '/assets/logo.png'}
                    badge={game.isFeatured ? "New" : undefined}
                  />
                ))}
              </MobileCarousel>
            </section>
          )}

          {/* Challenge Sections - Mobile */}
          {activeSection === "all" && (
            <section className="px-3 mt-3 space-y-3">
              {activeChallenges && activeChallenges.length > 0 && (
                <Panel 
                  title="Active Challenges" 
                  icon={Trophy} 
                  tone="challenges"
                  viewAllHref="/?section=active-challenges"
                  onViewAll={() => setActiveSection('active-challenges')}
                >
                  <HorizontalCards>
                    {activeChallenges
                      .filter(challenge => challenge.status === "active")
                      .map((challenge) => (
                        <div key={challenge.id} className="w-[76vw] shrink-0 snap-start">
                          <ActiveChallengeCard 
                            challenge={challenge as any} 
                            calculateProgress={calculateProgress}
                            calculateCountdown={calculateCountdown}
                          />
                        </div>
                      ))}
                  </HorizontalCards>
                </Panel>
              )}
              
              {upcomingChallenges && upcomingChallenges.length > 0 && (
                <Panel 
                  title="Upcoming Challenges" 
                  icon={Calendar} 
                  tone="upcoming"
                  viewAllHref="/?section=upcoming-challenges"
                  onViewAll={() => setActiveSection('upcoming-challenges')}
                >
                  <HorizontalCards>
                    {upcomingChallenges
                      .filter(challenge => challenge.status === "upcoming")
                      .map((challenge) => (
                        <div key={challenge.id} className="w-[76vw] shrink-0 snap-start">
                          <UpcomingChallengeCard 
                            challenge={challenge as any} 
                            calculateCountdown={calculateCountdown}
                          />
                        </div>
                      ))}
                  </HorizontalCards>
                </Panel>
              )}
            </section>
          )}

          {/* Search + Categories - Mobile */}
          <div className="px-3 mt-3 space-y-2">
            <SearchPillMobile />
            <CategoryChips 
              categories={categories || []}
              selectedCategory={selectedCategory}
              onCategorySelect={(categoryId) => {
                setSelectedCategory(categoryId);
                setActiveSection(categoryId === null ? 'all' : 'categories');
              }}
            />
          </div>

          {/* Games Grid - Mobile */}
          <section className="px-3 mt-2 pb-6">
            
            {isCurrentSectionLoading() ? (
              <div className="grid grid-cols-2 gap-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-[var(--gc-card)] rounded-2xl overflow-hidden">
                    <Skeleton className="w-full aspect-[4/3]" />
                    <div className="p-3">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : getCurrentGames().length === 0 ? (
              <div className="text-center py-8">
                <div className="text-slate-400 mb-2">No games found</div>
                <Button 
                  onClick={() => {setActiveSection('all'); setSelectedCategory(null);}}
                  className="bg-[var(--gc-accent)] hover:bg-[var(--gc-accent)]/90 text-black"
                >
                  Browse All Games
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {getCurrentGames().map((game: Game, index: number) => (
                  <GameCardMobile 
                    key={game.id} 
                    game={game} 
                    priority={index < 4} 
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

    </>
  );
}
