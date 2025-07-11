# News App Frontend - SearchPage Component

This frontend React TypeScript application provides a complete search interface for the News App backend API.

## Features

- **Basic Search**: Search across posts, categories, and users simultaneously
- **Advanced Search**: Detailed search with filtering options (category, tag, author, date range)
- **Autocomplete/Suggestions**: Real-time search suggestions as you type
- **Responsive Design**: Works on desktop and mobile devices
- **Loading States**: Visual feedback during search operations
- **Error Handling**: Graceful error handling with user-friendly messages

## Architecture

### Components

- **SearchPage**: Main search interface component
- **SearchInput**: Search input field with submit functionality
- **SearchResults**: Displays search results for posts, categories, and users
- **SuggestionsDropdown**: Shows autocomplete suggestions
- **AdvancedSearchForm**: Modal form for advanced search options

### Services

- **searchService**: API client for backend communication
  - `search()`: Basic search across all content types
  - `getSuggestions()`: Get autocomplete suggestions
  - `advancedSearch()`: Advanced search with filters

### Hooks

- **useSearch**: Hook for basic search functionality
- **useSuggestions**: Hook for autocomplete suggestions
- **useAdvancedSearch**: Hook for advanced search with pagination
- **useDebounce**: Debounce hook for search input

## API Integration

The SearchPage component integrates with the backend API endpoints:

- `GET /api/v1/search` - Basic search
- `GET /api/v1/search/suggest` - Autocomplete suggestions
- `GET /api/v1/search/advanced` - Advanced search with filters

## Backend Response Formats

### Basic Search Response
```json
{
  "status": "success",
  "data": {
    "query": "search_term",
    "results": {
      "posts": [...],
      "postsCount": 10,
      "categories": [...],
      "categoriesCount": 3,
      "users": [...],
      "usersCount": 2
    }
  }
}
```

### Suggestions Response
```json
{
  "status": "success",
  "data": {
    "query": "search_term",
    "suggestions": {
      "posts": [...],
      "categories": [...],
      "tags": [...]
    }
  }
}
```

### Advanced Search Response
```json
{
  "status": "success",
  "results": 10,
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  },
  "data": {
    "posts": [...]
  }
}
```

## Usage

### Basic Search
1. Type in the search box
2. Press Enter or click the search button
3. View results across posts, categories, and users

### Advanced Search
1. Click "Advanced Search" button
2. Fill in desired filters (category, tag, author, date range)
3. Configure sorting and results per page
4. Click "Search" to execute

### Suggestions
1. Start typing in the search box
2. Suggestions appear automatically after 300ms delay
3. Click on any suggestion to search for it

## Development

### Running the Frontend
```bash
cd frontend
npm install
npm start
```

### Running Tests
```bash
cd frontend
npm test
```

### Building for Production
```bash
cd frontend
npm run build
```

## Configuration

Set the backend API URL in `frontend/.env`:
```
REACT_APP_API_URL=http://localhost:3000
```

## Screenshots

![Basic Search Interface](https://github.com/user-attachments/assets/5f7493b2-4afc-497a-86b4-6f6c5d74a722)

![Advanced Search Form](https://github.com/user-attachments/assets/5bef27d5-710b-42f1-b753-fa30b76fbc14)