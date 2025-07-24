import 'package:flutter/foundation.dart';
import '../../domain/usecases/search/global_search_usecase.dart';
import '../../domain/repositories/search_repository.dart';
import '../../core/errors/failures.dart';

enum SearchStatus { initial, loading, loaded, error }

class SearchProvider extends ChangeNotifier {
  final GlobalSearchUseCase globalSearchUseCase;

  SearchProvider({
    required this.globalSearchUseCase,
  });

  SearchStatus _status = SearchStatus.initial;
  SearchResult? _searchResult;
  String? _errorMessage;
  String _currentQuery = '';

  SearchStatus get status => _status;
  SearchResult? get searchResult => _searchResult;
  String? get errorMessage => _errorMessage;
  String get currentQuery => _currentQuery;

  void _setStatus(SearchStatus status) {
    _status = status;
    notifyListeners();
  }

  void _setError(String error) {
    _errorMessage = error;
    _setStatus(SearchStatus.error);
  }

  void clearSearch() {
    _searchResult = null;
    _currentQuery = '';
    _status = SearchStatus.initial;
    notifyListeners();
  }

  Future<void> search(String query) async {
    if (query.trim().isEmpty) {
      clearSearch();
      return;
    }

    _currentQuery = query;
    _setStatus(SearchStatus.loading);

    final result = await globalSearchUseCase(query: query);

    result.fold(
      (failure) => _setError(_mapFailureToMessage(failure)),
      (searchResult) {
        _searchResult = searchResult;
        _setStatus(SearchStatus.loaded);
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