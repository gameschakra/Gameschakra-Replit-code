/**
 * Helper function to generate a proper thumbnail URL with cache-busting 
 * and complete context information for the server
 */
export function getThumbnailSrc(game: {
  id: number;
  title: string;
  thumbnailUrl?: string;
  thumbnailPath?: string;
  thumbnailHash?: string;
}) {
  // GC_FIX: Use canonical endpoint that checks uploaded thumbnails first, then fallbacks
  const baseUrl = `/api/games/${game.id}/thumbnail`;
  
  // Add cache-busting timestamp for now (correctness > perf)
  const queryParams = new URLSearchParams();
  queryParams.append('t', String(Date.now()));
  
  // Return the canonical URL
  return `${baseUrl}?${queryParams.toString()}`;
}

/**
 * Generate a simple thumbnail URL for games without all the information
 */
export function getSimpleThumbnailSrc(gameId: number, gameName: string) {
  const timestamp = Date.now();
  const queryParams = new URLSearchParams();
  queryParams.append('gameId', String(gameId));
  queryParams.append('gameName', gameName);
  queryParams.append('t', String(timestamp));
  
  return `/api/thumbnails/game_${gameId}.jpg?${queryParams.toString()}`;
}