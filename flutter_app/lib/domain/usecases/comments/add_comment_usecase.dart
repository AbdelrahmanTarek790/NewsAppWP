import 'package:dartz/dartz.dart';
import '../repositories/comments_repository.dart';
import '../entities/comment.dart';
import '../../core/errors/failures.dart';

class AddCommentUseCase {
  final CommentsRepository repository;

  AddCommentUseCase(this.repository);

  Future<Either<Failure, Comment>> call({
    required String postId,
    required String content,
    String? parentId,
  }) async {
    return await repository.addComment(
      postId: postId,
      content: content,
      parentId: parentId,
    );
  }
}