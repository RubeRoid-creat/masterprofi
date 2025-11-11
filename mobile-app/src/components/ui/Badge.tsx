/**
 * Badge Component
 * Modern badge for status indicators, counts, and labels
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { modernDesign } from '../../theme/modernDesign';

export interface BadgeProps {
  label: string | number;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'gray';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  size = 'medium',
  style,
  textStyle,
}) => {
  const badgeStyle = [
    styles.base,
    styles[size],
    styles[variant],
    style,
  ];

  const textColorStyle = [
    styles.text,
    styles[`${size}Text`],
    styles[`${variant}Text`],
    textStyle,
  ];

  return (
    <View style={badgeStyle}>
      <Text style={textColorStyle}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
  },
  // Sizes
  small: {
    ...modernDesign.badges.small,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  medium: {
    ...modernDesign.badges.medium,
  },
  large: {
    ...modernDesign.badges.large,
  },
  // Variants
  primary: {
    backgroundColor: colors.primary[100],
  },
  secondary: {
    backgroundColor: colors.secondary[100],
  },
  success: {
    backgroundColor: colors.success[100],
  },
  warning: {
    backgroundColor: colors.warning[100],
  },
  error: {
    backgroundColor: colors.error[100],
  },
  info: {
    backgroundColor: colors.primary[100],
  },
  gray: {
    backgroundColor: colors.gray[200],
  },
  // Text styles
  text: {
    fontWeight: '600',
  },
  smallText: {
    fontSize: 10,
  },
  mediumText: {
    fontSize: 12,
  },
  largeText: {
    fontSize: 14,
  },
  primaryText: {
    color: colors.primary[700],
  },
  secondaryText: {
    color: colors.secondary[700],
  },
  successText: {
    color: colors.success[700],
  },
  warningText: {
    color: colors.warning[700],
  },
  errorText: {
    color: colors.error[700],
  },
  infoText: {
    color: colors.primary[700],
  },
  grayText: {
    color: colors.gray[700],
  },
});

