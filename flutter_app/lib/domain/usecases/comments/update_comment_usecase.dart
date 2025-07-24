import 'package:dartz/dartz.dart';
import '../repositories/comments_repository.dart';
import '../entities/comment.dart';
import '../../core/errors/failures.dart';

class UpdateCommentUseCase {
  final CommentsRepository repository;

  UpdateCommentUseCase(this.repository);

  Future<Either<Failure, Comment>> call({
    required String commentId,
    required String content,
  }) async {
    return await repository.updateComment(
      commentId: commentId,
      content: content,
    );
  }
}