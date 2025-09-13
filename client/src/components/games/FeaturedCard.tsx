import { Link } from "wouter";

type FeaturedCardProps = {
  id: number;
  title: string;
  slug?: string;
  imageUrl: string;
  badge?: "New" | "Hot" | "Top Rated";
  big?: boolean;
  fillCell?: boolean;
};

const badgeColors = {
  "New": "bg-fuchsia-500/95 text-white",
  "Hot": "bg-rose-500/95 text-white",
  "Top Rated": "bg-emerald-500/95 text-white",
};

export default function FeaturedCard({
  id,
  title,
  slug,
  imageUrl,
  badge,
  big = false,
  fillCell = false,
}: FeaturedCardProps) {
  const href = slug ? `/games/${slug}` : `/games/${id}`;

  return (
    <Link href={href}>
      <a className="block group relative rounded-2xl ring-1 ring-white/5 bg-slate-900/50 overflow-hidden
                     shadow-[0_8px_32px_-12px_rgba(2,6,23,0.8)]
                     transition-all duration-300 hover:-translate-y-0.5
                     hover:ring-cyan-300/30 hover:shadow-[0_12px_40px_-10px_rgba(56,189,248,0.35)]
                     h-full w-full">
        {/* IMAGE + overlay */}
        <div className="relative overflow-hidden aspect-[16/9]">
          <img
            src={imageUrl}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          
          <div className="absolute inset-x-0 bottom-0 h-24 pointer-events-none
                          bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Badge positioned over image */}
          {badge && (
            <div className="absolute top-3 left-3">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeColors[badge]}`}>
                {badge}
              </span>
            </div>
          )}

          {/* Play Now Button - slides in from bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
            <button className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-semibold
                               bg-gradient-to-r from-amber-400 via-orange-400 to-pink-500 text-slate-900
                               shadow-[0_8px_24px_-6px_rgba(251,191,36,0.45)]
                               hover:shadow-[0_10px_32px_-6px_rgba(251,191,36,0.6)] transition-all w-full justify-center">
              ▶︎ Play Now
            </button>
          </div>
        </div>

        {/* CONTENT (no overlap ever) */}
        <div className="px-3 pt-2 pb-3">
          <h3 className={`text-white/90 font-semibold leading-tight line-clamp-1 ${big ? "text-lg" : "text-[15px]"}`}>
            {title}
          </h3>
        </div>
      </a>
    </Link>
  );
}