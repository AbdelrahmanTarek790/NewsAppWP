import 'package:dartz/dartz.dart';
import '../repositories/comments_repository.dart';
import '../../core/errors/failures.dart';

class DeleteCommentUseCase {
  final CommentsRepository repository;

  DeleteCommentUseCase(this.repository);

  Future<Either<Failure, void>> call({required String commentId}) async {
    return await repository.deleteComment(commentId: commentId);
  }
}