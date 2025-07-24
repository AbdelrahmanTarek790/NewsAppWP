import 'package:dartz/dartz.dart';
import '../repositories/posts_repository.dart';
import '../entities/post.dart';
import '../../core/errors/failures.dart';

class SearchPostsUseCase {
  final PostsRepository repository;

  SearchPostsUseCase(this.repository);

  Future<Either<Failure, List<Post>>> call({
    required String query,
    int page = 1,
    int limit = 10,
  }) async {
    return await repository.searchPosts(
      query: query,
      page: page,
      limit: limit,
    );
  }
}