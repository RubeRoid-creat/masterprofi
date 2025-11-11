import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { StyledInput } from '../components/common/StyledInput';
import { StyledButton } from '../components/common/StyledButton';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  setActiveTab,
  setOrders,
  setSearchQuery,
  setFilters,
  toggleMapView,
  setRefreshing,
  markOrderAsRead,
} from '../store/slices/ordersSlice';
import { useGetOrdersQuery } from '../store/api/ordersApi';
import { useWebSocket } from '../hooks/useWebSocket';
import { useOfflineCache } from '../hooks/useOfflineCache';
import { useDebounce, useOptimizedList, useMemoizedCallback } from '../hooks';
import { Order, OrderStatus } from '../types/order';
import { config } from '../config/environments';
import { OrderCard } from '../components/orders/OrderCard';
import { OrderTabs } from '../components/orders/OrderTabs';
import { OrderMapView } from '../components/lazy';
import { OrderFiltersComponent } from '../components/orders/OrderFilters';
import { OptimizedOrdersList } from '../components/orders/OptimizedOrdersList';
import { OrderBottomSheet } from '../components/orders/OrderBottomSheet';
import { useAcceptOrderMutation } from '../store/api/ordersApi';

interface OrderFeedScreenProps {
  onOrderPress?: (order: Order) => void;
}

export const OrderFeedScreen: React.FC<OrderFeedScreenProps> = ({ onOrderPress }) => {
  const dispatch = useAppDispatch();
  const {
    activeTab,
    filteredOrders,
    searchQuery,
    filters,
    showMap,
    isRefreshing,
    newOrdersCount,
  } = useAppSelector((state) => state.orders);

  const [searchText, setSearchText] = useState(searchQuery);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const debouncedSearchText = useDebounce(searchText, 300);
  const { isOffline, cachedOrders, saveOrders } = useOfflineCache();

  // Auto-open bottom sheet when map view is enabled
  useEffect(() => {
    if (showMap && filteredOrders.length > 0) {
      setBottomSheetVisible(true);
      setSelectedOrder(null); // Show list initially
    } else if (!showMap) {
      setBottomSheetVisible(false);
      setSelectedOrder(null);
    }
  }, [showMap, filteredOrders.length]);

  // RTK Query
  const {
    data: ordersData,
    isLoading,
    error,
    refetch,
  } = useGetOrdersQuery(
    { status: activeTab },
    {
      pollingInterval: 15 * 60 * 1000, // Background sync every 15 minutes
      skip: false,
    }
  );

  const [acceptOrder, { isLoading: isAccepting }] = useAcceptOrderMutation();
  const hasLoadedCacheRef = useRef(false);

  // WebSocket connection - temporarily disabled until Socket.IO client is implemented
  // Backend uses Socket.IO, not native WebSocket
  const wsConnected = false; // Disable until Socket.IO client is added
  // const { connected: wsConnected } = useWebSocket({
  //   url: `${config.wsUrl}/api/orders/stream`,
  //   enabled: !isOffline,
  //   onConnect: () => {
  //     console.log('WebSocket connected for real-time updates');
  //   },
  //   onDisconnect: () => {
  //     console.log('WebSocket disconnected');
  //   },
  //   onError: (error) => {
  //     console.error('WebSocket error:', error);
  //   },
  // });

  // Sync orders from API
  useEffect(() => {
    if (ordersData) {
      // ordersData is GetOrdersResponse, extract orders array
      const orders = ordersData.orders || [];
      dispatch(setOrders(orders));
      // Only save if we have orders and we're not offline
      if (orders.length > 0 && !isOffline) {
        saveOrders(orders);
      }
    }
  }, [ordersData, dispatch, saveOrders, isOffline]);

  // Use cached orders when offline - only once when going offline
  useEffect(() => {
    if (isOffline && cachedOrders.length > 0 && !ordersData && !hasLoadedCacheRef.current) {
      // Only use cache if we don't have fresh data and haven't loaded cache yet
      dispatch(setOrders(cachedOrders));
      hasLoadedCacheRef.current = true;
    }
    // Reset when coming back online
    if (!isOffline) {
      hasLoadedCacheRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOffline, ordersData]); // Only react to isOffline and ordersData changes

  // Load demo orders if API is unavailable
  useEffect(() => {
    const isApiError = error && ((error as any)?.status === 'FETCH_ERROR' || (error as any)?.status === 'PARSING_ERROR');
    
    if (isApiError && !cachedOrders.length && !ordersData) {
      console.log('API unavailable, loading demo orders for development');
      const demoOrders: Order[] = [
        {
          id: 'demo-order-1',
          client: {
            id: 'client-1',
            name: 'Иван Петров',
            phone: '+79991234567',
            rating: 4.8,
            avatar: undefined,
          },
          appliance: {
            type: 'washing_machine',
            brand: 'LG',
            model: 'F-1296ND3',
            age: 3,
          },
          location: {
            address: 'ул. Ленина, д. 10, кв. 5',
            coordinates: {
              latitude: 55.7558,
              longitude: 37.6173,
            },
            distance: 2.5,
          },
          price: {
            amount: 2500,
            currency: 'RUB',
          },
          status: 'new' as OrderStatus,
          urgency: 'normal',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isNew: true,
          description: 'Не включается стиральная машина',
        },
        {
          id: 'demo-order-2',
          client: {
            id: 'client-2',
            name: 'Мария Сидорова',
            phone: '+79997654321',
            rating: 4.9,
            avatar: undefined,
          },
          appliance: {
            type: 'refrigerator',
            brand: 'Samsung',
            model: 'RB-29J',
            age: 5,
          },
          location: {
            address: 'пр. Мира, д. 15, кв. 12',
            coordinates: {
              latitude: 55.7558,
              longitude: 37.6173,
            },
            distance: 4.2,
          },
          price: {
            amount: 3500,
            currency: 'RUB',
          },
          status: 'new' as OrderStatus,
          urgency: 'high',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          updatedAt: new Date(Date.now() - 3600000).toISOString(),
          isNew: true,
          description: 'Не работает холодильник, не морозит',
          },
      ];
      dispatch(setOrders(demoOrders));
      saveOrders(demoOrders);
    }
  }, [error, cachedOrders.length, ordersData, dispatch, saveOrders]);

  // Handle search with debounce
  useEffect(() => {
    dispatch(setSearchQuery(debouncedSearchText));
  }, [debouncedSearchText, dispatch]);

  const handleRefresh = useMemoizedCallback(async () => {
    dispatch(setRefreshing(true));
    try {
      await refetch();
    } catch (error) {
      console.error('Error refreshing orders:', error);
      if (isOffline) {
        Alert.alert('Offline', 'Using cached orders. Connect to internet for latest updates.');
      }
    } finally {
      dispatch(setRefreshing(false));
    }
  }, [refetch, dispatch, isOffline]);

  const handleTabChange = useMemoizedCallback((tab: OrderStatus) => {
    dispatch(setActiveTab(tab));
  }, [dispatch]);

  const handleOrderPress = useMemoizedCallback((order: Order) => {
    if (order.isNew) {
      dispatch(markOrderAsRead(order.id));
    }
    
    // If map view, show bottom sheet
    if (showMap) {
      setSelectedOrder(order);
      setBottomSheetVisible(true);
    } else if (onOrderPress) {
      onOrderPress(order);
    } else {
      // Default navigation or detail view
      console.log('Order pressed:', order.id);
    }
  }, [dispatch, onOrderPress, showMap]);
  
  const handleOrderSelect = useMemoizedCallback((order: Order) => {
    setSelectedOrder(order);
  }, []);
  
  const handleBottomSheetClose = useMemoizedCallback(() => {
    setBottomSheetVisible(false);
    setSelectedOrder(null);
  }, []);
  
  const handleViewDetails = useMemoizedCallback((order: Order) => {
    if (onOrderPress) {
      onOrderPress(order);
    }
  }, [onOrderPress]);

  const handleAcceptOrder = useMemoizedCallback(async (orderId: string) => {
    try {
      await acceptOrder(orderId).unwrap();
      Alert.alert('Success', 'Order accepted successfully');
    } catch (error: any) {
      Alert.alert('Error', error?.data?.message || 'Failed to accept order');
    }
  }, [acceptOrder]);

  const handleFilterApply = useMemoizedCallback((newFilters: typeof filters) => {
    dispatch(setFilters(newFilters));
  }, [dispatch]);

  const handleFilterReset = useMemoizedCallback(() => {
    dispatch(setFilters({}));
  }, [dispatch]);

  if (isLoading && !cachedOrders.length) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
        <Text style={styles.loadingText}>Загрузка заказов...</Text>
      </View>
    );
  }

  if (error && !cachedOrders.length && !filteredOrders.length) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Не удалось загрузить заказы</Text>
        <Text style={styles.errorMessage}>
          {isOffline
            ? 'Вы находитесь в офлайн режиме. Пожалуйста, подключитесь к интернету.'
            : 'Пожалуйста, попробуйте еще раз позже.'}
        </Text>
        <StyledButton
          title="Повторить попытку"
          onPress={handleRefresh}
          variant="primary"
          size="large"
          style={{ marginTop: spacing.xl }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Search and Filters */}
      <View style={styles.header}>
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Поиск заказов..."
              placeholderTextColor={colors.text.tertiary}
              value={searchText}
              onChangeText={setSearchText}
              autoCapitalize="none"
            />
          </View>
          <OrderFiltersComponent
            filters={filters}
            onApply={handleFilterApply}
            onReset={handleFilterReset}
          />
          <TouchableOpacity
            onPress={() => dispatch(toggleMapView())}
            style={[
              styles.mapToggleButton,
              showMap && styles.mapToggleButtonActive,
            ]}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.mapToggleText,
              showMap && styles.mapToggleTextActive,
            ]}>
              {showMap ? 'Список' : 'Карта'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Status Indicators */}
        <View style={styles.statusRow}>
          <View style={styles.statusIndicators}>
            {isOffline && (
              <View style={styles.statusIndicator}>
                <View style={[styles.statusDot, styles.statusDotOffline]} />
                <Text style={styles.statusText}>Офлайн</Text>
              </View>
            )}
            {wsConnected && (
              <View style={styles.statusIndicator}>
                <View style={[styles.statusDot, styles.statusDotLive]} />
                <Text style={styles.statusText}>Онлайн</Text>
              </View>
            )}
          </View>
          {filteredOrders.length > 0 && (
            <Text style={styles.ordersCount}>
              {filteredOrders.length} {filteredOrders.length === 1 ? 'заказ' : 'заказов'}
            </Text>
          )}
        </View>
      </View>

      {/* Tabs */}
      <OrderTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
        newOrdersCount={newOrdersCount}
      />

      {/* Content - Map or List */}
      {showMap ? (
        <>
          <OrderMapView
            orders={filteredOrders}
            onOrderPress={handleOrderPress}
            selectedOrder={selectedOrder}
            onShowBottomSheet={() => setBottomSheetVisible(true)}
          />
          <OrderBottomSheet
            visible={bottomSheetVisible}
            orders={filteredOrders}
            selectedOrder={selectedOrder}
            onClose={handleBottomSheetClose}
            onOrderSelect={handleOrderSelect}
            onAcceptOrder={handleAcceptOrder}
            onViewDetails={handleViewDetails}
          />
        </>
      ) : (
        <OptimizedOrdersList
          orders={filteredOrders}
          onOrderPress={handleOrderPress}
          onAcceptOrder={handleAcceptOrder}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          searchQuery={searchQuery}
          activeTab={activeTab}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.primary,
  },
  loadingText: {
    ...typography.body.medium,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.secondary,
    padding: spacing['2xl'],
  },
  errorTitle: {
    ...typography.heading.h2,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  errorMessage: {
    ...typography.body.medium,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  header: {
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
    color: colors.text.tertiary,
  },
  searchInput: {
    flex: 1,
    ...typography.body.medium,
    color: colors.text.primary,
  },
  mapToggleButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.gray[100],
  },
  mapToggleButtonActive: {
    backgroundColor: colors.primary[600],
  },
  mapToggleText: {
    ...typography.label.medium,
    color: colors.text.secondary,
  },
  mapToggleTextActive: {
    color: colors.text.inverse,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusIndicators: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  statusDotOffline: {
    backgroundColor: colors.warning[500],
  },
  statusDotLive: {
    backgroundColor: colors.success[500],
  },
  statusText: {
    ...typography.body.xsmall,
    color: colors.text.secondary,
  },
  ordersCount: {
    ...typography.body.small,
    color: colors.text.secondary,
  },
  listContent: {
    padding: spacing.lg,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['6xl'],
  },
  emptyTitle: {
    ...typography.heading.h3,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  emptyMessage: {
    ...typography.body.medium,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});

