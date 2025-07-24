import 'package:flutter/foundation.dart';
import '../../domain/entities/user.dart';
import '../../domain/entities/auth_result.dart';
import '../../domain/usecases/auth/login_usecase.dart';
import '../../domain/usecases/auth/register_usecase.dart';
import '../../domain/usecases/auth/logout_usecase.dart';
import '../../domain/usecases/auth/refresh_token_usecase.dart';
import '../../domain/usecases/auth/forgot_password_usecase.dart';
import '../../domain/usecases/auth/reset_password_usecase.dart';
import '../../domain/usecases/auth/get_current_user_usecase.dart';
import '../../core/errors/failures.dart';

enum AuthStatus { initial, loading, authenticated, unauthenticated, error }

class AuthProvider extends ChangeNotifier {
  final LoginUseCase loginUseCase;
  final RegisterUseCase registerUseCase;
  final LogoutUseCase logoutUseCase;
  final RefreshTokenUseCase refreshTokenUseCase;
  final ForgotPasswordUseCase forgotPasswordUseCase;
  final ResetPasswordUseCase resetPasswordUseCase;
  final GetCurrentUserUseCase getCurrentUserUseCase;

  AuthProvider({
    required this.loginUseCase,
    required this.registerUseCase,
    required this.logoutUseCase,
    required this.refreshTokenUseCase,
    required this.forgotPasswordUseCase,
    required this.resetPasswordUseCase,
    required this.getCurrentUserUseCase,
  });

  AuthStatus _status = AuthStatus.initial;
  User? _currentUser;
  String? _errorMessage;

  AuthStatus get status => _status;
  User? get currentUser => _currentUser;
  String? get errorMessage => _errorMessage;
  bool get isAuthenticated => _status == AuthStatus.authenticated;

  void _setStatus(AuthStatus status) {
    _status = status;
    notifyListeners();
  }

  void _setError(String error) {
    _errorMessage = error;
    _setStatus(AuthStatus.error);
  }

  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }

  Future<void> login({
    required String email,
    required String password,
  }) async {
    _setStatus(AuthStatus.loading);

    final result = await loginUseCase(email: email, password: password);

    result.fold(
      (failure) => _setError(_mapFailureToMessage(failure)),
      (authResult) {
        _currentUser = authResult.user;
        _setStatus(AuthStatus.authenticated);
      },
    );
  }

  Future<void> register({
    required String name,
    required String email,
    required String password,
  }) async {
    _setStatus(AuthStatus.loading);

    final result = await registerUseCase(
      name: name,
      email: email,
      password: password,
    );

    result.fold(
      (failure) => _setError(_mapFailureToMessage(failure)),
      (authResult) {
        _currentUser = authResult.user;
        _setStatus(AuthStatus.authenticated);
      },
    );
  }

  Future<void> logout() async {
    _setStatus(AuthStatus.loading);

    final result = await logoutUseCase();

    result.fold(
      (failure) => _setError(_mapFailureToMessage(failure)),
      (_) {
        _currentUser = null;
        _setStatus(AuthStatus.unauthenticated);
      },
    );
  }

  Future<void> refreshToken() async {
    final result = await refreshTokenUseCase();

    result.fold(
      (failure) => _setError(_mapFailureToMessage(failure)),
      (authResult) {
        _currentUser = authResult.user;
        _setStatus(AuthStatus.authenticated);
      },
    );
  }

  Future<void> forgotPassword({required String email}) async {
    _setStatus(AuthStatus.loading);

    final result = await forgotPasswordUseCase(email: email);

    result.fold(
      (failure) => _setError(_mapFailureToMessage(failure)),
      (_) => _setStatus(AuthStatus.unauthenticated),
    );
  }

  Future<void> resetPassword({
    required String token,
    required String password,
  }) async {
    _setStatus(AuthStatus.loading);

    final result = await resetPasswordUseCase(token: token, password: password);

    result.fold(
      (failure) => _setError(_mapFailureToMessage(failure)),
      (_) => _setStatus(AuthStatus.unauthenticated),
    );
  }

  Future<void> getCurrentUser() async {
    _setStatus(AuthStatus.loading);

    final result = await getCurrentUserUseCase();

    result.fold(
      (failure) => _setError(_mapFailureToMessage(failure)),
      (user) {
        _currentUser = user;
        _setStatus(AuthStatus.authenticated);
      },
    );
  }

  String _mapFailureToMessage(Failure failure) {
    switch (failure.runtimeType) {
      case ServerFailure:
        return failure.message;
      case NetworkFailure:
        return 'No internet connection';
      case AuthFailure:
        return failure.message;
      default:
        return 'An unexpected error occurred';
    }
  }
}