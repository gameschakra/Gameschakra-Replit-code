import { storage } from '../storage';
import * as fileService from './fileService';
import { 
  InsertGame, Game, InsertCategory, Category, 
  InsertFavorite, InsertRecentlyPlayed 
} from '@shared/schema';

// Create a new game
export async function createGame(gameData: Omit<InsertGame, 'gameDir' | 'entryFile'>, zipBuffer: Buffer, thumbnailBuffer?: Buffer): Promise<Game> {
  try {
    console.log('Creating game with data:', JSON.stringify({
      ...gameData,
      zipBuffer: zipBuffer ? `Buffer(${zipBuffer.length} bytes)` : null,
      thumbnailBuffer: thumbnailBuffer ? `Buffer(${thumbnailBuffer.length} bytes)` : null
    }, null, 2));

    if (!zipBuffer) {
      console.error('Game zip file buffer is missing or invalid');
      throw new Error('Game zip file buffer is missing or invalid');
    }

    console.log('Processing game zip file...');
    // Process the game zip file
    const gameResult = await fileService.processGameZip(zipBuffer);

    if (!gameResult || !gameResult.gameDir || !gameResult.entryFile) {
      console.error('Invalid game result returned from processGameZip:', gameResult);
      throw new Error('Failed to process game zip file: Invalid result');
    }

    const { gameDir, entryFile } = gameResult;
    console.log('Game zip processed successfully:', { gameDir, entryFile });

    // Prepare the initial game data without thumbnail
    const initialGameData = {
      ...gameData,
      gameDir,
      entryFile,
      thumbnailUrl: null
    };

    console.log('Saving game to database (initial):', JSON.stringify({
      ...initialGameData,
      description: initialGameData.description ? 'Yes' : 'No',
      instructions: initialGameData.instructions ? 'Yes' : 'No'
    }));

    // Create the game record first
    const game = await storage.createGame(initialGameData);
    console.log('Game created successfully with ID:', game.id);

    // Process thumbnail if provided (now we have game ID)
    if (thumbnailBuffer) {
      console.log('Processing thumbnail with game ID...');
      const { thumbnailPath } = await fileService.saveThumbnail(thumbnailBuffer, game.id);
      const thumbnailUrl = `/api/thumbnails/${thumbnailPath}`;
      console.log('Thumbnail saved:', thumbnailUrl);
      
      // Update game with thumbnail URL
      const updatedGame = await storage.updateGame(game.id, { thumbnailUrl });
      return updatedGame || game;
    }

    return game;
  } catch (error) {
    console.error('Error in createGame:', error);
    throw new Error(`Failed to create game: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Update a game
export async function updateGame(id: number, gameData: Partial<InsertGame>, zipBuffer?: Buffer, thumbnailBuffer?: Buffer): Promise<Game | undefined> {
  try {
    // Get the current game
    const currentGame = await storage.getGameById(id);
    if (!currentGame) {
      throw new Error('Game not found');
    }

    const updateData: Partial<InsertGame> = { ...gameData };

    // Process new zip file if provided
    if (zipBuffer) {
      // Remove old game files
      await fileService.removeGameDirectory(currentGame.gameDir);

      // Process new zip
      const { gameDir, entryFile } = await fileService.processGameZip(zipBuffer);
      updateData.gameDir = gameDir;
      updateData.entryFile = entryFile;
    }

    // Process new thumbnail if provided
    if (thumbnailBuffer) {
      // Remove old thumbnail if exists
      if (currentGame.thumbnailUrl) {
        const oldThumbnailPath = currentGame.thumbnailUrl.split('/').pop();
        if (oldThumbnailPath) {
          await fileService.removeThumbnail(oldThumbnailPath);
        }
      }

      // Save new thumbnail with game ID
      const { thumbnailPath } = await fileService.saveThumbnail(thumbnailBuffer, id);
      updateData.thumbnailUrl = `/api/thumbnails/${thumbnailPath}`;
    }

    // Update the game record
    const updatedGame = await storage.updateGame(id, updateData);
    return updatedGame;
  } catch (error: unknown) {
    const err = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to update game: ${err}`);
  }
}

// Update a game's thumbnail
export async function updateGameThumbnail(id: number, thumbnailBuffer: Buffer): Promise<Game | undefined> {
  try {
    // Get the current game
    const currentGame = await storage.getGameById(id);
    if (!currentGame) {
      throw new Error('Game not found');
    }

    // Extract the old thumbnail path if it exists
    let oldThumbnailPath: string | null = null;
    if (currentGame.thumbnailUrl) {
      oldThumbnailPath = currentGame.thumbnailUrl.split('/').pop() || null;
    }

    // Process the new thumbnail with game ID for unique naming
    const { thumbnailPath } = await fileService.saveThumbnail(thumbnailBuffer, id);
    const thumbnailUrl = `/api/thumbnails/${thumbnailPath}`;
    
    // Remove old thumbnail if it exists
    if (oldThumbnailPath) {
      try {
        await fileService.removeThumbnail(oldThumbnailPath);
      } catch (err) {
        console.log('Failed to remove old thumbnail:', err);
      }
    }

    // Update the game record
    const updatedGame = await storage.updateGame(id, { thumbnailUrl });
    return updatedGame;
  } catch (error) {
    throw new Error(`Failed to update game thumbnail: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Delete a game
export async function deleteGame(id: number): Promise<boolean> {
  try {
    console.log(`[gameService] Starting delete process for gameId: ${id}`);

    // Get the current game
    const game = await storage.getGameById(id);
    if (!game) {
      console.log(`[gameService] Game with ID: ${id} not found`);
      return false;
    }

    console.log(`[gameService] Found game for deletion: ${game.title} (ID: ${id})`);

    try {
      // First delete related records that might cause foreign key constraints
      console.log(`[gameService] Deleting game record from database first to handle cascade deletions`);
      const deleteResult = await storage.deleteGame(id);

      if (!deleteResult) {
        console.error(`[gameService] Failed to delete game record from database`);
        return false;
      }

      // After database deletion is successful, remove files
      console.log(`[gameService] Database record deleted successfully, now cleaning up files`);

      // Delete game files
      console.log(`[gameService] Removing game directory: ${game.gameDir}`);
      try {
        await fileService.removeGameDirectory(game.gameDir);
      } catch (error: unknown) {
        const fsError = error as Error;
        console.error(`[gameService] Error removing game directory: ${fsError.message}`);
        // Continue with deletion process even if file deletion fails
      }

      // Delete thumbnail if exists
      if (game.thumbnailUrl) {
        const thumbnailPath = game.thumbnailUrl.split('/').pop();
        if (thumbnailPath) {
          console.log(`[gameService] Removing thumbnail: ${thumbnailPath}`);
          try {
            await fileService.removeThumbnail(thumbnailPath);
          } catch (error: unknown) {
            const thumbError = error as Error;
            console.error(`[gameService] Error removing thumbnail: ${thumbError.message}`);
            // Continue with process even if thumbnail deletion fails
          }
        }
      }

      console.log(`[gameService] Game deletion completed successfully for ID: ${id}`);
      return true;
    } catch (error: unknown) {
      const dbError = error as Error;
      console.error(`[gameService] Database operation failed: ${dbError.message}`);
      throw dbError;
    }
  } catch (error: unknown) {
    const err = error as Error;
    console.error(`[gameService] Delete game error: ${err.message}`, err);
    throw new Error(`Failed to delete game: ${err.message}`);
  }
}

// Track game play
export async function trackGamePlay(gameId: number, userId?: number): Promise<void> {
  try {
    // Increment play count
    await storage.incrementGamePlayCount(gameId);

    // Add to recently played if user is logged in
    if (userId) {
      const recentlyPlayed: InsertRecentlyPlayed = {
        userId,
        gameId
      };
      await storage.addRecentlyPlayed(recentlyPlayed);
    }
  } catch (error: unknown) {
    const err = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to track game play: ${err}`);
  }
}

// Toggle game favorite status
export async function toggleGameFavorite(userId: number, gameId: number): Promise<boolean> {
  try {
    // Check if already favorited
    const isFavorite = await storage.isGameFavorite(userId, gameId);

    if (isFavorite) {
      // Remove from favorites
      await storage.removeFavorite(userId, gameId);
      return false;
    } else {
      // Add to favorites
      const favorite: InsertFavorite = {
        userId,
        gameId
      };
      await storage.addFavorite(favorite);
      return true;
    }
  } catch (error: unknown) {
    const err = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to toggle favorite: ${err}`);
  }
}

// Create a new category
export async function createCategory(categoryData: InsertCategory): Promise<Category> {
  try {
    return await storage.createCategory(categoryData);
  } catch (error: unknown) {
    const err = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to create category: ${err}`);
  }
}

// Update a category
export async function updateCategory(id: number, categoryData: Partial<InsertCategory>): Promise<Category | undefined> {
  try {
    return await storage.updateCategory(id, categoryData);
  } catch (error: unknown) {
    const err = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to update category: ${err}`);
  }
}

// Delete a category
export async function deleteCategory(id: number): Promise<boolean> {
  try {
    return await storage.deleteCategory(id);
  } catch (error: unknown) {
    const err = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to delete category: ${err}`);
  }
}