import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { useEffect } from "react";
import { games, categories } from "@/lib/api";
import GameCard from "@/components/games/GameCard";
import { Loader2 } from "lucide-react";
import { toItemsArray } from "@/lib/normalize";
// GC_SEO: Import new centralized SEO utilities
import { 
  applyMeta, 
  injectJsonLd, 
  clearJsonLd, 
  generateBreadcrumbJsonLd, 
  generateItemListJsonLd, 
  getBaseUrl,
  truncateDescription 
} from "@/lib/seo";

export function GamesListByCategory() {
  const { slug } = useParams<{ slug: string }>();
  const [location] = useLocation();

  // Get the category info first
  const {
    data: category,
    isLoading: categoryLoading,
    error: categoryError,
  } = useQuery({
    queryKey: ["category", slug],
    queryFn: () => categories.getBySlug(slug!),
    enabled: !!slug,
  });

  // Get games for this category
  const {
    data: gamesData,
    isLoading: gamesLoading,
    error: gamesError,
  } = useQuery({
    queryKey: ["games", "category", slug],
    queryFn: () => games.getAll({ categorySlug: slug, limit: 24, page: 1 }),
    enabled: !!slug,
  });

  // Calculate derived values before useEffect
  const gamesList = toItemsArray(gamesData);
  const totalGames = gamesList.length;

  // GC_SEO: Set up SEO when category and games data loads
  useEffect(() => {
    if (category && gamesList) {
      const baseUrl = getBaseUrl();
      const pageUrl = `${baseUrl}/category/${category.slug}`;
      
      // GC_SEO: Create description with top games
      const topGames = gamesList.slice(0, 2);
      const gameNames = topGames.map(game => game.title).join(', ');
      const description = truncateDescription(
        category.description || 
        `Play ${totalGames}+ ${category.name.toLowerCase()} games online free.${gameNames ? ` Including ${gameNames} and more.` : ''} No downloads required.`
      );
      
      // GC_SEO: Apply comprehensive meta tags
      applyMeta({
        title: `${category.name} Games – Play ${totalGames}+ ${category.name} Online | GamesChakra`,
        description,
        canonical: pageUrl,
        og: {
          'og:type': 'website',
          'og:title': `${category.name} Games – Play ${totalGames}+ ${category.name} Online | GamesChakra`,
          'og:description': description,
          'og:url': pageUrl
        },
        twitter: {
          'twitter:card': 'summary_large_image',
          'twitter:title': `${category.name} Games – Play ${totalGames}+ ${category.name} Online | GamesChakra`,
          'twitter:description': description
        }
      });
      
      // GC_SEO: Generate BreadcrumbList JSON-LD
      const breadcrumbItems = [
        { name: 'Home', url: '/' },
        { name: category.name, url: `/category/${category.slug}` }
      ];
      
      const breadcrumbJsonLd = generateBreadcrumbJsonLd(breadcrumbItems);
      injectJsonLd('gc-breadcrumb', breadcrumbJsonLd);
      
      // GC_SEO: Generate ItemList JSON-LD for first page of games (up to 50)
      if (gamesList.length > 0) {
        const gamesForJsonLd = gamesList.slice(0, 50).map(game => ({
          name: game.title,
          url: `/games/${game.slug}`,
          image: game.thumbnailUrl || game.thumbnailPath ? 
            `/api/games/${game.gameDir}/${game.thumbnailPath || game.thumbnailUrl}` : 
            undefined
        }));
        
        const itemListJsonLd = generateItemListJsonLd(
          gamesForJsonLd,
          `${category.name} Games`
        );
        
        injectJsonLd('gc-itemlist', itemListJsonLd);
      }
    }
    
    // GC_SEO: Cleanup on unmount
    return () => {
      clearJsonLd(['gc-breadcrumb', 'gc-itemlist']);
    };
  }, [category, gamesList, totalGames]);

  if (categoryLoading || gamesLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (categoryError) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Category Not Found</h1>
        <p className="text-gray-600">The category you're looking for doesn't exist.</p>
      </div>
    );
  }

  if (gamesError) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Games</h1>
        <p className="text-gray-600">There was an error loading games for this category.</p>
      </div>
    );
  }

  return (
    <>
      {/* Category Header */}
      <section className="dark relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="pt-6 sm:pt-8 lg:pt-10 pb-4 sm:pb-6">
            {/* Title */}
            <h1 className="font-title text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              {category?.name ?? slug}
            </h1>

            {/* Description (safe default, clamp to 2 lines) */}
            <p
              className="mt-2 max-w-2xl text-sm sm:text-base text-muted-foreground line-clamp-2"
              title={category?.description || `Play ${category?.name ?? slug} games`}
            >
              {category?.description || `Play ${category?.name ?? slug} games`}
            </p>

            {/* Meta row */}
            <div className="mt-3 flex items-center gap-3">
              <span className="inline-flex items-center rounded-full border border-border bg-accent/30 px-2.5 py-1 text-xs font-medium text-foreground/90">
                {totalGames} {totalGames === 1 ? "game" : "games"} found
              </span>
            </div>
          </div>

          {/* subtle divider */}
          <div className="h-px w-full bg-border/40" />
        </div>
      </section>

      {/* Empty state */}
      {gamesList.length === 0 && (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mt-8 rounded-lg border border-border bg-accent/20 p-6 text-center">
            <p className="text-foreground font-medium">No games found in this category yet.</p>
            <p className="mt-1 text-sm text-muted-foreground">Try another category or clear filters.</p>
          </div>
        </div>
      )}

      {/* Games Grid */}
      {gamesList.length > 0 && (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {gamesList.map((game, index) => (
              <GameCard key={game.id} game={game} priority={index === 0} />
            ))}
          </div>
        </div>
      )}

      {/* TODO: Add pagination if needed for large categories */}
    </>
  );
}