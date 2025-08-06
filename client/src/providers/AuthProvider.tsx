import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Define types
type User = {
  id: number;
  username: string;
  email: string;
  isAdmin: boolean;
  avatarUrl?: string;
  createdAt?: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<User>;
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [lastAuthCheck, setLastAuthCheck] = useState<Date>(new Date());
  
  // Get current user query
  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['/api/auth/user', lastAuthCheck],
    queryFn: async () => {
      try {
        const user = await apiRequest('GET', '/api/auth/user', null);
        console.log('Auth provider user data:', user);
        return user;
      } catch (error) {
        console.log('Auth provider user fetch error:', error);
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    retry: false, // Don't retry auth requests
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      console.log('Login attempt with:', { username, password: '******' });
      const response = await apiRequest('POST', '/api/auth/login', { username, password });
      console.log('Login response:', response);
      return response;
    },
    onSuccess: () => {
      // Refetch user data
      setLastAuthCheck(new Date());
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
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
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
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
      username,
      email,
      password,
    }: {
      username: string;
      email: string;
      password: string;
    }) => {
      const response = await apiRequest('POST', '/api/auth/register', {
        username,
        email,
        password,
      });
      return response;
    },
    onSuccess: () => {
      // Refetch user data
      setLastAuthCheck(new Date());
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
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
  const login = async (username: string, password: string): Promise<User> => {
    console.log('AuthProvider.login called with username:', username);
    try {
      const user = await loginMutation.mutateAsync({ username, password });
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

  const register = async (username: string, email: string, password: string): Promise<User> => {
    try {
      const user = await registerMutation.mutateAsync({ username, email, password });
      return user;
    } catch (error) {
      console.error('Registration error in AuthProvider:', error);
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