/**
 * Demo script for game developers to show how to use the displayAD function
 * 
 * This function is automatically available in the global window object
 * when your game runs on GamesChakra
 */

// Example of how to trigger an ad after a level completes
function onLevelComplete() {
  // Check if the displayAD function exists in the window object
  if (typeof window.displayAD === 'function') {
    // Call it to show an ad
    window.displayAD();
  } else {
    console.warn('displayAD function not found. Is your game running on GamesChakra?');
  }
}

// Example of how to trigger an ad after game over
function onGameOver() {
  if (typeof window.displayAD === 'function') {
    window.displayAD();
  }
}

// Example of how to trigger an ad at specific intervals 
// (e.g., every 3 minutes of gameplay)
let lastAdTime = 0;
const AD_INTERVAL = 3 * 60 * 1000; // 3 minutes in milliseconds

function checkIfAdShouldDisplay() {
  const currentTime = Date.now();
  
  // If enough time has passed since the last ad
  if (currentTime - lastAdTime > AD_INTERVAL) {
    // Display ad
    if (typeof window.displayAD === 'function') {
      window.displayAD();
      lastAdTime = currentTime;
    }
  }
}

// Game loop example that calls checkIfAdShouldDisplay
function gameLoop() {
  // Game logic here...
  
  // Check if it's time to show an ad
  checkIfAdShouldDisplay();
  
  // Continue game loop
  requestAnimationFrame(gameLoop);
}

// Start the game loop
// gameLoop();