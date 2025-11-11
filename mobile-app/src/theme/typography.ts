/**
 * Typography System
 * Comfortable font sizes and line heights for mobile
 */

export const typography = {
  // Display (Large Headings)
  display: {
    large: {
      fontSize: 32,
      lineHeight: 40,
      fontWeight: '700' as const,
      letterSpacing: -0.5,
    },
    medium: {
      fontSize: 28,
      lineHeight: 36,
      fontWeight: '700' as const,
      letterSpacing: -0.3,
    },
    small: {
      fontSize: 24,
      lineHeight: 32,
      fontWeight: '700' as const,
      letterSpacing: -0.2,
    },
  },

  // Headings
  heading: {
    h1: {
      fontSize: 22,
      lineHeight: 28,
      fontWeight: '700' as const,
      letterSpacing: -0.2,
    },
    h2: {
      fontSize: 20,
      lineHeight: 26,
      fontWeight: '600' as const,
      letterSpacing: -0.1,
    },
    h3: {
      fontSize: 18,
      lineHeight: 24,
      fontWeight: '600' as const,
    },
    h4: {
      fontSize: 16,
      lineHeight: 22,
      fontWeight: '600' as const,
    },
  },

  // Body Text
  body: {
    large: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '400' as const,
    },
    medium: {
      fontSize: 15,
      lineHeight: 22,
      fontWeight: '400' as const,
    },
    small: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '400' as const,
    },
    xsmall: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '400' as const,
    },
  },

  // Labels & Captions
  label: {
    large: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '500' as const,
    },
    medium: {
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '500' as const,
    },
    small: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '500' as const,
    },
  },

  // Buttons
  button: {
    large: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '600' as const,
      letterSpacing: 0.1,
    },
    medium: {
      fontSize: 15,
      lineHeight: 22,
      fontWeight: '600' as const,
    },
    small: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '600' as const,
    },
  },
};








