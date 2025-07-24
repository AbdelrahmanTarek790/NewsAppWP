import 'package:dartz/dartz.dart';
import '../entities/auth_result.dart';
import '../entities/user.dart';
import '../../core/errors/failures.dart';

abstract class AuthRepository {
  Future<Either<Failure, AuthResult>> login({
    required String email,
    required String password,
  });

  Future<Either<Failure, AuthResult>> register({
    required String name,
    required String email,
    required String password,
  });

  Future<Either<Failure, void>> logout();

  Future<Either<Failure, AuthResult>> refreshToken();

  Future<Either<Failure, void>> forgotPassword({
    required String email,
  });

  Future<Either<Failure, void>> resetPassword({
    required String token,
    required String password,
  });

  Future<Either<Failure, void>> updatePassword({
    required String currentPassword,
    required String newPassword,
  });

  Future<Either<Failure, void>> verifyEmail({
    required String token,
  });

  Future<Either<Failure, void>> resendVerification();

  Future<Either<Failure, User>> getCurrentUser();

  Future<bool> isLoggedIn();

  Future<String?> getAccessToken();
}