import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Gamepad2, Clock, Trophy, Heart, LogIn, LogOut, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/AuthProvider";

export default function FloatingGameButton() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [location, navigate] = useLocation();
  const { user, logout } = useAuth();

  // Hide on game playing screen
  const isGameScreen = location.includes('/games/') && location.includes('/play');

  if (isGameScreen) {
    return null;
  }

  // Options for logged out users
  const loggedOutActions = [
    { icon: Clock, label: "Recently Played", href: "/?section=recently-played", color: "from-green-500 to-emerald-500" },
    { icon: Star, label: "Active Challenge", href: "/?section=challenges", color: "from-yellow-500 to-orange-500" },
    { icon: LogIn, label: "Login", href: "/login", color: "from-blue-500 to-cyan-500" },
  ];

  // Options for logged in users
  const loggedInActions = [
    { icon: Heart, label: "Favorites", href: "/?section=favorites", color: "from-pink-500 to-rose-500" },
    { icon: Star, label: "Active Challenge", href: "/?section=challenges", color: "from-yellow-500 to-orange-500" },
    { icon: Trophy, label: "Leaderboard", href: "/leaderboard", color: "from-purple-500 to-indigo-500" },
    {
      icon: LogOut,
      label: "Logout",
      action: async () => {
        try {
          await logout();
          navigate("/");
          setIsExpanded(false);
        } catch (error) {
          console.error("Logout failed:", error);
        }
      },
      color: "from-red-500 to-pink-500"
    },
  ];

  const currentActions = user ? loggedInActions : loggedOutActions;

  return (
    <div className="fixed bottom-24 right-6 z-40 md:hidden">
      {/* Quick Action Buttons */}
      <div className={cn(
        "absolute transition-all duration-500",
        isExpanded ? "opacity-100 scale-100" : "opacity-0 scale-50 pointer-events-none"
      )}>
        {currentActions.map((action, index) => {
          // Better positioning - left side of floating button
          const positions = [
            { x: -120, y: -60 },  // First option - Top-left
            { x: -140, y: -15 },  // Second option - Middle-left
            { x: -120, y: 30 },   // Third option - Bottom-left
            { x: -100, y: 75 }    // Fourth option (Logout)
          ];

          const position = positions[index] || { x: -80, y: 0 };

          const ActionContent = () => (
            <div className="flex items-center gap-2 cursor-pointer group">
              <span className="bg-black/90 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full whitespace-nowrap shadow-lg">
                {action.label}
              </span>
              <button className={`w-10 h-10 rounded-full bg-gradient-to-br ${action.color} shadow-lg flex items-center justify-center`}>
                <action.icon className="w-5 h-5 text-white" />
              </button>
            </div>
          );

          return (
            <div
              key={index}
              className="absolute transition-all duration-500"
              style={{
                transform: `translate(${position.x}px, ${position.y}px)`,
                transitionDelay: `${index * 100}ms`
              }}
            >
              {action.href ? (
                <Link href={action.href}>
                  <div onClick={() => setIsExpanded(false)}>
                    <ActionContent />
                  </div>
                </Link>
              ) : (
                <div onClick={action.action}>
                  <ActionContent />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Main Floating Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="relative w-14 h-14 rounded-full shadow-lg bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 hover:scale-110 active:scale-95 flex items-center justify-center transition-all duration-300"
      >
        <Gamepad2 className="w-7 h-7 text-white" />
      </button>

      {/* Backdrop */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-[-1]"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  );
}