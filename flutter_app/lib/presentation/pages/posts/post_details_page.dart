import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_html/flutter_html.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:intl/intl.dart';
import '../../providers/posts_provider.dart';
import '../../providers/comments_provider.dart';
import '../../widgets/common/loading_indicator.dart';

class PostDetailsPage extends StatefulWidget {
  final String slug;

  const PostDetailsPage({
    super.key,
    required this.slug,
  });

  @override
  State<PostDetailsPage> createState() => _PostDetailsPageState();
}

class _PostDetailsPageState extends State<PostDetailsPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<PostsProvider>().getPostDetails(widget.slug);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ShadTheme.of(context).colorScheme.background,
      body: Consumer<PostsProvider>(
        builder: (context, postsProvider, child) {
          if (postsProvider.status == PostsStatus.loading) {
            return const SafeArea(
              child: LoadingIndicator(message: 'Loading post...'),
            );
          }

          if (postsProvider.status == PostsStatus.error) {
            return SafeArea(
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      LucideIcons.alertCircle,
                      size: 48,
                      color: ShadTheme.of(context).colorScheme.muted.color,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'Error loading post',
                      style: ShadTheme.of(context).textTheme.h6,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      postsProvider.errorMessage ?? 'Something went wrong',
                      style: ShadTheme.of(context).textTheme.muted,
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 16),
                    ShadButton(
                      onPressed: () => context.pop(),
                      child: const Text('Go Back'),
                    ),
                  ],
                ),
              ),
            );
          }

          final post = postsProvider.currentPost;
          if (post == null) {
            return const SafeArea(
              child: LoadingIndicator(message: 'Loading post...'),
            );
          }

          return CustomScrollView(
            slivers: [
              SliverAppBar(
                expandedHeight: post.featuredImage != null ? 300 : 100,
                pinned: true,
                backgroundColor: ShadTheme.of(context).colorScheme.background,
                flexibleSpace: FlexibleSpaceBar(
                  background: post.featuredImage != null
                      ? CachedNetworkImage(
                          imageUrl: post.featuredImage!,
                          fit: BoxFit.cover,
                          placeholder: (context, url) => Container(
                            color: ShadTheme.of(context).colorScheme.muted.color,
                            child: const Center(
                              child: Icon(LucideIcons.image, size: 32),
                            ),
                          ),
                          errorWidget: (context, url, error) => Container(
                            color: ShadTheme.of(context).colorScheme.muted.color,
                            child: const Center(
                              child: Icon(LucideIcons.imageOff, size: 32),
                            ),
                          ),
                        )
                      : null,
                ),
              ),
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Categories
                      if (post.categories.isNotEmpty)
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: post.categories.map((category) {
                            return Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 6,
                              ),
                              decoration: BoxDecoration(
                                color: ShadTheme.of(context).colorScheme.primary.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(16),
                              ),
                              child: Text(
                                category.name,
                                style: ShadTheme.of(context).textTheme.small?.copyWith(
                                  color: ShadTheme.of(context).colorScheme.primary,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            );
                          }).toList(),
                        ),
                      const SizedBox(height: 16),

                      // Title
                      Text(
                        post.title,
                        style: ShadTheme.of(context).textTheme.h2,
                      ),
                      const SizedBox(height: 16),

                      // Author and metadata
                      Row(
                        children: [
                          CircleAvatar(
                            radius: 20,
                            backgroundImage: post.author.avatar != null
                                ? CachedNetworkImageProvider(post.author.avatar!)
                                : null,
                            child: post.author.avatar == null
                                ? const Icon(LucideIcons.user, size: 16)
                                : null,
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  post.author.name,
                                  style: ShadTheme.of(context).textTheme.p?.copyWith(
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                                Text(
                                  DateFormat('MMM d, yyyy • h:mm a').format(post.publishedAt),
                                  style: ShadTheme.of(context).textTheme.muted,
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
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),

                      // Content
                      Html(
                        data: post.content,
                        style: {
                          "body": Style(
                            margin: Margins.zero,
                            padding: HtmlPaddings.zero,
                            fontSize: FontSize(16),
                            lineHeight: const LineHeight(1.6),
                            color: ShadTheme.of(context).colorScheme.foreground,
                          ),
                          "p": Style(
                            margin: Margins.only(bottom: 16),
                          ),
                          "h1, h2, h3, h4, h5, h6": Style(
                            margin: Margins.only(top: 24, bottom: 16),
                            fontWeight: FontWeight.bold,
                          ),
                          "img": Style(
                            width: Width(double.infinity),
                            margin: Margins.symmetric(vertical: 16),
                          ),
                          "blockquote": Style(
                            margin: Margins.symmetric(vertical: 16),
                            padding: HtmlPaddings.only(left: 16),
                            border: Border(
                              left: BorderSide(
                                color: ShadTheme.of(context).colorScheme.border,
                                width: 4,
                              ),
                            ),
                          ),
                        },
                      ),
                      const SizedBox(height: 32),

                      // Tags
                      if (post.tags.isNotEmpty) ...[
                        Text(
                          'Tags',
                          style: ShadTheme.of(context).textTheme.h6,
                        ),
                        const SizedBox(height: 12),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: post.tags.map((tag) {
                            return Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 6,
                              ),
                              decoration: BoxDecoration(
                                color: ShadTheme.of(context).colorScheme.secondary,
                                borderRadius: BorderRadius.circular(16),
                              ),
                              child: Text(
                                '#$tag',
                                style: ShadTheme.of(context).textTheme.small?.copyWith(
                                  color: ShadTheme.of(context).colorScheme.secondaryForeground,
                                ),
                              ),
                            );
                          }).toList(),
                        ),
                        const SizedBox(height: 32),
                      ],

                      // Comments section placeholder
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: ShadTheme.of(context).colorScheme.card,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: ShadTheme.of(context).colorScheme.border,
                          ),
                        ),
                        child: Row(
                          children: [
                            Icon(
                              LucideIcons.messageCircle,
                              size: 20,
                              color: ShadTheme.of(context).colorScheme.muted.color,
                            ),
                            const SizedBox(width: 12),
                            Text(
                              '${_formatCount(post.commentsCount)} comments',
                              style: ShadTheme.of(context).textTheme.p?.copyWith(
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                            const Spacer(),
                            Text(
                              'View comments',
                              style: ShadTheme.of(context).textTheme.small?.copyWith(
                                color: ShadTheme.of(context).colorScheme.primary,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
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