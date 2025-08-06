import path from "path";
import fs from "fs";

// Define the mapping structure
interface ThumbnailMappings {
  idMappings: Record<string, string>;
  nameMappings: Record<string, string>;
  availableFiles: string[];
  defaultThumbnail: string;
  // Direct mapping for games without using hash or ID lookups
  directMapping: Record<string, string>;
}

// Default values in case the mappings file is missing
const DEFAULT_THUMBNAIL = '428181a5b6e6df875b9dc5a07ca14176.jpg'; // Hopping Crowns
const DEFAULT_MAPPINGS: ThumbnailMappings = {
  idMappings: { "34": DEFAULT_THUMBNAIL },
  nameMappings: { "Hopping Crowns": DEFAULT_THUMBNAIL },
  availableFiles: [DEFAULT_THUMBNAIL],
  defaultThumbnail: DEFAULT_THUMBNAIL,
  directMapping: {}
};

// Load thumbnail mappings from the JSON file and verify available files
let thumbnailMappings: ThumbnailMappings;

try {
  const mappingsPath = path.join(process.cwd(), 'public', 'images', 'games', 'thumbnailMappings.json');
  const mappingsData = fs.readFileSync(mappingsPath, 'utf8');
  
  // Get the parsed mapping data
  thumbnailMappings = JSON.parse(mappingsData);
  
  // Initialize directMapping if it doesn't exist
  if (!thumbnailMappings.directMapping) {
    thumbnailMappings.directMapping = {};
  }
  
  // Load actual files from the directory to ensure we're using real files
  const gamesDir = path.join(process.cwd(), 'public', 'images', 'games');
  const actualFiles = fs.readdirSync(gamesDir)
    .filter(filename => 
      filename.endsWith('.jpg') || 
      filename.endsWith('.png') || 
      filename.endsWith('.jpeg')
    );
  
  // Update the availableFiles list to include all actual image files
  thumbnailMappings.availableFiles = actualFiles;
  
  // Create directMapping between game IDs and actual images
  // This is a more deterministic approach where each game gets assigned a specific image file
  // We're using a modulo operation to make sure we distribute the available images among games
  for (let i = 34; i <= 100; i++) {
    // Calculate the image index (ensure we spread out the images across all games)
    const imageIndex = i % actualFiles.length;
    const gameFilename = actualFiles[imageIndex];
    
    // Add to directMapping
    thumbnailMappings.directMapping[`game_${i}`] = gameFilename;
    
    // Also add to idMappings if it doesn't exist
    if (!thumbnailMappings.idMappings[i.toString()]) {
      thumbnailMappings.idMappings[i.toString()] = gameFilename;
    }
  }
  
  console.log(`Successfully loaded thumbnail mappings with ${actualFiles.length} available image files`);
} catch (error) {
  console.error("Error loading thumbnail mappings, using defaults:", error);
  thumbnailMappings = DEFAULT_MAPPINGS;
}

/**
 * Find the appropriate thumbnail file for a game
 * @param gameId - Game ID
 * @param gameName - Game name
 * @param requestedFile - The file path from the request (may be a hash/filename)
 * @returns The filename of the thumbnail to use
 */
export function getGameThumbnail(
  gameId: number | string | null | undefined, 
  gameName: string | null | undefined,
  requestedFile: string | null | undefined
): string {
  // First check the direct mapping for game ID patterns
  if (gameId !== null && gameId !== undefined) {
    const gameKey = `game_${gameId}`;
    if (gameKey in thumbnailMappings.directMapping) {
      return thumbnailMappings.directMapping[gameKey];
    }
  }
  
  // Strategy 1: Match by game ID from ID mappings
  if (gameId !== null && gameId !== undefined) {
    const idStr = gameId.toString();
    if (idStr in thumbnailMappings.idMappings) {
      return thumbnailMappings.idMappings[idStr];
    }
  }
  
  // Strategy 2: Match by game name
  if (gameName !== null && gameName !== undefined && gameName.length > 0) {
    if (gameName in thumbnailMappings.nameMappings) {
      return thumbnailMappings.nameMappings[gameName];
    }
  }
  
  // Strategy 3: Use the requested file if it's in the available files list
  if (requestedFile !== null && requestedFile !== undefined) {
    // Extract just the filename without path or query params
    const filename = path.basename(requestedFile.split('?')[0]);
    if (thumbnailMappings.availableFiles.includes(filename)) {
      return filename;
    }
    
    // Try to extract a game ID pattern from the filename
    const gameIdMatch = filename.match(/game_(\d+)/);
    if (gameIdMatch && gameIdMatch[1]) {
      const extractedId = gameIdMatch[1];
      const directKey = `game_${extractedId}`;
      if (directKey in thumbnailMappings.directMapping) {
        return thumbnailMappings.directMapping[directKey];
      }
    }
    
    // If there's a placeholder pattern, use the ID to get a deterministic image
    const placeholderMatch = filename.match(/placeholder_(\d+)/);
    if (placeholderMatch && placeholderMatch[1]) {
      const extractedId = parseInt(placeholderMatch[1]);
      // Use modulo to get a deterministic image based on ID
      const imageIndex = extractedId % thumbnailMappings.availableFiles.length;
      return thumbnailMappings.availableFiles[imageIndex];
    }
  }
  
  // If we have a game ID but no other matches, use a deterministic approach
  if (gameId !== null && gameId !== undefined) {
    const numericId = typeof gameId === 'string' ? parseInt(gameId) : gameId;
    if (!isNaN(numericId)) {
      const imageIndex = numericId % thumbnailMappings.availableFiles.length;
      return thumbnailMappings.availableFiles[imageIndex];
    }
  }
  
  // Ultimate fallback to default thumbnail
  return thumbnailMappings.defaultThumbnail;
}

/**
 * Get the full path to a thumbnail file
 * @param filename - The thumbnail filename
 * @returns The full path to the thumbnail
 */
export function getThumbnailPath(filename: string): string {
  // Get just the base filename without path
  const baseFilename = path.basename(filename);
  
  // First try exact file match
  if (thumbnailMappings.availableFiles.includes(baseFilename)) {
    return path.join(process.cwd(), 'public', 'images', 'games', baseFilename);
  }
  
  // If we have a hash mapping for this filename, use that
  for (const [hash, mappedFile] of Object.entries(thumbnailMappings.idMappings)) {
    if (mappedFile === baseFilename && thumbnailMappings.availableFiles.includes(mappedFile)) {
      return path.join(process.cwd(), 'public', 'images', 'games', mappedFile);
    }
  }
  
  // If nothing matches, use default
  console.log(`Thumbnail ${baseFilename} not found, using default thumbnail ${thumbnailMappings.defaultThumbnail}`);
  return path.join(process.cwd(), 'public', 'images', 'games', thumbnailMappings.defaultThumbnail);
}

/**
 * Apply no-cache headers to response
 */
export function setNoCacheHeaders(res: any): void {
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
}