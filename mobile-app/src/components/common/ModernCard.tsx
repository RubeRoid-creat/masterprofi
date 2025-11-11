/**
 * Modern Card Component
 * Combines best practices from multiple design systems
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity, Pressable } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../../theme';
import { modernDesign } from '../../theme/modernDesign';

interface ModernCardProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'flat' | 'glass';
  onPress?: () => void;
  style?: ViewStyle;
  padding?: 'none' | 'small' | 'medium' | 'large';
  showShadow?: boolean;
}

export const ModernCard: React.FC<ModernCardProps> = ({
  children,
  variant = 'elevated',
  onPress,
  style,
  padding = 'medium',
  showShadow = true,
}) => {
  const cardStyle = [
    styles.base,
    variant === 'elevated' && styles.elevated,
    variant === 'flat' && styles.flat,
    variant === 'glass' && styles.glass,
    padding !== 'none' && styles[`padding${padding.charAt(0).toUpperCase() + padding.slice(1)}`],
    !showShadow && styles.noShadow,
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          cardStyle,
          pressed && styles.pressed,
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.background.primary,
  },
  elevated: {
    ...modernDesign.cardElevated,
  },
  flat: {
    ...modernDesign.cardFlat,
  },
  glass: {
    ...modernDesign.glass,
    borderRadius: borderRadius['2xl'],
  },
  paddingNone: {
    padding: 0,
  },
  paddingSmall: {
    padding: spacing.md,
  },
  paddingMedium: {
    padding: spacing.lg,
  },
  paddingLarge: {
    padding: spacing['2xl'],
  },
  noShadow: {
    shadowOpacity: 0,
    elevation: 0,
  },
  pressed: {
    transform: [{ scale: modernDesign.interactions.pressScale }],
    opacity: modernDesign.interactions.pressOpacity,
  },
});








