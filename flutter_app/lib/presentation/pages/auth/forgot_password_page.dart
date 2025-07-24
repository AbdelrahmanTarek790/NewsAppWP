import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:go_router/go_router.dart';
import '../../providers/auth_provider.dart';

class ForgotPasswordPage extends StatefulWidget {
  const ForgotPasswordPage({super.key});

  @override
  State<ForgotPasswordPage> createState() => _ForgotPasswordPageState();
}

class _ForgotPasswordPageState extends State<ForgotPasswordPage> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  bool _emailSent = false;

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  void _sendResetEmail() async {
    if (_formKey.currentState!.validate()) {
      await context.read<AuthProvider>().forgotPassword(
            email: _emailController.text.trim(),
          );
      
      if (mounted && context.read<AuthProvider>().status != AuthStatus.error) {
        setState(() {
          _emailSent = true;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ShadTheme.of(context).colorScheme.background,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 400),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Back button
                  Align(
                    alignment: Alignment.topLeft,
                    child: ShadButton.ghost(
                      onPressed: () => context.pop(),
                      icon: const Icon(LucideIcons.arrowLeft, size: 16),
                      child: const Text('Back'),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Icon
                  Container(
                    width: 80,
                    height: 80,
                    margin: const EdgeInsets.only(bottom: 32),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(16),
                      color: ShadTheme.of(context).colorScheme.secondary,
                    ),
                    child: Icon(
                      _emailSent ? LucideIcons.mailCheck : LucideIcons.keyRound,
                      size: 40,
                      color: ShadTheme.of(context).colorScheme.secondaryForeground,
                    ),
                  ),
                  
                  if (!_emailSent) ...[
                    Text(
                      'Forgot password?',
                      style: ShadTheme.of(context).textTheme.h2,
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Enter your email address and we\'ll send you a link to reset your password.',
                      style: ShadTheme.of(context).textTheme.muted,
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 32),

                    Form(
                      key: _formKey,
                      child: ShadInputFormField(
                        controller: _emailController,
                        placeholder: 'Enter your email',
                        keyboardType: TextInputType.emailAddress,
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Please enter your email';
                          }
                          if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(value)) {
                            return 'Please enter a valid email';
                          }
                          return null;
                        },
                        decoration: const ShadDecoration(
                          label: Text('Email'),
                          icon: Padding(
                            padding: EdgeInsets.all(4.0),
                            child: Icon(LucideIcons.mail, size: 16),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),

                    Consumer<AuthProvider>(
                      builder: (context, authProvider, child) {
                        return ShadButton(
                          onPressed: authProvider.status == AuthStatus.loading ? null : _sendResetEmail,
                          child: authProvider.status == AuthStatus.loading
                              ? const SizedBox(
                                  width: 16,
                                  height: 16,
                                  child: CircularProgressIndicator(strokeWidth: 2),
                                )
                              : const Text('Send Reset Link'),
                        );
                      },
                    ),
                  ] else ...[
                    Text(
                      'Check your email',
                      style: ShadTheme.of(context).textTheme.h2,
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'We\'ve sent a password reset link to ${_emailController.text}',
                      style: ShadTheme.of(context).textTheme.muted,
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 32),

                    ShadButton(
                      onPressed: () => context.go('/login'),
                      child: const Text('Back to Sign In'),
                    ),
                    const SizedBox(height: 16),

                    ShadButton.outline(
                      onPressed: () {
                        setState(() {
                          _emailSent = false;
                        });
                      },
                      child: const Text('Try Different Email'),
                    ),
                  ],

                  const SizedBox(height: 16),

                  // Error message
                  Consumer<AuthProvider>(
                    builder: (context, authProvider, child) {
                      if (authProvider.status == AuthStatus.error && 
                          authProvider.errorMessage != null) {
                        return Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: ShadTheme.of(context).colorScheme.destructive.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(
                              color: ShadTheme.of(context).colorScheme.destructive.withOpacity(0.3),
                            ),
                          ),
                          child: Row(
                            children: [
                              Icon(
                                LucideIcons.alertCircle,
                                size: 16,
                                color: ShadTheme.of(context).colorScheme.destructive,
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  authProvider.errorMessage!,
                                  style: TextStyle(
                                    color: ShadTheme.of(context).colorScheme.destructive,
                                    fontSize: 14,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        );
                      }
                      return const SizedBox.shrink();
                    },
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}