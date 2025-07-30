import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContextType, AuthResponse, User } from '@/app/types';


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
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful login
      const mockUser: User = {
        id: '1',
        email: email,
        name: email.split('@')[0]
      };
      const mockToken = 'mock_jwt_token_' + Date.now();
      
      await AsyncStorage.setItem('userToken', mockToken);
      await AsyncStorage.setItem('userData', JSON.stringify(mockUser));
      
      setToken(mockToken);
      setUser(mockUser);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<AuthResponse> => {
    try {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful registration
      const mockUser: User = {
        id: '1',
        email: email,
        name: name
      };
      const mockToken = 'mock_jwt_token_' + Date.now();
      
      await AsyncStorage.setItem('userToken', mockToken);
      await AsyncStorage.setItem('userData', JSON.stringify(mockUser));
      
      setToken(mockToken);
      setUser(mockUser);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
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