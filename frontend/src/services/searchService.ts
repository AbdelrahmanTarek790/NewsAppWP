import {
  SearchResponse,
  SuggestionsResponse,
  AdvancedSearchResponse,
  SearchFilters,
} from '../types/search';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
const API_PREFIX = '/api/v1';

class SearchService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}${API_PREFIX}`;
  }

  /**
   * Basic search across posts, categories, and users
   */
  async search(query: string, page: number = 1, limit: number = 10): Promise<SearchResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
      );

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  }

  /**
   * Get search suggestions for autocomplete
   */
  async getSuggestions(query: string): Promise<SuggestionsResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/search/suggest?q=${encodeURIComponent(query)}`
      );

      if (!response.ok) {
        throw new Error(`Suggestions failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Suggestions error:', error);
      throw error;
    }
  }

  /**
   * Advanced search with filtering options
   */
  async advancedSearch(filters: SearchFilters): Promise<AdvancedSearchResponse> {
    try {
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await fetch(
        `${this.baseUrl}/search/advanced?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error(`Advanced search failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Advanced search error:', error);
      throw error;
    }
  }
}

export const searchService = new SearchService();
export default searchService;