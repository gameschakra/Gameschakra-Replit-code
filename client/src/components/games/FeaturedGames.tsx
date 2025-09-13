import { Link } from "wouter";
import FeaturedCard from "./FeaturedCard";

type Game = {
  id: number;
  title: string;
  slug?: string;
  thumbnailUrl?: string;
  thumbnailPath?: string;
  gameDir?: string;
  badge?: "New" | "Hot" | "Top Rated";
};

type FeaturedGamesProps = {
  featured: Game[];
  fallback: Game[];
};

const getImageUrl = (game: Game): string => {
  if (game.thumbnailUrl) return game.thumbnailUrl;
  if (game.thumbnailPath && game.gameDir) {
    return `/api/games/${game.gameDir}/${game.thumbnailPath}`;
  }
  return "/assets/placeholder-16x9.jpg";
};

const createPlaceholder = (index: number): Game => ({
  id: -index,
  title: "Coming Soon",
  thumbnailUrl: "/assets/placeholder-16x9.jpg",
});

export default function FeaturedGames({ featured, fallback }: FeaturedGamesProps) {
  // Build exactly 3 games
  const seenIds = new Set<number>();
  const games: Game[] = [];
  
  // Add featured games first (dedupe by id)
  for (const game of featured) {
    if (!seenIds.has(game.id)) {
      games.push(game);
      seenIds.add(game.id);
      if (games.length >= 3) break;
    }
  }
  
  // Fill from fallback
  for (const game of fallback) {
    if (games.length >= 3) break;
    if (!seenIds.has(game.id)) {
      games.push(game);
      seenIds.add(game.id);
    }
  }
  
  // Pad with placeholders if needed
  while (games.length < 3) {
    games.push(createPlaceholder(games.length));
  }

  return (
    <section className="py-6 md:py-8">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 gc-card p-4 md:p-6">
        {/* Header - Only show on desktop */}
        <div className="hidden md:flex items-center justify-between mb-6">
          <h2 className="gc-section-title">Featured Games</h2>
          <Link href="/games">
            <a className="gc-cta-link">
              View All →
            </a>
          </Link>
        </div>

      {/* Desktop Layout - 3-grid */}
      <div className="hidden md:grid grid-cols-3 gap-5">
        {games.map((game) => (
          <div key={game.id} className="relative overflow-hidden rounded-2xl aspect-[16/9]">
            <FeaturedCard
              {...game}
              imageUrl={getImageUrl(game)}
              fillCell={true}
            />
          </div>
        ))}
      </div>
      
      {/* Mobile Layout - horizontal scroll */}
      <div className="md:hidden flex gap-3 overflow-x-auto snap-x pb-2">
        {games.map((game, index) => (
          <div
            key={game.id}
            className="flex-shrink-0 snap-start w-[76vw] max-w-[420px]"
          >
            <div className="relative overflow-hidden rounded-2xl aspect-[16/9]">
              <FeaturedCard
                {...game}
                imageUrl={getImageUrl(game)}
              />
            </div>
          </div>
        ))}
      </div>
      </div>
      
      <style jsx>{`
        .featured-mobile-scroll {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .featured-mobile-scroll::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}