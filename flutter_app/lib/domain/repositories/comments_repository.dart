import 'package:dartz/dartz.dart';
import '../entities/comment.dart';
import '../../core/errors/failures.dart';

abstract class CommentsRepository {
  Future<Either<Failure, List<Comment>>> getPostComments({
    required String postId,
    int page = 1,
    int limit = 10,
  });

  Future<Either<Failure, Comment>> addComment({
    required String postId,
    required String content,
    String? parentId,
  });

  Future<Either<Failure, Comment>> updateComment({
    required String commentId,
    required String content,
  });

  Future<Either<Failure, void>> deleteComment({
    required String commentId,
  });
}