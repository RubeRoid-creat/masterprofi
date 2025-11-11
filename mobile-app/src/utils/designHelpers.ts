/**
 * Design Helpers
 * Common styles and utilities for consistent design
 */

import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';

export const designHelpers = {
  // Card styles
  card: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.md,
  } as ViewStyle,

  // Input styles
  input: {
    ...typography.body.medium,
    color: colors.text.primary,
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  } as TextStyle,

  // Button base
  buttonBase: {
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  // Text styles
  label: {
    ...typography.label.medium,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  } as TextStyle,

  errorText: {
    ...typography.body.small,
    color: colors.error[600],
    marginTop: spacing.xs,
  } as TextStyle,
};








