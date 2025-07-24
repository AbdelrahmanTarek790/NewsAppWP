import 'package:dartz/dartz.dart';
import '../repositories/auth_repository.dart';
import '../../core/errors/failures.dart';

class LogoutUseCase {
  final AuthRepository repository;

  LogoutUseCase(this.repository);

  Future<Either<Failure, void>> call() async {
    return await repository.logout();
  }
}