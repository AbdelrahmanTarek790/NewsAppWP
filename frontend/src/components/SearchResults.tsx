import React from 'react';
import { SearchResults as SearchResultsType } from '../types/search';

interface SearchResultsProps {
  results: SearchResultsType;
  query: string;
  onPageChange?: (page: number) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({ results, query }) => {
  const { posts, postsCount, categories, categoriesCount, users, usersCount } = results;

  const totalResults = postsCount + categoriesCount + usersCount;

  if (totalResults === 0) {
    return (
      <div className="search-results">
        <div className="search-results__empty">
          <h2>No results found</h2>
          <p>No results found for "{query}". Try different keywords.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="search-results">
      <div className="search-results__header">
        <h2>Search Results for "{query}"</h2>
        <p>{totalResults} results found</p>
      </div>

      {posts.length > 0 && (
        <div className="search-results__section">
          <h3>Posts ({postsCount})</h3>
          <div className="search-results__posts">
            {posts.map((post) => (
              <div key={post._id} className="search-results__post-card">
                <h4>{post.title}</h4>
                <p>{post.content.substring(0, 200)}...</p>
                <div className="search-results__post-meta">
                  <span>By: {post.author}</span>
                  <span>Published: {new Date(post.publishedAt).toLocaleDateString()}</span>
                  {post.score && <span>Score: {post.score.toFixed(2)}</span>}
                </div>
                <div className="search-results__post-tags">
                  {post.categories.map((category, index) => (
                    <span key={index} className="tag category">{category}</span>
                  ))}
                  {post.tags.map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                </div>
                {post.featured && <span className="search-results__featured">Featured</span>}
                {post.trending && <span className="search-results__trending">Trending</span>}
              </div>
            ))}
          </div>
          {postsCount > posts.length && (
            <p className="search-results__more">
              And {postsCount - posts.length} more posts...
            </p>
          )}
        </div>
      )}

      {categories.length > 0 && (
        <div className="search-results__section">
          <h3>Categories ({categoriesCount})</h3>
          <div className="search-results__categories">
            {categories.map((category) => (
              <div key={category._id} className="search-results__category-card">
                <h4 style={{ color: category.color }}>{category.name}</h4>
                <p>{category.description}</p>
                <div className="search-results__category-meta">
                  <span>Created: {new Date(category.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
          {categoriesCount > categories.length && (
            <p className="search-results__more">
              And {categoriesCount - categories.length} more categories...
            </p>
          )}
        </div>
      )}

      {users.length > 0 && (
        <div className="search-results__section">
          <h3>Users ({usersCount})</h3>
          <div className="search-results__users">
            {users.map((user) => (
              <div key={user._id} className="search-results__user-card">
                <div className="search-results__user-avatar">
                  {user.photo ? (
                    <img src={user.photo} alt={user.name} />
                  ) : (
                    <div className="search-results__user-avatar-placeholder">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="search-results__user-info">
                  <h4>{user.name}</h4>
                  <p>@{user.username}</p>
                  <p>{user.bio}</p>
                  <span className="search-results__user-role">{user.role}</span>
                </div>
              </div>
            ))}
          </div>
          {usersCount > users.length && (
            <p className="search-results__more">
              And {usersCount - users.length} more users...
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchResults;