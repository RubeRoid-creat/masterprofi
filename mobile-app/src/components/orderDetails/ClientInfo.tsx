import React from 'react';
import { View, Text, TouchableOpacity, Image, Linking, StyleSheet } from 'react-native';
import { Order } from '../../types/order';
import { getFirstChar } from '../../utils/stringHelpers';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { StyledButton } from '../common/StyledButton';

interface ClientInfoProps {
  client: Order['client'];
  onCall?: () => void;
  onMessage?: () => void;
}

export const ClientInfo: React.FC<ClientInfoProps> = ({
  client,
  onCall,
  onMessage,
}) => {
  const handleCall = () => {
    if (onCall) {
      onCall();
    } else {
      Linking.openURL(`tel:${client.phone}`);
    }
  };

  const handleMessage = () => {
    if (onMessage) {
      onMessage();
    } else {
      Linking.openURL(`sms:${client.phone}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Информация о клиенте</Text>
      
      <View style={styles.clientRow}>
        {client.avatar ? (
          <Image
            source={{ uri: client.avatar }}
            style={styles.avatar}
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {getFirstChar(client.name)}
            </Text>
          </View>
        )}
        
        <View style={styles.clientInfo}>
          <Text style={styles.clientName}>{client.name}</Text>
          <Text style={styles.clientPhone}>{client.phone}</Text>
        </View>
      </View>

      {/* Contact Actions */}
      <View style={styles.actionsRow}>
        <StyledButton
          title="📞 Позвонить"
          onPress={handleCall}
          variant="primary"
          size="medium"
          style={styles.actionButton}
        />
        <StyledButton
          title="💬 Сообщение"
          onPress={handleMessage}
          variant="outline"
          size="medium"
          style={[styles.actionButton, styles.actionButtonSecondary]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.heading.h3,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  clientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    marginRight: spacing.md,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    ...typography.heading.h3,
    color: colors.primary[600],
    fontWeight: '600',
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    ...typography.heading.h3,
    color: colors.text.primary,
    fontWeight: '600',
  },
  clientPhone: {
    ...typography.body.small,
    color: colors.text.secondary,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  actionButtonSecondary: {
    backgroundColor: colors.success[600],
  },
});
