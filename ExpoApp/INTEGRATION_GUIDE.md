# NewsPress App - ExpoApp Backend Integration

## Overview

The ExpoApp has been successfully integrated with the backend API and includes all requested features:

- ✅ Splash screen with NewsPress branding
- ✅ HomePage with news feed and search functionality
- ✅ ProfilePage for user account management
- ✅ SettingsPage for app configuration
- ✅ Protected routes that prompt login for certain actions
- ✅ User flow: Splash → Home → Login (when needed)

## Key Features

### 1. Splash Screen
- Custom branded splash screen in `components/SplashScreen.tsx`
- Shows for 2 seconds minimum before navigating
- Displays loading state while checking authentication

### 2. Authentication Flow
- Real API integration with backend endpoints
- Token management with refresh token support
- Mock data fallback when backend is unavailable
- Protected actions require authentication

### 3. Pages Structure

#### HomePage (`app/(tabs)/index.tsx`)
- News feed with mock articles (ready for real API)
- Search functionality (protected - requires login)
- Like articles (protected - requires login)
- Read full articles (protected - requires login)
- Guest users see auth prompts for protected actions

#### ProfilePage (`app/(tabs)/profile.tsx`)
- Protected route - requires login
- Displays user information
- Account management options
- Logout functionality

#### SettingsPage (`app/settings.tsx`)
- App preferences (notifications, appearance)
- Account settings (change password, delete account)
- Support links
- Logout option

### 4. API Integration (`services/api.ts`)
- RESTful API service layer
- Authentication endpoints (login, register, logout, refresh)
- News endpoints (posts, search, categories)
- Error handling and token management
- Environment-based configuration

## Setup Instructions

### 1. Backend Setup
Ensure the backend server is running on port 3000 (or update the API URL in `.env`):

```bash
cd NewsAppWP
npm run dev
```

### 2. ExpoApp Configuration
Update the API URL in `ExpoApp/.env`:

```bash
# For local development
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000

# For development with physical device (replace with your computer's IP)
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.100:3000
```

### 3. Running the App
```bash
cd ExpoApp
npm install
npm run start
```

## User Flow

1. **Splash Screen**: Shows for 2 seconds with NewsPress branding
2. **Home Page**: 
   - Guest users can view news articles
   - Search, like, and read full articles require login
   - Clear call-to-action buttons for registration/login
3. **Authentication**: 
   - Login/Register forms with validation
   - Real API integration with error handling
4. **Protected Features**:
   - Profile page (login required)
   - Settings page (login required)
   - Search functionality (login required)
   - Article interactions (login required)

## API Endpoints Used

- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/refresh-token` - Token refresh
- `GET /api/v1/auth/me` - Get current user
- `GET /api/v1/posts` - Get news posts
- `GET /api/v1/search/posts` - Search posts

## Technical Implementation

### Protected Routes
Uses `ProtectedRoute` component that:
- Checks authentication status
- Shows loading while verifying
- Prompts login for unauthenticated users
- Renders protected content for authenticated users

### State Management
- `AuthContext` manages global authentication state
- Real-time token validation and refresh
- Persistent storage with AsyncStorage
- Loading states and error handling

### UI Components
- Custom splash screen with branding
- News card components with interaction buttons
- Settings components with switches and options
- Responsive design for different screen sizes

## Future Enhancements

1. **Real News Data**: Replace mock data with actual API calls
2. **Push Notifications**: Implement notification system
3. **Offline Support**: Add data caching for offline reading
4. **User Preferences**: Save and sync user settings
5. **Social Features**: Add sharing and commenting capabilities

## Testing

The app is ready for testing with:
1. Mock authentication flow (works without backend)
2. Real API integration (when backend is available)
3. Protected route behavior
4. Responsive UI components

To test the full integration, ensure both backend and frontend are running and configured properly.