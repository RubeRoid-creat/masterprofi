import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MessageStatus as MessageStatusType } from '../../types/chat';
import { colors, typography } from '../../theme';

interface MessageStatusProps {
  status: MessageStatusType;
  showLabel?: boolean;
}

const STATUS_CONFIG: Record<MessageStatusType, { icon: string; label: string; color: string }> = {
  sending: { icon: '⏳', label: 'Отправка', color: colors.text.disabled },
  sent: { icon: '✓', label: 'Отправлено', color: colors.text.tertiary },
  delivered: { icon: '✓✓', label: 'Доставлено', color: colors.primary[600] },
  read: { icon: '✓✓✓', label: 'Прочитано', color: colors.primary[600] },
  failed: { icon: '✗', label: 'Ошибка', color: colors.error[600] },
};

export const MessageStatus: React.FC<MessageStatusProps> = ({
  status,
  showLabel = false,
}) => {
  const config = STATUS_CONFIG[status];

  return (
    <View style={styles.container}>
      <Text style={[styles.icon, { color: config.color }]}>{config.icon}</Text>
      {showLabel && (
        <Text style={[styles.label, { color: config.color }]}>{config.label}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  icon: {
    ...typography.body.xsmall,
  },
  label: {
    ...typography.body.xsmall,
  },
});
