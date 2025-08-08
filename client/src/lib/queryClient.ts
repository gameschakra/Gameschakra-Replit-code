import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorMessage = `${res.status}: ${res.statusText}`;
    
    // Clone the response to avoid "body already read" errors
    const responseClone = res.clone();
    
    try {
      // Try to parse as JSON first
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorResponse = await responseClone.json();
        if (errorResponse && errorResponse.message) {
          errorMessage = typeof errorResponse.message === 'string' 
            ? errorResponse.message 
            : JSON.stringify(errorResponse.message);
        }
      } else {
        // If not JSON, try to read as text
        const text = await responseClone.text();
        if (text && text.trim()) {
          errorMessage = `${res.status}: ${text.slice(0, 200)}`;
        }
      }
    } catch (e) {
      // If all parsing fails, use the default status text
      console.warn('Failed to read error response, using default:', e);
    }
    
    throw new Error(errorMessage);
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
    'Content-Type': 'application/json' // Ensure JSON content type is set by default
  };
  
  // Don't set Content-Type for FormData, browser will set it with correct boundary
  if (options.isFormData) {
    delete headers["Content-Type"]; // Remove Content-Type for FormData
  }
  
  // Ensure URL has the right format
  const fullUrl = url;
  
  // Debug fetch call with enhanced logging
  console.log(`[API Call] ${method} ${fullUrl}`);
  console.log(`[API Call] Headers:`, headers);
  console.log(`[API Call] Data:`, options.isFormData ? 'FormData object' : data);
  console.log(`[API Call] Current cookies:`, document.cookie);
  
  // Detect if we're in localhost development environment
  const isLocalDevelopment = window.location.hostname === 'localhost' || 
                            window.location.hostname === '127.0.0.1' ||
                            window.location.hostname.includes('localhost');
  
  console.log(`[API Call] Environment: ${isLocalDevelopment ? 'Local Development' : 'Production/Remote'}`);
  console.log(`[API Call] Hostname: ${window.location.hostname}`);
  
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
    
    // Parse response as JSON with defensive coding and proper content type checking
    let responseData: T;
    
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      try {
        responseData = await res.json();
      } catch (error) {
        console.error('[API Response] Failed to parse JSON response:', error);
        throw new Error('Failed to parse server response as JSON');
      }
    } else {
      // Handle non-JSON responses
      console.warn(`[API Response] Unexpected content type: ${contentType}`);
      try {
        const text = await res.text();
        console.warn(`[API Response] Response text: ${text.slice(0, 200)}`);
        throw new Error(`Server returned non-JSON response: ${contentType}`);
      } catch (error) {
        throw new Error('Failed to parse server response');
      }
    }
    
    console.log(`[API Response] Data:`, responseData);
    return responseData;
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
    
    // Detect if we're in localhost development environment
    const isLocalDevelopment = window.location.hostname === 'localhost' || 
                               window.location.hostname === '127.0.0.1' ||
                               window.location.hostname.includes('localhost');
    
    console.log(`[Query] Environment: ${isLocalDevelopment ? 'Local Development' : 'Production/Remote'} for ${fullUrl}`);
    console.log(`[Query] Hostname: ${window.location.hostname}`);
    
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
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest' // Add for CORS improvement
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
      
      // Parse response as JSON with defensive coding and proper content type checking
      let data;
      
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        try {
          data = await res.json();
        } catch (error) {
          console.error('[Query] Failed to parse JSON response:', error);
          throw new Error('Failed to parse server response as JSON');
        }
      } else {
        // Handle non-JSON responses
        console.warn(`[Query] Unexpected content type: ${contentType}`);
        try {
          const text = await res.text();
          console.warn(`[Query] Response text: ${text.slice(0, 200)}`);
          throw new Error(`Server returned non-JSON response: ${contentType}`);
        } catch (error) {
          throw new Error('Failed to parse server response');
        }
      }
      
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
