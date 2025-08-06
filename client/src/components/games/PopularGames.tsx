import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Game } from "@/types";
import GameCard from "./GameCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function PopularGames() {
  const { data: popularGames, isLoading } = useQuery<Game[]>({
    queryKey: ["/api/games/popular"],
  });

  if (isLoading) {
    return (
      <section className="py-10 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-title font-bold">Popular Games</h2>
            <Link href="/?section=popular" className="text-primary hover:text-primary/80 flex items-center">
              <span>View all</span>
              <span className="material-icons text-sm ml-1">arrow_forward</span>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md">
                <Skeleton className="h-40 w-full" />
                <div className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!popularGames || popularGames.length === 0) {
    return null;
  }

  return (
    <section className="py-10 bg-white dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-title font-bold">Popular Games</h2>
          <Link href="/?section=popular" className="text-primary hover:text-primary/80 flex items-center">
            <span>View all</span>
            <span className="material-icons text-sm ml-1">arrow_forward</span>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {popularGames.map(game => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </div>
    </section>
  );
}
