import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

type Size = "sm" | "md" | "lg";

const sizeMap: Record<Size, string> = {
  sm: "h-6 w-6 rounded-lg",
  md: "h-8 w-8 rounded-lg", 
  lg: "h-10 w-10 rounded-xl",
};

const iconSizeMap: Record<Size, string> = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

export function GradientIcon({
  icon: Icon,
  tone = "sunset",
  isActive,
  size = "sm",
  className,
}: {
  icon: LucideIcon;
  tone?:
    | "sunset"
    | "aqua" 
    | "candy"
    | "mint"
    | "peach"
    | "violet"
    | "flame"
    | "sky"
    | "home"
    | "new"
    | "trending"
    | "popular"
    | "featured"
    | "multiplayer"
    | "favorites"
    | "challenges"
    | "upcoming";
  isActive?: boolean;
  size?: Size;
  className?: string;
}) {
  const toneClass =
    {
      sunset: "from-amber-400 via-pink-500 to-fuchsia-500",
      aqua: "from-cyan-400 via-sky-500 to-blue-600",
      candy: "from-fuchsia-400 via-rose-400 to-orange-400",
      mint: "from-emerald-400 via-teal-400 to-cyan-400",
      peach: "from-orange-400 via-amber-400 to-yellow-300",
      violet: "from-violet-400 via-fuchsia-400 to-pink-400",
      flame: "from-red-500 via-orange-500 to-amber-400",
      sky: "from-sky-400 via-indigo-400 to-purple-500",
      // Mobile gaming presets
      home: "from-purple-500 to-indigo-500",
      new: "from-emerald-400 to-teal-500",
      trending: "from-rose-400 to-orange-400",
      popular: "from-amber-300 to-yellow-500",
      featured: "from-cyan-400 to-sky-500",
      multiplayer: "from-fuchsia-500 to-pink-500",
      favorites: "from-rose-500 to-pink-500",
      challenges: "from-orange-400 to-red-500",
      upcoming: "from-blue-400 to-cyan-400",
    }[tone] ?? "from-amber-400 via-pink-500 to-fuchsia-500";

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center bg-gradient-to-br",
        toneClass,
        "ring-1 ring-white/10 shadow-md transition-all duration-200",
        sizeMap[size],
        isActive 
          ? "shadow-[0_0_20px_-6px_rgba(34,211,238,0.6)] ring-2 ring-[var(--gc-accent)]/20" 
          : "hover:shadow-lg hover:scale-105",
        className
      )}
    >
      <Icon className={cn(iconSizeMap[size], "text-white drop-shadow")} />
    </span>
  );
}

// Alternative simple gradient icon for non-Lucide content
export function SimpleGradientIcon({ 
  children, 
  from, 
  to, 
  size = "md", 
  className = "" 
}: { 
  children: ReactNode;
  from: string;
  to: string;
  size?: Size;
  className?: string;
}) {
  return (
    <span 
      className={cn(
        "inline-grid place-items-center bg-gradient-to-br text-white shadow-md transition-all duration-200",
        `from-${from} to-${to}`,
        sizeMap[size],
        "hover:shadow-lg hover:scale-105",
        className
      )} 
      aria-hidden="true"
    >
      {children}
    </span>
  );
}