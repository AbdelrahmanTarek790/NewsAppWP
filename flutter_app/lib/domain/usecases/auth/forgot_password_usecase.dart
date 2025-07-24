import 'package:dartz/dartz.dart';
import '../repositories/auth_repository.dart';
import '../../core/errors/failures.dart';

class ForgotPasswordUseCase {
  final AuthRepository repository;

  ForgotPasswordUseCase(this.repository);

  Future<Either<Failure, void>> call({required String email}) async {
    return await repository.forgotPassword(email: email);
  }
}