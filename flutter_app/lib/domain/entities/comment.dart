import 'package:equatable/equatable.dart';
import 'user.dart';

class Comment extends Equatable {
  final String id;
  final String content;
  final String postId;
  final User author;
  final String? parentId;
  final List<Comment> replies;
  final DateTime createdAt;
  final DateTime updatedAt;

  const Comment({
    required this.id,
    required this.content,
    required this.postId,
    required this.author,
    this.parentId,
    required this.replies,
    required this.createdAt,
    required this.updatedAt,
  });

  @override
  List<Object?> get props => [
        id,
        content,
        postId,
        author,
        parentId,
        replies,
        createdAt,
        updatedAt,
      ];

  Comment copyWith({
    String? id,
    String? content,
    String? postId,
    User? author,
    String? parentId,
    List<Comment>? replies,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Comment(
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