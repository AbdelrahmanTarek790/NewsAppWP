import React, { useState } from 'react';
import { SearchFilters } from '../types/search';

interface AdvancedSearchFormProps {
  onSearch: (filters: SearchFilters) => void;
  onClose: () => void;
  initialQuery?: string;
}

const AdvancedSearchForm: React.FC<AdvancedSearchFormProps> = ({
  onSearch,
  onClose,
  initialQuery = '',
}) => {
  const [filters, setFilters] = useState<SearchFilters>({
    q: initialQuery,
    category: '',
    tag: '',
    author: '',
    from: '',
    to: '',
    page: 1,
    limit: 10,
    sort: 'publishedAt',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filter out empty values
    const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        acc[key as keyof SearchFilters] = value;
      }
      return acc;
    }, {} as SearchFilters);

    onSearch(cleanFilters);
    onClose();
  };

  const handleReset = () => {
    setFilters({
      q: '',
      category: '',
      tag: '',
      author: '',
      from: '',
      to: '',
      page: 1,
      limit: 10,
      sort: 'publishedAt',
    });
  };

  return (
    <div className="advanced-search-overlay">
      <div className="advanced-search-form">
        <div className="advanced-search-form__header">
          <h2>Advanced Search</h2>
          <button 
            type="button" 
            className="advanced-search-form__close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="advanced-search-form__form">
          <div className="advanced-search-form__section">
            <h3>Search Terms</h3>
            <div className="advanced-search-form__field">
              <label htmlFor="q">Search Query</label>
              <input
                type="text"
                id="q"
                name="q"
                value={filters.q}
                onChange={handleInputChange}
                placeholder="Enter search terms..."
              />
            </div>
          </div>

          <div className="advanced-search-form__section">
            <h3>Filters</h3>
            <div className="advanced-search-form__field">
              <label htmlFor="category">Category</label>
              <input
                type="text"
                id="category"
                name="category"
                value={filters.category}
                onChange={handleInputChange}
                placeholder="Enter category name..."
              />
            </div>

            <div className="advanced-search-form__field">
              <label htmlFor="tag">Tag</label>
              <input
                type="text"
                id="tag"
                name="tag"
                value={filters.tag}
                onChange={handleInputChange}
                placeholder="Enter tag name..."
              />
            </div>

            <div className="advanced-search-form__field">
              <label htmlFor="author">Author</label>
              <input
                type="text"
                id="author"
                name="author"
                value={filters.author}
                onChange={handleInputChange}
                placeholder="Enter author ID..."
              />
            </div>
          </div>

          <div className="advanced-search-form__section">
            <h3>Date Range</h3>
            <div className="advanced-search-form__field">
              <label htmlFor="from">From Date</label>
              <input
                type="date"
                id="from"
                name="from"
                value={filters.from}
                onChange={handleInputChange}
              />
            </div>

            <div className="advanced-search-form__field">
              <label htmlFor="to">To Date</label>
              <input
                type="date"
                id="to"
                name="to"
                value={filters.to}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="advanced-search-form__section">
            <h3>Results</h3>
            <div className="advanced-search-form__field">
              <label htmlFor="sort">Sort By</label>
              <select
                id="sort"
                name="sort"
                value={filters.sort}
                onChange={handleInputChange}
              >
                <option value="publishedAt">Published Date (Newest)</option>
                <option value="-publishedAt">Published Date (Oldest)</option>
                <option value="title">Title (A-Z)</option>
                <option value="-title">Title (Z-A)</option>
                <option value="createdAt">Created Date (Newest)</option>
                <option value="-createdAt">Created Date (Oldest)</option>
              </select>
            </div>

            <div className="advanced-search-form__field">
              <label htmlFor="limit">Results per Page</label>
              <select
                id="limit"
                name="limit"
                value={filters.limit}
                onChange={handleInputChange}
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>
          </div>

          <div className="advanced-search-form__actions">
            <button type="button" onClick={handleReset}>
              Reset
            </button>
            <button type="submit">
              Search
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdvancedSearchForm;