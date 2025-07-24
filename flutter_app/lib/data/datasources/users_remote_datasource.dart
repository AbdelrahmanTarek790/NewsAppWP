import '../models/user_model.dart';
import '../../core/network/api_client.dart';
import '../../core/constants/api_constants.dart';
import '../../core/errors/exceptions.dart';

abstract class UsersRemoteDataSource {
  Future<List<UserModel>> getAuthors({int page = 1, int limit = 10});
  Future<UserModel> getAuthorByUsername(String username);
  Future<UserModel> getCurrentUser();
  Future<UserModel> updateProfile({String? name, String? bio, String? avatar});
}

class UsersRemoteDataSourceImpl implements UsersRemoteDataSource {
  final ApiClient apiClient;

  UsersRemoteDataSourceImpl(this.apiClient);

  @override
  Future<List<UserModel>> getAuthors({int page = 1, int limit = 10}) async {
    try {
      final response = await apiClient.get('${ApiConstants.authors}?page=$page&limit=$limit');
      final authorsData = response['authors'] ?? response['data'] ?? response;
      if (authorsData is List) {
        return authorsData.map((author) => UserModel.fromJson(author)).toList();
      }
      throw ServerException('Invalid response format');
    } catch (e) {
      throw ServerException(e.toString());
    }
  }

  @override
  Future<UserModel> getAuthorByUsername(String username) async {
    try {
      final response = await apiClient.get('${ApiConstants.authors}/$username');
      return UserModel.fromJson(response['author'] ?? response);
    } catch (e) {
      throw ServerException(e.toString());
    }
  }

  @override
  Future<UserModel> getCurrentUser() async {
    try {
      final response = await apiClient.get(ApiConstants.userMe);
      return UserModel.fromJson(response['user'] ?? response);
    } catch (e) {
      throw ServerException(e.toString());
    }
  }

  @override
  Future<UserModel> updateProfile({String? name, String? bio, String? avatar}) async {
    try {
      final body = <String, dynamic>{};
      if (name != null) body['name'] = name;
      if (bio != null) body['bio'] = bio;
      if (avatar != null) body['avatar'] = avatar;

      final response = await apiClient.patch(ApiConstants.updateMe, body: body);
      return UserModel.fromJson(response['user'] ?? response);
    } catch (e) {
      throw ServerException(e.toString());
    }
  }
}