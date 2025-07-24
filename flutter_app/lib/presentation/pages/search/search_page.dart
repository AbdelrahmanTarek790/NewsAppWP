import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import '../../providers/search_provider.dart';
import '../../widgets/common/post_card.dart';
import '../../widgets/common/loading_indicator.dart';

class SearchPage extends StatefulWidget {
  const SearchPage({super.key});

  @override
  State<SearchPage> createState() => _SearchPageState();
}

class _SearchPageState extends State<SearchPage> {
  final _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _performSearch() {
    final query = _searchController.text.trim();
    if (query.isNotEmpty) {
      context.read<SearchProvider>().search(query);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ShadTheme.of(context).colorScheme.background,
      appBar: AppBar(
        backgroundColor: ShadTheme.of(context).colorScheme.background,
        elevation: 0,
        title: ShadInput(
          controller: _searchController,
          placeholder: 'Search for posts, authors, categories...',
          onSubmitted: (_) => _performSearch(),
          prefix: const Icon(LucideIcons.search, size: 16),
          suffix: ShadButton.ghost(
            width: 24,
            height: 24,
            padding: EdgeInsets.zero,
            decoration: const ShadDecoration(
              secondaryBorder: ShadBorder.none,
              secondaryFocusedBorder: ShadBorder.none,
            ),
            icon: const Icon(LucideIcons.x, size: 16),
            onPressed: () {
              _searchController.clear();
              context.read<SearchProvider>().clearSearch();
            },
          ),
        ),
      ),
      body: Consumer<SearchProvider>(
        builder: (context, searchProvider, child) {
          if (searchProvider.status == SearchStatus.initial) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    LucideIcons.search,
                    size: 64,
                    color: ShadTheme.of(context).colorScheme.muted.color,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Search NewsApp',
                    style: ShadTheme.of(context).textTheme.h4,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Find posts, authors, and categories',
                    style: ShadTheme.of(context).textTheme.muted,
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            );
          }

          if (searchProvider.status == SearchStatus.loading) {
            return const LoadingIndicator(message: 'Searching...');
          }

          if (searchProvider.status == SearchStatus.error) {
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
                    'Search failed',
                    style: ShadTheme.of(context).textTheme.h6,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    searchProvider.errorMessage ?? 'Something went wrong',
                    style: ShadTheme.of(context).textTheme.muted,
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 16),
                  ShadButton(
                    onPressed: _performSearch,
                    child: const Text('Try Again'),
                  ),
                ],
              ),
            );
          }

          final searchResult = searchProvider.searchResult;
          if (searchResult == null) {
            return const LoadingIndicator();
          }

          final hasResults = searchResult.posts.isNotEmpty ||
              searchResult.authors.isNotEmpty ||
              searchResult.categories.isNotEmpty;

          if (!hasResults) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    LucideIcons.searchX,
                    size: 48,
                    color: ShadTheme.of(context).colorScheme.muted.color,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'No results found',
                    style: ShadTheme.of(context).textTheme.h6,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Try different keywords or check your spelling',
                    style: ShadTheme.of(context).textTheme.muted,
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            );
          }

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Search query
                Text(
                  'Results for "${searchProvider.currentQuery}"',
                  style: ShadTheme.of(context).textTheme.h5,
                ),
                const SizedBox(height: 24),

                // Posts results
                if (searchResult.posts.isNotEmpty) ...[
                  Text(
                    'Posts (${searchResult.posts.length})',
                    style: ShadTheme.of(context).textTheme.h6,
                  ),
                  const SizedBox(height: 16),
                  ...searchResult.posts.map((post) => PostCard(
                        post: post,
                        onTap: () => Navigator.pushNamed(
                          context,
                          '/posts/${post.slug}',
                        ),
                      )),
                  const SizedBox(height: 24),
                ],

                // Authors results
                if (searchResult.authors.isNotEmpty) ...[
                  Text(
                    'Authors (${searchResult.authors.length})',
                    style: ShadTheme.of(context).textTheme.h6,
                  ),
                  const SizedBox(height: 16),
                  ...searchResult.authors.map((author) => Container(
                        margin: const EdgeInsets.only(bottom: 12),
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
                            CircleAvatar(
                              radius: 24,
                              child: Text(
                                author.name.substring(0, 1).toUpperCase(),
                                style: ShadTheme.of(context).textTheme.h6,
                              ),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    author.name,
                                    style: ShadTheme.of(context).textTheme.p?.copyWith(
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                  if (author.bio != null)
                                    Text(
                                      author.bio!,
                                      style: ShadTheme.of(context).textTheme.muted,
                                      maxLines: 2,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      )),
                  const SizedBox(height: 24),
                ],

                // Categories results
                if (searchResult.categories.isNotEmpty) ...[
                  Text(
                    'Categories (${searchResult.categories.length})',
                    style: ShadTheme.of(context).textTheme.h6,
                  ),
                  const SizedBox(height: 16),
                  Wrap(
                    spacing: 12,
                    runSpacing: 12,
                    children: searchResult.categories.map((category) => Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 12,
                          ),
                          decoration: BoxDecoration(
                            color: ShadTheme.of(context).colorScheme.card,
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(
                              color: ShadTheme.of(context).colorScheme.border,
                            ),
                          ),
                          child: Column(
                            children: [
                              Icon(
                                LucideIcons.folder,
                                size: 20,
                                color: ShadTheme.of(context).colorScheme.primary,
                              ),
                              const SizedBox(height: 8),
                              Text(
                                category.name,
                                style: ShadTheme.of(context).textTheme.small?.copyWith(
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                              Text(
                                '${category.postCount} posts',
                                style: ShadTheme.of(context).textTheme.small?.copyWith(
                                  color: ShadTheme.of(context).colorScheme.muted.color,
                                ),
                              ),
                            ],
                          ),
                        )).toList(),
                  ),
                ],
              ],
            ),
          );
        },
      ),
    );
  }
}