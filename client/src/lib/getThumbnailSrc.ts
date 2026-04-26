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
  // If the game has a direct thumbnailUrl (e.g. /api/thumbnails/game_N_ts_hash.jpg),
  // use it directly — it already points to the actual file and is stable per upload.
  if (game.thumbnailUrl) {
    return game.thumbnailUrl;
  }

  // Fallback: canonical thumbnail endpoint — stable URL, no Date.now() so it
  // doesn't create a new browser request on every render.
  return `/api/games/${game.id}/thumbnail`;
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