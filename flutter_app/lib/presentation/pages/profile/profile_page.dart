import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:go_router/go_router.dart';
import '../../providers/auth_provider.dart';
import '../../providers/theme_provider.dart';

class ProfilePage extends StatelessWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ShadTheme.of(context).colorScheme.background,
      appBar: AppBar(
        backgroundColor: ShadTheme.of(context).colorScheme.background,
        elevation: 0,
        title: Text(
          'Profile',
          style: ShadTheme.of(context).textTheme.h4,
        ),
        actions: [
          Consumer<ThemeProvider>(
            builder: (context, themeProvider, child) {
              return ShadButton.ghost(
                onPressed: () => themeProvider.toggleTheme(),
                icon: Icon(
                  themeProvider.isDarkMode ? LucideIcons.sun : LucideIcons.moon,
                  size: 20,
                ),
              );
            },
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: Consumer<AuthProvider>(
        builder: (context, authProvider, child) {
          final user = authProvider.currentUser;
          if (user == null) {
            return const Center(
              child: Text('User not found'),
            );
          }

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                // Profile header
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: ShadTheme.of(context).colorScheme.card,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: ShadTheme.of(context).colorScheme.border,
                    ),
                  ),
                  child: Column(
                    children: [
                      CircleAvatar(
                        radius: 40,
                        child: Text(
                          user.name.substring(0, 1).toUpperCase(),
                          style: ShadTheme.of(context).textTheme.h3,
                        ),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        user.name,
                        style: ShadTheme.of(context).textTheme.h4,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        user.email,
                        style: ShadTheme.of(context).textTheme.muted,
                      ),
                      if (user.bio != null) ...[
                        const SizedBox(height: 12),
                        Text(
                          user.bio!,
                          style: ShadTheme.of(context).textTheme.p,
                          textAlign: TextAlign.center,
                        ),
                      ],
                      const SizedBox(height: 16),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          color: user.isEmailVerified
                              ? Colors.green.withOpacity(0.1)
                              : Colors.orange.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              user.isEmailVerified
                                  ? LucideIcons.checkCircle
                                  : LucideIcons.alertCircle,
                              size: 14,
                              color: user.isEmailVerified
                                  ? Colors.green
                                  : Colors.orange,
                            ),
                            const SizedBox(width: 6),
                            Text(
                              user.isEmailVerified
                                  ? 'Verified'
                                  : 'Unverified',
                              style: ShadTheme.of(context).textTheme.small?.copyWith(
                                color: user.isEmailVerified
                                    ? Colors.green
                                    : Colors.orange,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // Menu items
                _buildMenuItem(
                  context,
                  icon: LucideIcons.user,
                  title: 'Edit Profile',
                  subtitle: 'Update your profile information',
                  onTap: () {
                    // TODO: Navigate to edit profile
                  },
                ),
                _buildMenuItem(
                  context,
                  icon: LucideIcons.lock,
                  title: 'Change Password',
                  subtitle: 'Update your account password',
                  onTap: () {
                    // TODO: Navigate to change password
                  },
                ),
                _buildMenuItem(
                  context,
                  icon: LucideIcons.bell,
                  title: 'Notifications',
                  subtitle: 'Manage notification preferences',
                  onTap: () {
                    // TODO: Navigate to notifications settings
                  },
                ),
                _buildMenuItem(
                  context,
                  icon: LucideIcons.helpCircle,
                  title: 'Help & Support',
                  subtitle: 'Get help and contact support',
                  onTap: () {
                    // TODO: Navigate to help
                  },
                ),
                _buildMenuItem(
                  context,
                  icon: LucideIcons.info,
                  title: 'About',
                  subtitle: 'App version and information',
                  onTap: () {
                    // TODO: Show about dialog
                  },
                ),
                const SizedBox(height: 24),

                // Logout button
                ShadButton.destructive(
                  onPressed: () async {
                    await authProvider.logout();
                    if (context.mounted) {
                      context.go('/login');
                    }
                  },
                  width: double.infinity,
                  child: authProvider.status == AuthStatus.loading
                      ? const SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(LucideIcons.logOut, size: 16),
                            SizedBox(width: 8),
                            Text('Sign Out'),
                          ],
                        ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildMenuItem(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      child: ShadButton.ghost(
        onPressed: onTap,
        width: double.infinity,
        padding: const EdgeInsets.all(16),
        decoration: ShadDecoration(
          border: ShadBorder.all(
            color: ShadTheme.of(context).colorScheme.border,
          ),
        ),
        child: Row(
          children: [
            Icon(icon, size: 20),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: ShadTheme.of(context).textTheme.p?.copyWith(
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: ShadTheme.of(context).textTheme.small?.copyWith(
                      color: ShadTheme.of(context).colorScheme.muted.color,
                    ),
                  ),
                ],
              ),
            ),
            const Icon(LucideIcons.chevronRight, size: 16),
          ],
        ),
      ),
    );
  }
}