import 'package:equatable/equatable.dart';
import 'user.dart';
import 'category.dart';

class Post extends Equatable {
  final String id;
  final String title;
  final String slug;
  final String content;
  final String? excerpt;
  final String? featuredImage;
  final User author;
  final List<Category> categories;
  final List<String> tags;
  final String status;
  final bool isFeatured;
  final int viewCount;
  final int likesCount;
  final int commentsCount;
  final DateTime publishedAt;
  final DateTime createdAt;
  final DateTime updatedAt;

  const Post({
    required this.id,
    required this.title,
    required this.slug,
    required this.content,
    this.excerpt,
    this.featuredImage,
    required this.author,
    required this.categories,
    required this.tags,
    required this.status,
    required this.isFeatured,
    required this.viewCount,
    required this.likesCount,
    required this.commentsCount,
    required this.publishedAt,
    required this.createdAt,
    required this.updatedAt,
  });

  @override
  List<Object?> get props => [
        id,
        title,
        slug,
        content,
        excerpt,
        featuredImage,
        author,
        categories,
        tags,
        status,
        isFeatured,
        viewCount,
        likesCount,
        commentsCount,
        publishedAt,
        createdAt,
        updatedAt,
      ];

  Post copyWith({
    String? id,
    String? title,
    String? slug,
    String? content,
    String? excerpt,
    String? featuredImage,
    User? author,
    List<Category>? categories,
    List<String>? tags,
    String? status,
    bool? isFeatured,
    int? viewCount,
    int? likesCount,
    int? commentsCount,
    DateTime? publishedAt,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Post(
      id: id ?? this.id,
      title: title ?? this.title,
      slug: slug ?? this.slug,
      content: content ?? this.content,
      excerpt: excerpt ?? this.excerpt,
      featuredImage: featuredImage ?? this.featuredImage,
      author: author ?? this.author,
      categories: categories ?? this.categories,
      tags: tags ?? this.tags,
      status: status ?? this.status,
      isFeatured: isFeatured ?? this.isFeatured,
      viewCount: viewCount ?? this.viewCount,
      likesCount: likesCount ?? this.likesCount,
      commentsCount: commentsCount ?? this.commentsCount,
      publishedAt: publishedAt ?? this.publishedAt,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}