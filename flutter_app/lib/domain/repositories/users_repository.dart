import 'package:dartz/dartz.dart';
import '../entities/user.dart';
import '../../core/errors/failures.dart';

abstract class UsersRepository {
  Future<Either<Failure, List<User>>> getAuthors({
    int page = 1,
    int limit = 10,
  });

  Future<Either<Failure, User>> getAuthorByUsername(String username);

  Future<Either<Failure, User>> getCurrentUser();

  Future<Either<Failure, User>> updateProfile({
    String? name,
    String? bio,
    String? avatar,
  });
}