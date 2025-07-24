import 'package:flutter/foundation.dart';
import '../../domain/entities/category.dart';
import '../../domain/entities/post.dart';
import '../../domain/usecases/categories/get_categories_usecase.dart';
import '../../domain/usecases/categories/get_category_posts_usecase.dart';
import '../../core/errors/failures.dart';

enum CategoriesStatus { initial, loading, loaded, error }

class CategoriesProvider extends ChangeNotifier {
  final GetCategoriesUseCase getCategoriesUseCase;
  final GetCategoryPostsUseCase getCategoryPostsUseCase;

  CategoriesProvider({
    required this.getCategoriesUseCase,
    required this.getCategoryPostsUseCase,
  });

  CategoriesStatus _status = CategoriesStatus.initial;
  List<Category> _categories = [];
  List<Post> _categoryPosts = [];
  String? _errorMessage;

  CategoriesStatus get status => _status;
  List<Category> get categories => _categories;
  List<Post> get categoryPosts => _categoryPosts;
  String? get errorMessage => _errorMessage;

  void _setStatus(CategoriesStatus status) {
    _status = status;
    notifyListeners();
  }

  void _setError(String error) {
    _errorMessage = error;
    _setStatus(CategoriesStatus.error);
  }

  Future<void> getCategories() async {
    _setStatus(CategoriesStatus.loading);
    final result = await getCategoriesUseCase();
    result.fold(
      (failure) => _setError(_mapFailureToMessage(failure)),
      (categories) {
        _categories = categories;
        _setStatus(CategoriesStatus.loaded);
      },
    );
  }

  Future<void> getCategoryPosts(String slug) async {
    _setStatus(CategoriesStatus.loading);
    final result = await getCategoryPostsUseCase(slug: slug);
    result.fold(
      (failure) => _setError(_mapFailureToMessage(failure)),
      (posts) {
        _categoryPosts = posts;
        _setStatus(CategoriesStatus.loaded);
      },
    );
  }

  String _mapFailureToMessage(Failure failure) {
    switch (failure.runtimeType) {
      case ServerFailure:
        return failure.message;
      case NetworkFailure:
        return 'No internet connection';
      default:
        return 'An unexpected error occurred';
    }
  }
}

class CommentsProvider extends ChangeNotifier {
  // Implementation placeholder for comments provider
}

class SearchProvider extends ChangeNotifier {
  // Implementation placeholder for search provider
}