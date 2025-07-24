import 'package:dartz/dartz.dart';
import '../entities/category.dart';
import '../entities/post.dart';
import '../../core/errors/failures.dart';

abstract class CategoriesRepository {
  Future<Either<Failure, List<Category>>> getCategories();

  Future<Either<Failure, Category>> getCategoryBySlug(String slug);

  Future<Either<Failure, List<Post>>> getCategoryPosts({
    required String slug,
    int page = 1,
    int limit = 10,
  });
}