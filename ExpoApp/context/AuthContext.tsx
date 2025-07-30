import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContextType, AuthResponse, User } from '@/app/types';
import { apiService } from '@/services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async (): Promise<void> => {
    try {
      const storedToken = await AsyncStorage.getItem('userToken');
      const storedUser = await AsyncStorage.getItem('userData');
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        
        // Verify token is still valid and get fresh user data
        try {
          const currentUser = await apiService.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
          } else {
            // Token is invalid, clear auth state
            await logout();
          }
        } catch (error) {
          console.error('Failed to verify token:', error);
          // Try to refresh token
          const newToken = await apiService.refreshToken();
          if (newToken) {
            setToken(newToken);
          } else {
            // Could not refresh, logout
            await logout();
          }
        }
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      setIsLoading(true);
      
      const result = await apiService.login(email, password);
      
      if (result.success && result.user && result.token) {
        setToken(result.token);
        setUser(result.user);
      }
      
      return result;
    } catch (error) {
      return { success: false, error: (error as Error).message };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, username?: string): Promise<AuthResponse> => {
    try {
      setIsLoading(true);
      
      // Generate username from email if not provided
      const finalUsername = username || email.split('@')[0] + Math.floor(Math.random() * 1000);
      
      const result = await apiService.register(name, email, password, finalUsername);
      
      if (result.success && result.user && result.token) {
        setToken(result.token);
        setUser(result.user);
      }
      
      return result;
    } catch (error) {
      return { success: false, error: (error as Error).message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      setToken(null);
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};