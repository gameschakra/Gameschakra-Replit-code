import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Search, Menu, X, LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";
import SearchPillMobile from "@/components/search/SearchPillMobile";
import { useAuth } from "@/providers/AuthProvider";

export default function HeaderMobile() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [, navigate] = useLocation();
  
  // Get user data from AuthProvider
  const { user, logout } = useAuth();

  const handleSearchPillClick = () => {
    setIsSearchOpen(true);
  };

  const handleSearchClose = () => {
    setIsSearchOpen(false);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      {/* Main Header */}
      <header className={cn(
        "md:hidden sticky top-0 z-50 h-14",
        "bg-[var(--gc-bg-2)]/90 backdrop-blur-md",
        "border-b border-[var(--gc-border)]",
        "pt-[env(safe-area-inset-top)]"
      )}>
        <div className="flex items-center justify-between h-14 px-4">
          {/* Logo */}
          <Link href="/" className={cn(
            "flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-[var(--gc-accent)]/50",
            "focus-visible:outline-none focus-visible:rounded touch-manipulation"
          )} onClick={() => navigate("/")}>
            <div className="h-6 w-6 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-md flex items-center justify-center shrink-0 shadow-sm">
              <span className="material-icons text-black text-sm font-bold">sports_esports</span>
            </div>
            <span className="text-lg font-title font-extrabold tracking-tight text-white">
              GAMES<span className="text-amber-500">CHAKRA</span>
            </span>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Search Pill */}
            <button
              onClick={handleSearchPillClick}
              className={cn(
                "flex items-center gap-2 rounded-full bg-white/5 border border-white/10",
                "px-3 py-2 text-slate-300 text-[13px] transition-colors duration-200",
                "focus-visible:ring-2 focus-visible:ring-[var(--gc-accent)]/50 focus-visible:outline-none",
                "touch-manipulation active:scale-95",
                "hover:bg-white/8 hover:border-white/20"
              )}
            >
              <Search className="w-4 h-4" />
              <span>Search games...</span>
            </button>

            {/* Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={cn(
                "p-2 rounded-full text-white/90 transition-colors duration-200",
                "focus-visible:ring-2 focus-visible:ring-[var(--gc-accent)]/50 focus-visible:outline-none",
                "touch-manipulation active:scale-95",
                "hover:bg-white/10"
              )}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Fullscreen Search Sheet */}
      {isSearchOpen && (
        <div className={cn(
          "md:hidden fixed inset-0 z-[100] bg-[var(--gc-bg-1)]",
          "pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
        )}>
          {/* Search Header */}
          <div className="flex items-center gap-3 p-4 border-b border-[var(--gc-border)]">
            <button
              onClick={handleSearchClose}
              className={cn(
                "p-2 rounded-full text-white/90 transition-colors duration-200",
                "focus-visible:ring-2 focus-visible:ring-[var(--gc-accent)]/50 focus-visible:outline-none",
                "touch-manipulation active:scale-95",
                "hover:bg-white/10"
              )}
              aria-label="Close search"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex-1">
              <SearchPillMobile autoFocus />
            </div>
          </div>

          {/* Search Content Area */}
          <div className="flex-1 p-4">
            <div className="text-center text-slate-400 mt-8">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Start typing to search games...</p>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu Sheet */}
      {isMobileMenuOpen && (
        <div className={cn(
          "md:hidden fixed inset-0 z-[90] bg-black/50",
          "pt-[env(safe-area-inset-top)]"
        )}>
          <div className={cn(
            "absolute right-0 top-0 bottom-0 w-80 max-w-[85vw]",
            "bg-[var(--gc-bg-2)] border-l border-[var(--gc-border)]",
            "pt-[env(safe-area-inset-top)]"
          )}>
            {/* Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--gc-border)]">
              <h2 className="text-lg font-semibold text-white">Menu</h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "p-2 rounded-full text-white/90 transition-colors duration-200",
                  "focus-visible:ring-2 focus-visible:ring-[var(--gc-accent)]/50 focus-visible:outline-none",
                  "touch-manipulation active:scale-95",
                  "hover:bg-white/10"
                )}
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu Content */}
            <div className="p-4">
              <nav className="space-y-2">
                <Link
                  href="/"
                  className="block py-3 px-3 text-white/90 hover:bg-white/5 rounded-lg transition-colors"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigate("/");
                  }}
                >
                  Home
                </Link>
                <Link
                  href="/blog"
                  className="block py-3 px-3 text-white/90 hover:bg-white/5 rounded-lg transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Blog
                </Link>
                <Link
                  href="/developers"
                  className="block py-3 px-3 text-white/90 hover:bg-white/5 rounded-lg transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dev Portal
                </Link>
                
                {/* Auth Section */}
                {user ? (
                  <div className="space-y-2 pt-2 border-t border-white/10">
                    <div className="py-3 px-3 text-amber-500 bg-amber-500/10 rounded-lg">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span className="font-medium truncate">{user.name || user.email}</span>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="block w-full py-3 px-3 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors font-medium text-left"
                    >
                      <div className="flex items-center gap-2">
                        <LogOut className="w-4 h-4" />
                        <span>Log Out</span>
                      </div>
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="block py-3 px-3 text-amber-500 hover:bg-amber-500/10 rounded-lg transition-colors font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Log In
                  </Link>
                )}
              </nav>
            </div>
          </div>

          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        </div>
      )}
    </>
  );
}