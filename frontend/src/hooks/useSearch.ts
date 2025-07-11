import { useState, useEffect, useCallback } from 'react';
import {
  SearchResults,
  SearchSuggestions,
  Post,
  Pagination,
  SearchFilters,
} from '../types/search';
import searchService from '../services/searchService';

export const useSearch = () => {
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string, page: number = 1, limit: number = 10) => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await searchService.search(query, page, limit);
      setResults(response.data.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  }, []);

  return { results, loading, error, search };
};

export const useSuggestions = () => {
  const [suggestions, setSuggestions] = useState<SearchSuggestions | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSuggestions = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSuggestions(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await searchService.getSuggestions(query);
      setSuggestions(response.data.suggestions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get suggestions');
    } finally {
      setLoading(false);
    }
  }, []);

  return { suggestions, loading, error, getSuggestions };
};

export const useAdvancedSearch = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const advancedSearch = useCallback(async (filters: SearchFilters) => {
    setLoading(true);
    setError(null);

    try {
      const response = await searchService.advancedSearch(filters);
      setPosts(response.data.posts);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Advanced search failed');
    } finally {
      setLoading(false);
    }
  }, []);

  return { posts, pagination, loading, error, advancedSearch };
};

export const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};