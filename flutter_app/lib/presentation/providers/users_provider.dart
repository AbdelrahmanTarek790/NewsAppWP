import 'package:flutter/foundation.dart';
import '../../domain/entities/user.dart';
import '../../domain/usecases/users/get_authors_usecase.dart';
import '../../domain/usecases/users/get_author_profile_usecase.dart';
import '../../domain/usecases/users/update_profile_usecase.dart';
import '../../core/errors/failures.dart';

enum UsersStatus { initial, loading, loaded, error }

class UsersProvider extends ChangeNotifier {
  final GetAuthorsUseCase getAuthorsUseCase;
  final GetAuthorProfileUseCase getAuthorProfileUseCase;
  final UpdateProfileUseCase updateProfileUseCase;

  UsersProvider({
    required this.getAuthorsUseCase,
    required this.getAuthorProfileUseCase,
    required this.updateProfileUseCase,
  });

  UsersStatus _status = UsersStatus.initial;
  List<User> _authors = [];
  User? _selectedAuthor;
  String? _errorMessage;

  UsersStatus get status => _status;
  List<User> get authors => _authors;
  User? get selectedAuthor => _selectedAuthor;
  String? get errorMessage => _errorMessage;

  void _setStatus(UsersStatus status) {
    _status = status;
    notifyListeners();
  }

  void _setError(String error) {
    _errorMessage = error;
    _setStatus(UsersStatus.error);
  }

  Future<void> getAuthors() async {
    _setStatus(UsersStatus.loading);
    final result = await getAuthorsUseCase();
    result.fold(
      (failure) => _setError(_mapFailureToMessage(failure)),
      (authors) {
        _authors = authors;
        _setStatus(UsersStatus.loaded);
      },
    );
  }

  Future<void> getAuthorProfile(String username) async {
    _setStatus(UsersStatus.loading);
    final result = await getAuthorProfileUseCase(username);
    result.fold(
      (failure) => _setError(_mapFailureToMessage(failure)),
      (author) {
        _selectedAuthor = author;
        _setStatus(UsersStatus.loaded);
      },
    );
  }

  Future<void> updateProfile({String? name, String? bio, String? avatar}) async {
    _setStatus(UsersStatus.loading);
    final result = await updateProfileUseCase(name: name, bio: bio, avatar: avatar);
    result.fold(
      (failure) => _setError(_mapFailureToMessage(failure)),
      (user) {
        _setStatus(UsersStatus.loaded);
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