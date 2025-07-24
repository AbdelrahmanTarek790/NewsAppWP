import '../models/comment_model.dart';
import '../../core/network/api_client.dart';
import '../../core/constants/api_constants.dart';
import '../../core/errors/exceptions.dart';

abstract class CommentsRemoteDataSource {
  Future<List<CommentModel>> getPostComments({required String postId, int page = 1, int limit = 10});
  Future<CommentModel> addComment({required String postId, required String content, String? parentId});
  Future<CommentModel> updateComment({required String commentId, required String content});
  Future<void> deleteComment({required String commentId});
}

class CommentsRemoteDataSourceImpl implements CommentsRemoteDataSource {
  final ApiClient apiClient;

  CommentsRemoteDataSourceImpl(this.apiClient);

  @override
  Future<List<CommentModel>> getPostComments({required String postId, int page = 1, int limit = 10}) async {
    try {
      final response = await apiClient.get('${ApiConstants.comments}/post/$postId?page=$page&limit=$limit');
      final commentsData = response['comments'] ?? response['data'] ?? response;
      if (commentsData is List) {
        return commentsData.map((comment) => CommentModel.fromJson(comment)).toList();
      }
      throw ServerException('Invalid response format');
    } catch (e) {
      throw ServerException(e.toString());
    }
  }

  @override
  Future<CommentModel> addComment({required String postId, required String content, String? parentId}) async {
    try {
      final body = {
        'postId': postId,
        'content': content,
      };
      if (parentId != null) body['parentId'] = parentId;

      final response = await apiClient.post(ApiConstants.comments, body: body);
      return CommentModel.fromJson(response['comment'] ?? response);
    } catch (e) {
      throw ServerException(e.toString());
    }
  }

  @override
  Future<CommentModel> updateComment({required String commentId, required String content}) async {
    try {
      final response = await apiClient.patch('${ApiConstants.comments}/$commentId', body: {'content': content});
      return CommentModel.fromJson(response['comment'] ?? response);
    } catch (e) {
      throw ServerException(e.toString());
    }
  }

  @override
  Future<void> deleteComment({required String commentId}) async {
    try {
      await apiClient.delete('${ApiConstants.comments}/$commentId');
    } catch (e) {
      throw ServerException(e.toString());
    }
  }
}