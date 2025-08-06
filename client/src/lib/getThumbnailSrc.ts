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
  // Use deterministic pattern for each game ID
  // This is more reliable than using thumbnailHash or thumbnailPath
  const baseUrl = `/api/thumbnails/game_${game.id}.jpg`;
  
  // Always add game ID and name as query parameters
  const queryParams = new URLSearchParams();
  queryParams.append('gameId', String(game.id));
  queryParams.append('gameName', game.title);
  
  // Add cache-busting timestamp
  queryParams.append('t', String(Date.now()));
  
  // Return the complete URL
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