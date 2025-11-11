/**
 * Sync Status Indicator Component
 * Shows current synchronization status and progress
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { Badge } from '../ui/Badge';
import { databaseSyncService } from '../../services/databaseSyncService';
import * as NetInfo from '@react-native-community/netinfo';

export interface SyncStatusIndicatorProps {
  compact?: boolean;
  showDetails?: boolean;
}

type SyncStatus = 'synced' | 'syncing' | 'pending' | 'error' | 'offline';

export const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({
  compact = false,
  showDetails = false,
}) => {
  const [status, setStatus] = useState<SyncStatus>('synced');
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  useEffect(() => {
    // Check network status
    const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected ?? false);
      if (!state.isConnected) {
        setStatus('offline');
      }
    });

    // Check initial network status
    NetInfo.fetch().then((state) => {
      setIsOnline(state.isConnected ?? false);
    });

    // Listen to sync service events (if available)
    // This would require adding event emitters to databaseSyncService

    return () => {
      unsubscribeNetInfo();
    };
  }, []);

  const handleSyncPress = async () => {
    if (!isOnline) return;
    
    setStatus('syncing');
    try {
      await databaseSyncService.syncAll({ force: true });
      setStatus('synced');
      setLastSyncTime(new Date());
    } catch (error) {
      setStatus('error');
      console.error('Sync error:', error);
    }
  };

  const getStatusColor = (): string => {
    switch (status) {
      case 'synced':
        return colors.success[600];
      case 'syncing':
        return colors.primary[600];
      case 'pending':
        return colors.warning[600];
      case 'error':
        return colors.error[600];
      case 'offline':
        return colors.gray[500];
      default:
        return colors.gray[500];
    }
  };

  const getStatusLabel = (): string => {
    switch (status) {
      case 'synced':
        return 'Синхронизировано';
      case 'syncing':
        return 'Синхронизация...';
      case 'pending':
        return `Ожидает (${pendingCount})`;
      case 'error':
        return 'Ошибка синхронизации';
      case 'offline':
        return 'Офлайн';
      default:
        return 'Неизвестно';
    }
  };

  if (compact) {
    return (
      <TouchableOpacity
        onPress={handleSyncPress}
        disabled={!isOnline || status === 'syncing'}
        style={styles.compactContainer}
      >
        {status === 'syncing' ? (
          <ActivityIndicator size="small" color={getStatusColor()} />
        ) : (
          <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
        )}
        {showDetails && (
          <Text style={styles.compactText}>{getStatusLabel()}</Text>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={handleSyncPress}
      disabled={!isOnline || status === 'syncing'}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.statusRow}>
          {status === 'syncing' ? (
            <ActivityIndicator size="small" color={getStatusColor()} />
          ) : (
            <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
          )}
          <Text style={styles.statusText}>{getStatusLabel()}</Text>
          {pendingCount > 0 && (
            <Badge label={pendingCount} variant="warning" size="small" />
          )}
        </View>
        {showDetails && lastSyncTime && (
          <Text style={styles.timeText}>
            Последняя синхронизация: {lastSyncTime.toLocaleTimeString('ru-RU')}
          </Text>
        )}
        {!isOnline && (
          <Text style={styles.offlineText}>
            Нет подключения к интернету
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.xs,
  },
  content: {
    flex: 1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    ...typography.body.medium,
    color: colors.text.primary,
    flex: 1,
  },
  compactText: {
    ...typography.body.small,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  timeText: {
    ...typography.body.small,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  offlineText: {
    ...typography.body.small,
    color: colors.error[600],
    marginTop: spacing.xs,
  },
});

