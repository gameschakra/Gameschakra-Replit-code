import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Home, Grid3X3, Trophy, Heart, User } from "lucide-react";

interface BottomNavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  activeSection?: string[];
}

const navItems: BottomNavItem[] = [
  {
    id: "home",
    label: "Home", 
    href: "/",
    icon: Home,
    activeSection: ["all", ""]
  },
  {
    id: "categories",
    label: "Categories",
    href: "/?section=categories", 
    icon: Grid3X3,
    activeSection: ["categories"]
  },
  {
    id: "challenges",
    label: "Challenges",
    href: "/?section=active-challenges",
    icon: Trophy,
    activeSection: ["active-challenges", "upcoming-challenges", "completed-challenges"]
  },
  {
    id: "favorites", 
    label: "Favorites",
    href: "/?section=favorites",
    icon: Heart,
    activeSection: ["favorites"]
  },
  {
    id: "profile",
    label: "Profile",
    href: "/login",
    icon: User,
    activeSection: ["login", "profile"]
  }
];

export default function BottomNav() {
  const [location] = useLocation();
  
  // Extract section from URL params
  const urlParams = new URLSearchParams(location.split("?")[1] || "");
  const currentSection = urlParams.get("section") || (location === "/" ? "all" : location.replace("/", ""));

  const isActive = (item: BottomNavItem): boolean => {
    if (!item.activeSection) return false;
    return item.activeSection.some(section => 
      section === currentSection || (section === "" && location === "/")
    );
  };

  return (
    <nav className={cn(
      "md:hidden fixed bottom-0 inset-x-0 z-50",
      "bg-[var(--gc-bg-2)]/95 backdrop-blur-md",
      "border-t border-[var(--gc-border)]",
      "pb-[env(safe-area-inset-bottom)] pt-2"
    )}>
      <ul className="grid grid-cols-5 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          
          return (
            <li key={item.id}>
              <a
                href={item.href}
                className={cn(
                  "w-full h-14 grid place-items-center gap-1 text-[11px] transition-colors duration-200",
                  "touch-manipulation active:scale-95",
                  "focus-visible:ring-2 focus-visible:ring-[var(--gc-accent)]/50 focus-visible:outline-none focus-visible:rounded-lg",
                  active 
                    ? "text-[var(--gc-accent)]" 
                    : "text-slate-400 hover:text-slate-300"
                )}
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = item.href;
                }}
              >
                <Icon 
                  className={cn(
                    "w-5 h-5 transition-all duration-200",
                    active ? "text-[var(--gc-accent)]" : "text-slate-400"
                  )} 
                />
                <span className={cn(
                  "font-medium transition-colors duration-200",
                  active ? "text-[var(--gc-accent)]" : "text-slate-400"
                )}>
                  {item.label}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}