import 'package:flutter/foundation.dart';
import '../../domain/entities/post.dart';
import '../../domain/usecases/posts/get_posts_usecase.dart';
import '../../domain/usecases/posts/get_post_details_usecase.dart';
import '../../domain/usecases/posts/get_featured_posts_usecase.dart';
import '../../domain/usecases/posts/get_trending_posts_usecase.dart';
import '../../domain/usecases/posts/search_posts_usecase.dart';
import '../../core/errors/failures.dart';

enum PostsStatus { initial, loading, loaded, error }

class PostsProvider extends ChangeNotifier {
  final GetPostsUseCase getPostsUseCase;
  final GetPostDetailsUseCase getPostDetailsUseCase;
  final GetFeaturedPostsUseCase getFeaturedPostsUseCase;
  final GetTrendingPostsUseCase getTrendingPostsUseCase;
  final SearchPostsUseCase searchPostsUseCase;

  PostsProvider({
    required this.getPostsUseCase,
    required this.getPostDetailsUseCase,
    required this.getFeaturedPostsUseCase,
    required this.getTrendingPostsUseCase,
    required this.searchPostsUseCase,
  });

  PostsStatus _status = PostsStatus.initial;
  List<Post> _posts = [];
  List<Post> _featuredPosts = [];
  List<Post> _trendingPosts = [];
  Post? _currentPost;
  String? _errorMessage;
  bool _hasReachedMax = false;
  int _currentPage = 1;

  PostsStatus get status => _status;
  List<Post> get posts => _posts;
  List<Post> get featuredPosts => _featuredPosts;
  List<Post> get trendingPosts => _trendingPosts;
  Post? get currentPost => _currentPost;
  String? get errorMessage => _errorMessage;
  bool get hasReachedMax => _hasReachedMax;

  void _setStatus(PostsStatus status) {
    _status = status;
    notifyListeners();
  }

  void _setError(String error) {
    _errorMessage = error;
    _setStatus(PostsStatus.error);
  }

  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }

  Future<void> getPosts({
    bool refresh = false,
    String? category,
    String? author,
    String? status,
  }) async {
    if (refresh) {
      _currentPage = 1;
      _hasReachedMax = false;
      _setStatus(PostsStatus.loading);
    }

    final result = await getPostsUseCase(
      page: _currentPage,
      category: category,
      author: author,
      status: status,
    );

    result.fold(
      (failure) => _setError(_mapFailureToMessage(failure)),
      (newPosts) {
        if (refresh) {
          _posts = newPosts;
        } else {
          _posts.addAll(newPosts);
        }
        
        if (newPosts.length < 10) {
          _hasReachedMax = true;
        } else {
          _currentPage++;
        }
        
        _setStatus(PostsStatus.loaded);
      },
    );
  }

  Future<void> getPostDetails(String slug) async {
    _setStatus(PostsStatus.loading);

    final result = await getPostDetailsUseCase(slug);

    result.fold(
      (failure) => _setError(_mapFailureToMessage(failure)),
      (post) {
        _currentPost = post;
        _setStatus(PostsStatus.loaded);
      },
    );
  }

  Future<void> getFeaturedPosts() async {
    final result = await getFeaturedPostsUseCase();

    result.fold(
      (failure) => _setError(_mapFailureToMessage(failure)),
      (posts) {
        _featuredPosts = posts;
        notifyListeners();
      },
    );
  }

  Future<void> getTrendingPosts() async {
    final result = await getTrendingPostsUseCase();

    result.fold(
      (failure) => _setError(_mapFailureToMessage(failure)),
      (posts) {
        _trendingPosts = posts;
        notifyListeners();
      },
    );
  }

  Future<void> searchPosts({
    required String query,
    bool refresh = false,
  }) async {
    if (refresh) {
      _currentPage = 1;
      _hasReachedMax = false;
      _setStatus(PostsStatus.loading);
    }

    final result = await searchPostsUseCase(
      query: query,
      page: _currentPage,
    );

    result.fold(
      (failure) => _setError(_mapFailureToMessage(failure)),
      (newPosts) {
        if (refresh) {
          _posts = newPosts;
        } else {
          _posts.addAll(newPosts);
        }
        
        if (newPosts.length < 10) {
          _hasReachedMax = true;
        } else {
          _currentPage++;
        }
        
        _setStatus(PostsStatus.loaded);
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