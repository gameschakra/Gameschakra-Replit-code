import { User } from "@/types";
import { apiRequest, queryClient } from "./queryClient";

// Auth related API calls
export const auth = {
  // Login
  async login(username: string, password: string): Promise<User> {
    console.log("Login attempt with:", { username, password: "*****" });
    
    try {
      const response = await apiRequest("POST", "/api/auth/login", { 
        username, 
        password 
      });
      
      console.log("Login success response:", response);
      
      // Ensure we refetch user data after successful login
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      await queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });
      
      // Return the user object
      return response;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },
  
  // Register
  async register(username: string, email: string, password: string): Promise<User> {
    const response = await apiRequest("POST", "/api/auth/register", { 
      username, 
      email, 
      password 
    });
    
    // Invalidate auth state
    queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    
    return response;
  },
  
  // Logout
  async logout(): Promise<void> {
    await apiRequest("POST", "/api/auth/logout", {});
    
    // Invalidate auth state
    queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
  },
  
  // Get current user
  async getCurrentUser(): Promise<User | null> {
    try {
      const user = await apiRequest("GET", "/api/auth/user", null);
      return user;
    } catch (error) {
      // Return null if not authenticated
      return null;
    }
  }
};

// Games related API calls
export const games = {
  // Get all games
  async getAll(options: { 
    limit?: number, 
    offset?: number,
    categoryId?: number,
    search?: string,
    status?: "draft" | "published",
    featured?: boolean
  } = {}): Promise<any[]> {
    let url = "/api/games";
    const queryParams = new URLSearchParams();
    
    if (options.limit) queryParams.append("limit", options.limit.toString());
    if (options.offset) queryParams.append("offset", options.offset.toString());
    if (options.categoryId) queryParams.append("categoryId", options.categoryId.toString());
    if (options.search) queryParams.append("search", options.search);
    if (options.status) queryParams.append("status", options.status);
    if (options.featured) queryParams.append("featured", options.featured.toString());
    
    const queryString = queryParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
    
    return apiRequest("GET", url, null);
  },
  
  // Get featured games
  async getFeatured(limit?: number): Promise<any[]> {
    const queryParams = limit ? `?limit=${limit}` : "";
    return apiRequest("GET", `/api/games/featured${queryParams}`, null);
  },
  
  // Get popular games
  async getPopular(limit?: number): Promise<any[]> {
    const queryParams = limit ? `?limit=${limit}` : "";
    return apiRequest("GET", `/api/games/popular${queryParams}`, null);
  },
  
  // Get single game by slug
  async getBySlug(slug: string): Promise<any> {
    return apiRequest("GET", `/api/games/${slug}`, null);
  },
  
  // Track a game play
  async trackPlay(gameId: number): Promise<void> {
    return apiRequest("POST", `/api/games/${gameId}/play`, {});
  }
};

// Categories related API calls
export const categories = {
  // Get all categories
  async getAll(): Promise<any[]> {
    return apiRequest("GET", "/api/categories", null);
  },
  
  // Get category by slug
  async getBySlug(slug: string): Promise<any> {
    return apiRequest("GET", `/api/categories/${slug}`, null);
  }
};

// Favorites related API calls
export const favorites = {
  // Get user favorites
  async getAll(): Promise<any[]> {
    return apiRequest("GET", "/api/favorites", null);
  },
  
  // Toggle favorite status
  async toggle(gameId: number): Promise<{ isFavorite: boolean }> {
    return apiRequest("POST", `/api/favorites/${gameId}`, {});
  },
  
  // Check if a game is favorited
  async isFavorite(gameId: number): Promise<{ isFavorite: boolean }> {
    return apiRequest("GET", `/api/favorites/is-favorite/${gameId}`, null);
  }
};

// Recently played related API calls
export const recentlyPlayed = {
  // Get user recently played games
  async getAll(): Promise<any[]> {
    return apiRequest("GET", "/api/recently-played", null);
  }
};