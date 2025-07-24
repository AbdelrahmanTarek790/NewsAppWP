import 'package:dartz/dartz.dart';
import '../repositories/categories_repository.dart';
import '../entities/post.dart';
import '../../core/errors/failures.dart';

class GetCategoryPostsUseCase {
  final CategoriesRepository repository;

  GetCategoryPostsUseCase(this.repository);

  Future<Either<Failure, List<Post>>> call({
    required String slug,
    int page = 1,
    int limit = 10,
  }) async {
    return await repository.getCategoryPosts(
      slug: slug,
      page: page,
      limit: limit,
    );
  }
}