import 'package:dartz/dartz.dart';
import '../repositories/categories_repository.dart';
import '../entities/category.dart';
import '../../core/errors/failures.dart';

class GetCategoriesUseCase {
  final CategoriesRepository repository;

  GetCategoriesUseCase(this.repository);

  Future<Either<Failure, List<Category>>> call() async {
    return await repository.getCategories();
  }
}