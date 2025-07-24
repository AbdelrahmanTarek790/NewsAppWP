import 'package:dartz/dartz.dart';
import '../repositories/auth_repository.dart';
import '../entities/auth_result.dart';
import '../../core/errors/failures.dart';

class RefreshTokenUseCase {
  final AuthRepository repository;

  RefreshTokenUseCase(this.repository);

  Future<Either<Failure, AuthResult>> call() async {
    return await repository.refreshToken();
  }
}