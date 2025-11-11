/**
 * Notification Group Component
 * Groups notifications by category and time
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { ModernCard } from '../common/ModernCard';
import { Badge } from '../ui/Badge';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: 'new_order' | 'message' | 'payment' | 'reminder' | 'system' | 'mlm';
  timestamp: Date;
  read: boolean;
  data?: Record<string, any>;
}

export interface NotificationGroupProps {
  notifications: NotificationItem[];
  onNotificationPress?: (notification: NotificationItem) => void;
  onMarkAsRead?: (notificationId: string) => void;
  maxItems?: number;
}

export const NotificationGroup: React.FC<NotificationGroupProps> = ({
  notifications,
  onNotificationPress,
  onMarkAsRead,
  maxItems = 5,
}) => {
  const unreadCount = notifications.filter((n) => !n.read).length;
  const displayNotifications = notifications.slice(0, maxItems);

  const getCategoryColor = (category: NotificationItem['category']): string => {
    switch (category) {
      case 'new_order':
        return colors.primary[600];
      case 'message':
        return colors.secondary[600];
      case 'payment':
        return colors.success[600];
      case 'reminder':
        return colors.warning[600];
      case 'mlm':
        return colors.secondary[600];
      default:
        return colors.gray[600];
    }
  };

  const formatTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Только что';
    if (minutes < 60) return `${minutes} мин назад`;
    if (hours < 24) return `${hours} ч назад`;
    if (days < 7) return `${days} дн назад`;
    return date.toLocaleDateString('ru-RU');
  };

  const handleNotificationPress = (notification: NotificationItem) => {
    if (!notification.read && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
    if (onNotificationPress) {
      onNotificationPress(notification);
    }
  };

  const renderNotification = ({ item }: { item: NotificationItem }) => (
    <TouchableOpacity
      onPress={() => handleNotificationPress(item)}
      style={[
        styles.notificationItem,
        !item.read && styles.unreadNotification,
      ]}
    >
      <View style={styles.notificationContent}>
        <View style={[styles.categoryDot, { backgroundColor: getCategoryColor(item.category) }]} />
        <View style={styles.textContainer}>
          <Text style={[styles.title, !item.read && styles.unreadTitle]}>
            {item.title}
          </Text>
          <Text style={styles.message} numberOfLines={2}>
            {item.message}
          </Text>
          <Text style={styles.time}>{formatTime(item.timestamp)}</Text>
        </View>
        {!item.read && (
          <View style={styles.unreadDot} />
        )}
      </View>
    </TouchableOpacity>
  );

  if (notifications.length === 0) {
    return (
      <ModernCard variant="flat" padding="medium">
        <Text style={styles.emptyText}>Нет уведомлений</Text>
      </ModernCard>
    );
  }

  return (
    <ModernCard variant="elevated" padding="none" style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Уведомления</Text>
        {unreadCount > 0 && (
          <Badge label={unreadCount} variant="error" size="small" />
        )}
      </View>
      <FlatList
        data={displayNotifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        scrollEnabled={false}
      />
      {notifications.length > maxItems && (
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Еще {notifications.length - maxItems} уведомлений
          </Text>
        </View>
      )}
    </ModernCard>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerTitle: {
    ...typography.heading.small,
    fontWeight: '700',
    color: colors.text.primary,
  },
  notificationItem: {
    padding: spacing.md,
  },
  unreadNotification: {
    backgroundColor: colors.primary[50],
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...typography.body.medium,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  unreadTitle: {
    fontWeight: '700',
  },
  message: {
    ...typography.body.small,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  time: {
    ...typography.body.xsmall,
    color: colors.text.tertiary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary[600],
    marginTop: 6,
    marginLeft: spacing.sm,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border.light,
    marginLeft: spacing.md,
  },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    alignItems: 'center',
  },
  footerText: {
    ...typography.body.small,
    color: colors.primary[600],
    fontWeight: '600',
  },
  emptyText: {
    ...typography.body.medium,
    color: colors.text.tertiary,
    textAlign: 'center',
    padding: spacing.lg,
  },
});

