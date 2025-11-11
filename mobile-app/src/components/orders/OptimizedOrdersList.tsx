/**
 * Optimized Orders List Component
 * Uses performance optimizations for better rendering
 */

import React, { useMemo, useCallback } from 'react';
import { FlatList, View, Text, RefreshControl, StyleSheet } from 'react-native';
import { Order } from '../../types/order';
import { OrderCard } from './OrderCard';
import { useOptimizedList } from '../../hooks/useOptimizedList';
import { colors, typography, spacing } from '../../theme';

export interface OptimizedOrdersListProps {
  orders: Order[];
  onOrderPress: (order: Order) => void;
  onAcceptOrder: (orderId: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  searchQuery: string;
  activeTab: string;
}

const ESTIMATED_ITEM_HEIGHT = 250; // Approximate height of OrderCard

export const OptimizedOrdersList: React.FC<OptimizedOrdersListProps> = React.memo(({
  orders,
  onOrderPress,
  onAcceptOrder,
  isRefreshing,
  onRefresh,
  searchQuery,
  activeTab,
}) => {
  const { optimizedProps } = useOptimizedList(orders, ESTIMATED_ITEM_HEIGHT, {
    windowSize: 10,
    initialNumToRender: 10,
    maxToRenderPerBatch: 5,
    removeClippedSubviews: true,
  });

  const renderItem = useCallback(
    ({ item }: { item: Order }) => (
      <OrderCard
        orderId={item.id}
        clientName={item.client?.name || 'Клиент'}
        applianceType={item.appliance?.type || 'Техника'}
        address={item.location?.address || 'Адрес не указан'}
        distance={item.location?.distance || 0}
        price={item.price?.amount || 0}
        status={item.status}
        urgency={(item.priority as 'low' | 'medium' | 'high') || 'medium'}
        onPress={() => onOrderPress(item)}
        onAccept={() => onAcceptOrder(item.id)}
        clientRating={item.client?.rating}
        clientAvatar={item.client?.avatar}
        currency={item.price?.currency || 'RUB'}
      />
    ),
    [onOrderPress, onAcceptOrder]
  );

  const keyExtractor = useCallback((item: Order) => item.id, []);

  const emptyComponent = useMemo(
    () => (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Заказы не найдены</Text>
        <Text style={styles.emptyMessage}>
          {searchQuery
            ? 'Попробуйте изменить параметры поиска или фильтры'
            : `Нет доступных заказов со статусом "${activeTab.replace('_', ' ')}"`}
        </Text>
      </View>
    ),
    [searchQuery, activeTab]
  );

  return (
    <FlatList
      data={orders}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      contentContainerStyle={styles.listContent}
      ListEmptyComponent={emptyComponent}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary[600]}
        />
      }
      onEndReachedThreshold={0.5}
      {...optimizedProps}
    />
  );
});

OptimizedOrdersList.displayName = 'OptimizedOrdersList';

const styles = StyleSheet.create({
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing['2xl'],
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['3xl'],
    minHeight: 300,
  },
  emptyTitle: {
    ...typography.heading.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  emptyMessage: {
    ...typography.body.medium,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});

