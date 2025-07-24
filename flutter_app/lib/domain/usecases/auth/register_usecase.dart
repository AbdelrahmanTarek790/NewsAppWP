import 'package:dartz/dartz.dart';
import '../repositories/auth_repository.dart';
import '../entities/auth_result.dart';
import '../../core/errors/failures.dart';

class RegisterUseCase {
  final AuthRepository repository;

  RegisterUseCase(this.repository);

  Future<Either<Failure, AuthResult>> call({
    required String name,
    required String email,
    required String password,
  }) async {
    return await repository.register(
      name: name,
      email: email,
      password: password,
    );
  }
}