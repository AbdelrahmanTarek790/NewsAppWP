import '../models/post_model.dart';
import '../../core/network/api_client.dart';
import '../../core/constants/api_constants.dart';
import '../../core/errors/exceptions.dart';

abstract class PostsRemoteDataSource {
  Future<List<PostModel>> getPosts({
    int page = 1,
    int limit = 10,
    String? category,
    String? author,
    String? status,
  });

  Future<PostModel> getPostBySlug(String slug);

  Future<List<PostModel>> getFeaturedPosts({
    int page = 1,
    int limit = 10,
  });

  Future<List<PostModel>> getTrendingPosts({
    int page = 1,
    int limit = 10,
  });

  Future<List<PostModel>> searchPosts({
    required String query,
    int page = 1,
    int limit = 10,
  });
}

class PostsRemoteDataSourceImpl implements PostsRemoteDataSource {
  final ApiClient apiClient;

  PostsRemoteDataSourceImpl(this.apiClient);

  @override
  Future<List<PostModel>> getPosts({
    int page = 1,
    int limit = 10,
    String? category,
    String? author,
    String? status,
  }) async {
    try {
      final queryParams = <String, String>{
        'page': page.toString(),
        'limit': limit.toString(),
      };

      if (category != null && category.isNotEmpty) {
        queryParams['category'] = category;
      }
      if (author != null && author.isNotEmpty) {
        queryParams['author'] = author;
      }
      if (status != null && status.isNotEmpty) {
        queryParams['status'] = status;
      }

      final queryString = queryParams.entries
          .map((e) => '${e.key}=${e.value}')
          .join('&');

      final response = await apiClient.get('${ApiConstants.posts}?$queryString');
      
      final postsData = response['posts'] ?? response['data'] ?? response;
      if (postsData is List) {
        return postsData
            .map((post) => PostModel.fromJson(post))
            .toList();
      }
      
      throw ServerException('Invalid response format');
    } catch (e) {
      throw ServerException(e.toString());
    }
  }

  @override
  Future<PostModel> getPostBySlug(String slug) async {
    try {
      final response = await apiClient.get('${ApiConstants.posts}/$slug');
      return PostModel.fromJson(response['post'] ?? response);
    } catch (e) {
      throw ServerException(e.toString());
    }
  }

  @override
  Future<List<PostModel>> getFeaturedPosts({
    int page = 1,
    int limit = 10,
  }) async {
    try {
      final response = await apiClient.get(
        '${ApiConstants.featuredPosts}?page=$page&limit=$limit',
      );
      
      final postsData = response['posts'] ?? response['data'] ?? response;
      if (postsData is List) {
        return postsData
            .map((post) => PostModel.fromJson(post))
            .toList();
      }
      
      throw ServerException('Invalid response format');
    } catch (e) {
      throw ServerException(e.toString());
    }
  }

  @override
  Future<List<PostModel>> getTrendingPosts({
    int page = 1,
    int limit = 10,
  }) async {
    try {
      final response = await apiClient.get(
        '${ApiConstants.trendingPosts}?page=$page&limit=$limit',
      );
      
      final postsData = response['posts'] ?? response['data'] ?? response;
      if (postsData is List) {
        return postsData
            .map((post) => PostModel.fromJson(post))
            .toList();
      }
      
      throw ServerException('Invalid response format');
    } catch (e) {
      throw ServerException(e.toString());
    }
  }

  @override
  Future<List<PostModel>> searchPosts({
    required String query,
    int page = 1,
    int limit = 10,
  }) async {
    try {
      final response = await apiClient.get(
        '${ApiConstants.searchPosts}?q=$query&page=$page&limit=$limit',
      );
      
      final postsData = response['posts'] ?? response['data'] ?? response;
      if (postsData is List) {
        return postsData
            .map((post) => PostModel.fromJson(post))
            .toList();
      }
      
      throw ServerException('Invalid response format');
    } catch (e) {
      throw ServerException(e.toString());
    }
  }
}