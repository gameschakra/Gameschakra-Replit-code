import React, { useMemo } from "react";
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

const getImageUrl = (g: Game) =>
  g.thumbnailUrl ||
  (g.thumbnailPath && g.gameDir
    ? `/api/games/${g.gameDir}/${g.thumbnailPath}`
    : "/assets/placeholder-16x9.jpg");

export default function Featured({
  featured = [],
  fallback = [],
}: {
  featured: Game[];
  fallback: Game[];
}) {
  const six = useMemo(() => {
    const m = new Map<number, Game>();
    featured.forEach((g) => m.set(g.id, g));
    for (const g of fallback) {
      if (m.size >= 6) break;
      if (!m.has(g.id)) m.set(g.id, g);
    }
    const out = Array.from(m.values()).slice(0, 6);
    while (out.length < 6) {
      out.push({
        id: -1000 - out.length,
        title: "Coming Soon",
        slug: "coming-soon",
        thumbnailUrl: "/assets/placeholder-16x9.jpg",
        badge: "Hot",
      });
    }
    return out;
  }, [featured, fallback]);

  if (!six.length) return null;

  const [hero, ...rest] = six;
  const hasSix = rest.length > 4;

  return (
    <section className="relative z-0">
      {/* IMPORTANT: keep a max-width container so hero never becomes full-screen */}
      <div className="mx-auto max-w-[1200px] xl:max-w-[1320px] 2xl:max-w-[1440px] px-4 md:px-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Featured Games</h2>
          <Link href="/games?featured=true">
            <a className="text-sky-400 hover:text-sky-300 text-sm font-medium">
              View All →
            </a>
          </Link>
        </div>

        {/* DESKTOP/TABLET GRID */}
        <div
          className={[
            "hidden md:grid gap-5",
            // 1.6fr | 1fr | 1fr → hero gets a bit less, right side gets breathing room
            "grid-cols-[1.6fr_1fr_1fr]",
            // Make row height stable; tweak 180–200px as you like
            hasSix ? "auto-rows-[188px]" : "auto-rows-[188px]",
          ].join(" ")}
        >
          {/* LEFT HERO spans 2 rows */}
          <div className="col-start-1 row-span-2">
            <FeaturedCard
              id={hero.id}
              title={hero.title}
              slug={hero.slug}
              imageUrl={getImageUrl(hero)}
              badge={hero.badge}
              isHero
            />
          </div>

          {/* RIGHT 2×2 tiles */}
          {rest.slice(0, 4).map((g, i) => (
            <div
              key={g.id}
              // place them exactly in cols 2..3 rows 1..2
              className={
                i === 0
                  ? "col-start-2 row-start-1"
                  : i === 1
                  ? "col-start-3 row-start-1"
                  : i === 2
                  ? "col-start-2 row-start-2"
                  : "col-start-3 row-start-2"
              }
            >
              <FeaturedCard
                id={g.id}
                title={g.title}
                slug={g.slug}
                imageUrl={getImageUrl(g)}
                badge={g.badge}
              />
            </div>
          ))}

          {/* If 6th tile exists, make a neat third row on the RIGHT only */}
          {hasSix && (
            <>
              {/* spacer to keep the left third-row cell occupied (so the right spans align) */}
              <div className="col-start-1 row-start-3 invisible" />
              <div className="col-start-2 col-span-2 row-start-3">
                <FeaturedCard
                  id={rest[4].id}
                  title={rest[4].title}
                  slug={rest[4].slug}
                  imageUrl={getImageUrl(rest[4])}
                  badge={rest[4].badge}
                />
              </div>
            </>
          )}
        </div>

        {/* MOBILE – horizontal scroller remains same */}
        <div className="md:hidden -mx-4 px-4">
          <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory featured-mobile-scroll">
            {[hero, ...rest].map((g, i) => (
              <div key={g.id} className="snap-start">
                <div className={i === 0 ? "w-[88vw] max-w-[560px]" : "w-[72vw] max-w-[420px]"}>
                  <div className="relative w-full overflow-hidden rounded-2xl shadow-lg ring-1 ring-white/5">
                    <div className="aspect-[16/9]">
                      <FeaturedCard
                        id={g.id}
                        title={g.title}
                        slug={g.slug}
                        imageUrl={getImageUrl(g)}
                        badge={g.badge}
                        isHero={i === 0}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}