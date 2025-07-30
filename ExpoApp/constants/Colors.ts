/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#2563EB'; // Blue-600
const tintColorDark = '#60A5FA'; // Blue-400

export const Colors = {
  light: {
    text: '#1F2937', // Gray-800
    background: '#FFFFFF',
    tint: tintColorLight,
    icon: '#6B7280', // Gray-500
    tabIconDefault: '#9CA3AF', // Gray-400
    tabIconSelected: tintColorLight,
    card: '#F9FAFB', // Gray-50
    border: '#E5E7EB', // Gray-200
    success: '#10B981', // Emerald-500
    error: '#EF4444', // Red-500
    warning: '#F59E0B', // Amber-500
  },
  dark: {
    text: '#F9FAFB', // Gray-50
    background: '#111827', // Gray-900
    tint: tintColorDark,
    icon: '#9CA3AF', // Gray-400
    tabIconDefault: '#6B7280', // Gray-500
    tabIconSelected: tintColorDark,
    card: '#1F2937', // Gray-800
    border: '#374151', // Gray-700
    success: '#34D399', // Emerald-400
    error: '#F87171', // Red-400
    warning: '#FCD34D', // Amber-300
  },
};
