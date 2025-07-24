import 'package:flutter/material.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:go_router/go_router.dart';

class MainNavigation extends StatefulWidget {
  final Widget child;

  const MainNavigation({
    super.key,
    required this.child,
  });

  @override
  State<MainNavigation> createState() => _MainNavigationState();
}

class _MainNavigationState extends State<MainNavigation> {
  int _selectedIndex = 0;

  final List<NavigationItem> _items = [
    NavigationItem(
      path: '/home',
      icon: LucideIcons.home,
      label: 'Home',
      index: 0,
    ),
    NavigationItem(
      path: '/posts',
      icon: LucideIcons.newspaper,
      label: 'Posts',
      index: 1,
    ),
    NavigationItem(
      path: '/categories',
      icon: LucideIcons.grid3x3,
      label: 'Categories',
      index: 2,
    ),
    NavigationItem(
      path: '/search',
      icon: LucideIcons.search,
      label: 'Search',
      index: 3,
    ),
    NavigationItem(
      path: '/profile',
      icon: LucideIcons.user,
      label: 'Profile',
      index: 4,
    ),
  ];

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _updateSelectedIndex();
  }

  void _updateSelectedIndex() {
    final location = GoRouterState.of(context).matchedLocation;
    for (final item in _items) {
      if (location.startsWith(item.path)) {
        if (_selectedIndex != item.index) {
          setState(() {
            _selectedIndex = item.index;
          });
        }
        break;
      }
    }
  }

  void _onItemTapped(int index) {
    if (index != _selectedIndex) {
      context.go(_items[index].path);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: widget.child,
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          border: Border(
            top: BorderSide(
              color: ShadTheme.of(context).colorScheme.border,
              width: 1,
            ),
          ),
        ),
        child: BottomNavigationBar(
          type: BottomNavigationBarType.fixed,
          currentIndex: _selectedIndex,
          onTap: _onItemTapped,
          backgroundColor: ShadTheme.of(context).colorScheme.background,
          selectedItemColor: ShadTheme.of(context).colorScheme.primary,
          unselectedItemColor: ShadTheme.of(context).colorScheme.muted.color,
          showUnselectedLabels: true,
          elevation: 0,
          items: _items.map((item) => BottomNavigationBarItem(
            icon: Icon(item.icon, size: 20),
            label: item.label,
          )).toList(),
        ),
      ),
    );
  }
}

class NavigationItem {
  final String path;
  final IconData icon;
  final String label;
  final int index;

  NavigationItem({
    required this.path,
    required this.icon,
    required this.label,
    required this.index,
  });
}