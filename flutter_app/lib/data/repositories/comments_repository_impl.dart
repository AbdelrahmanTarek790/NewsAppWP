import 'package:dartz/dartz.dart';
import '../../domain/entities/comment.dart';
import '../../domain/repositories/comments_repository.dart';
import '../../core/errors/failures.dart';
import '../../core/errors/exceptions.dart';
import '../../core/network/network_info.dart';
import '../datasources/comments_remote_datasource.dart';

class CommentsRepositoryImpl implements CommentsRepository {
  final CommentsRemoteDataSource remoteDataSource;
  final NetworkInfo networkInfo;

  CommentsRepositoryImpl({
    required this.remoteDataSource,
    required this.networkInfo,
  });

  @override
  Future<Either<Failure, List<Comment>>> getPostComments({
    required String postId,
    int page = 1,
    int limit = 10,
  }) async {
    if (await networkInfo.isConnected) {
      try {
        final comments = await remoteDataSource.getPostComments(
          postId: postId,
          page: page,
          limit: limit,
        );
        return Right(comments);
      } on ServerException catch (e) {
        return Left(ServerFailure(e.message));
      } catch (e) {
        return Left(ServerFailure(e.toString()));
      }
    } else {
      return Left(NetworkFailure('No internet connection'));
    }
  }

  @override
  Future<Either<Failure, Comment>> addComment({
    required String postId,
    required String content,
    String? parentId,
  }) async {
    if (await networkInfo.isConnected) {
      try {
        final comment = await remoteDataSource.addComment(
          postId: postId,
          content: content,
          parentId: parentId,
        );
        return Right(comment);
      } on ServerException catch (e) {
        return Left(ServerFailure(e.message));
      } catch (e) {
        return Left(ServerFailure(e.toString()));
      }
    } else {
      return Left(NetworkFailure('No internet connection'));
    }
  }

  @override
  Future<Either<Failure, Comment>> updateComment({
    required String commentId,
    required String content,
  }) async {
    if (await networkInfo.isConnected) {
      try {
        final comment = await remoteDataSource.updateComment(
          commentId: commentId,
          content: content,
        );
        return Right(comment);
      } on ServerException catch (e) {
        return Left(ServerFailure(e.message));
      } catch (e) {
        return Left(ServerFailure(e.toString()));
      }
    } else {
      return Left(NetworkFailure('No internet connection'));
    }
  }

  @override
  Future<Either<Failure, void>> deleteComment({required String commentId}) async {
    if (await networkInfo.isConnected) {
      try {
        await remoteDataSource.deleteComment(commentId: commentId);
        return const Right(null);
      } on ServerException catch (e) {
        return Left(ServerFailure(e.message));
      } catch (e) {
        return Left(ServerFailure(e.toString()));
      }
    } else {
      return Left(NetworkFailure('No internet connection'));
    }
  }
}