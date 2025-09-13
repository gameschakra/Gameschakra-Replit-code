import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/providers/AuthProvider';

interface RecentGame {
  gameId: number;
  gameSlug: string;
  gameTitle: string;
  gameThumbnail: string;
  categoryName?: string;
  playedAt: string;
}

interface RecentGameWithDetails extends RecentGame {
  game: {
    id: number;
    slug: string;
    title: string;
    thumbnailUrl: string;
    category: {
      name: string;
    } | null;
  };
}

const STORAGE_KEY = 'gameschakra-recent-games';
const MAX_LOCAL_GAMES = 15;

export function useRecentlyPlayed() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [localGames, setLocalGames] = useState<RecentGame[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setLocalGames(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading recent games from localStorage:', error);
    }
  }, []);

  // Fetch server data for authenticated users
  const { data: serverGames, isLoading: serverLoading } = useQuery({
    queryKey: ["/api/recently-played"],
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Add game to recently played
  const addRecentGame = useMutation({
    mutationFn: async (game: Omit<RecentGame, 'playedAt'>) => {
      const recentGame: RecentGame = {
        ...game,
        playedAt: new Date().toISOString(),
      };

      // Always update localStorage
      const updated = [
        recentGame,
        ...localGames.filter(g => g.gameId !== game.gameId),
      ].slice(0, MAX_LOCAL_GAMES);

      setLocalGames(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      // Also update server if user is logged in
      if (user) {
        const response = await fetch('/api/game-plays', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gameId: game.gameId }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to track game play on server');
        }
      }

      return recentGame;
    },
    onSuccess: () => {
      // Invalidate server query to refresh data
      if (user) {
        queryClient.invalidateQueries({ queryKey: ["/api/recently-played"] });
      }
    },
  });

  // Merge and deduplicate local and server games
  const getAllRecentGames = (): RecentGameWithDetails[] => {
    const combined: RecentGameWithDetails[] = [];
    const seenIds = new Set<number>();

    // Add server games first (they're more authoritative)
    if (serverGames && Array.isArray(serverGames)) {
      serverGames.forEach((item: any) => {
        if (!seenIds.has(item.game.id)) {
          seenIds.add(item.game.id);
          combined.push({
            gameId: item.game.id,
            gameSlug: item.game.slug,
            gameTitle: item.game.title,
            gameThumbnail: item.game.thumbnailUrl || '',
            categoryName: item.game.category?.name,
            playedAt: item.playedAt,
            game: item.game,
          });
        }
      });
    }

    // Add local games that aren't already included
    localGames.forEach((localGame) => {
      if (!seenIds.has(localGame.gameId)) {
        seenIds.add(localGame.gameId);
        combined.push({
          ...localGame,
          game: {
            id: localGame.gameId,
            slug: localGame.gameSlug,
            title: localGame.gameTitle,
            thumbnailUrl: localGame.gameThumbnail,
            category: localGame.categoryName ? { name: localGame.categoryName } : null,
          },
        });
      }
    });

    // Sort by played date (most recent first)
    return combined.sort((a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime());
  };

  // Clear all recently played games
  const clearRecentGames = useMutation({
    mutationFn: async () => {
      // Clear localStorage
      setLocalGames([]);
      localStorage.removeItem(STORAGE_KEY);

      // Clear server data if logged in
      if (user) {
        const response = await fetch('/api/recently-played', {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error('Failed to clear server recent games');
        }
      }
    },
    onSuccess: () => {
      if (user) {
        queryClient.invalidateQueries({ queryKey: ["/api/recently-played"] });
      }
    },
  });

  return {
    recentGames: getAllRecentGames(),
    isLoading: serverLoading,
    addRecentGame: addRecentGame.mutate,
    clearRecentGames: clearRecentGames.mutate,
    isAddingGame: addRecentGame.isPending,
    isClearingGames: clearRecentGames.isPending,
  };
}