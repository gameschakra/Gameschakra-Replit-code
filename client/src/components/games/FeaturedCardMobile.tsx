import { Link } from "wouter";
import { cn } from "@/lib/utils";

type FeaturedCardMobileProps = {
  id: number;
  title: string;
  slug?: string;
  imageUrl: string;
  badge?: "New" | "Hot" | "Top Rated";
  className?: string;
};

const badgeColors = {
  "New": "bg-[var(--gc-good)]/90 text-white",
  "Hot": "bg-[var(--gc-bad)]/90 text-white", 
  "Top Rated": "bg-[var(--gc-accent)]/90 text-white",
};

export default function FeaturedCardMobile({
  id,
  title,
  slug,
  imageUrl,
  badge,
  className,
}: FeaturedCardMobileProps) {
  const href = slug ? `/games/${slug}` : `/games/${id}`;

  return (
    <div className={cn(
      "relative overflow-hidden shadow-[var(--gc-elev-1)] snap-start",
      "bg-[var(--gc-card)] rounded-2xl touch-manipulation",
      "active:scale-[0.98] transition-transform duration-200",
      className
    )}>
      <Link href={href}>
        {/* Hero image */}
        <div className="relative">
          <img
            src={imageUrl}
            alt={title}
            className="w-full aspect-video object-cover"
            loading="lazy"
          />
          
          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Badge positioned over image */}
          {badge && (
            <div className="absolute top-3 left-3">
              <span className={cn(
                "px-2 py-1 rounded-full text-[10px] font-bold shadow-sm",
                badgeColors[badge]
              )}>
                {badge}
              </span>
            </div>
          )}

          {/* Content positioned at bottom */}
          <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-3">
            {/* Title - max 2 lines */}
            <h3 className="text-[15px] leading-5 font-semibold text-white line-clamp-2 drop-shadow-lg">
              {title}
            </h3>
            
            {/* Play Now CTA button */}
            <button className={cn(
              "shrink-0 rounded-full h-10 px-4 font-semibold text-slate-900 shadow-lg",
              "bg-gradient-to-r from-amber-300 via-amber-400 to-rose-400",
              "active:translate-y-px transition-transform duration-150",
              "focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:outline-none",
              "touch-manipulation"
            )}>
              Play Now
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
}