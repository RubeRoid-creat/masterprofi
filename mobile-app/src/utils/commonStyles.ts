/**
 * Common reusable styles for consistent design
 */

import { StyleSheet } from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';

export const commonStyles = StyleSheet.create({
  // Card styles
  card: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  cardTitle: {
    ...typography.heading.h3,
    color: colors.text.primary,
    fontWeight: '700',
  },

  // Stat card styles
  statCard: {
    flex: 1,
    minWidth: '48%',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  statCardPrimary: {
    backgroundColor: colors.primary[50],
  },
  statCardSuccess: {
    backgroundColor: colors.success[50],
  },
  statCardWarning: {
    backgroundColor: colors.warning[50],
  },
  statCardInfo: {
    backgroundColor: colors.primary[50],
  },
  statLabel: {
    ...typography.body.xsmall,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
  },
  statValue: {
    ...typography.heading.h2,
    color: colors.text.primary,
    fontWeight: '800',
  },
  statSubtext: {
    ...typography.body.xsmall,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },

  // Button styles
  buttonPrimary: {
    backgroundColor: colors.primary[600],
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSecondary: {
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    ...typography.button.medium,
    color: colors.text.inverse,
    fontWeight: '700',
  },
  buttonTextSecondary: {
    ...typography.button.medium,
    color: colors.text.primary,
    fontWeight: '600',
  },

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
  },
  inputLabel: {
    ...typography.label.medium,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },

  // Section divider
  divider: {
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    marginTop: spacing.md,
    paddingTop: spacing.md,
  },

  // Badge styles
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgePrimary: {
    backgroundColor: colors.primary[100],
  },
  badgeSuccess: {
    backgroundColor: colors.success[100],
  },
  badgeWarning: {
    backgroundColor: colors.warning[100],
  },
  badgeText: {
    ...typography.label.small,
    fontWeight: '600',
  },
});

