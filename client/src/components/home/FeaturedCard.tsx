import React from "react";
import { Link } from "wouter";

type FeaturedCardProps = {
  id: number;
  title: string;
  slug?: string;
  imageUrl: string;
  badge?: "New" | "Hot" | "Top Rated";
  isHero?: boolean;
  className?: string;
};

const badgeStyles: Record<NonNullable<FeaturedCardProps["badge"]>, string> = {
  New: "bg-emerald-500/90",
  Hot: "bg-red-500/90", 
  "Top Rated": "bg-amber-500/90",
};

export default function FeaturedCard({
  id,
  title,
  slug,
  imageUrl,
  badge,
  isHero = false,
  className = "",
}: FeaturedCardProps) {
  const gameUrl = slug ? `/games/${slug}` : `/games/${id}`;

  return (
    <Link href={gameUrl}>
      <a
        className={[
          "group relative block w-full h-full overflow-hidden rounded-xl",
          "bg-gray-900 shadow-lg hover:shadow-xl transition-all duration-300",
          "ring-1 ring-white/10 hover:ring-white/20",
          "hover:scale-[1.02] transform-gpu",
          className,
        ].join(" ")}
        aria-label={`Play ${title}`}
      >
        <div className="relative w-full h-full">
          <div
            className="absolute inset-0 bg-center bg-cover transition-transform duration-500 group-hover:scale-105"
            style={{ backgroundImage: `url(${imageUrl})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          <div className="absolute inset-0 flex flex-col justify-end p-4">
            <div className="space-y-2">
              {badge && (
                <span
                  className={[
                    "inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full text-white",
                    "shadow-sm backdrop-blur-sm",
                    badgeStyles[badge],
                  ].join(" ")}
                >
                  {badge}
                </span>
              )}
              
              <h3
                className={[
                  "text-white font-bold leading-tight",
                  "drop-shadow-lg group-hover:text-sky-300 transition-colors duration-200",
                  isHero ? "text-xl sm:text-2xl" : "text-sm sm:text-base",
                ].join(" ")}
                title={title}
              >
                {title}
              </h3>
              
              <div
                className={[
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full",
                  "bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold",
                  "shadow-md hover:shadow-lg transform hover:-translate-y-0.5",
                  "transition-all duration-200",
                ].join(" ")}
              >
                <span>Play Now</span>
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </a>
    </Link>
  );
}