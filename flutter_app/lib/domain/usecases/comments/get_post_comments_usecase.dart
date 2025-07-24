import 'package:dartz/dartz.dart';
import '../repositories/comments_repository.dart';
import '../entities/comment.dart';
import '../../core/errors/failures.dart';

class GetPostCommentsUseCase {
  final CommentsRepository repository;

  GetPostCommentsUseCase(this.repository);

  Future<Either<Failure, List<Comment>>> call({
    required String postId,
    int page = 1,
    int limit = 10,
  }) async {
    return await repository.getPostComments(
      postId: postId,
      page: page,
      limit: limit,
    );
  }
}