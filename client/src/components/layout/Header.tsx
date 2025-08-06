import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/providers/AuthProvider";
import { cn } from "@/lib/utils";
import SearchBar from "@/components/search/SearchBar";

export default function Header() {
  const [location, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Get user data from AuthProvider
  const { user, isLoading, logout } = useAuth();

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Close sidebar when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node) && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mobileMenuOpen]);

  // Mobile SearchBar now handles focus
  
  // Handle escape key to close search
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showMobileSearch) {
        setShowMobileSearch(false);
      }
    };
    
    window.addEventListener('keydown', handleEscKey);
    return () => {
      window.removeEventListener('keydown', handleEscKey);
    };
  }, [showMobileSearch]);

  return (
    <header className="bg-background sticky top-0 z-50 border-b border-border/20 shadow-md w-full overflow-x-hidden">
      <div className="container mx-auto px-4 sm:px-6 flex items-center justify-between h-16 max-w-full">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <span className="font-title font-bold text-2xl text-white">GAMES<span className="text-amber-500">CHAKRA</span></span>
          </Link>
        </div>

        {/* Desktop Search Bar */}
        <div className="hidden md:block flex-1 max-w-md mx-6">
          <SearchBar />
        </div>

        {/* Main Navigation */}
        <nav className="hidden md:flex space-x-6 h-16 items-center">
          <Link href="/" className="text-white hover:text-amber-500 transition-colors">
            Games
          </Link>
          <Link href="/?section=active-challenges" className="text-white hover:text-amber-500 transition-colors">
            Leaderboard
          </Link>
          <Link href="/blog" className="text-white hover:text-amber-500 transition-colors">
            Blog
          </Link>

          <Link href="/developers" className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-md font-medium flex items-center">
            <span className="material-icons mr-1 text-sm">code</span>
            Dev Portal
          </Link>
          <Button className="bg-amber-500 hover:bg-amber-600 text-black font-medium">
            <Link href="/login">Log In</Link>
          </Button>
        </nav>
        
        {/* Mobile Actions */}
        <div className="flex md:hidden items-center space-x-2">
          {/* Mobile Search Button */}
          <Button
            variant="ghost"
            size="icon"
            className="p-1 text-white hover:text-amber-500 hover:bg-transparent"
            onClick={() => setShowMobileSearch(!showMobileSearch)}
          >
            <span className="material-icons">{showMobileSearch ? "close" : "search"}</span>
          </Button>
          
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="p-1 text-white hover:text-amber-500 hover:bg-transparent"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="material-icons">{mobileMenuOpen ? "close" : "menu"}</span>
          </Button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div 
        className={cn(
          "md:hidden bg-background border-b border-border/20 overflow-hidden transition-all duration-300 w-full",
          showMobileSearch ? "max-h-16 py-3 opacity-100" : "max-h-0 py-0 opacity-0"
        )}
      >
        <div className="container mx-auto px-4 sm:px-6 max-w-[100vw]">
          <SearchBar 
            isMobile={true} 
            onClose={() => setShowMobileSearch(false)} 
          />
        </div>
      </div>

      {/* Mobile Sidebar Menu */}
      <div 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-gray-900/95 backdrop-blur-sm shadow-lg transform transition-transform duration-300 ease-in-out md:hidden",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
        ref={sidebarRef}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-800">
            <Link href="/" className="flex items-center" onClick={() => setMobileMenuOpen(false)}>
              <span className="font-title font-bold text-xl text-white">GAMES<span className="text-amber-500">CHAKRA</span></span>
            </Link>
          </div>
          
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="px-4 space-y-2">
              <Link
                href="/"
                className="block py-2 px-3 text-white hover:text-amber-500 transition-colors rounded-md hover:bg-gray-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex items-center">
                  <span className="material-icons mr-3">home</span>
                  <span>Home</span>
                </div>
              </Link>
              <Link
                href="/?section=all"
                className="block py-2 px-3 text-white hover:text-amber-500 transition-colors rounded-md hover:bg-gray-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex items-center">
                  <span className="material-icons mr-3">sports_esports</span>
                  <span>All Games</span>
                </div>
              </Link>
              <Link
                href="/?section=active-challenges"
                className="block py-2 px-3 text-white hover:text-amber-500 transition-colors rounded-md hover:bg-gray-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex items-center">
                  <span className="material-icons mr-3">emoji_events</span>
                  <span>Challenges</span>
                </div>
              </Link>
              <Link
                href="/?section=popular"
                className="block py-2 px-3 text-white hover:text-amber-500 transition-colors rounded-md hover:bg-gray-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex items-center">
                  <span className="material-icons mr-3">trending_up</span>
                  <span>Popular</span>
                </div>
              </Link>

              <Link
                href="/blog"
                className="block py-2 px-3 text-white hover:text-amber-500 transition-colors rounded-md hover:bg-gray-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex items-center">
                  <span className="material-icons mr-3">article</span>
                  <span>Blog</span>
                </div>
              </Link>
              
              <div className="py-2 px-3 text-gray-400 uppercase text-xs font-semibold mt-4">
                Categories
              </div>

              <Link
                href="/?category=action"
                className="block py-2 px-3 text-white hover:text-amber-500 transition-colors rounded-md hover:bg-gray-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex items-center">
                  <span className="material-icons mr-3">flash_on</span>
                  <span>Action</span>
                </div>
              </Link>
              <Link
                href="/?category=puzzle"
                className="block py-2 px-3 text-white hover:text-amber-500 transition-colors rounded-md hover:bg-gray-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex items-center">
                  <span className="material-icons mr-3">extension</span>
                  <span>Puzzle</span>
                </div>
              </Link>
              <Link
                href="/?category=adventure"
                className="block py-2 px-3 text-white hover:text-amber-500 transition-colors rounded-md hover:bg-gray-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex items-center">
                  <span className="material-icons mr-3">explore</span>
                  <span>Adventure</span>
                </div>
              </Link>
            </nav>
          </div>
          
          <div className="p-4 border-t border-gray-800">
            <Link
              href="/developers"
              className="block py-2 px-3 text-white bg-purple-600 hover:bg-purple-700 transition-colors rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="flex items-center">
                <span className="material-icons mr-3">code</span>
                <span>Dev Portal</span>
              </div>
            </Link>

            <Link
              href="/login"
              className="block py-2 px-3 text-amber-500 hover:text-amber-400 transition-colors rounded-md bg-gray-800 mt-3"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="flex items-center justify-center">
                <span className="material-icons mr-2">login</span>
                <span>Log In</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Dark overlay when sidebar is open */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </header>
  );
}
