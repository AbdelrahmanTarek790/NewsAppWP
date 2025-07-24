import 'package:dartz/dartz.dart';
import '../repositories/users_repository.dart';
import '../entities/user.dart';
import '../../core/errors/failures.dart';

class GetAuthorProfileUseCase {
  final UsersRepository repository;

  GetAuthorProfileUseCase(this.repository);

  Future<Either<Failure, User>> call(String username) async {
    return await repository.getAuthorByUsername(username);
  }
}