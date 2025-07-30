/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * Using a red, white, and black theme as requested.
 */

const tintColorLight = '#DC2626'; // Red-600
const tintColorDark = '#F87171'; // Red-400

export const Colors = {
  light: {
    text: '#000000', // Pure Black
    background: '#FFFFFF', // Pure White
    tint: tintColorLight,
    icon: '#6B7280', // Gray-500
    tabIconDefault: '#9CA3AF', // Gray-400
    tabIconSelected: tintColorLight,
    card: '#F9FAFB', // Very light gray
    border: '#E5E7EB', // Light gray
    success: '#059669', // Green-600
    error: '#DC2626', // Red-600
    warning: '#D97706', // Orange-600
    primary: tintColorLight,
    secondary: '#6B7280',
  },
  dark: {
    text: '#FFFFFF', // Pure White
    background: '#000000', // Pure Black
    tint: tintColorDark,
    icon: '#9CA3AF', // Gray-400
    tabIconDefault: '#6B7280', // Gray-500
    tabIconSelected: tintColorDark,
    card: '#1F1F1F', // Very dark gray
    border: '#374151', // Dark gray
    success: '#10B981', // Green-500
    error: '#F87171', // Red-400
    warning: '#FCD34D', // Amber-300
    primary: tintColorDark,
    secondary: '#9CA3AF',
  },
};
