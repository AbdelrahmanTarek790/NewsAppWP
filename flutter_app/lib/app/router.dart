import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../presentation/pages/auth/login_page.dart';
import '../presentation/pages/auth/register_page.dart';
import '../presentation/pages/auth/forgot_password_page.dart';
import '../presentation/pages/home/home_page.dart';
import '../presentation/pages/posts/posts_page.dart';
import '../presentation/pages/posts/post_details_page.dart';
import '../presentation/pages/categories/categories_page.dart';
import '../presentation/pages/profile/profile_page.dart';
import '../presentation/pages/search/search_page.dart';
import '../presentation/pages/splash/splash_page.dart';
import '../presentation/widgets/navigation/main_navigation.dart';
import '../core/di/service_locator.dart';
import '../presentation/providers/auth_provider.dart';

class AppRouter {
  static final GoRouter router = GoRouter(
    initialLocation: '/splash',
    redirect: (context, state) {
      final authProvider = ServiceLocator.get<AuthProvider>();
      final isLoggedIn = authProvider.isAuthenticated;
      final isLoggingIn = state.matchedLocation == '/login' ||
          state.matchedLocation == '/register' ||
          state.matchedLocation == '/forgot-password';
      
      // If not logged in and not on auth pages, redirect to login
      if (!isLoggedIn && !isLoggingIn && state.matchedLocation != '/splash') {
        return '/login';
      }
      
      // If logged in and on auth pages, redirect to home
      if (isLoggedIn && isLoggingIn) {
        return '/home';
      }
      
      return null;
    },
    routes: [
      GoRoute(
        path: '/splash',
        builder: (context, state) => const SplashPage(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginPage(),
      ),
      GoRoute(
        path: '/register',
        builder: (context, state) => const RegisterPage(),
      ),
      GoRoute(
        path: '/forgot-password',
        builder: (context, state) => const ForgotPasswordPage(),
      ),
      ShellRoute(
        builder: (context, state, child) => MainNavigation(child: child),
        routes: [
          GoRoute(
            path: '/home',
            builder: (context, state) => const HomePage(),
          ),
          GoRoute(
            path: '/posts',
            builder: (context, state) => const PostsPage(),
            routes: [
              GoRoute(
                path: '/:slug',
                builder: (context, state) => PostDetailsPage(
                  slug: state.pathParameters['slug']!,
                ),
              ),
            ],
          ),
          GoRoute(
            path: '/categories',
            builder: (context, state) => const CategoriesPage(),
          ),
          GoRoute(
            path: '/search',
            builder: (context, state) => const SearchPage(),
          ),
          GoRoute(
            path: '/profile',
            builder: (context, state) => const ProfilePage(),
          ),
        ],
      ),
    ],
  );
}