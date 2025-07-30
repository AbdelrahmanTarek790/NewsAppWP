import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthResponse, User } from '@/app/types';

// Base API configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000';
const API_PREFIX = '/api/v1';

interface ApiResponse<T = any> {
  status: string;
  data?: T;
  message?: string;
  error?: string;
}

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = `${API_BASE_URL}${API_PREFIX}`;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      const defaultHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication methods
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await this.request<{
        token: string;
        refreshToken: string;
        user: User;
      }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (response.status === 'success' && response.data) {
        await AsyncStorage.setItem('userToken', response.data.token);
        await AsyncStorage.setItem('refreshToken', response.data.refreshToken);
        await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
        
        return { success: true, user: response.data.user, token: response.data.token };
      }

      return { success: false, error: response.message || 'Login failed' };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async register(name: string, email: string, password: string, username: string): Promise<AuthResponse> {
    try {
      const response = await this.request<{
        token: string;
        refreshToken: string;
        user: User;
      }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ 
          name, 
          email, 
          password, 
          passwordConfirm: password,
          username 
        }),
      });

      if (response.status === 'success' && response.data) {
        await AsyncStorage.setItem('userToken', response.data.token);
        await AsyncStorage.setItem('refreshToken', response.data.refreshToken);
        await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
        
        return { success: true, user: response.data.user, token: response.data.token };
      }

      return { success: false, error: response.message || 'Registration failed' };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('refreshToken');
      await AsyncStorage.removeItem('userData');
    }
  }

  async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (!refreshToken) return null;

      const response = await this.request<{
        token: string;
        refreshToken: string;
      }>('/auth/refresh-token', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });

      if (response.status === 'success' && response.data) {
        await AsyncStorage.setItem('userToken', response.data.token);
        await AsyncStorage.setItem('refreshToken', response.data.refreshToken);
        return response.data.token;
      }

      return null;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return null;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await this.request<{ user: User }>('/auth/me');
      
      if (response.status === 'success' && response.data) {
        await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
        return response.data.user;
      }
      
      return null;
    } catch (error) {
      console.error('Get current user failed:', error);
      return null;
    }
  }

  // News/Posts methods
  async getPosts(page: number = 1, limit: number = 10) {
    return this.request(`/posts?page=${page}&limit=${limit}`);
  }

  async getPost(id: string) {
    return this.request(`/posts/${id}`);
  }

  async getCategories() {
    return this.request('/categories');
  }

  async searchPosts(query: string, page: number = 1) {
    return this.request(`/search/posts?q=${encodeURIComponent(query)}&page=${page}`);
  }
}

export const apiService = new ApiService();
export default apiService;