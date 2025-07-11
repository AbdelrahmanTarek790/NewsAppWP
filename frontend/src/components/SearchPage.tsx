import React, { useState, useEffect } from 'react';
import { useSearch, useSuggestions, useAdvancedSearch, useDebounce } from '../hooks/useSearch';
import { SearchFilters } from '../types/search';
import SearchInput from './SearchInput';
import SearchResults from './SearchResults';
import AdvancedSearchForm from './AdvancedSearchForm';
import SuggestionsDropdown from './SuggestionsDropdown';
import './SearchPage.css';

const SearchPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [searchMode, setSearchMode] = useState<'basic' | 'advanced'>('basic');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const { results, loading: basicLoading, error: basicError, search } = useSearch();
  const { suggestions, loading: suggestionsLoading, getSuggestions } = useSuggestions();
  const { 
    posts: advancedPosts, 
    pagination, 
    loading: advancedLoading, 
    error: advancedError, 
    advancedSearch 
  } = useAdvancedSearch();

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Handle basic search
  useEffect(() => {
    if (debouncedSearchQuery && searchMode === 'basic') {
      search(debouncedSearchQuery);
    }
  }, [debouncedSearchQuery, searchMode, search]);

  // Handle suggestions
  useEffect(() => {
    if (debouncedSearchQuery && showSuggestions) {
      getSuggestions(debouncedSearchQuery);
    }
  }, [debouncedSearchQuery, showSuggestions, getSuggestions]);

  const handleSearchInputChange = (value: string) => {
    setSearchQuery(value);
    setShowSuggestions(true);
  };

  const handleSearchSubmit = (query: string) => {
    setSearchQuery(query);
    setShowSuggestions(false);
    if (searchMode === 'basic') {
      search(query);
    }
  };

  const handleSuggestionSelect = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    if (searchMode === 'basic') {
      search(suggestion);
    }
  };

  const handleAdvancedSearch = (filters: SearchFilters) => {
    setSearchMode('advanced');
    setShowSuggestions(false);
    advancedSearch(filters);
  };

  const handleSwitchToBasic = () => {
    setSearchMode('basic');
    setShowAdvancedSearch(false);
    if (searchQuery) {
      search(searchQuery);
    }
  };

  const handlePageChange = (page: number) => {
    if (searchMode === 'basic') {
      search(searchQuery, page);
    }
  };

  const isLoading = basicLoading || advancedLoading;
  const error = basicError || advancedError;

  return (
    <div className="search-page">
      <div className="search-page__header">
        <h1 className="search-page__title">Search</h1>
        <div className="search-page__input-container">
          <SearchInput
            value={searchQuery}
            onChange={handleSearchInputChange}
            onSubmit={handleSearchSubmit}
            placeholder="Search posts, categories, and users..."
            loading={isLoading}
          />
          {showSuggestions && suggestions && (
            <SuggestionsDropdown
              suggestions={suggestions}
              onSelect={handleSuggestionSelect}
              loading={suggestionsLoading}
            />
          )}
        </div>
        <div className="search-page__controls">
          <button
            className={`search-page__mode-btn ${searchMode === 'basic' ? 'active' : ''}`}
            onClick={handleSwitchToBasic}
          >
            Basic Search
          </button>
          <button
            className={`search-page__mode-btn ${searchMode === 'advanced' ? 'active' : ''}`}
            onClick={() => setShowAdvancedSearch(true)}
          >
            Advanced Search
          </button>
        </div>
      </div>

      {showAdvancedSearch && (
        <AdvancedSearchForm
          onSearch={handleAdvancedSearch}
          onClose={() => setShowAdvancedSearch(false)}
          initialQuery={searchQuery}
        />
      )}

      <div className="search-page__content">
        {error && (
          <div className="search-page__error">
            <p>Error: {error}</p>
          </div>
        )}

        {isLoading && (
          <div className="search-page__loading">
            <div className="spinner"></div>
            <p>Searching...</p>
          </div>
        )}

        {!isLoading && !error && (
          <>
            {searchMode === 'basic' && results && (
              <SearchResults
                results={results}
                query={searchQuery}
                onPageChange={handlePageChange}
              />
            )}

            {searchMode === 'advanced' && advancedPosts && (
              <div className="search-page__advanced-results">
                <h2>Advanced Search Results</h2>
                <div className="search-page__posts-grid">
                  {advancedPosts.map((post) => (
                    <div key={post._id} className="search-page__post-card">
                      <h3>{post.title}</h3>
                      <p>{post.content.substring(0, 150)}...</p>
                      <div className="search-page__post-meta">
                        <span>By: {post.author}</span>
                        <span>Published: {new Date(post.publishedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="search-page__post-tags">
                        {post.tags.map((tag, index) => (
                          <span key={index} className="tag">{tag}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                
                {pagination && pagination.pages > 1 && (
                  <div className="search-page__pagination">
                    <button
                      disabled={pagination.page === 1}
                      onClick={() => handlePageChange(pagination.page - 1)}
                    >
                      Previous
                    </button>
                    <span>
                      Page {pagination.page} of {pagination.pages}
                    </span>
                    <button
                      disabled={pagination.page === pagination.pages}
                      onClick={() => handlePageChange(pagination.page + 1)}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchPage;