import '../models/post_model.dart';
import '../models/user_model.dart';
import '../models/category_model.dart';
import '../../core/network/api_client.dart';
import '../../core/constants/api_constants.dart';
import '../../core/errors/exceptions.dart';
import '../../domain/repositories/search_repository.dart';

class SearchResultModel {
  final List<PostModel> posts;
  final List<UserModel> authors;
  final List<CategoryModel> categories;

  SearchResultModel({
    required this.posts,
    required this.authors,
    required this.categories,
  });

  factory SearchResultModel.fromJson(Map<String, dynamic> json) {
    return SearchResultModel(
      posts: (json['posts'] as List?)?.map((post) => PostModel.fromJson(post)).toList() ?? [],
      authors: (json['authors'] as List?)?.map((author) => UserModel.fromJson(author)).toList() ?? [],
      categories: (json['categories'] as List?)?.map((category) => CategoryModel.fromJson(category)).toList() ?? [],
    );
  }

  SearchResult toDomain() {
    return SearchResult(
      posts: posts,
      authors: authors,
      categories: categories,
    );
  }
}

abstract class SearchRemoteDataSource {
  Future<SearchResultModel> globalSearch({required String query, int page = 1, int limit = 10});
}

class SearchRemoteDataSourceImpl implements SearchRemoteDataSource {
  final ApiClient apiClient;

  SearchRemoteDataSourceImpl(this.apiClient);

  @override
  Future<SearchResultModel> globalSearch({required String query, int page = 1, int limit = 10}) async {
    try {
      final response = await apiClient.get('${ApiConstants.search}?q=$query&page=$page&limit=$limit');
      return SearchResultModel.fromJson(response);
    } catch (e) {
      throw ServerException(e.toString());
    }
  }
}