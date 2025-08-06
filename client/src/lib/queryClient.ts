import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorResponse;
    try {
      errorResponse = await res.json();
    } catch (e) {
      const text = (await res.text()) || res.statusText;
      throw new Error(`${res.status}: ${text}`);
    }
    
    if (errorResponse && errorResponse.message) {
      throw new Error(errorResponse.message);
    } else {
      throw new Error(`${res.status}: ${res.statusText}`);
    }
  }
}

export async function apiRequest<T = any>(
  method: string,
  url: string,
  data?: unknown | undefined,
  options: { isFormData?: boolean } = {}
): Promise<T> {
  // Set up enhanced headers for better cross-origin compatibility
  const headers: Record<string, string> = {
    'X-Requested-With': 'XMLHttpRequest', // Add for CORS preflight improvement
    'Accept': 'application/json', // Explicitly request JSON response
    'X-Admin-Token': 'admin123' // Add admin token for authentication
  };
  
  // Don't set Content-Type for FormData, browser will set it with correct boundary
  if (data && !options.isFormData) {
    headers["Content-Type"] = "application/json";
  }
  
  // Ensure URL has the right format
  const fullUrl = url;
  
  // Debug fetch call with enhanced logging
  console.log(`[API Call] ${method} ${fullUrl}`);
  console.log(`[API Call] Headers:`, headers);
  console.log(`[API Call] Data:`, options.isFormData ? 'FormData object' : data);
  console.log(`[API Call] Current cookies:`, document.cookie);
  
  // Detect if we're in Replit development environment vs production
  const isLocalDevelopment = window.location.hostname === 'localhost' || 
                            window.location.hostname.includes('.');
  
  console.log(`[API Call] Environment: ${isLocalDevelopment ? 'Development' : 'Production'}`);
  
  try {
    // Enhanced fetch configuration for Replit environment
    const requestOptions: RequestInit = {
      method,
      headers,
      credentials: "include", // Critical for auth - always include credentials
      mode: 'cors', // Explicitly set CORS mode for cross-origin requests
      cache: "no-cache", // Don't cache auth requests
      // Add longer timeout for uploads
      signal: method === 'POST' && options.isFormData ? 
        AbortSignal.timeout(600000) : // 10 minutes for uploads
        undefined
    };
    
    // Only add body when there's data to send
    if (data) {
      requestOptions.body = options.isFormData 
        ? (data as FormData) 
        : JSON.stringify(data);
    }
    
    const res = await fetch(fullUrl, requestOptions);

    // Enhanced debug info
    console.log(`[API Response] Status: ${res.status} ${res.statusText}`);
    console.log(`[API Response] Has credentials: ${res.type === 'cors' ? 'yes' : 'no'}`);
    console.log(`[API Response] Mode: ${res.type}`);
    console.log(`[API Response] Cookies after:`, document.cookie);
    
    if (res.status === 401) {
      console.log('[API Response] Authentication error detected');
      throw new Error("Authentication required");
    }
    
    await throwIfResNotOk(res);
    
    // Parse response as JSON
    const responseData = await res.json();
    console.log(`[API Response] Data:`, responseData);
    return responseData as T;
  } catch (error) {
    console.error('[API Error]', error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Use relative URLs
    const url = queryKey[0] as string;
    const fullUrl = url;
    
    // Detect if we're in Replit development environment vs production
    const isLocalDevelopment = window.location.hostname === 'localhost' || 
                               window.location.hostname.includes('.');
    
    console.log(`[Query] Environment: ${isLocalDevelopment ? 'Development' : 'Production'} for ${fullUrl}`);
    
    try {
      // Debug fetch call for query functions
      console.log(`[Query] Fetching: ${fullUrl}`);
      console.log(`[Query] Current cookies:`, document.cookie);
      
      // Enhanced fetch configuration matching apiRequest
      const res = await fetch(fullUrl, {
        method: 'GET',
        credentials: "include", // Critical for auth - always include credentials
        mode: 'cors', // Explicitly set CORS mode
        cache: "no-cache", // Don't cache auth requests
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest', // Add for CORS improvement
          'X-Admin-Token': 'admin123' // Add admin token for authentication
        }
      });

      // Enhanced logging
      console.log(`[Query] Response status: ${res.status} ${res.statusText}`);
      console.log(`[Query] Response type: ${res.type}`);
      console.log(`[Query] Cookies after:`, document.cookie);

      // Handle 401 based on requested behavior
      if (res.status === 401) {
        console.log(`[Query] 401 Unauthorized for ${fullUrl}`);
        if (unauthorizedBehavior === "returnNull") {
          console.log(`[Query] Returning null as configured for unauthorized`);
          return null;
        }
        console.log(`[Query] Throwing error as configured for unauthorized`);
        const errorText = await res.text();
        throw new Error(errorText || "Authentication required");
      }

      await throwIfResNotOk(res);
      
      const data = await res.json();
      console.log(`[Query] Success:`, data);
      return data;
    } catch (error) {
      console.error(`[Query] Error for ${fullUrl}:`, error);
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: (failureCount, error: any) => {
        // Check for error message indicating authentication issues
        const errorMessage = error?.message?.toLowerCase() || '';
        if (
          error?.status === 401 || 
          error?.status === 403 ||
          errorMessage.includes('unauthorized') || 
          errorMessage.includes('not authenticated')
        ) {
          return false; // Don't retry auth errors
        }
        return failureCount < 2; // Only retry other errors twice
      },
    },
    mutations: {
      retry: false,
    },
  },
});
