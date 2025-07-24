import 'package:dartz/dartz.dart';
import '../entities/post.dart';
import '../../core/errors/failures.dart';

abstract class PostsRepository {
  Future<Either<Failure, List<Post>>> getPosts({
    int page = 1,
    int limit = 10,
    String? category,
    String? author,
    String? status,
  });

  Future<Either<Failure, Post>> getPostBySlug(String slug);

  Future<Either<Failure, List<Post>>> getFeaturedPosts({
    int page = 1,
    int limit = 10,
  });

  Future<Either<Failure, List<Post>>> getTrendingPosts({
    int page = 1,
    int limit = 10,
  });

  Future<Either<Failure, List<Post>>> searchPosts({
    required String query,
    int page = 1,
    int limit = 10,
  });
}