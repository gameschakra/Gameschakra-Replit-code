interface AnalyticsConfig {
  baseUrl: string;
  respectDNT: boolean;
  debug: boolean;
}

interface PlaySession {
  gameId: number;
  startTime: number;
}

class GameAnalytics {
  private config: AnalyticsConfig;
  private currentSession: PlaySession | null = null;
  private pageViewTimeout: number | null = null;
  private isEnabled: boolean = true;

  constructor(config: Partial<AnalyticsConfig> = {}) {
    this.config = {
      baseUrl: config.baseUrl || '/api/analytics',
      respectDNT: config.respectDNT !== false, // Default to true
      debug: config.debug || false
    };

    // Check if tracking is disabled
    this.checkTrackingPermission();

    // Set up page view tracking
    this.setupPageViewTracking();

    // Set up unload tracking for play sessions
    this.setupUnloadTracking();
  }

  private checkTrackingPermission(): void {
    // Check Do Not Track header
    if (this.config.respectDNT && navigator.doNotTrack === '1') {
      this.isEnabled = false;
      if (this.config.debug) {
        console.log('[Analytics] Tracking disabled due to DNT header');
      }
      return;
    }

    // Additional privacy checks could be added here
    this.isEnabled = true;
  }

  private log(message: string, ...args: any[]): void {
    if (this.config.debug) {
      console.log(`[Analytics] ${message}`, ...args);
    }
  }

  private async sendEvent(endpoint: string, data: any): Promise<void> {
    if (!this.isEnabled) {
      return;
    }

    try {
      const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`Analytics request failed: ${response.status}`);
      }

      this.log(`Event sent to ${endpoint}:`, data);
    } catch (error) {
      // Never throw errors that could break the main application
      if (this.config.debug) {
        console.error('[Analytics] Failed to send event:', error);
      }
    }
  }

  private setupPageViewTracking(): void {
    // Track initial page load
    this.trackPageView();

    // Track navigation in SPA
    // For React Router or similar, listen to popstate and pushstate
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function(...args) {
      originalPushState.apply(this, args);
      // Debounce page view tracking to avoid duplicate events
      if (typeof window !== 'undefined' && (window as any).gameAnalytics) {
        (window as any).gameAnalytics.debouncedTrackPageView();
      }
    };

    history.replaceState = function(...args) {
      originalReplaceState.apply(this, args);
      if (typeof window !== 'undefined' && (window as any).gameAnalytics) {
        (window as any).gameAnalytics.debouncedTrackPageView();
      }
    };

    window.addEventListener('popstate', () => {
      this.debouncedTrackPageView();
    });
  }

  private debouncedTrackPageView(): void {
    if (this.pageViewTimeout) {
      clearTimeout(this.pageViewTimeout);
    }

    this.pageViewTimeout = window.setTimeout(() => {
      this.trackPageView();
    }, 100); // 100ms debounce
  }

  private trackPageView(): void {
    // Page views are automatically tracked by server middleware
    // This method could be used for additional client-side tracking if needed
    this.log('Page view tracked by server middleware');
  }

  private setupUnloadTracking(): void {
    // Handle page unload/refresh during game sessions
    window.addEventListener('beforeunload', () => {
      if (this.currentSession) {
        this.endGameSession(this.currentSession.gameId);
      }
    });

    // Handle visibility change (tab switching, minimizing)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden' && this.currentSession) {
        // Don't end session on visibility change, just note it
        // The session will continue when user returns
      }
    });
  }

  // Public API methods
  public startGameSession(gameId: number): void {
    if (!this.isEnabled) return;

    // End any existing session first
    if (this.currentSession) {
      this.endGameSession(this.currentSession.gameId);
    }

    // Start new session
    this.currentSession = {
      gameId,
      startTime: Date.now()
    };

    this.sendEvent('/play/start', { gameId });
    this.log('Game session started', { gameId });
  }

  public endGameSession(gameId?: number): void {
    if (!this.isEnabled) return;

    const session = this.currentSession;
    if (!session) {
      this.log('No active session to end');
      return;
    }

    // Use provided gameId or current session gameId
    const targetGameId = gameId || session.gameId;

    if (targetGameId !== session.gameId) {
      this.log('Game ID mismatch, ending current session');
    }

    const durationMs = Date.now() - session.startTime;
    
    // Only send if minimum play time (e.g., 1 second)
    if (durationMs >= 1000) {
      this.sendEvent('/play/end', { 
        gameId: targetGameId, 
        durationMs 
      });
    }

    this.currentSession = null;
    this.log('Game session ended', { gameId: targetGameId, durationMs });
  }

  public isSessionActive(): boolean {
    return this.currentSession !== null;
  }

  public getCurrentSessionInfo(): { gameId: number; duration: number } | null {
    if (!this.currentSession) return null;

    return {
      gameId: this.currentSession.gameId,
      duration: Date.now() - this.currentSession.startTime
    };
  }

  // Utility method to manually track page views if needed
  public trackCustomEvent(eventName: string, data?: any): void {
    this.log('Custom event tracked', { eventName, data });
    // Could be extended to support custom events in the future
  }
}

// Global instance
let gameAnalyticsInstance: GameAnalytics | null = null;

// Initialize analytics
export function initializeAnalytics(config?: Partial<AnalyticsConfig>): GameAnalytics {
  if (!gameAnalyticsInstance) {
    gameAnalyticsInstance = new GameAnalytics(config);
    
    // Make available globally for debugging and external access
    if (typeof window !== 'undefined') {
      (window as any).gameAnalytics = gameAnalyticsInstance;
    }
  }
  
  return gameAnalyticsInstance;
}

// Convenience functions
export function startGameSession(gameId: number): void {
  if (gameAnalyticsInstance) {
    gameAnalyticsInstance.startGameSession(gameId);
  }
}

export function endGameSession(gameId?: number): void {
  if (gameAnalyticsInstance) {
    gameAnalyticsInstance.endGameSession(gameId);
  }
}

export function isSessionActive(): boolean {
  return gameAnalyticsInstance?.isSessionActive() || false;
}

export function getCurrentSessionInfo(): { gameId: number; duration: number } | null {
  return gameAnalyticsInstance?.getCurrentSessionInfo() || null;
}

// Auto-initialize with default config in browser environment
if (typeof window !== 'undefined') {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initializeAnalytics();
    });
  } else {
    initializeAnalytics();
  }
}