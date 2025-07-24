class ApiConstants {
  static const String baseUrl = 'http://localhost:3000/api';
  
  // Auth endpoints
  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String logout = '/auth/logout';
  static const String refreshToken = '/auth/refresh-token';
  static const String forgotPassword = '/auth/forgot-password';
  static const String resetPassword = '/auth/reset-password';
  static const String updatePassword = '/auth/update-password';
  static const String verifyEmail = '/auth/verify-email';
  static const String resendVerification = '/auth/resend-verification';
  static const String me = '/auth/me';
  
  // Posts endpoints
  static const String posts = '/posts';
  static const String featuredPosts = '/posts/featured';
  static const String trendingPosts = '/posts/trending';
  static const String searchPosts = '/posts/search';
  
  // Users endpoints
  static const String authors = '/users/authors';
  static const String userMe = '/users/me';
  static const String updateMe = '/users/update-me';
  
  // Categories endpoints
  static const String categories = '/categories';
  
  // Comments endpoints
  static const String comments = '/comments';
  
  // Search endpoints
  static const String search = '/search';
}