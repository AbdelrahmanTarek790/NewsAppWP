import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:go_router/go_router.dart';
import '../../providers/posts_provider.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/common/post_card.dart';
import '../../widgets/common/loading_indicator.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<PostsProvider>().getFeaturedPosts();
      context.read<PostsProvider>().getTrendingPosts();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ShadTheme.of(context).colorScheme.background,
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async {
            await Future.wait([
              context.read<PostsProvider>().getFeaturedPosts(),
              context.read<PostsProvider>().getTrendingPosts(),
            ]);
          },
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header
                _buildHeader(),
                const SizedBox(height: 24),

                // Featured Posts
                _buildFeaturedSection(),
                const SizedBox(height: 32),

                // Trending Posts
                _buildTrendingSection(),
                const SizedBox(height: 16),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Consumer<AuthProvider>(
      builder: (context, authProvider, child) {
        final user = authProvider.currentUser;
        return Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Welcome back${user != null ? ', ${user.name.split(' ').first}' : ''}!',
                    style: ShadTheme.of(context).textTheme.h3,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Stay updated with the latest news',
                    style: ShadTheme.of(context).textTheme.muted,
                  ),
                ],
              ),
            ),
            ShadButton.ghost(
              onPressed: () => context.push('/search'),
              icon: const Icon(LucideIcons.search, size: 20),
            ),
            const SizedBox(width: 8),
            ShadButton.ghost(
              onPressed: () => context.push('/profile'),
              icon: const Icon(LucideIcons.user, size: 20),
            ),
          ],
        );
      },
    );
  }

  Widget _buildFeaturedSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Featured Stories',
              style: ShadTheme.of(context).textTheme.h4,
            ),
            ShadButton.ghost(
              onPressed: () => context.push('/posts?filter=featured'),
              child: const Text('See all'),
            ),
          ],
        ),
        const SizedBox(height: 16),
        Consumer<PostsProvider>(
          builder: (context, postsProvider, child) {
            if (postsProvider.featuredPosts.isEmpty) {
              return const LoadingIndicator();
            }

            return SizedBox(
              height: 280,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                itemCount: postsProvider.featuredPosts.length,
                itemBuilder: (context, index) {
                  final post = postsProvider.featuredPosts[index];
                  return Container(
                    width: 300,
                    margin: EdgeInsets.only(
                      right: index < postsProvider.featuredPosts.length - 1 ? 16 : 0,
                    ),
                    child: PostCard(
                      post: post,
                      onTap: () => context.push('/posts/${post.slug}'),
                      featured: true,
                    ),
                  );
                },
              ),
            );
          },
        ),
      ],
    );
  }

  Widget _buildTrendingSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Trending Now',
              style: ShadTheme.of(context).textTheme.h4,
            ),
            ShadButton.ghost(
              onPressed: () => context.push('/posts?filter=trending'),
              child: const Text('See all'),
            ),
          ],
        ),
        const SizedBox(height: 16),
        Consumer<PostsProvider>(
          builder: (context, postsProvider, child) {
            if (postsProvider.trendingPosts.isEmpty) {
              return const LoadingIndicator();
            }

            return Column(
              children: postsProvider.trendingPosts.take(5).map((post) {
                return Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: PostCard(
                    post: post,
                    onTap: () => context.push('/posts/${post.slug}'),
                    compact: true,
                  ),
                );
              }).toList(),
            );
          },
        ),
      ],
    );
  }
}