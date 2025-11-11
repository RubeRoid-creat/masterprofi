import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { QuickReply } from '../../types/chat';
import { colors, typography, spacing, borderRadius } from '../../theme';

interface QuickRepliesProps {
  replies: QuickReply[];
  onSelect: (reply: QuickReply) => void;
  visible?: boolean;
}

const DEFAULT_REPLIES: QuickReply[] = [
  { id: '1', text: 'В пути!', category: 'common' },
  { id: '2', text: 'Буду через 10 минут', category: 'common' },
  { id: '3', text: 'Спасибо!', category: 'common' },
  { id: '4', text: 'Понял', category: 'common' },
  { id: '5', text: 'Можете отправить адрес?', category: 'common' },
  { id: '6', text: 'Перезвоню в ближайшее время', category: 'common' },
];

export const QuickRepliesComponent: React.FC<QuickRepliesProps> = ({
  replies = DEFAULT_REPLIES,
  onSelect,
  visible = true,
}) => {
  if (!visible) return null;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {replies.map((reply) => (
          <TouchableOpacity
            key={reply.id}
            onPress={() => onSelect(reply)}
            style={styles.replyButton}
          >
            <Text style={styles.replyText}>{reply.text}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.gray[50],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingVertical: spacing.xs,
  },
  scrollContent: {
    paddingHorizontal: spacing.sm,
    gap: spacing.xs,
  },
  replyButton: {
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  replyText: {
    ...typography.body.small,
    color: colors.text.secondary,
  },
});
