import '../models/category_model.dart';
import '../models/post_model.dart';
import '../../core/network/api_client.dart';
import '../../core/constants/api_constants.dart';
import '../../core/errors/exceptions.dart';

abstract class CategoriesRemoteDataSource {
  Future<List<CategoryModel>> getCategories();
  Future<CategoryModel> getCategoryBySlug(String slug);
  Future<List<PostModel>> getCategoryPosts({required String slug, int page = 1, int limit = 10});
}

class CategoriesRemoteDataSourceImpl implements CategoriesRemoteDataSource {
  final ApiClient apiClient;

  CategoriesRemoteDataSourceImpl(this.apiClient);

  @override
  Future<List<CategoryModel>> getCategories() async {
    try {
      final response = await apiClient.get(ApiConstants.categories);
      final categoriesData = response['categories'] ?? response['data'] ?? response;
      if (categoriesData is List) {
        return categoriesData.map((category) => CategoryModel.fromJson(category)).toList();
      }
      throw ServerException('Invalid response format');
    } catch (e) {
      throw ServerException(e.toString());
    }
  }

  @override
  Future<CategoryModel> getCategoryBySlug(String slug) async {
    try {
      final response = await apiClient.get('${ApiConstants.categories}/$slug');
      return CategoryModel.fromJson(response['category'] ?? response);
    } catch (e) {
      throw ServerException(e.toString());
    }
  }

  @override
  Future<List<PostModel>> getCategoryPosts({required String slug, int page = 1, int limit = 10}) async {
    try {
      final response = await apiClient.get('${ApiConstants.categories}/$slug/posts?page=$page&limit=$limit');
      final postsData = response['posts'] ?? response['data'] ?? response;
      if (postsData is List) {
        return postsData.map((post) => PostModel.fromJson(post)).toList();
      }
      throw ServerException('Invalid response format');
    } catch (e) {
      throw ServerException(e.toString());
    }
  }
}