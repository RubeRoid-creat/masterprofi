/**
 * Color Palette
 * Modern, comfortable color scheme for MasterProfi mobile app
 */

export const colors = {
  // Primary Brand Colors (Blue - matching admin panel)
  primary: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6', // Main primary (blue-500 from admin)
    600: '#2563EB', // blue-600 from admin (buttons, active states)
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },

  // Secondary Colors (Purple for accents - matching admin panel)
  secondary: {
    50: '#F3E8FF',
    100: '#E9D5FF',
    200: '#DDD6FE',
    300: '#C4B5FD',
    400: '#A78BFA',
    500: '#8B5CF6',
    600: '#7C3AED', // purple-600 from admin
    700: '#6D28D9',
    800: '#5B21B6',
    900: '#4C1D95',
  },

  // Success/Green
  success: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E',
    600: '#16A34A',
    700: '#15803D',
    800: '#166534',
    900: '#14532D',
  },

  // Warning/Amber
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },

  // Error/Red
  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },

  // Neutral Grays (matching admin panel Tailwind colors)
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6', // bg-gray-100 from admin
    200: '#E5E7EB', // border-gray-200
    300: '#D1D5DB', // text-gray-300, border-gray-300
    400: '#9CA3AF', // text-gray-400
    500: '#6B7280', // text-gray-500
    600: '#4B5563', // border-gray-600 (dark mode)
    700: '#374151', // bg-gray-700 (dark inputs)
    800: '#1F2937', // bg-gray-800 (dark cards)
    900: '#111827', // bg-gray-900 (dark background)
  },

  // Background Colors (matching admin panel)
  background: {
    primary: '#FFFFFF', // white (cards)
    secondary: '#F3F4F6', // gray-100 from admin panel
    tertiary: '#E5E7EB', // gray-200
    dark: '#111827', // gray-900 for dark mode
    darkSecondary: '#1F2937', // gray-800 for dark cards
    darkTertiary: '#374151', // gray-700
  },

  // Text Colors
  text: {
    primary: '#111827',
    secondary: '#4B5563',
    tertiary: '#6B7280',
    disabled: '#9CA3AF',
    inverse: '#FFFFFF',
    link: '#2563EB',
  },

  // Border Colors
  border: {
    light: '#E5E7EB',
    default: '#D1D5DB',
    dark: '#9CA3AF',
  },

  // Status Colors (matching admin panel)
  status: {
    new: '#22C55E', // green
    assigned: '#3B82F6', // blue-500 (matches admin)
    inProgress: '#F59E0B', // amber
    completed: '#10B981', // green
    cancelled: '#EF4444', // red-500
  },

  // Gradient Colors (matching admin panel login gradient)
  gradients: {
    primary: ['#3B82F6', '#7C3AED'], // blue-500 to purple-600
    login: ['#3B82F6', '#9333EA'], // blue-500 to purple-600 (from admin login)
  },
};

