import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { TypingIndicator as TypingIndicatorType } from '../../types/chat';
import { colors, typography, spacing } from '../../theme';

interface TypingIndicatorProps {
  typingUsers: TypingIndicatorType[];
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ typingUsers }) => {
  if (typingUsers.length === 0) return null;

  const userNames = typingUsers.map((u) => u.userName).join(', ');

  return (
    <View style={styles.container}>
      <View style={styles.dotsContainer}>
        <View style={[styles.dot, styles.dot1]} />
        <View style={[styles.dot, styles.dot2]} />
        <View style={[styles.dot, styles.dot3]} />
      </View>
      <Text style={styles.text}>
        {userNames} {typingUsers.length === 1 ? 'печатает' : 'печатают'}...
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginRight: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    backgroundColor: colors.text.tertiary,
    borderRadius: 4,
  },
  dot1: {
    opacity: 0.4,
  },
  dot2: {
    opacity: 0.6,
  },
  dot3: {
    opacity: 0.8,
  },
  text: {
    ...typography.body.small,
    color: colors.text.tertiary,
    fontStyle: 'italic',
  },
});
