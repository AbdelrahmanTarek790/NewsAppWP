import '../../domain/entities/post.dart';
import 'user_model.dart';
import 'category_model.dart';

class PostModel extends Post {
  const PostModel({
    required super.id,
    required super.title,
    required super.slug,
    required super.content,
    super.excerpt,
    super.featuredImage,
    required super.author,
    required super.categories,
    required super.tags,
    required super.status,
    required super.isFeatured,
    required super.viewCount,
    required super.likesCount,
    required super.commentsCount,
    required super.publishedAt,
    required super.createdAt,
    required super.updatedAt,
  });

  factory PostModel.fromJson(Map<String, dynamic> json) {
    return PostModel(
      id: json['_id'] ?? json['id'],
      title: json['title'],
      slug: json['slug'],
      content: json['content'],
      excerpt: json['excerpt'],
      featuredImage: json['featuredImage'],
      author: UserModel.fromJson(json['author']),
      categories: (json['categories'] as List)
          .map((category) => CategoryModel.fromJson(category))
          .toList(),
      tags: List<String>.from(json['tags'] ?? []),
      status: json['status'],
      isFeatured: json['isFeatured'] ?? false,
      viewCount: json['viewCount'] ?? 0,
      likesCount: json['likesCount'] ?? 0,
      commentsCount: json['commentsCount'] ?? 0,
      publishedAt: DateTime.parse(json['publishedAt']),
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'title': title,
      'slug': slug,
      'content': content,
      'excerpt': excerpt,
      'featuredImage': featuredImage,
      'author': (author as UserModel).toJson(),
      'categories': categories.map((category) => (category as CategoryModel).toJson()).toList(),
      'tags': tags,
      'status': status,
      'isFeatured': isFeatured,
      'viewCount': viewCount,
      'likesCount': likesCount,
      'commentsCount': commentsCount,
      'publishedAt': publishedAt.toIso8601String(),
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  PostModel copyWith({
    String? id,
    String? title,
    String? slug,
    String? content,
    String? excerpt,
    String? featuredImage,
    UserModel? author,
    List<CategoryModel>? categories,
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
    return PostModel(
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