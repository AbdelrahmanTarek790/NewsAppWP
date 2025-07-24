import '../../domain/entities/comment.dart';
import 'user_model.dart';

class CommentModel extends Comment {
  const CommentModel({
    required super.id,
    required super.content,
    required super.postId,
    required super.author,
    super.parentId,
    required super.replies,
    required super.createdAt,
    required super.updatedAt,
  });

  factory CommentModel.fromJson(Map<String, dynamic> json) {
    return CommentModel(
      id: json['_id'] ?? json['id'],
      content: json['content'],
      postId: json['postId'] ?? json['post'],
      author: UserModel.fromJson(json['author']),
      parentId: json['parentId'],
      replies: (json['replies'] as List?)
              ?.map((reply) => CommentModel.fromJson(reply))
              .toList() ??
          [],
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'content': content,
      'postId': postId,
      'author': (author as UserModel).toJson(),
      'parentId': parentId,
      'replies': replies.map((reply) => (reply as CommentModel).toJson()).toList(),
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  CommentModel copyWith({
    String? id,
    String? content,
    String? postId,
    UserModel? author,
    String? parentId,
    List<CommentModel>? replies,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return CommentModel(
      id: id ?? this.id,
      content: content ?? this.content,
      postId: postId ?? this.postId,
      author: author ?? this.author,
      parentId: parentId ?? this.parentId,
      replies: replies ?? this.replies,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}