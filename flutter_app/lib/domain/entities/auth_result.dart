import 'package:equatable/equatable.dart';
import 'user.dart';

class AuthResult extends Equatable {
  final User user;
  final String accessToken;
  final String refreshToken;

  const AuthResult({
    required this.user,
    required this.accessToken,
    required this.refreshToken,
  });

  @override
  List<Object> get props => [user, accessToken, refreshToken];

  AuthResult copyWith({
    User? user,
    String? accessToken,
    String? refreshToken,
  }) {
    return AuthResult(
      user: user ?? this.user,
      accessToken: accessToken ?? this.accessToken,
      refreshToken: refreshToken ?? this.refreshToken,
    );
  }
}