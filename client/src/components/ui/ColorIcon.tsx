import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type ColorIconProps = {
  icon: LucideIcon;
  size?: "sm"|"md";
  gradient?: "violet"|"fuchsia"|"orange"|"cyan"|"emerald"|"rose"|"sky"|"amber"|"pink"|"green";
  active?: boolean;
  className?: string;
};

const MAP: Record<NonNullable<ColorIconProps["gradient"]>, string> = {
  violet:  "from-violet-500 to-fuchsia-500",
  fuchsia: "from-fuchsia-500 to-pink-500",
  orange:  "from-orange-500 to-amber-500",
  cyan:    "from-cyan-500 to-sky-500",
  emerald: "from-emerald-500 to-teal-500",
  rose:    "from-rose-500 to-orange-400",
  sky:     "from-sky-500 to-indigo-500",
  amber:   "from-amber-500 to-orange-500",
  pink:    "from-pink-500 to-rose-500",
  green:   "from-green-500 to-emerald-500",
};

export function ColorIcon({
  icon: Icon,
  size = "md",
  gradient = "violet",
  active = false,
  className
}: ColorIconProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full relative",
        "shadow-[0_0_0_1px_rgba(255,255,255,.06)]",
        "transition-all duration-200",
        size === "sm" ? "w-8 h-8" : "w-9 h-9",
        `bg-gradient-to-br ${MAP[gradient]}`,
        active
          ? "ring-2 ring-white/20 shadow-[0_5px_24px_-6px_rgba(56,189,248,.45)]"
          : "opacity-90 hover:opacity-100 hover:shadow-[0_6px_24px_-8px_rgba(56,189,248,.35)]",
        className
      )}
      aria-hidden
    >
      <Icon className="w-[18px] h-[18px] text-white drop-shadow-sm" />
    </span>
  );
}