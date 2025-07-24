import 'package:dartz/dartz.dart';
import '../repositories/posts_repository.dart';
import '../entities/post.dart';
import '../../core/errors/failures.dart';

class GetTrendingPostsUseCase {
  final PostsRepository repository;

  GetTrendingPostsUseCase(this.repository);

  Future<Either<Failure, List<Post>>> call({
    int page = 1,
    int limit = 10,
  }) async {
    return await repository.getTrendingPosts(page: page, limit: limit);
  }
}