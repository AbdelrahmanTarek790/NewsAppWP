import 'package:dartz/dartz.dart';
import '../repositories/posts_repository.dart';
import '../entities/post.dart';
import '../../core/errors/failures.dart';

class GetPostDetailsUseCase {
  final PostsRepository repository;

  GetPostDetailsUseCase(this.repository);

  Future<Either<Failure, Post>> call(String slug) async {
    return await repository.getPostBySlug(slug);
  }
}