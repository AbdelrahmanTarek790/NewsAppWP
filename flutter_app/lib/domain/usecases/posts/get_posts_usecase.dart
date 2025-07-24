import 'package:dartz/dartz.dart';
import '../repositories/posts_repository.dart';
import '../entities/post.dart';
import '../../core/errors/failures.dart';

class GetPostsUseCase {
  final PostsRepository repository;

  GetPostsUseCase(this.repository);

  Future<Either<Failure, List<Post>>> call({
    int page = 1,
    int limit = 10,
    String? category,
    String? author,
    String? status,
  }) async {
    return await repository.getPosts(
      page: page,
      limit: limit,
      category: category,
      author: author,
      status: status,
    );
  }
}