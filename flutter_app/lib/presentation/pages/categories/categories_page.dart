import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import '../../providers/categories_provider.dart';
import '../../widgets/common/loading_indicator.dart';

class CategoriesPage extends StatefulWidget {
  const CategoriesPage({super.key});

  @override
  State<CategoriesPage> createState() => _CategoriesPageState();
}

class _CategoriesPageState extends State<CategoriesPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<CategoriesProvider>().getCategories();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ShadTheme.of(context).colorScheme.background,
      appBar: AppBar(
        backgroundColor: ShadTheme.of(context).colorScheme.background,
        elevation: 0,
        title: Text(
          'Categories',
          style: ShadTheme.of(context).textTheme.h4,
        ),
      ),
      body: Consumer<CategoriesProvider>(
        builder: (context, categoriesProvider, child) {
          if (categoriesProvider.status == CategoriesStatus.loading) {
            return const LoadingIndicator(message: 'Loading categories...');
          }

          if (categoriesProvider.status == CategoriesStatus.error) {
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
                    'Error loading categories',
                    style: ShadTheme.of(context).textTheme.h6,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    categoriesProvider.errorMessage ?? 'Something went wrong',
                    style: ShadTheme.of(context).textTheme.muted,
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 16),
                  ShadButton(
                    onPressed: () => categoriesProvider.getCategories(),
                    child: const Text('Try Again'),
                  ),
                ],
              ),
            );
          }

          return GridView.builder(
            padding: const EdgeInsets.all(16),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              childAspectRatio: 1.2,
              crossAxisSpacing: 16,
              mainAxisSpacing: 16,
            ),
            itemCount: categoriesProvider.categories.length,
            itemBuilder: (context, index) {
              final category = categoriesProvider.categories[index];
              return Container(
                decoration: BoxDecoration(
                  color: ShadTheme.of(context).colorScheme.card,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: ShadTheme.of(context).colorScheme.border,
                  ),
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      LucideIcons.folder,
                      size: 32,
                      color: ShadTheme.of(context).colorScheme.primary,
                    ),
                    const SizedBox(height: 12),
                    Text(
                      category.name,
                      style: ShadTheme.of(context).textTheme.h6,
                      textAlign: TextAlign.center,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${category.postCount} posts',
                      style: ShadTheme.of(context).textTheme.muted,
                    ),
                  ],
                ),
              );
            },
          );
        },
      ),
    );
  }
}