/**
 * Alert Component
 * Modern alert for displaying messages, warnings, and errors
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle, TouchableOpacity } from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { ModernCard } from '../common/ModernCard';

export interface AlertProps {
  title?: string;
  message: string;
  variant?: 'info' | 'success' | 'warning' | 'error';
  onClose?: () => void;
  style?: ViewStyle;
  showIcon?: boolean;
}

export const Alert: React.FC<AlertProps> = ({
  title,
  message,
  variant = 'info',
  onClose,
  style,
  showIcon = true,
}) => {
  const alertStyle = [
    styles.container,
    styles[variant],
    style,
  ];

  return (
    <ModernCard variant="flat" padding="medium" style={alertStyle}>
      <View style={styles.content}>
        {showIcon && (
          <View style={[styles.iconContainer, styles[`${variant}Icon`]]}>
            <Text style={styles.iconText}>
              {variant === 'success' && '✓'}
              {variant === 'warning' && '⚠'}
              {variant === 'error' && '✕'}
              {variant === 'info' && 'ℹ'}
            </Text>
          </View>
        )}
        <View style={styles.textContainer}>
          {title && (
            <Text style={[styles.title, styles[`${variant}Title`]]}>
              {title}
            </Text>
          )}
          <Text style={[styles.message, styles[`${variant}Message`]]}>
            {message}
          </Text>
        </View>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
    </ModernCard>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...typography.heading.small,
    marginBottom: spacing.xs,
    fontWeight: '700',
  },
  message: {
    ...typography.body.medium,
  },
  closeButton: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
  closeText: {
    fontSize: 18,
    color: colors.text.tertiary,
    fontWeight: '600',
  },
  // Variants
  info: {
    backgroundColor: colors.primary[50],
    borderLeftWidth: 4,
    borderLeftColor: colors.primary[600],
  },
  success: {
    backgroundColor: colors.success[50],
    borderLeftWidth: 4,
    borderLeftColor: colors.success[600],
  },
  warning: {
    backgroundColor: colors.warning[50],
    borderLeftWidth: 4,
    borderLeftColor: colors.warning[600],
  },
  error: {
    backgroundColor: colors.error[50],
    borderLeftWidth: 4,
    borderLeftColor: colors.error[600],
  },
  // Icon variants
  infoIcon: {
    backgroundColor: colors.primary[100],
  },
  successIcon: {
    backgroundColor: colors.success[100],
  },
  warningIcon: {
    backgroundColor: colors.warning[100],
  },
  errorIcon: {
    backgroundColor: colors.error[100],
  },
  iconText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  // Text variants
  infoTitle: {
    color: colors.primary[900],
  },
  successTitle: {
    color: colors.success[900],
  },
  warningTitle: {
    color: colors.warning[900],
  },
  errorTitle: {
    color: colors.error[900],
  },
  infoMessage: {
    color: colors.primary[800],
  },
  successMessage: {
    color: colors.success[800],
  },
  warningMessage: {
    color: colors.warning[800],
  },
  errorMessage: {
    color: colors.error[800],
  },
});

