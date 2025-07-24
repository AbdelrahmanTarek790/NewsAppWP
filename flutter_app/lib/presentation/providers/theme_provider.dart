import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ThemeProvider extends ChangeNotifier {
  final SharedPreferences _prefs;
  static const String _themeKey = 'theme_mode';

  ThemeProvider(this._prefs);

  bool get isDarkMode => _prefs.getBool(_themeKey) ?? false;

  Future<void> toggleTheme() async {
    final newValue = !isDarkMode;
    await _prefs.setBool(_themeKey, newValue);
    notifyListeners();
  }

  Future<void> setTheme(bool isDark) async {
    await _prefs.setBool(_themeKey, isDark);
    notifyListeners();
  }
}