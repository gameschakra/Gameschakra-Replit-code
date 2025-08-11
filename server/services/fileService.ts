import * as fsPromises from 'fs/promises';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import extractZip from 'extract-zip';
import AdmZip from 'adm-zip';

// Base directories
export const ROOT_DIR = process.cwd();
export const UPLOAD_DIR = path.join(ROOT_DIR, 'uploads');
export const GAMES_DIR = path.join(UPLOAD_DIR, 'games');
export const THUMBNAILS_DIR = path.join(UPLOAD_DIR, 'thumbnails');

// Public directories for consistent access
export const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
export const PUBLIC_IMAGES_DIR = path.join(PUBLIC_DIR, 'images');
export const PUBLIC_GAMES_IMAGES_DIR = path.join(PUBLIC_IMAGES_DIR, 'games');
export const DEFAULT_THUMBNAIL = path.join(PUBLIC_IMAGES_DIR, 'placeholder-game.jpg');

// Ensure directories exist
async function ensureDirectories() {
  await fsPromises.mkdir(UPLOAD_DIR, { recursive: true });
  await fsPromises.mkdir(GAMES_DIR, { recursive: true });
  await fsPromises.mkdir(THUMBNAILS_DIR, { recursive: true });
  await fsPromises.mkdir(PUBLIC_IMAGES_DIR, { recursive: true });
  await fsPromises.mkdir(PUBLIC_GAMES_IMAGES_DIR, { recursive: true });
}

// Initialize directories
(async () => {
  try {
    await ensureDirectories();
  } catch (error: unknown) {
    const err = error instanceof Error ? error.message : String(error);
    console.error('Failed to create upload directories:', err);
  }
})();

// Generate a unique folder name
function generateUniqueFolderName(): string {
  return crypto.randomBytes(16).toString('hex');
}

export interface UploadedGame {
  gameDir: string;
  entryFile: string;
}

export interface ThumbnailResult {
  thumbnailPath: string;
}

/**
 * Processes a game zip file
 * - Pre-validates the ZIP content for index.html
 * - Extracts the zip to a unique directory
 * - Finds the entry HTML file
 * - Returns the path information
 */
export async function processGameZip(zipBuffer: Buffer): Promise<UploadedGame> {
  if (!zipBuffer || !(zipBuffer instanceof Buffer)) {
    console.error('Invalid zip buffer provided:', zipBuffer);
    throw new Error('Invalid zip buffer provided');
  }

  console.log('Processing zip buffer of size:', zipBuffer.length);
  
  // Pre-validate ZIP content using adm-zip
  try {
    // Using AdmZip to validate ZIP content
    try {
      const zip = new AdmZip(zipBuffer);
      const zipEntries = zip.getEntries();
      
      // Check for index.html in root directory
      const hasIndexHtml = zipEntries.some((entry: any) => 
        entry.entryName === 'index.html' || 
        entry.entryName.toLowerCase() === 'index.html'
      );
      
      // Check for index.html in any subdirectory
      const hasIndexHtmlInSubdir = zipEntries.some((entry: any) => 
        entry.entryName.endsWith('/index.html') || 
        entry.entryName.toLowerCase().endsWith('/index.html')
      );
      
      // Check for any HTML file
      const hasAnyHtmlFile = zipEntries.some((entry: any) => 
        entry.entryName.endsWith('.html') || 
        entry.entryName.toLowerCase().endsWith('.html')
      );
      
      console.log('ZIP validation results:', {
        hasIndexHtml,
        hasIndexHtmlInSubdir,
        hasAnyHtmlFile,
        totalEntries: zipEntries.length
      });
      
      if (!hasAnyHtmlFile) {
        throw new Error('ZIP file does not contain any HTML files. Please include at least one HTML file, preferably an index.html in the root directory.');
      }
      
      if (!hasIndexHtml && !hasIndexHtmlInSubdir) {
        console.warn('ZIP file does not contain index.html. It\'s recommended to use index.html as the main entry point.');
        // We don't throw here, as we can use any HTML file as fallback
      }
    } catch (zipValidationError: any) {
      console.error('Error validating ZIP content:', zipValidationError);
      
      // If it's our custom error message, rethrow it
      if (zipValidationError.message.includes('ZIP file does not contain')) {
        throw zipValidationError;
      }
      
      // Otherwise, it's likely a corrupted ZIP
      throw new Error(`Invalid or corrupted ZIP file: ${zipValidationError.message}`);
    }
  } catch (admZipError: any) {
    // If adm-zip isn't available, log warning but continue
    console.warn('adm-zip not available for pre-validation, proceeding without pre-check:', admZipError.message);
  }
  
  const folderName = generateUniqueFolderName();
  const gamePath = path.join(GAMES_DIR, folderName);
  
  console.log(`Creating game directory: ${gamePath}`);
  
  try {
    // Create the game directory
    await fsPromises.mkdir(gamePath, { recursive: true });
    
    console.log(`Extracting zip file to: ${gamePath}`);
    // Create a temporary zip file
    const tempZipPath = path.join(gamePath, 'temp.zip');
    
    try {
      // Write the buffer to a temporary file
      await fsPromises.writeFile(tempZipPath, zipBuffer);
      
      // Extract the zip file
      await extractZip(tempZipPath, { dir: path.resolve(gamePath) });
      console.log('ZIP extraction successful');
      
      // Delete the temporary zip file
      await fsPromises.unlink(tempZipPath);
    } catch (zipError: any) {
      console.error('Error during ZIP extraction:', zipError);
      throw new Error(`Failed to extract ZIP file: ${zipError.message}`);
    }
    
    console.log('Zip extraction complete, searching for HTML files');
    
    // Find the entry HTML file (index.html or similar)
    const files = await fsPromises.readdir(gamePath);
    console.log(`Found files in root directory: ${files.join(', ')}`);
    
    // Check for index.html at the root
    if (files.includes('index.html')) {
      console.log('Found index.html at root level');
      return {
        gameDir: folderName,
        entryFile: 'index.html'
      };
    }
    
    // Search for any .html file
    for (const file of files) {
      if (file.endsWith('.html')) {
        console.log(`Found HTML file at root level: ${file}`);
        return {
          gameDir: folderName,
          entryFile: file
        };
      }
    }
    
    // If no HTML file found, search in subdirectories
    console.log('No HTML files at root, searching subdirectories');
    for (const file of files) {
      const filePath = path.join(gamePath, file);
      const stats = await fsPromises.stat(filePath);
      
      if (stats.isDirectory()) {
        console.log(`Checking subdirectory: ${file}`);
        const subFiles = await fsPromises.readdir(filePath);
        console.log(`Files in ${file} subdirectory: ${subFiles.join(', ')}`);
        
        // Check for index.html in the subdirectory
        if (subFiles.includes('index.html')) {
          console.log(`Found index.html in subdirectory: ${file}`);
          return {
            gameDir: folderName,
            entryFile: path.join(file, 'index.html')
          };
        }
        
        // Check for any .html file in the subdirectory
        for (const subFile of subFiles) {
          if (subFile.endsWith('.html')) {
            console.log(`Found HTML file in subdirectory: ${file}/${subFile}`);
            return {
              gameDir: folderName,
              entryFile: path.join(file, subFile)
            };
          }
        }
      }
    }
    
    console.log('No HTML files found, throwing error');
    throw new Error('No HTML files found in the ZIP file. Please include at least one HTML file, preferably an index.html in the root directory.');
    // If no HTML file found, create a simple index.html
    await createFallbackHtml(gamePath);
    
    console.log('Returning game info with fallback HTML');
    return {
      gameDir: folderName,
      entryFile: 'index.html'
    };
  } catch (error: unknown) {
    console.error('Error in processGameZip:', error);
    // Clean up on error
    try {
      await fsPromises.rm(gamePath, { recursive: true, force: true });
    } catch (cleanupError) {
      console.error('Failed to clean up after error:', cleanupError);
    }
    const err = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to process game zip: ${err}`);
  }
}

/**
 * Creates a fallback HTML file when no valid HTML is found in the zip
 */
async function createFallbackHtml(gamePath: string): Promise<void> {
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Game</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      background-color: #f0f0f0;
    }
    .message {
      max-width: 500px;
      padding: 20px;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      text-align: center;
    }
    h1 {
      color: #333;
    }
    p {
      color: #666;
    }
  </style>
</head>
<body>
  <div class="message">
    <h1>Game Loading Error</h1>
    <p>The uploaded game files couldn't be properly loaded. Please check that your ZIP file contains a valid HTML5 game with an index.html file.</p>
  </div>
</body>
</html>
  `;
  
  await fsPromises.writeFile(path.join(gamePath, 'index.html'), htmlContent.trim());
}

/**
 * Saves a thumbnail image with unique filename to avoid collisions
 */
export async function saveThumbnail(imageBuffer: Buffer, gameId?: number): Promise<ThumbnailResult> {
  if (!imageBuffer || !(imageBuffer instanceof Buffer)) {
    throw new Error('Invalid thumbnail buffer provided');
  }

  // GC_FIX: Generate unique filename with timestamp to avoid collisions
  const timestamp = Date.now();
  const randomSuffix = crypto.randomBytes(4).toString('hex');
  const filename = gameId 
    ? `game_${gameId}_${timestamp}_${randomSuffix}.jpg`
    : `thumbnail_${timestamp}_${randomSuffix}.jpg`;
  
  const thumbnailPath = path.join(THUMBNAILS_DIR, filename);
  
  console.log(`Saving thumbnail to ${thumbnailPath}`);
  
  try {
    // Make sure the directories exist
    await fsPromises.mkdir(THUMBNAILS_DIR, { recursive: true });
    
    // Write the file to uploads/thumbnails only (canonical storage)
    await fsPromises.writeFile(thumbnailPath, imageBuffer);
    
    console.log(`Thumbnail saved successfully: ${filename}`);
    
    return {
      thumbnailPath: filename
    };
  } catch (error: unknown) {
    console.error('Error saving thumbnail:', error);
    const err = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to save thumbnail: ${err}`);
  }
}

/**
 * Removes a game directory
 */
export async function removeGameDirectory(gameDir: string): Promise<void> {
  if (!gameDir) {
    console.error(`[fileService] Cannot remove game directory: gameDir is empty or undefined`);
    return;
  }
  
  const gamePath = path.join(GAMES_DIR, gameDir);
  console.log(`[fileService] Removing game directory at: ${gamePath}`);
  
  try {
    // Check if directory exists before removing
    const exists = await fsPromises.access(gamePath)
      .then(() => true)
      .catch(() => false);
      
    if (!exists) {
      console.log(`[fileService] Game directory does not exist at: ${gamePath}`);
      return;
    }
    
    await fsPromises.rm(gamePath, { recursive: true, force: true });
    console.log(`[fileService] Successfully removed game directory: ${gamePath}`);
  } catch (error: unknown) {
    const err = error instanceof Error ? error.message : String(error);
    console.error(`[fileService] Error removing game directory: ${err}`, error);
    // Re-throw so caller can handle or ignore as needed
    throw new Error(err);
  }
}

/**
 * Removes a thumbnail
 */
export async function removeThumbnail(thumbnailPath: string): Promise<void> {
  if (!thumbnailPath) {
    console.error(`[fileService] Cannot remove thumbnail: thumbnailPath is empty or undefined`);
    return;
  }
  
  const fullPath = path.join(THUMBNAILS_DIR, thumbnailPath);
  console.log(`[fileService] Removing thumbnail at: ${fullPath}`);
  
  try {
    // Check if file exists before removing
    const exists = await fsPromises.access(fullPath)
      .then(() => true)
      .catch(() => false);
      
    if (!exists) {
      console.log(`[fileService] Thumbnail does not exist at: ${fullPath}`);
      return;
    }
    
    await fsPromises.unlink(fullPath);
    console.log(`[fileService] Successfully removed thumbnail: ${fullPath}`);
  } catch (error: unknown) {
    const err = error instanceof Error ? error.message : String(error);
    console.error(`[fileService] Error removing thumbnail: ${err}`, error);
    // Re-throw so caller can handle or ignore as needed
    throw new Error(err);
  }
}

/**
 * Updates a game's thumbnail
 * Removes the old thumbnail and saves the new one
 */
export async function updateGameThumbnail(oldThumbnailPath: string | null, imageBuffer: Buffer): Promise<ThumbnailResult> {
  // Remove the old thumbnail if it exists
  if (oldThumbnailPath) {
    try {
      await removeThumbnail(oldThumbnailPath);
    } catch (error: unknown) {
      const err = error instanceof Error ? error.message : String(error);
      console.error(`[fileService] Error removing old thumbnail: ${err}`, error);
      // Continue with saving the new thumbnail even if removal fails
    }
  }
  
  // Save the new thumbnail
  return await saveThumbnail(imageBuffer);
}

/**
 * Gets the full path for a game file
 */
export function getGameFilePath(gameDir: string, entryFile: string): string {
  return path.join(GAMES_DIR, gameDir, entryFile);
}

/**
 * Checks multiple locations for a thumbnail and returns the best available path
 */
export async function findBestThumbnailPath(filename: string): Promise<string> {
  // Step 1: Check if original thumbnail exists in uploads/thumbnails
  const originalPath = path.join(THUMBNAILS_DIR, filename);
  try {
    await fsPromises.access(originalPath, fs.constants.F_OK);
    console.log(`Found original thumbnail: ${filename}`);
    return originalPath;
  } catch {
    // Original thumbnail not found, continue to next option
  }
  
  // Step 2: Check if duplicate exists in public/images/games
  const publicPath = path.join(PUBLIC_GAMES_IMAGES_DIR, filename);
  try {
    await fsPromises.access(publicPath, fs.constants.F_OK);
    console.log(`Found thumbnail in public directory: ${filename}`);
    return publicPath;
  } catch {
    // Public copy not found, continue to next option
  }
  
  // Step 3: Try to find any thumbnail with the same base name (without extension)
  const baseName = path.parse(filename).name;
  try {
    const publicFiles = await fsPromises.readdir(PUBLIC_GAMES_IMAGES_DIR);
    const matchingFile = publicFiles.find(file => file.startsWith(baseName));
    if (matchingFile) {
      const matchingPath = path.join(PUBLIC_GAMES_IMAGES_DIR, matchingFile);
      console.log(`Found similar thumbnail in public directory: ${matchingFile}`);
      return matchingPath;
    }
  } catch {
    // Failed to read directory or no matching file found, continue to fallback
  }
  
  // Step 4: If all above fails, use the default placeholder image
  console.log(`No thumbnail found for ${filename}, using default placeholder`);
  return DEFAULT_THUMBNAIL;
}

/**
 * Gets the full path for a thumbnail.
 * Also handles fallback to default thumbnail if the requested file doesn't exist.
 * Legacy synchronous version - use findBestThumbnailPath for async operations
 */
export function getThumbnailPath(thumbnailPath: string): string {
  // If the path is already absolute, return it as is
  if (path.isAbsolute(thumbnailPath)) {
    return thumbnailPath;
  }
  
  // First check in uploads/thumbnails
  const fullPath = path.join(THUMBNAILS_DIR, thumbnailPath);
  if (fs.existsSync(fullPath)) {
    return fullPath;
  }
  
  // Then check in public/images/games
  const publicPath = path.join(PUBLIC_GAMES_IMAGES_DIR, thumbnailPath);
  if (fs.existsSync(publicPath)) {
    console.log(`Found thumbnail in public directory: ${thumbnailPath}`);
    return publicPath;
  }
  
  // Fallback to default placeholder
  console.log(`Thumbnail not found: ${thumbnailPath}, using default placeholder image.`);
  
  // Check if default placeholder exists
  if (fs.existsSync(DEFAULT_THUMBNAIL)) {
    return DEFAULT_THUMBNAIL;
  }
  
  // If even the default placeholder doesn't exist, try some fallbacks
  const defaultThumbnails = [
    path.join(THUMBNAILS_DIR, 'be629a0480a027ba3a204cef0c438414.jpg'),
    path.join(THUMBNAILS_DIR, '912e31351cae8f7854b90af3b2d680d4.jpg')
  ];
  
  for (const defaultPath of defaultThumbnails) {
    if (fs.existsSync(defaultPath)) {
      console.log(`Using default thumbnail: ${path.basename(defaultPath)}`);
      return defaultPath;
    }
  }
  
  // If we get here, we couldn't find any suitable image
  console.error('No default thumbnails found! This is unexpected.');
  return fullPath; // Return the original path and let the caller handle the 404
}
