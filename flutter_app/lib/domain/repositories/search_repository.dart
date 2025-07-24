import 'package:dartz/dartz.dart';
import '../entities/post.dart';
import '../entities/user.dart';
import '../entities/category.dart';
import '../../core/errors/failures.dart';

class SearchResult {
  final List<Post> posts;
  final List<User> authors;
  final List<Category> categories;

  SearchResult({
    required this.posts,
    required this.authors,
    required this.categories,
  });
}

abstract class SearchRepository {
  Future<Either<Failure, SearchResult>> globalSearch({
    required String query,
    int page = 1,
    int limit = 10,
  });
}