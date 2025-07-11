export interface Post {
  _id: string;
  title: string;
  content: string;
  slug: string;
  author: string;
  categories: string[];
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  trending: boolean;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  score?: number;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  name: string;
  username: string;
  photo?: string;
  bio: string;
  role: 'user' | 'author' | 'editor' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface SearchResults {
  posts: Post[];
  postsCount: number;
  categories: Category[];
  categoriesCount: number;
  users: User[];
  usersCount: number;
}

export interface SearchResponse {
  status: 'success';
  data: {
    query: string;
    results: SearchResults;
  };
}

export interface PostSuggestion {
  _id: string;
  title: string;
  slug: string;
}

export interface CategorySuggestion {
  _id: string;
  name: string;
  slug: string;
}

export interface TagSuggestion {
  tag: string;
  count: number;
}

export interface SearchSuggestions {
  posts: PostSuggestion[];
  categories: CategorySuggestion[];
  tags: TagSuggestion[];
}

export interface SuggestionsResponse {
  status: 'success';
  data: {
    query: string;
    suggestions: SearchSuggestions;
  };
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface AdvancedSearchResponse {
  status: 'success';
  results: number;
  pagination: Pagination;
  data: {
    posts: Post[];
  };
}

export interface SearchFilters {
  q?: string;
  category?: string;
  tag?: string;
  author?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
  sort?: string;
}