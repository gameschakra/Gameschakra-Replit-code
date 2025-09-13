import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Define types
type User = {
  id: number;
  email: string;
  name: string;
  username: string;
  phone?: string;
  city?: string;
  country?: string;
  avatarUrl?: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
  password?: string | null;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string, phone: string, username: string, city?: string, country?: string) => Promise<User>;
  updateUser: (data: Partial<Pick<User, 'name' | 'phone' | 'city' | 'country'>>) => Promise<User>;
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [lastAuthCheck, setLastAuthCheck] = useState<Date>(new Date());
  
  // Get current user query
  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['/api/auth/me', lastAuthCheck],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/auth/me', null);
        console.log('Auth provider user data:', response);
        return response;
      } catch (error) {
        console.log('Auth provider user fetch error:', error);
        return { user: null };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    retry: false, // Don't retry auth requests
  });

  const user = response?.user || null;

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      console.log('Login attempt with:', { email, password: '******' });
      const response = await apiRequest('POST', '/api/auth/login', { email, password });
      console.log('Login response:', response);
      return response.user;
    },
    onSuccess: () => {
      // Refetch user data
      setLastAuthCheck(new Date());
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    },
    onError: (error: Error) => {
      console.error('Login error:', error);
      toast({
        title: 'Login failed',
        description: error.message || 'Please check your credentials and try again',
        variant: 'destructive',
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/auth/logout', {});
      return response;
    },
    onSuccess: () => {
      // Clear user data
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      
      // Clear all favorites-related queries completely
      queryClient.removeQueries({ 
        predicate: (query) => {
          const queryKey = query.queryKey as string[];
          return queryKey.some(key => 
            typeof key === 'string' && 
            (key.includes('/api/favorites') || key.includes('favorites'))
          );
        }
      });
      
      // Also clear any recently played or user-specific data
      queryClient.removeQueries({ 
        predicate: (query) => {
          const queryKey = query.queryKey as string[];
          return queryKey.some(key => 
            typeof key === 'string' && 
            (key.includes('/api/recently-played') || key.includes('recently-played'))
          );
        }
      });
      
      // Force a re-render by updating auth check timestamp
      setLastAuthCheck(new Date());
      
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out',
      });
    },
    onError: (error: Error) => {
      console.error('Logout error:', error);
      toast({
        title: 'Logout failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async ({
      email,
      password,
      name,
      phone,
      username,
      city,
      country,
    }: {
      email: string;
      password: string;
      name: string;
      phone: string;
      username: string;
      city?: string;
      country?: string;
    }) => {
      const response = await apiRequest('POST', '/api/auth/register', {
        email,
        password,
        name,
        phone,
        username,
        city,
        country,
      });
      return response.user;
    },
    onSuccess: () => {
      // Refetch user data
      setLastAuthCheck(new Date());
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      toast({
        title: 'Registration successful',
        description: 'Your account has been created',
      });
    },
    onError: (error: Error) => {
      console.error('Registration error:', error);
      toast({
        title: 'Registration failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Auth methods
  const login = async (email: string, password: string): Promise<User> => {
    console.log('AuthProvider.login called with email:', email);
    try {
      const user = await loginMutation.mutateAsync({ email, password });
      console.log('Login successful, user:', user);
      return user;
    } catch (error) {
      console.error('Login error in AuthProvider:', error);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    await logoutMutation.mutateAsync();
  };

  const register = async (email: string, password: string, name: string, phone: string, username: string, city?: string, country?: string): Promise<User> => {
    try {
      const user = await registerMutation.mutateAsync({ email, password, name, phone, username, city, country });
      return user;
    } catch (error) {
      console.error('Registration error in AuthProvider:', error);
      throw error;
    }
  };

  const updateUser = async (data: Partial<Pick<User, 'name' | 'phone' | 'city' | 'country'>>): Promise<User> => {
    try {
      const response = await apiRequest('PUT', '/api/auth/profile', data);
      // Refresh user data
      setLastAuthCheck(new Date());
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      return response.user;
    } catch (error: any) {
      console.error('Update user error in AuthProvider:', error);
      throw error;
    }
  };

  // Check authentication status periodically
  useEffect(() => {
    const checkAuthStatus = () => {
      setLastAuthCheck(new Date());
    };

    // Check auth status every 5 minutes
    const intervalId = setInterval(checkAuthStatus, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        register,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}