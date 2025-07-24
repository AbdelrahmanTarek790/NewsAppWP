import 'package:dartz/dartz.dart';
import '../repositories/posts_repository.dart';
import '../entities/post.dart';
import '../../core/errors/failures.dart';

class GetFeaturedPostsUseCase {
  final PostsRepository repository;

  GetFeaturedPostsUseCase(this.repository);

  Future<Either<Failure, List<Post>>> call({
    int page = 1,
    int limit = 10,
  }) async {
    return await repository.getFeaturedPosts(page: page, limit: limit);
  }
}