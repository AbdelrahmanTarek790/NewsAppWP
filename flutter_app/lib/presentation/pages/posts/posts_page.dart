import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:go_router/go_router.dart';
import '../../providers/posts_provider.dart';
import '../../widgets/common/post_card.dart';
import '../../widgets/common/loading_indicator.dart';

class PostsPage extends StatefulWidget {
  const PostsPage({super.key});

  @override
  State<PostsPage> createState() => _PostsPageState();
}

class _PostsPageState extends State<PostsPage> {
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<PostsProvider>().getPosts(refresh: true);
    });
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_isBottom) {
      final postsProvider = context.read<PostsProvider>();
      if (!postsProvider.hasReachedMax) {
        postsProvider.getPosts();
      }
    }
  }

  bool get _isBottom {
    if (!_scrollController.hasClients) return false;
    final maxScroll = _scrollController.position.maxScrollExtent;
    final currentScroll = _scrollController.offset;
    return currentScroll >= (maxScroll * 0.9);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ShadTheme.of(context).colorScheme.background,
      appBar: AppBar(
        backgroundColor: ShadTheme.of(context).colorScheme.background,
        elevation: 0,
        title: Text(
          'All Posts',
          style: ShadTheme.of(context).textTheme.h4,
        ),
        actions: [
          ShadButton.ghost(
            onPressed: () => context.push('/search'),
            icon: const Icon(LucideIcons.search, size: 20),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          await context.read<PostsProvider>().getPosts(refresh: true);
        },
        child: Consumer<PostsProvider>(
          builder: (context, postsProvider, child) {
            if (postsProvider.status == PostsStatus.loading && postsProvider.posts.isEmpty) {
              return const LoadingIndicator(message: 'Loading posts...');
            }

            if (postsProvider.status == PostsStatus.error) {
              return Center(
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
                      'Error loading posts',
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
                      onPressed: () => postsProvider.getPosts(refresh: true),
                      child: const Text('Try Again'),
                    ),
                  ],
                ),
              );
            }

            if (postsProvider.posts.isEmpty) {
              return Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      LucideIcons.newspaper,
                      size: 48,
                      color: ShadTheme.of(context).colorScheme.muted.color,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'No posts available',
                      style: ShadTheme.of(context).textTheme.h6,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Check back later for new content',
                      style: ShadTheme.of(context).textTheme.muted,
                    ),
                  ],
                ),
              );
            }

            return ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.all(16),
              itemCount: postsProvider.posts.length + (postsProvider.hasReachedMax ? 0 : 1),
              itemBuilder: (context, index) {
                if (index >= postsProvider.posts.length) {
                  return const Padding(
                    padding: EdgeInsets.symmetric(vertical: 16),
                    child: LoadingIndicator(),
                  );
                }

                final post = postsProvider.posts[index];
                return PostCard(
                  post: post,
                  onTap: () => context.push('/posts/${post.slug}'),
                );
              },
            );
          },
        ),
      ),
    );
  }
}