import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { RecentlyPlayedWithGame } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function RecentlyPlayed() {
  const { data: recentlyPlayed, isLoading } = useQuery<RecentlyPlayedWithGame[]>({
    queryKey: ["/api/recently-played"],
    enabled: false, // This only works for authenticated users, don't auto fetch
  });

  // If no data and not loading, don't show the section
  if (!isLoading && (!recentlyPlayed || recentlyPlayed.length === 0)) {
    return null;
  }

  return (
    <section className="py-10 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-title font-bold">Recently Played</h2>
          <Link href="/?section=recent" className="text-primary hover:text-primary/80 flex items-center">
            <span>View all</span>
            <span className="material-icons text-sm ml-1">arrow_forward</span>
          </Link>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          {isLoading ? (
            [...Array(3)].map((_, index) => (
              <div key={index} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                <div className="p-4">
                  <div className="flex items-center">
                    <Skeleton className="h-16 w-28 rounded" />
                    <div className="ml-4 flex-grow">
                      <Skeleton className="h-5 w-2/3 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                    <Skeleton className="h-8 w-16 rounded-full" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            recentlyPlayed?.map(item => (
              <div key={item.id} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                <div className="flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="relative h-16 w-28 flex-shrink-0">
                    <img 
                      src={item.game.thumbnailUrl || `https://via.placeholder.com/112x64?text=${item.game.title}`} 
                      alt={`${item.game.title} thumbnail`} 
                      className="absolute inset-0 w-full h-full object-cover rounded"
                    />
                  </div>
                  <div className="ml-4 flex-grow">
                    <h3 className="font-title font-semibold">{item.game.title}</h3>
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span className="flex items-center">
                        <span className="material-icons text-xs mr-1">schedule</span>
                        <span>{formatDistanceToNow(new Date(item.playedAt), { addSuffix: true })}</span>
                      </span>
                      <span className="mx-2">•</span>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                        {item.game.category?.name || "Game"}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <Button asChild size="sm" className="px-3 py-1 rounded-full flex items-center">
                      <Link href={`/games/${item.game.slug}`}>
                        <span className="material-icons text-sm mr-1">play_arrow</span>
                        <span>Play</span>
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
          
          {recentlyPlayed?.length === 0 && (
            <div className="p-6 text-center">
              <p className="text-gray-500 dark:text-gray-400">You haven't played any games yet.</p>
              <Button asChild className="mt-4">
                <Link href="/">Browse Games</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
