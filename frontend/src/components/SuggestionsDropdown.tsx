import React from 'react';
import { SearchSuggestions } from '../types/search';

interface SuggestionsDropdownProps {
  suggestions: SearchSuggestions;
  onSelect: (suggestion: string) => void;
  loading?: boolean;
}

const SuggestionsDropdown: React.FC<SuggestionsDropdownProps> = ({
  suggestions,
  onSelect,
  loading = false,
}) => {
  const { posts, categories, tags } = suggestions;

  const hasSuggestions = posts.length > 0 || categories.length > 0 || tags.length > 0;

  if (loading) {
    return (
      <div className="suggestions-dropdown">
        <div className="suggestions-dropdown__loading">
          <div className="spinner"></div>
          <span>Loading suggestions...</span>
        </div>
      </div>
    );
  }

  if (!hasSuggestions) {
    return (
      <div className="suggestions-dropdown">
        <div className="suggestions-dropdown__empty">
          <span>No suggestions found</span>
        </div>
      </div>
    );
  }

  return (
    <div className="suggestions-dropdown">
      {posts.length > 0 && (
        <div className="suggestions-dropdown__section">
          <h4>Posts</h4>
          <ul>
            {posts.map((post) => (
              <li key={post._id} onClick={() => onSelect(post.title)}>
                <div className="suggestions-dropdown__item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10,9 9,9 8,9"/>
                  </svg>
                  <span>{post.title}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {categories.length > 0 && (
        <div className="suggestions-dropdown__section">
          <h4>Categories</h4>
          <ul>
            {categories.map((category) => (
              <li key={category._id} onClick={() => onSelect(category.name)}>
                <div className="suggestions-dropdown__item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                  </svg>
                  <span>{category.name}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tags.length > 0 && (
        <div className="suggestions-dropdown__section">
          <h4>Tags</h4>
          <ul>
            {tags.map((tag, index) => (
              <li key={index} onClick={() => onSelect(tag.tag)}>
                <div className="suggestions-dropdown__item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                    <line x1="7" y1="7" x2="7.01" y2="7"/>
                  </svg>
                  <span>{tag.tag}</span>
                  <span className="suggestions-dropdown__count">({tag.count})</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SuggestionsDropdown;