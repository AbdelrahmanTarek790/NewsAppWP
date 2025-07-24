import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'router.dart';
import '../presentation/providers/auth_provider.dart';
import '../presentation/providers/theme_provider.dart';
import '../core/di/service_locator.dart';

class NewsApp extends StatelessWidget {
  const NewsApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(
          create: (_) => ServiceLocator.get<AuthProvider>(),
        ),
        ChangeNotifierProvider(
          create: (_) => ServiceLocator.get<ThemeProvider>(),
        ),
      ],
      child: Consumer<ThemeProvider>(
        builder: (context, themeProvider, child) {
          return ShadApp.materialApp(
            title: 'NewsApp',
            theme: ShadThemeData(
              brightness: themeProvider.isDarkMode 
                  ? Brightness.dark 
                  : Brightness.light,
              colorScheme: themeProvider.isDarkMode 
                  ? const ShadSlateColorScheme.dark()
                  : const ShadSlateColorScheme.light(),
            ),
            routerConfig: AppRouter.router,
            debugShowCheckedModeBanner: false,
          );
        },
      ),
    );
  }
}