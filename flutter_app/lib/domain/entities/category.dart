import 'package:equatable/equatable.dart';

class Category extends Equatable {
  final String id;
  final String name;
  final String slug;
  final String? description;
  final String? image;
  final int postCount;
  final DateTime createdAt;
  final DateTime updatedAt;

  const Category({
    required this.id,
    required this.name,
    required this.slug,
    this.description,
    this.image,
    required this.postCount,
    required this.createdAt,
    required this.updatedAt,
  });

  @override
  List<Object?> get props => [
        id,
        name,
        slug,
        description,
        image,
        postCount,
        createdAt,
        updatedAt,
      ];

  Category copyWith({
    String? id,
    String? name,
    String? slug,
    String? description,
    String? image,
    int? postCount,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Category(
      id: id ?? this.id,
      name: name ?? this.name,
      slug: slug ?? this.slug,
      description: description ?? this.description,
      image: image ?? this.image,
      postCount: postCount ?? this.postCount,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}