import 'package:dartz/dartz.dart';
import '../repositories/auth_repository.dart';
import '../../core/errors/failures.dart';

class ResetPasswordUseCase {
  final AuthRepository repository;

  ResetPasswordUseCase(this.repository);

  Future<Either<Failure, void>> call({
    required String token,
    required String password,
  }) async {
    return await repository.resetPassword(token: token, password: password);
  }
}