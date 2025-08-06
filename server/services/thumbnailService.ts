import path from "path";
import fs from "fs";
import * as fileService from "./fileService";

// Default image when nothing else is found
const DEFAULT_THUMBNAIL = '428181a5b6e6df875b9dc5a07ca14176.jpg'; // Hopping Crowns

// Maps game IDs to specific thumbnails (using only verified files that exist)
const idMappings: Record<number, string> = {
  33: "3c58303d155083757175fa05d9931a63.jpg",   // 90 Degrees
  34: "428181a5b6e6df875b9dc5a07ca14176.jpg",   // Hopping Crowns
  35: "e783b0222848d08100df776e5ce7772a.jpg",   // Loonie Birds
  36: "e783b0222848d08100df776e5ce7772a.jpg",   // Color Up (original was missing)
  37: "e783b0222848d08100df776e5ce7772a.jpg",   // Colored Circle (original was missing)
  38: "e2776b9069e9cd6058e47ab0f666d94c.jpg",   // BubbleSort
  39: "3c58303d155083757175fa05d9931a63.jpg",   // Color Box (original was missing)
  40: "e783b0222848d08100df776e5ce7772a.jpg",   // Alphabet Memory (original was missing)
  41: "f6908273e3cd5ae13de963280e133a27.jpg",   // Animal Fall
  42: "568a10a8ba8b2b2e0e1a39ffaeaf6a7f.jpg",   // Brick Dodge
  43: "ea743a9f68aef29cac0fec4c4fd0650e.jpg",   // NumberSnake
  
  // Common game IDs from screenshots - using available thumbnails
  50: "3c58303d155083757175fa05d9931a63.jpg",   // Star Blaster
  52: "3c58303d155083757175fa05d9931a63.jpg",   // Space Jump
  60: "e783b0222848d08100df776e5ce7772a.jpg",   // Bird Memory
  64: "f6908273e3cd5ae13de963280e133a27.jpg",   // Hungry Number
  65: "f6908273e3cd5ae13de963280e133a27.jpg",   // Jet Halloween
  66: "1ca87e1075258fbf9827c7f7e619e820.jpg",   // Hold up the Ball
  67: "568a10a8ba8b2b2e0e1a39ffaeaf6a7f.jpg",   // Stickman Fighter
  68: "ea743a9f68aef29cac0fec4c4fd0650e.jpg",   // Helicopter Fuel
  69: "428181a5b6e6df875b9dc5a07ca14176.jpg",   // Tic Tac Toe
  70: "f6908273e3cd5ae13de963280e133a27.jpg",   // PacMan
  71: "428181a5b6e6df875b9dc5a07ca14176.jpg",   // Jumper
  72: "1ca87e1075258fbf9827c7f7e619e820.jpg",   // Hold up the Ball
  73: "428181a5b6e6df875b9dc5a07ca14176.jpg",   // Jumper
};

// Maps last digit of game ID for consistent fallbacks - validated files only
const digitMappings: Record<number, string> = {
  0: '3c58303d155083757175fa05d9931a63.jpg',  // Use 90 Degrees instead of Waverun
  1: '428181a5b6e6df875b9dc5a07ca14176.jpg', // Hopping Crowns
  2: 'e783b0222848d08100df776e5ce7772a.jpg', // Loonie Birds
  3: '1ca87e1075258fbf9827c7f7e619e820.jpg', // Hold up the Ball
  4: '3c58303d155083757175fa05d9931a63.jpg', // 90 Degrees
  5: 'e2776b9069e9cd6058e47ab0f666d94c.jpg', // BubbleSort
  6: '3c58303d155083757175fa05d9931a63.jpg', // Use 90 Degrees instead of Color Box
  7: '568a10a8ba8b2b2e0e1a39ffaeaf6a7f.jpg', // Brick Dodge
  8: 'ea743a9f68aef29cac0fec4c4fd0650e.jpg', // NumberSnake
  9: 'f6908273e3cd5ae13de963280e133a27.jpg', // Animal Fall
};

// Maps game names to thumbnails for name-based lookups - only using thumbnails that exist
const nameMappings: Record<string, string> = {
  "Tic Tac Toe": "428181a5b6e6df875b9dc5a07ca14176.jpg",
  "Jumper": "428181a5b6e6df875b9dc5a07ca14176.jpg",
  "Ricochet": "428181a5b6e6df875b9dc5a07ca14176.jpg",
  "Richocet": "428181a5b6e6df875b9dc5a07ca14176.jpg",
  "Ninja Pumpkin": "428181a5b6e6df875b9dc5a07ca14176.jpg",
  "Hold up the Ball": "1ca87e1075258fbf9827c7f7e619e820.jpg",
  "PacMan": "f6908273e3cd5ae13de963280e133a27.jpg",
  "Star Blaster": "3c58303d155083757175fa05d9931a63.jpg",
  "Loonie Birds": "e783b0222848d08100df776e5ce7772a.jpg",
  "Hopping Crowns": "428181a5b6e6df875b9dc5a07ca14176.jpg",
  "90 Degrees": "3c58303d155083757175fa05d9931a63.jpg",
  "Color Up": "e783b0222848d08100df776e5ce7772a.jpg",
  "Colored Circle": "e783b0222848d08100df776e5ce7772a.jpg", 
  "BubbleSort": "e2776b9069e9cd6058e47ab0f666d94c.jpg",
  "Color Box": "3c58303d155083757175fa05d9931a63.jpg",
  "Alphabet Memory": "e783b0222848d08100df776e5ce7772a.jpg",
  "Animal Fall": "f6908273e3cd5ae13de963280e133a27.jpg",
  "Brick Dodge": "568a10a8ba8b2b2e0e1a39ffaeaf6a7f.jpg",
  "NumberSnake": "ea743a9f68aef29cac0fec4c4fd0650e.jpg",
  "Space Jump": "3c58303d155083757175fa05d9931a63.jpg",
  "Bird Memory": "e783b0222848d08100df776e5ce7772a.jpg",
  "Hungry Number": "f6908273e3cd5ae13de963280e133a27.jpg",
  "Jet Halloween": "f6908273e3cd5ae13de963280e133a27.jpg",
  "Stickman Fighter": "568a10a8ba8b2b2e0e1a39ffaeaf6a7f.jpg",
  "Helicopter Fuel": "ea743a9f68aef29cac0fec4c4fd0650e.jpg",
  "Dungeon box": "e783b0222848d08100df776e5ce7772a.jpg",
  "CutieTuttiFrutti": "428181a5b6e6df875b9dc5a07ca14176.jpg",
  "ABC Jump": "428181a5b6e6df875b9dc5a07ca14176.jpg",
  "2 Dots Challenge": "428181a5b6e6df875b9dc5a07ca14176.jpg",
  "Stone in Galaxy": "3c58303d155083757175fa05d9931a63.jpg",
  "Waverun": "3c58303d155083757175fa05d9931a63.jpg",
  "Equations Right or Wrong!": "428181a5b6e6df875b9dc5a07ca14176.jpg",
};

// Maps hash values to thumbnails for problematic files - using only verified files
const hashMappings: Record<string, string> = {
  // Core mapping using validated files
  'fe05f8c9a8df183956079af3acd0a79e.jpg': '428181a5b6e6df875b9dc5a07ca14176.jpg', // Hopping Crowns
  'c948062a29cd2fe293aab2985d77c60a.jpg': 'e783b0222848d08100df776e5ce7772a.jpg', // Loonie Birds
  '92dbcae728bb35a59950105f2f9eec4b.jpg': '3c58303d155083757175fa05d9931a63.jpg', // Star Blaster
  'f4cc59b28c6fb9c9b4142d2ea353cad7.jpg': '3c58303d155083757175fa05d9931a63.jpg', // 90 Degrees
  '9416012413033cdc9afd6c2ccea892ba.jpg': '428181a5b6e6df875b9dc5a07ca14176.jpg', // Tic Tac Toe
  '8f103ba97fc003c819e6de8efeae1341.jpg': '428181a5b6e6df875b9dc5a07ca14176.jpg', // Jumper
  '29aec4e9c100b3ef09d6c942e5505bd3.jpg': '1ca87e1075258fbf9827c7f7e619e820.jpg', // Hold up the Ball
  '0ac26b009d1ce7af56f492f12ce4b0e2.jpg': 'f6908273e3cd5ae13de963280e133a27.jpg', // PacMan
  'e085a25581b241c98752f02b63501f60.jpg': '428181a5b6e6df875b9dc5a07ca14176.jpg', // Richocet
  '367b5234a6fcf374227ee9f058fe2bcc.jpg': '428181a5b6e6df875b9dc5a07ca14176.jpg', // Ninja Pumpkin
  'd0caa20606bbef7fdf26f21b463f3745.jpg': 'ea743a9f68aef29cac0fec4c4fd0650e.jpg', // Helicopter Fuel
  '47ba4809ca80f0b639724e1bd37365da.jpg': '568a10a8ba8b2b2e0e1a39ffaeaf6a7f.jpg', // Stickman Fighter
  'bfa62cb583915eaf42fb396faa657573.jpg': 'f6908273e3cd5ae13de963280e133a27.jpg', // Jet Halloween
  
  // Additional mappings using confirmed files 
  'f5efff039db86bb64de542c656bb79c1.jpg': 'f6908273e3cd5ae13de963280e133a27.jpg', // Hungry Number 
  '76444b80450af4bf35a53ad4c6620e22.jpg': '428181a5b6e6df875b9dc5a07ca14176.jpg', // Equations Right or Wrong!
  'cff210ee181281c80cc432ade7ca5abf.jpg': 'e783b0222848d08100df776e5ce7772a.jpg', // Dungeon box
  '8e4b8962fb4957bfa08adbdbbf9315ec.jpg': '428181a5b6e6df875b9dc5a07ca14176.jpg', // CutieTuttiFrutti
  'cfcdd7a34cfa5fcf551dc4926acfcf78.jpg': 'e783b0222848d08100df776e5ce7772a.jpg', // Bird Memory
  '4885a5c53efcdfe136a1141b58251be3.jpg': '428181a5b6e6df875b9dc5a07ca14176.jpg', // ABC Jump
  'a547e7c12080e7b4536b8dcf5a0009a7.jpg': '428181a5b6e6df875b9dc5a07ca14176.jpg', // 2 Dots Challenge
  '11c8fde88800dbd142146d93b5b5f38d.jpg': '3c58303d155083757175fa05d9931a63.jpg', // Space Jump
  'e6a0a534b0bdafce25e5f717d1a7c3eb.jpg': 'ea743a9f68aef29cac0fec4c4fd0650e.jpg', // NumberSnake
  '223f83b02df9b17077ddc325d11f1255.jpg': '3c58303d155083757175fa05d9931a63.jpg', // Stone in Galaxy
  '1b127f4bc32bd99734a182341b2dba0a.jpg': '3c58303d155083757175fa05d9931a63.jpg', // Waverun
  'e6301519afb5c9e05e6314395d5caf48.jpg': '3c58303d155083757175fa05d9931a63.jpg', // Color Box
  '9bca1ec9763bac151c4cc00240283bb9.jpg': '568a10a8ba8b2b2e0e1a39ffaeaf6a7f.jpg', // Brick Dodge
  '4c57b16fcecc623db4afd3867d075971.jpg': 'f6908273e3cd5ae13de963280e133a27.jpg', // Animal Fall
  '162c1e37ee6c1bfe42755b18345456f8.jpg': 'e783b0222848d08100df776e5ce7772a.jpg', // Color Up
  'd5ca51c555d4726f167a3d57fe3dfd1b.jpg': 'e783b0222848d08100df776e5ce7772a.jpg', // Colored Circle
  '5c761f4376918d51bea14cc82d5cf760.jpg': 'e783b0222848d08100df776e5ce7772a.jpg', // Alphabet Memory
  '04ca5bd49a5e35aebecd8a4f487e4e41.jpg': 'e2776b9069e9cd6058e47ab0f666d94c.jpg', // BubbleSort
};

/**
 * Find the appropriate thumbnail file using multiple strategies
 * This enhanced version ensures proper thumbnail assignment for each game
 */
export async function findThumbnail(
  thumbnailPath: string, 
  gameId: number | null = null, 
  gameName: string | null = null
): Promise<string> {
  try {
    console.log(`Finding thumbnail for Path: ${thumbnailPath}, Game ID: ${gameId}, Game Name: ${gameName}`);
    
    // Clean up thumbnail path and parameters
    if (thumbnailPath && thumbnailPath.includes('?')) {
      thumbnailPath = thumbnailPath.split('?')[0];
    }
    
    // Ensure any gameName is decoded if it contains URL encoding
    if (gameName && gameName.includes('%')) {
      try {
        gameName = decodeURIComponent(gameName);
      } catch (e) {
        // Ignore decoding errors and use as-is
      }
    }
    
    // Strategy 1: Try exact file match in uploads directory
    try {
      const uploadPath = path.join(fileService.THUMBNAILS_DIR, thumbnailPath);
      await fs.promises.access(uploadPath);
      console.log(`Found exact thumbnail file in uploads: ${thumbnailPath}`);
      return uploadPath;
    } catch (err) {
      // File not in uploads directory, continue to next strategy
    }
    
    // Determine which thumbnail to use
    let thumbnailFile = DEFAULT_THUMBNAIL;
    let sourceStrategy = "default";
    
    // Strategy 2: Match by game ID - most precise and reliable
    if (gameId !== null && gameId > 0) {
      if (gameId in idMappings) {
        thumbnailFile = idMappings[gameId];
        sourceStrategy = `gameId:${gameId}`;
      } else {
        // Strategy 3: Use last digit for consistent mapping
        const lastDigit = gameId % 10;
        if (lastDigit in digitMappings) {
          thumbnailFile = digitMappings[lastDigit];
          sourceStrategy = `lastDigit:${lastDigit}`;
        }
      }
    }
    
    // Strategy 4: Match by game name if we haven't found a match by ID or if the game name is very specific
    if ((thumbnailFile === DEFAULT_THUMBNAIL || gameId === null) && 
        gameName !== null && gameName.length > 0) {
      if (gameName in nameMappings) {
        thumbnailFile = nameMappings[gameName];
        sourceStrategy = `gameName:${gameName}`;
      }
    }
    
    // Strategy 5: Match by hash for known problematic files when other methods fail
    if (thumbnailFile === DEFAULT_THUMBNAIL && thumbnailPath in hashMappings) {
      thumbnailFile = hashMappings[thumbnailPath];
      sourceStrategy = `hash:${thumbnailPath}`;
    }
    
    // Create file path and ensure it exists
    try {
      const staticPath = path.join(process.cwd(), 'public', 'images', 'games', thumbnailFile);
      // Verify the thumbnail file actually exists
      await fs.promises.access(staticPath);
      console.log(`Using thumbnail: ${thumbnailFile} from ${sourceStrategy} for request: ${thumbnailPath}`);
      return staticPath;
    } catch (e) {
      // Final fallback to the default image
      console.log(`Thumbnail ${thumbnailFile} not found, using default Hopping Crowns image.`);
      const defaultPath = path.join(process.cwd(), 'public', 'images', 'games', DEFAULT_THUMBNAIL);
      return defaultPath;
    }
  } catch (error) {
    // In case of any error, return the default thumbnail
    console.error("Error finding thumbnail:", error);
    const defaultPath = path.join(process.cwd(), 'public', 'images', 'games', DEFAULT_THUMBNAIL);
    return defaultPath;
  }
}

/**
 * Apply no-cache headers to response
 */
export function setNoCacheHeaders(res: any): void {
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
}