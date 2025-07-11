import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SearchPage from '../components/SearchPage';

// Mock the search service
jest.mock('../services/searchService', () => ({
  search: jest.fn(),
  getSuggestions: jest.fn(),
  advancedSearch: jest.fn(),
}));

describe('SearchPage', () => {
  test('renders search page with title and search input', () => {
    render(<SearchPage />);
    
    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search posts, categories, and users...')).toBeInTheDocument();
    expect(screen.getByText('Basic Search')).toBeInTheDocument();
    expect(screen.getByText('Advanced Search')).toBeInTheDocument();
  });

  test('allows user to type in search input', () => {
    render(<SearchPage />);
    
    const searchInput = screen.getByPlaceholderText('Search posts, categories, and users...');
    fireEvent.change(searchInput, { target: { value: 'test query' } });
    
    expect(searchInput).toHaveValue('test query');
  });

  test('switches between basic and advanced search modes', () => {
    render(<SearchPage />);
    
    const basicSearchBtn = screen.getByText('Basic Search');
    const advancedSearchBtn = screen.getByText('Advanced Search');
    
    // Initially basic search should be active
    expect(basicSearchBtn).toHaveClass('active');
    expect(advancedSearchBtn).not.toHaveClass('active');
    
    // Click advanced search
    fireEvent.click(advancedSearchBtn);
    
    // Should show advanced search form (look for the form header)
    expect(screen.getByRole('heading', { name: 'Advanced Search' })).toBeInTheDocument();
  });

  test('handles search submission', async () => {
    const mockSearch = require('../services/searchService').search;
    mockSearch.mockResolvedValue({
      data: {
        results: {
          posts: [],
          postsCount: 0,
          categories: [],
          categoriesCount: 0,
          users: [],
          usersCount: 0,
        },
      },
    });

    render(<SearchPage />);
    
    const searchInput = screen.getByPlaceholderText('Search posts, categories, and users...');
    
    fireEvent.change(searchInput, { target: { value: 'test query' } });
    fireEvent.submit(searchInput.closest('form')!);

    await waitFor(() => {
      expect(mockSearch).toHaveBeenCalledWith('test query', 1, 10);
    });
  });
});