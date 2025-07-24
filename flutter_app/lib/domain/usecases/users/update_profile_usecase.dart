import 'package:dartz/dartz.dart';
import '../repositories/users_repository.dart';
import '../entities/user.dart';
import '../../core/errors/failures.dart';

class UpdateProfileUseCase {
  final UsersRepository repository;

  UpdateProfileUseCase(this.repository);

  Future<Either<Failure, User>> call({
    String? name,
    String? bio,
    String? avatar,
  }) async {
    return await repository.updateProfile(
      name: name,
      bio: bio,
      avatar: avatar,
    );
  }
}