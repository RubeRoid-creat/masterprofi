/**
 * CRM Sync Screen
 * Displays sync status and allows manual sync trigger
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  FlatList,
} from 'react-native';
import { 
  useGetSyncStatusQuery, 
  useLazyInitialSyncQuery, 
  useLazyIncrementalSyncQuery 
} from '../store/api/crmApi';
import { crmSyncService } from '../services/crmSyncService';
import * as NetInfo from '@react-native-community/netinfo';
import { database } from '../database/database';
import { Q } from '@nozbe/watermelondb';
import CrmContact from '../database/models/CrmContact';
import CrmDeal from '../database/models/CrmDeal';
import { Platform } from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { ModernCard } from '../components/common/ModernCard';
import { StyledButton } from '../components/common/StyledButton';
import { Badge } from '../components/ui/Badge';
import { Alert } from '../components/ui/Alert';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export const CrmSyncScreen: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<'contacts' | 'deals'>('contacts');

  const { data: syncStatus, refetch: refetchStatus } = useGetSyncStatusQuery();
  const [triggerInitialSync, { isLoading: isInitialSyncing }] = useLazyInitialSyncQuery();
  const [triggerIncrementalSync, { isLoading: isIncrementalSyncing }] = useLazyIncrementalSyncQuery();

  // Загружаем данные из локальной БД
  const [contacts, setContacts] = useState<CrmContact[]>([]);
  const [deals, setDeals] = useState<CrmDeal[]>([]);

  // Подписка на изменения в БД
  useEffect(() => {
    if (Platform.OS === 'web' || !database) {
      return;
    }

    const loadData = async () => {
      try {
        const contactsCollection = database.collections.get<CrmContact>('crm_contacts');
        const contactsData = await contactsCollection.query(Q.sortBy('updated_at', Q.desc)).fetch();
        setContacts(contactsData);

        const dealsCollection = database.collections.get<CrmDeal>('crm_deals');
        const dealsData = await dealsCollection.query(Q.sortBy('updated_at', Q.desc)).fetch();
        setDeals(dealsData);
      } catch (error) {
        console.error('Error loading CRM data:', error);
      }
    };

    loadData();

    // Подписываемся на изменения
    const contactsObservable = database.collections.get<CrmContact>('crm_contacts').query(Q.sortBy('updated_at', Q.desc)).observe();
    const dealsObservable = database.collections.get<CrmDeal>('crm_deals').query(Q.sortBy('updated_at', Q.desc)).observe();

    const contactsSubscription = contactsObservable.subscribe((data) => {
      setContacts(data);
      console.log('Contacts updated:', data.length);
    });

    const dealsSubscription = dealsObservable.subscribe((data) => {
      setDeals(data);
      console.log('Deals updated:', data.length);
    });

    return () => {
      contactsSubscription.unsubscribe();
      dealsSubscription.unsubscribe();
    };
  }, [refreshing]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected ?? false);
    });

    return () => unsubscribe();
  }, []);

  const handleInitialSync = async () => {
    setSyncing(true);
    try {
      // Первоначальная синхронизация - загружаем все данные
      await crmSyncService.initialSync();
      await refetchStatus();
      
      // Перезагружаем данные из БД после синхронизации
      await loadDataFromDb();
    } catch (error) {
      console.error('Initial sync failed', error);
    } finally {
      setSyncing(false);
    }
  };

  const handleIncrementalSync = async () => {
    setSyncing(true);
    try {
      // Используем новый метод startSync, который выполняет полный цикл синхронизации
      await crmSyncService.startSync();
      await refetchStatus();
      
      // Перезагружаем данные из БД после синхронизации
      await loadDataFromDb();
    } catch (error) {
      console.error('Incremental sync failed', error);
    } finally {
      setSyncing(false);
    }
  };

  const loadDataFromDb = async () => {
    if (database && Platform.OS !== 'web') {
      try {
        const contactsCollection = database.collections.get<CrmContact>('crm_contacts');
        const contactsData = await contactsCollection.query(Q.sortBy('updated_at', Q.desc)).fetch();
        setContacts(contactsData);
        console.log('Loaded contacts after sync:', contactsData.length);

        const dealsCollection = database.collections.get<CrmDeal>('crm_deals');
        const dealsData = await dealsCollection.query(Q.sortBy('updated_at', Q.desc)).fetch();
        setDeals(dealsData);
        console.log('Loaded deals after sync:', dealsData.length);
      } catch (error) {
        console.error('Error loading data from DB:', error);
      }
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetchStatus();
    await loadDataFromDb();
    setRefreshing(false);
  };

  const isLoading = syncing || isInitialSyncing || isIncrementalSyncing;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={handleRefresh}
          tintColor={colors.primary[600]}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Connection Status */}
      <ModernCard variant="elevated" padding="medium" style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Статус подключения</Text>
          <Badge
            label={isOnline ? 'Онлайн' : 'Офлайн'}
            variant={isOnline ? 'success' : 'error'}
            size="small"
          />
        </View>
        <View style={[styles.statusRow, !isOnline && styles.statusRowError]}>
          <View style={[styles.statusIndicator, isOnline ? styles.online : styles.offline]} />
          <Text style={styles.statusText}>
            {isOnline ? 'Подключено к интернету' : 'Нет подключения к интернету'}
          </Text>
        </View>
        {!isOnline && (
          <Alert
            variant="warning"
            message="Для синхронизации необходимо подключение к интернету"
            style={styles.alert}
          />
        )}
      </ModernCard>

      {/* Sync Status */}
      {syncStatus && (
        <ModernCard variant="flat" padding="medium" style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Статус синхронизации</Text>
            {syncStatus.isSyncing && (
              <LoadingSpinner size="small" color={colors.primary[600]} />
            )}
          </View>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Контактов</Text>
              <Text style={styles.statValue}>{syncStatus.totalContacts}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Сделок</Text>
              <Text style={styles.statValue}>{syncStatus.totalDeals}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Задач</Text>
              <Text style={styles.statValue}>{syncStatus.totalTasks}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Ожидает</Text>
              <Badge
                label={syncStatus.pendingChanges}
                variant={syncStatus.pendingChanges > 0 ? 'warning' : 'success'}
                size="small"
              />
            </View>
          </View>

          <View style={styles.lastSyncRow}>
            <Text style={styles.lastSyncLabel}>Последняя синхронизация:</Text>
            <Text style={styles.lastSyncValue}>
              {syncStatus.lastSyncAt
                ? new Date(syncStatus.lastSyncAt).toLocaleString('ru-RU')
                : 'Никогда'}
            </Text>
          </View>

          {syncStatus.lastError && (
            <Alert
              variant="error"
              message={syncStatus.lastError}
              style={styles.alert}
            />
          )}
        </ModernCard>
      )}

      {/* Actions */}
      <ModernCard variant="elevated" padding="medium" style={styles.section}>
        <Text style={styles.sectionTitle}>Действия синхронизации</Text>
        <View style={styles.actionsContainer}>
          <StyledButton
            title="Полная синхронизация"
            onPress={handleInitialSync}
            variant="primary"
            size="large"
            loading={isInitialSyncing}
            disabled={isLoading || !isOnline}
            fullWidth={true}
          />
          <StyledButton
            title="Инкрементальная синхронизация"
            onPress={handleIncrementalSync}
            variant="outline"
            size="large"
            loading={isIncrementalSyncing}
            disabled={isLoading || !isOnline}
            fullWidth={true}
          />
        </View>
        {!isOnline && (
          <Text style={styles.disabledHint}>
            Синхронизация недоступна без подключения к интернету
          </Text>
        )}
      </ModernCard>

      {/* Data Display */}
      <ModernCard variant="flat" padding="medium" style={styles.section}>
        <Text style={styles.sectionTitle}>Синхронизированные данные</Text>
        
        {/* Tabs */}
        <View style={styles.tabs}>
          <StyledButton
            title={`Контакты (${contacts.length})`}
            onPress={() => setActiveTab('contacts')}
            variant={activeTab === 'contacts' ? 'primary' : 'ghost'}
            size="medium"
            fullWidth={false}
            style={[styles.tabButton, activeTab === 'contacts' && styles.tabButtonActive]}
          />
          <StyledButton
            title={`Сделки (${deals.length})`}
            onPress={() => setActiveTab('deals')}
            variant={activeTab === 'deals' ? 'primary' : 'ghost'}
            size="medium"
            fullWidth={false}
            style={[styles.tabButton, activeTab === 'deals' && styles.tabButtonActive]}
          />
        </View>

        {/* Contacts List */}
        {activeTab === 'contacts' && (
          <View style={styles.dataContainer}>
            {contacts.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>📇</Text>
                <Text style={styles.emptyStateText}>Нет синхронизированных контактов</Text>
                <Text style={styles.emptyStateSubtext}>
                  Нажмите "Полная синхронизация" для загрузки данных
                </Text>
              </View>
            ) : (
              <FlatList
                data={contacts}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                nestedScrollEnabled={true}
                renderItem={({ item }) => (
                  <ModernCard variant="flat" padding="medium" style={styles.contactCard}>
                    <View style={styles.contactHeader}>
                      <Text style={styles.contactName}>{item.name || 'Без имени'}</Text>
                      <Badge
                        label={item.status === 'active' ? 'Активен' : 'Неактивен'}
                        variant={item.status === 'active' ? 'success' : 'gray'}
                        size="small"
                      />
                    </View>
                    {item.email && (
                      <View style={styles.contactDetailRow}>
                        <Text style={styles.contactDetailIcon}>📧</Text>
                        <Text style={styles.contactDetail}>{item.email}</Text>
                      </View>
                    )}
                    {item.phone && (
                      <View style={styles.contactDetailRow}>
                        <Text style={styles.contactDetailIcon}>📱</Text>
                        <Text style={styles.contactDetail}>{item.phone}</Text>
                      </View>
                    )}
                    <View style={styles.contactFooter}>
                      <Badge
                        label={item.isSynced ? 'Синхронизирован' : 'Ожидает'}
                        variant={item.isSynced ? 'success' : 'warning'}
                        size="small"
                      />
                    </View>
                  </ModernCard>
                )}
              />
            )}
          </View>
        )}

        {/* Deals List */}
        {activeTab === 'deals' && (
          <View style={styles.dataContainer}>
            {deals.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>💼</Text>
                <Text style={styles.emptyStateText}>Нет синхронизированных сделок</Text>
                <Text style={styles.emptyStateSubtext}>
                  Нажмите "Полная синхронизация" для загрузки данных
                </Text>
              </View>
            ) : (
              <FlatList
                data={deals}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                nestedScrollEnabled={true}
                renderItem={({ item }) => (
                  <ModernCard variant="flat" padding="medium" style={styles.dealCard}>
                    <View style={styles.dealHeader}>
                      <Text style={styles.dealTitle}>{item.title || 'Без названия'}</Text>
                      {item.stage && (
                        <Badge
                          label={item.stage}
                          variant="info"
                          size="small"
                        />
                      )}
                    </View>
                    {item.description && (
                      <Text style={styles.dealDescription} numberOfLines={2}>
                        {item.description}
                      </Text>
                    )}
                    <View style={styles.dealFooter}>
                      <View style={styles.dealAmountContainer}>
                        <Text style={styles.dealAmountLabel}>Сумма:</Text>
                        <Text style={styles.dealAmount}>
                          {item.amount ? `${item.amount} ${item.currency || 'RUB'}` : 'Не указана'}
                        </Text>
                      </View>
                      <Badge
                        label={item.isSynced ? 'Синхронизировано' : 'Ожидает'}
                        variant={item.isSynced ? 'success' : 'warning'}
                        size="small"
                      />
                    </View>
                  </ModernCard>
                )}
              />
            )}
          </View>
        )}
      </ModernCard>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing['2xl'],
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.heading.h3,
    color: colors.text.primary,
    fontWeight: '700',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  statusRowError: {
    backgroundColor: colors.error[50],
    borderRadius: borderRadius.md,
    padding: spacing.sm,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.sm,
  },
  online: {
    backgroundColor: colors.success[600],
  },
  offline: {
    backgroundColor: colors.error[600],
  },
  statusText: {
    ...typography.body.medium,
    color: colors.text.primary,
  },
  alert: {
    marginTop: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.gray[50],
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  statLabel: {
    ...typography.body.small,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  statValue: {
    ...typography.heading.h3,
    color: colors.text.primary,
    fontWeight: '700',
  },
  lastSyncRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  lastSyncLabel: {
    ...typography.body.small,
    color: colors.text.secondary,
  },
  lastSyncValue: {
    ...typography.body.medium,
    color: colors.text.primary,
    fontWeight: '600',
  },
  actionsContainer: {
    gap: spacing.md,
  },
  disabledHint: {
    ...typography.body.small,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  tabs: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  tabButton: {
    flex: 1,
  },
  tabButtonActive: {
    // Active state handled by variant
  },
  dataContainer: {
    maxHeight: 500,
  },
  emptyState: {
    padding: spacing['3xl'],
    alignItems: 'center',
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyStateText: {
    ...typography.heading.h4,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    ...typography.body.medium,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  contactCard: {
    marginBottom: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary[600],
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  contactName: {
    ...typography.heading.h4,
    color: colors.text.primary,
    fontWeight: '700',
    flex: 1,
  },
  contactDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  contactDetailIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  contactDetail: {
    ...typography.body.medium,
    color: colors.text.secondary,
  },
  contactFooter: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  dealCard: {
    marginBottom: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.success[600],
  },
  dealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  dealTitle: {
    ...typography.heading.h4,
    color: colors.text.primary,
    fontWeight: '700',
    flex: 1,
  },
  dealDescription: {
    ...typography.body.medium,
    color: colors.text.secondary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  dealFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  dealAmountContainer: {
    flex: 1,
  },
  dealAmountLabel: {
    ...typography.body.small,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
  },
  dealAmount: {
    ...typography.heading.h4,
    color: colors.success[700],
    fontWeight: '700',
  },
});

