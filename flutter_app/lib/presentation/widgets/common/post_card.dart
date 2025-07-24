import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:intl/intl.dart';
import '../../../domain/entities/post.dart';

class PostCard extends StatelessWidget {
  final Post post;
  final VoidCallback onTap;
  final bool featured;
  final bool compact;

  const PostCard({
    super.key,
    required this.post,
    required this.onTap,
    this.featured = false,
    this.compact = false,
  });

  @override
  Widget build(BuildContext context) {
    if (compact) {
      return _buildCompactCard(context);
    } else if (featured) {
      return _buildFeaturedCard(context);
    } else {
      return _buildStandardCard(context);
    }
  }

  Widget _buildCompactCard(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: ShadTheme.of(context).colorScheme.card,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: ShadTheme.of(context).colorScheme.border,
          ),
        ),
        child: Row(
          children: [
            if (post.featuredImage != null)
              ClipRRect(
                borderRadius: BorderRadius.circular(6),
                child: CachedNetworkImage(
                  imageUrl: post.featuredImage!,
                  width: 60,
                  height: 60,
                  fit: BoxFit.cover,
                  placeholder: (context, url) => Container(
                    width: 60,
                    height: 60,
                    color: ShadTheme.of(context).colorScheme.muted.color,
                    child: const Icon(LucideIcons.image, size: 24),
                  ),
                  errorWidget: (context, url, error) => Container(
                    width: 60,
                    height: 60,
                    color: ShadTheme.of(context).colorScheme.muted.color,
                    child: const Icon(LucideIcons.imageOff, size: 24),
                  ),
                ),
              ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    post.title,
                    style: ShadTheme.of(context).textTheme.p?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Text(
                        post.author.name,
                        style: ShadTheme.of(context).textTheme.small?.copyWith(
                          color: ShadTheme.of(context).colorScheme.muted.color,
                        ),
                      ),
                      Text(
                        ' • ${_formatDate(post.publishedAt)}',
                        style: ShadTheme.of(context).textTheme.small?.copyWith(
                          color: ShadTheme.of(context).colorScheme.muted.color,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFeaturedCard(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: ShadTheme.of(context).colorScheme.card,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: ShadTheme.of(context).colorScheme.border,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (post.featuredImage != null)
              ClipRRect(
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(12),
                  topRight: Radius.circular(12),
                ),
                child: CachedNetworkImage(
                  imageUrl: post.featuredImage!,
                  height: 160,
                  width: double.infinity,
                  fit: BoxFit.cover,
                  placeholder: (context, url) => Container(
                    height: 160,
                    color: ShadTheme.of(context).colorScheme.muted.color,
                    child: const Center(
                      child: Icon(LucideIcons.image, size: 32),
                    ),
                  ),
                  errorWidget: (context, url, error) => Container(
                    height: 160,
                    color: ShadTheme.of(context).colorScheme.muted.color,
                    child: const Center(
                      child: Icon(LucideIcons.imageOff, size: 32),
                    ),
                  ),
                ),
              ),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (post.categories.isNotEmpty)
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: ShadTheme.of(context).colorScheme.primary.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        post.categories.first.name,
                        style: ShadTheme.of(context).textTheme.small?.copyWith(
                          color: ShadTheme.of(context).colorScheme.primary,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  const SizedBox(height: 8),
                  Text(
                    post.title,
                    style: ShadTheme.of(context).textTheme.h6,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 8),
                  if (post.excerpt != null)
                    Text(
                      post.excerpt!,
                      style: ShadTheme.of(context).textTheme.muted,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      CircleAvatar(
                        radius: 12,
                        backgroundImage: post.author.avatar != null
                            ? CachedNetworkImageProvider(post.author.avatar!)
                            : null,
                        child: post.author.avatar == null
                            ? const Icon(LucideIcons.user, size: 12)
                            : null,
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              post.author.name,
                              style: ShadTheme.of(context).textTheme.small?.copyWith(
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                            Text(
                              _formatDate(post.publishedAt),
                              style: ShadTheme.of(context).textTheme.small?.copyWith(
                                color: ShadTheme.of(context).colorScheme.muted.color,
                              ),
                            ),
                          ],
                        ),
                      ),
                      Row(
                        children: [
                          Icon(
                            LucideIcons.eye,
                            size: 14,
                            color: ShadTheme.of(context).colorScheme.muted.color,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            _formatCount(post.viewCount),
                            style: ShadTheme.of(context).textTheme.small?.copyWith(
                              color: ShadTheme.of(context).colorScheme.muted.color,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStandardCard(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        decoration: BoxDecoration(
          color: ShadTheme.of(context).colorScheme.card,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: ShadTheme.of(context).colorScheme.border,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (post.featuredImage != null)
              ClipRRect(
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(12),
                  topRight: Radius.circular(12),
                ),
                child: CachedNetworkImage(
                  imageUrl: post.featuredImage!,
                  height: 200,
                  width: double.infinity,
                  fit: BoxFit.cover,
                  placeholder: (context, url) => Container(
                    height: 200,
                    color: ShadTheme.of(context).colorScheme.muted.color,
                    child: const Center(
                      child: Icon(LucideIcons.image, size: 32),
                    ),
                  ),
                  errorWidget: (context, url, error) => Container(
                    height: 200,
                    color: ShadTheme.of(context).colorScheme.muted.color,
                    child: const Center(
                      child: Icon(LucideIcons.imageOff, size: 32),
                    ),
                  ),
                ),
              ),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      if (post.categories.isNotEmpty) ...[
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: ShadTheme.of(context).colorScheme.primary.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            post.categories.first.name,
                            style: ShadTheme.of(context).textTheme.small?.copyWith(
                              color: ShadTheme.of(context).colorScheme.primary,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                      ],
                      if (post.isFeatured)
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: ShadTheme.of(context).colorScheme.secondary,
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            'Featured',
                            style: ShadTheme.of(context).textTheme.small?.copyWith(
                              color: ShadTheme.of(context).colorScheme.secondaryForeground,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    post.title,
                    style: ShadTheme.of(context).textTheme.h5,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 8),
                  if (post.excerpt != null)
                    Text(
                      post.excerpt!,
                      style: ShadTheme.of(context).textTheme.muted,
                      maxLines: 3,
                      overflow: TextOverflow.ellipsis,
                    ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      CircleAvatar(
                        radius: 16,
                        backgroundImage: post.author.avatar != null
                            ? CachedNetworkImageProvider(post.author.avatar!)
                            : null,
                        child: post.author.avatar == null
                            ? const Icon(LucideIcons.user, size: 14)
                            : null,
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              post.author.name,
                              style: ShadTheme.of(context).textTheme.small?.copyWith(
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                            Text(
                              _formatDate(post.publishedAt),
                              style: ShadTheme.of(context).textTheme.small?.copyWith(
                                color: ShadTheme.of(context).colorScheme.muted.color,
                              ),
                            ),
                          ],
                        ),
                      ),
                      Row(
                        children: [
                          Icon(
                            LucideIcons.eye,
                            size: 16,
                            color: ShadTheme.of(context).colorScheme.muted.color,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            _formatCount(post.viewCount),
                            style: ShadTheme.of(context).textTheme.small?.copyWith(
                              color: ShadTheme.of(context).colorScheme.muted.color,
                            ),
                          ),
                          const SizedBox(width: 16),
                          Icon(
                            LucideIcons.messageCircle,
                            size: 16,
                            color: ShadTheme.of(context).colorScheme.muted.color,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            _formatCount(post.commentsCount),
                            style: ShadTheme.of(context).textTheme.small?.copyWith(
                              color: ShadTheme.of(context).colorScheme.muted.color,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date);

    if (difference.inDays > 7) {
      return DateFormat('MMM d, yyyy').format(date);
    } else if (difference.inDays > 0) {
      return '${difference.inDays}d ago';
    } else if (difference.inHours > 0) {
      return '${difference.inHours}h ago';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes}m ago';
    } else {
      return 'Just now';
    }
  }

  String _formatCount(int count) {
    if (count >= 1000000) {
      return '${(count / 1000000).toStringAsFixed(1)}M';
    } else if (count >= 1000) {
      return '${(count / 1000).toStringAsFixed(1)}K';
    } else {
      return count.toString();
    }
  }
}