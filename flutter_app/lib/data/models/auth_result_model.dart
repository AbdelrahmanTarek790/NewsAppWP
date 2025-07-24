import '../../domain/entities/auth_result.dart';
import 'user_model.dart';

class AuthResultModel extends AuthResult {
  const AuthResultModel({
    required super.user,
    required super.accessToken,
    required super.refreshToken,
  });

  factory AuthResultModel.fromJson(Map<String, dynamic> json) {
    return AuthResultModel(
      user: UserModel.fromJson(json['user']),
      accessToken: json['accessToken'] ?? json['token'],
      refreshToken: json['refreshToken'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'user': (user as UserModel).toJson(),
      'accessToken': accessToken,
      'refreshToken': refreshToken,
    };
  }

  AuthResultModel copyWith({
    UserModel? user,
    String? accessToken,
    String? refreshToken,
  }) {
    return AuthResultModel(
      user: user ?? this.user,
      accessToken: accessToken ?? this.accessToken,
      refreshToken: refreshToken ?? this.refreshToken,
    );
  }
}