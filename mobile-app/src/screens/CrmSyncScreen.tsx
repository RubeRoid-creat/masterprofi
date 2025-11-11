/**
 * CRM Sync Screen
 * Displays sync status and allows manual sync trigger
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
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
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.content}>
        {/* Connection Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Статус подключения</Text>
          <View style={[styles.statusRow, !isOnline && styles.statusRowError]}>
            <View style={[styles.statusIndicator, isOnline ? styles.online : styles.offline]} />
            <Text style={styles.statusText}>
              {isOnline ? 'Подключено' : 'Нет подключения'}
            </Text>
          </View>
        </View>

        {/* Sync Status */}
        {syncStatus && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Статус синхронизации</Text>
            <View style={styles.statusRow}>
              <Text style={styles.label}>Последняя синхронизация:</Text>
              <Text style={styles.value}>
                {syncStatus.lastSyncAt
                  ? new Date(syncStatus.lastSyncAt).toLocaleString('ru-RU')
                  : 'Никогда'}
              </Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.label}>Контактов:</Text>
              <Text style={styles.value}>{syncStatus.totalContacts}</Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.label}>Сделок:</Text>
              <Text style={styles.value}>{syncStatus.totalDeals}</Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.label}>Задач:</Text>
              <Text style={styles.value}>{syncStatus.totalTasks}</Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.label}>Ожидающих отправки:</Text>
              <Text style={styles.value}>{syncStatus.pendingChanges}</Text>
            </View>
            {syncStatus.isSyncing && (
              <View style={styles.syncingIndicator}>
                <ActivityIndicator size="small" color="#007AFF" />
                <Text style={styles.syncingText}>Синхронизация...</Text>
              </View>
            )}
            {syncStatus.lastError && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{syncStatus.lastError}</Text>
              </View>
            )}
          </View>
        )}

        {/* Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Действия</Text>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton, isLoading && styles.buttonDisabled]}
            onPress={handleInitialSync}
            disabled={isLoading || !isOnline}
          >
            {isInitialSyncing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Полная синхронизация</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton, isLoading && styles.buttonDisabled]}
            onPress={handleIncrementalSync}
            disabled={isLoading || !isOnline}
          >
            {isIncrementalSyncing ? (
              <ActivityIndicator color="#007AFF" />
            ) : (
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                Инкрементальная синхронизация
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Data Display */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Синхронизированные данные</Text>
          
          {/* Tabs */}
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'contacts' && styles.tabActive]}
              onPress={() => setActiveTab('contacts')}
            >
              <Text style={[styles.tabText, activeTab === 'contacts' && styles.tabTextActive]}>
                Контакты ({contacts.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'deals' && styles.tabActive]}
              onPress={() => setActiveTab('deals')}
            >
              <Text style={[styles.tabText, activeTab === 'deals' && styles.tabTextActive]}>
                Сделки ({deals.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Contacts List */}
          {activeTab === 'contacts' && (
            <View style={styles.dataContainer}>
              {contacts.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>Нет синхронизированных контактов</Text>
                  <Text style={styles.emptyStateSubtext}>
                    Нажмите "Полная синхронизация" для загрузки данных
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={contacts}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={true}
                  nestedScrollEnabled={true}
                  renderItem={({ item }) => (
                    <View style={styles.contactCard}>
                      <Text style={styles.contactName}>{item.name || 'Без имени'}</Text>
                      {item.email && (
                        <Text style={styles.contactDetail}>📧 {item.email}</Text>
                      )}
                      {item.phone && (
                        <Text style={styles.contactDetail}>📱 {item.phone}</Text>
                      )}
                      <View style={styles.contactFooter}>
                        <Text style={styles.contactStatus}>
                          {item.status === 'active' ? '✅ Активен' : '❌ Неактивен'}
                        </Text>
                        <Text style={styles.contactSync}>
                          {item.isSynced ? '✓ Синхронизирован' : '⏳ Ожидает'}
                        </Text>
                      </View>
                    </View>
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
                  <Text style={styles.emptyStateText}>Нет синхронизированных сделок</Text>
                  <Text style={styles.emptyStateSubtext}>
                    Нажмите "Полная синхронизация" для загрузки данных
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={deals}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={true}
                  nestedScrollEnabled={true}
                  renderItem={({ item }) => (
                    <View style={styles.dealCard}>
                      <Text style={styles.dealTitle}>{item.title || 'Без названия'}</Text>
                      {item.description && (
                        <Text style={styles.dealDescription} numberOfLines={2}>
                          {item.description}
                        </Text>
                      )}
                      <View style={styles.dealFooter}>
                        <Text style={styles.dealAmount}>
                          {item.amount ? `${item.amount} ${item.currency || 'RUB'}` : 'Сумма не указана'}
                        </Text>
                        <Text style={styles.dealStage}>
                          Статус: {item.stage || 'Не указан'}
                        </Text>
                      </View>
                      <Text style={styles.dealSync}>
                        {item.isSynced ? '✓ Синхронизировано' : '⏳ Ожидает синхронизации'}
                      </Text>
                    </View>
                  )}
                />
              )}
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statusRowError: {
    backgroundColor: '#fff5f5',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  online: {
    backgroundColor: '#4CAF50',
  },
  offline: {
    backgroundColor: '#F44336',
  },
  statusText: {
    fontSize: 16,
    color: '#333',
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  syncingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 8,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
  },
  syncingText: {
    marginLeft: 8,
    color: '#1976d2',
    fontSize: 14,
  },
  errorBox: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#ffebee',
    borderRadius: 8,
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    minHeight: 50,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#f0f0f0',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#007AFF',
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  dataContainer: {
    maxHeight: 400,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  contactCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  contactDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  contactFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  contactStatus: {
    fontSize: 12,
    color: '#666',
  },
  contactSync: {
    fontSize: 12,
    color: '#4CAF50',
  },
  dealCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  dealTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  dealDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  dealFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dealAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  dealStage: {
    fontSize: 12,
    color: '#666',
  },
  dealSync: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
});

