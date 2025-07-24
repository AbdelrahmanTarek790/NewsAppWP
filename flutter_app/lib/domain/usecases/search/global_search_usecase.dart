import 'package:dartz/dartz.dart';
import '../repositories/search_repository.dart';
import '../../core/errors/failures.dart';

class GlobalSearchUseCase {
  final SearchRepository repository;

  GlobalSearchUseCase(this.repository);

  Future<Either<Failure, SearchResult>> call({
    required String query,
    int page = 1,
    int limit = 10,
  }) async {
    return await repository.globalSearch(
      query: query,
      page: page,
      limit: limit,
    );
  }
}