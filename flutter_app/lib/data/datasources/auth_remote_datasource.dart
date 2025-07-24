import '../models/auth_result_model.dart';
import '../models/user_model.dart';
import '../../core/network/api_client.dart';
import '../../core/constants/api_constants.dart';
import '../../core/errors/exceptions.dart';

abstract class AuthRemoteDataSource {
  Future<AuthResultModel> login({
    required String email,
    required String password,
  });

  Future<AuthResultModel> register({
    required String name,
    required String email,
    required String password,
  });

  Future<void> logout();

  Future<AuthResultModel> refreshToken();

  Future<void> forgotPassword({
    required String email,
  });

  Future<void> resetPassword({
    required String token,
    required String password,
  });

  Future<void> updatePassword({
    required String currentPassword,
    required String newPassword,
  });

  Future<void> verifyEmail({
    required String token,
  });

  Future<void> resendVerification();

  Future<UserModel> getCurrentUser();
}

class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  final ApiClient apiClient;

  AuthRemoteDataSourceImpl(this.apiClient);

  @override
  Future<AuthResultModel> login({
    required String email,
    required String password,
  }) async {
    try {
      final response = await apiClient.post(
        ApiConstants.login,
        body: {
          'email': email,
          'password': password,
        },
      );

      return AuthResultModel.fromJson(response);
    } catch (e) {
      throw ServerException(e.toString());
    }
  }

  @override
  Future<AuthResultModel> register({
    required String name,
    required String email,
    required String password,
  }) async {
    try {
      final response = await apiClient.post(
        ApiConstants.register,
        body: {
          'name': name,
          'email': email,
          'password': password,
        },
      );

      return AuthResultModel.fromJson(response);
    } catch (e) {
      throw ServerException(e.toString());
    }
  }

  @override
  Future<void> logout() async {
    try {
      await apiClient.post(ApiConstants.logout);
    } catch (e) {
      throw ServerException(e.toString());
    }
  }

  @override
  Future<AuthResultModel> refreshToken() async {
    try {
      final response = await apiClient.post(ApiConstants.refreshToken);
      return AuthResultModel.fromJson(response);
    } catch (e) {
      throw ServerException(e.toString());
    }
  }

  @override
  Future<void> forgotPassword({required String email}) async {
    try {
      await apiClient.post(
        ApiConstants.forgotPassword,
        body: {'email': email},
      );
    } catch (e) {
      throw ServerException(e.toString());
    }
  }

  @override
  Future<void> resetPassword({
    required String token,
    required String password,
  }) async {
    try {
      await apiClient.patch(
        '${ApiConstants.resetPassword}/$token',
        body: {'password': password},
      );
    } catch (e) {
      throw ServerException(e.toString());
    }
  }

  @override
  Future<void> updatePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    try {
      await apiClient.patch(
        ApiConstants.updatePassword,
        body: {
          'currentPassword': currentPassword,
          'newPassword': newPassword,
        },
      );
    } catch (e) {
      throw ServerException(e.toString());
    }
  }

  @override
  Future<void> verifyEmail({required String token}) async {
    try {
      await apiClient.post('${ApiConstants.verifyEmail}/$token');
    } catch (e) {
      throw ServerException(e.toString());
    }
  }

  @override
  Future<void> resendVerification() async {
    try {
      await apiClient.post(ApiConstants.resendVerification);
    } catch (e) {
      throw ServerException(e.toString());
    }
  }

  @override
  Future<UserModel> getCurrentUser() async {
    try {
      final response = await apiClient.get(ApiConstants.me);
      return UserModel.fromJson(response['user'] ?? response);
    } catch (e) {
      throw ServerException(e.toString());
    }
  }
}