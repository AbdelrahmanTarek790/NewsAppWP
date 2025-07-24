import 'package:flutter/foundation.dart';
import '../../domain/entities/comment.dart';
import '../../domain/usecases/comments/get_post_comments_usecase.dart';
import '../../domain/usecases/comments/add_comment_usecase.dart';
import '../../domain/usecases/comments/update_comment_usecase.dart';
import '../../domain/usecases/comments/delete_comment_usecase.dart';
import '../../core/errors/failures.dart';

enum CommentsStatus { initial, loading, loaded, error }

class CommentsProvider extends ChangeNotifier {
  final GetPostCommentsUseCase getPostCommentsUseCase;
  final AddCommentUseCase addCommentUseCase;
  final UpdateCommentUseCase updateCommentUseCase;
  final DeleteCommentUseCase deleteCommentUseCase;

  CommentsProvider({
    required this.getPostCommentsUseCase,
    required this.addCommentUseCase,
    required this.updateCommentUseCase,
    required this.deleteCommentUseCase,
  });

  CommentsStatus _status = CommentsStatus.initial;
  List<Comment> _comments = [];
  String? _errorMessage;

  CommentsStatus get status => _status;
  List<Comment> get comments => _comments;
  String? get errorMessage => _errorMessage;

  void _setStatus(CommentsStatus status) {
    _status = status;
    notifyListeners();
  }

  void _setError(String error) {
    _errorMessage = error;
    _setStatus(CommentsStatus.error);
  }

  Future<void> getPostComments(String postId) async {
    _setStatus(CommentsStatus.loading);
    final result = await getPostCommentsUseCase(postId: postId);
    result.fold(
      (failure) => _setError(_mapFailureToMessage(failure)),
      (comments) {
        _comments = comments;
        _setStatus(CommentsStatus.loaded);
      },
    );
  }

  Future<void> addComment({
    required String postId,
    required String content,
    String? parentId,
  }) async {
    final result = await addCommentUseCase(
      postId: postId,
      content: content,
      parentId: parentId,
    );
    result.fold(
      (failure) => _setError(_mapFailureToMessage(failure)),
      (comment) {
        _comments.add(comment);
        notifyListeners();
      },
    );
  }

  Future<void> updateComment({
    required String commentId,
    required String content,
  }) async {
    final result = await updateCommentUseCase(
      commentId: commentId,
      content: content,
    );
    result.fold(
      (failure) => _setError(_mapFailureToMessage(failure)),
      (updatedComment) {
        final index = _comments.indexWhere((c) => c.id == commentId);
        if (index != -1) {
          _comments[index] = updatedComment;
          notifyListeners();
        }
      },
    );
  }

  Future<void> deleteComment(String commentId) async {
    final result = await deleteCommentUseCase(commentId: commentId);
    result.fold(
      (failure) => _setError(_mapFailureToMessage(failure)),
      (_) {
        _comments.removeWhere((c) => c.id == commentId);
        notifyListeners();
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