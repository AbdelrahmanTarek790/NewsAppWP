import 'package:dartz/dartz.dart';
import '../repositories/auth_repository.dart';
import '../entities/auth_result.dart';
import '../../core/errors/failures.dart';

class LoginUseCase {
  final AuthRepository repository;

  LoginUseCase(this.repository);

  Future<Either<Failure, AuthResult>> call({
    required String email,
    required String password,
  }) async {
    return await repository.login(email: email, password: password);
  }
}