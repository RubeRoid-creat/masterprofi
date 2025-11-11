/**
 * Modern Design System
 * Combining best practices from:
 * - Яндекс Такси (simplicity, large buttons)
 * - Uber (modern minimalism, maps)
 * - Delivery apps (quick actions, order cards)
 * - Material Design 3 (elevated cards, colors)
 * - iOS Human Interface (smooth animations, large touch targets)
 * - Modern trends (gradients, glassmorphism, micro-interactions)
 */

import { colors } from './colors';
import { spacing, borderRadius, shadows } from './spacing';

export const modernDesign = {
  // Elevated Cards (Material Design 3 style)
  cardElevated: {
    ...shadows.xl,
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius['2xl'],
    borderWidth: 0,
  },

  cardFlat: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.sm,
  },

  // Glassmorphism effect
  glass: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },

  // Gradient backgrounds
  gradients: {
    primary: ['#3B82F6', '#2563EB'],
    success: ['#22C55E', '#16A34A'],
    warning: ['#F59E0B', '#D97706'],
    error: ['#EF4444', '#DC2626'],
    purple: ['#8B5CF6', '#7C3AED'],
  },

  // Modern button styles
  buttonSizes: {
    large: {
      paddingVertical: spacing.xl,
      paddingHorizontal: spacing['3xl'],
      minHeight: 56, // Large touch target (iOS HIG)
      borderRadius: borderRadius.xl,
    },
    medium: {
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing['2xl'],
      minHeight: 48,
      borderRadius: borderRadius.lg,
    },
    small: {
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      minHeight: 40,
      borderRadius: borderRadius.md,
    },
  },

  // Touch targets (iOS HIG - minimum 44x44pt)
  touchTarget: {
    minWidth: 44,
    minHeight: 44,
  },

  // Modern spacing (delivery apps style)
  spacing: {
    cardPadding: spacing['2xl'],
    sectionGap: spacing['3xl'],
    elementGap: spacing.lg,
  },

  // Micro-interactions
  interactions: {
    pressScale: 0.98,
    pressOpacity: 0.8,
    animationDuration: 200,
    springConfig: {
      tension: 300,
      friction: 30,
    },
  },

  // Status indicators (Uber style)
  statusIndicators: {
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    pulse: {
      width: 16,
      height: 16,
      borderRadius: 8,
      opacity: 0.6,
    },
  },

  // Modern badges (Material Design 3)
  badges: {
    small: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: borderRadius.full,
      fontSize: 10,
    },
    medium: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.full,
      fontSize: 12,
    },
    large: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.full,
      fontSize: 14,
    },
  },
};

