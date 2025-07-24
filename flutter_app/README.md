# NewsApp Mobile - Flutter Application

A complete Flutter mobile application for the NewsApp backend using shadcn/ui Flutter library for modern, beautiful UI components.

## 🌟 Features

### Core Features
- **Authentication System**: User registration, login, password reset, email verification
- **Posts Management**: Browse, search, view details, filter by categories and authors
- **Comments System**: View, add, reply, edit, and delete comments
- **User Profiles**: Profile management and viewing author profiles
- **Categories**: Browse and filter posts by categories
- **Global Search**: Search across posts, authors, and categories

### Technical Features
- **Clean Architecture**: Proper separation of concerns with domain, data, and presentation layers
- **State Management**: Provider-based state management with comprehensive error handling
- **Modern UI**: shadcn/ui Flutter components with Material Design 3
- **Responsive Design**: Mobile-first design that works on different screen sizes
- **Dark/Light Theme**: Theme switching with persistent preferences
- **Offline Handling**: Network-aware error handling and retry mechanisms
- **Image Caching**: Efficient image loading and caching
- **Pull-to-Refresh**: Intuitive content refreshing
- **Infinite Scrolling**: Smooth pagination for large content lists

## 🏗️ Architecture

### Clean Architecture Layers

```
lib/
├── main.dart                 # App entry point
├── app/                      # App configuration
│   ├── app.dart             # Main app widget
│   └── router.dart          # Navigation configuration
├── core/                     # Core functionality
│   ├── constants/           # API constants and app constants
│   ├── errors/              # Error handling and failures
│   ├── network/             # Network client and connectivity
│   ├── storage/             # Secure storage implementation
│   ├── utils/               # Utility functions
│   └── di/                  # Dependency injection setup
├── domain/                   # Business logic layer
│   ├── entities/            # Domain entities
│   ├── repositories/        # Repository interfaces
│   └── usecases/            # Business logic use cases
├── data/                     # Data layer
│   ├── datasources/         # Remote data sources (API)
│   ├── models/              # Data models with serialization
│   └── repositories/        # Repository implementations
├── presentation/             # UI layer
│   ├── pages/               # App screens/pages
│   ├── widgets/             # Reusable UI components
│   └── providers/           # State management providers
└── shared/                   # Shared utilities
    ├── components/          # Shared UI components
    ├── constants/           # UI constants
    └── extensions/          # Dart extensions
```

### State Management
- **Provider**: Used for state management with proper separation of concerns
- **Repository Pattern**: Clean data access with error handling
- **Use Cases**: Encapsulated business logic
- **Dependency Injection**: GetIt for service locator pattern

## 🚀 Getting Started

### Prerequisites
- Flutter SDK 3.0+
- Dart 3.0+
- iOS/Android development environment
- NewsApp backend API running

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/AbdelrahmanTarek790/NewsAppWP.git
cd NewsAppWP/flutter_app
```

2. **Install dependencies**
```bash
flutter pub get
```

3. **Configure API endpoint**
Update the base URL in `lib/core/constants/api_constants.dart`:
```dart
static const String baseUrl = 'http://your-api-url/api';
```

4. **Run the app**
```bash
flutter run
```

## 📱 Screenshots

*Add screenshots of your app here when available*

## 🎨 UI Components

This app uses **shadcn/ui Flutter** components for a modern, consistent design:

- **Forms**: Input fields with validation and error states
- **Buttons**: Primary, secondary, ghost, and destructive variants
- **Cards**: Content cards for posts, categories, and user profiles
- **Navigation**: Bottom navigation bar and app bars
- **Dialogs**: Error dialogs and confirmation dialogs
- **Loading States**: Skeleton loaders and progress indicators

## 🔧 Configuration

### API Configuration
Configure your backend API endpoint in `lib/core/constants/api_constants.dart`:

```dart
class ApiConstants {
  static const String baseUrl = 'http://localhost:3000/api'; // Update this
  // ... other endpoints
}
```

### Theme Configuration
The app supports both light and dark themes. Users can toggle between themes in the profile page.

## 📚 Key Dependencies

```yaml
dependencies:
  shadcn_ui: ^0.15.2              # Modern UI components
  go_router: ^14.2.7              # Navigation and routing
  provider: ^6.1.2                # State management
  http: ^1.2.2                    # HTTP client
  shared_preferences: ^2.3.2      # Local storage
  cached_network_image: ^3.4.1    # Image caching
  flutter_html: ^3.0.0-beta.2     # HTML content rendering
  flutter_secure_storage: ^9.2.2  # Secure token storage
  get_it: ^8.0.0                  # Dependency injection
  dartz: ^0.10.1                  # Functional programming
  equatable: ^2.0.5               # Value equality
```

## 🔐 Security Features

- **Secure Storage**: Tokens and sensitive data stored securely
- **Token Management**: Automatic token refresh and logout on expiry
- **Input Validation**: Client-side validation for all forms
- **Error Handling**: Proper error messages without exposing sensitive info

## 🧪 Testing

```bash
# Run unit tests
flutter test

# Run integration tests
flutter test integration_test/
```

## 📈 Performance Optimizations

- **Image Caching**: Cached network images with placeholder states
- **Lazy Loading**: Infinite scroll with pagination
- **Memory Management**: Proper disposal of controllers and providers
- **Network Optimization**: Efficient API calls with error retry

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [shadcn/ui](https://flutter-shadcn-ui.mariuti.com/) for the beautiful UI components
- [Flutter](https://flutter.dev/) for the amazing framework
- NewsApp backend team for the API

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Contact: [your-email@example.com]

---

**Built with ❤️ using Flutter and shadcn/ui**