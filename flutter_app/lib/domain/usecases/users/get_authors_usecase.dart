import 'package:dartz/dartz.dart';
import '../repositories/users_repository.dart';
import '../entities/user.dart';
import '../../core/errors/failures.dart';

class GetAuthorsUseCase {
  final UsersRepository repository;

  GetAuthorsUseCase(this.repository);

  Future<Either<Failure, List<User>>> call({
    int page = 1,
    int limit = 10,
  }) async {
    return await repository.getAuthors(page: page, limit: limit);
  }
}