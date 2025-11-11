import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Order, OrderStatus, OrderFilters } from '../../types/order';
import { ChatMessage } from '../../types/orderDetails';

// Types
export interface OfflineAction {
  id: string;
  type: 'accept' | 'decline' | 'updateStatus' | 'sendMessage' | 'updateOrder';
  payload: any;
  timestamp: string;
  retryCount: number;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
  isLoadingMore: boolean;
}

export interface OrdersState {
  orders: Order[];
  filteredOrders: Order[];
  activeOrder: Order | null;
  activeTab: OrderStatus;
  searchQuery: string;
  filters: OrderFilters;
  showMap: boolean;
  isRefreshing: boolean;
  newOrdersCount: number;
  lastSyncTime: string | null;
  
  // Pagination
  pagination: PaginationState;
  
  // Chat messages
  chatMessages: Record<string, ChatMessage[]>; // orderId -> messages[]
  
  // Offline queue
  offlineQueue: OfflineAction[];
  isOffline: boolean;
  
  // Real-time sync
  isSyncing: boolean;
  syncError: string | null;
}

const initialState: OrdersState = {
  orders: [],
  filteredOrders: [],
  activeOrder: null,
  activeTab: 'new',
  searchQuery: '',
  filters: {},
  showMap: false,
  isRefreshing: false,
  newOrdersCount: 0,
  lastSyncTime: null,
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0,
    hasMore: true,
    isLoadingMore: false,
  },
  chatMessages: {},
  offlineQueue: [],
  isOffline: false,
  isSyncing: false,
  syncError: null,
};

// Async Thunks
export const syncOfflineActions = createAsyncThunk(
  'orders/syncOfflineActions',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { orders: OrdersState };
      const { offlineQueue } = state.orders;

      if (offlineQueue.length === 0) {
        return { synced: [], failed: [] };
      }

      const synced: string[] = [];
      const failed: string[] = [];

      for (const action of offlineQueue) {
        try {
          // TODO: Replace with actual API calls based on action type
          let response;
          switch (action.type) {
            case 'accept':
              response = await fetch(`/api/orders/${action.payload.orderId}/accept`, {
                method: 'POST',
              });
              break;
            case 'decline':
              response = await fetch(`/api/orders/${action.payload.orderId}/decline`, {
                method: 'POST',
              });
              break;
            case 'updateStatus':
              response = await fetch(`/api/orders/${action.payload.orderId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: action.payload.status }),
              });
              break;
            case 'sendMessage':
              response = await fetch(`/api/orders/${action.payload.orderId}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: action.payload.message }),
              });
              break;
            default:
              continue;
          }

          if (response && response.ok) {
            synced.push(action.id);
          } else {
            failed.push(action.id);
          }
        } catch (error) {
          failed.push(action.id);
        }
      }

      return { synced, failed };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const loadCachedOrders = createAsyncThunk(
  'orders/loadCachedOrders',
  async () => {
    try {
      const cached = await AsyncStorage.getItem('cached_orders');
      const lastSync = await AsyncStorage.getItem('orders_last_sync');
      
      if (cached) {
        return {
          orders: JSON.parse(cached),
          lastSyncTime: lastSync || null,
        };
      }
      
      return { orders: [], lastSyncTime: null };
    } catch (error) {
      return { orders: [], lastSyncTime: null };
    }
  }
);

export const cacheOrders = createAsyncThunk(
  'orders/cacheOrders',
  async (orders: Order[]) => {
    try {
      await AsyncStorage.setItem('cached_orders', JSON.stringify(orders));
      await AsyncStorage.setItem('orders_last_sync', new Date().toISOString());
      return true;
    } catch (error) {
      return false;
    }
  }
);

// Slice
const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setActiveTab: (state, action: PayloadAction<OrderStatus>) => {
      state.activeTab = action.payload;
      state.filteredOrders = filterOrders(
        state.orders,
        state.searchQuery,
        state.filters,
        action.payload
      );
      state.newOrdersCount = state.orders.filter(
        (o) => o.isNew && o.status === action.payload
      ).length;
      // Reset pagination when changing tabs
      state.pagination.page = 1;
      state.pagination.hasMore = true;
    },
    setOrders: (state, action: PayloadAction<Order[]>) => {
      state.orders = action.payload;
      state.filteredOrders = filterOrders(
        action.payload,
        state.searchQuery,
        state.filters,
        state.activeTab
      );
      state.newOrdersCount = action.payload.filter(
        (o) => o.isNew && o.status === state.activeTab
      ).length;
      state.pagination.total = action.payload.length;
    },
    addOrders: (state, action: PayloadAction<Order[]>) => {
      // Add new orders, avoiding duplicates
      const existingIds = new Set(state.orders.map((o) => o.id));
      const newOrders = action.payload.filter((o) => !existingIds.has(o.id));
      state.orders = [...state.orders, ...newOrders];
      state.filteredOrders = filterOrders(
        state.orders,
        state.searchQuery,
        state.filters,
        state.activeTab
      );
    },
    updateOrder: (state, action: PayloadAction<Order>) => {
      const index = state.orders.findIndex((o) => o.id === action.payload.id);
      if (index !== -1) {
        state.orders[index] = action.payload;
      } else {
        state.orders.push(action.payload);
      }
      
      if (state.activeOrder?.id === action.payload.id) {
        state.activeOrder = action.payload;
      }
      
      state.filteredOrders = filterOrders(
        state.orders,
        state.searchQuery,
        state.filters,
        state.activeTab
      );
      state.newOrdersCount = state.orders.filter(
        (o) => o.isNew && o.status === state.activeTab
      ).length;
    },
    removeOrder: (state, action: PayloadAction<string>) => {
      state.orders = state.orders.filter((o) => o.id !== action.payload);
      state.filteredOrders = filterOrders(
        state.orders,
        state.searchQuery,
        state.filters,
        state.activeTab
      );
      if (state.activeOrder?.id === action.payload) {
        state.activeOrder = null;
      }
    },
    setActiveOrder: (state, action: PayloadAction<Order | null>) => {
      state.activeOrder = action.payload;
    },
    updateOrderStatus: (state, action: PayloadAction<{ orderId: string; status: OrderStatus }>) => {
      const order = state.orders.find((o) => o.id === action.payload.orderId);
      if (order) {
        order.status = action.payload.status;
        if (state.activeOrder?.id === action.payload.orderId) {
          state.activeOrder.status = action.payload.status;
        }
        state.filteredOrders = filterOrders(
          state.orders,
          state.searchQuery,
          state.filters,
          state.activeTab
        );
      }
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.filteredOrders = filterOrders(
        state.orders,
        action.payload,
        state.filters,
        state.activeTab
      );
    },
    setFilters: (state, action: PayloadAction<OrderFilters>) => {
      state.filters = action.payload;
      state.filteredOrders = filterOrders(
        state.orders,
        state.searchQuery,
        action.payload,
        state.activeTab
      );
    },
    toggleMapView: (state) => {
      state.showMap = !state.showMap;
    },
    setRefreshing: (state, action: PayloadAction<boolean>) => {
      state.isRefreshing = action.payload;
    },
    markOrderAsRead: (state, action: PayloadAction<string>) => {
      const order = state.orders.find((o) => o.id === action.payload);
      if (order) {
        order.isNew = false;
        state.newOrdersCount = state.orders.filter(
          (o) => o.isNew && o.status === state.activeTab
        ).length;
      }
    },
    setLastSyncTime: (state, action: PayloadAction<string>) => {
      state.lastSyncTime = action.payload;
    },
    
    // Pagination
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pagination.pageSize = action.payload;
      state.pagination.page = 1; // Reset to first page
    },
    setPaginationTotal: (state, action: PayloadAction<number>) => {
      state.pagination.total = action.payload;
      state.pagination.hasMore = state.pagination.page * state.pagination.pageSize < action.payload;
    },
    setLoadingMore: (state, action: PayloadAction<boolean>) => {
      state.pagination.isLoadingMore = action.payload;
    },
    incrementPage: (state) => {
      state.pagination.page += 1;
    },
    
    // Chat Messages
    addChatMessage: (state, action: PayloadAction<{ orderId: string; message: ChatMessage }>) => {
      const { orderId, message } = action.payload;
      if (!state.chatMessages[orderId]) {
        state.chatMessages[orderId] = [];
      }
      state.chatMessages[orderId].push(message);
      // Sort by timestamp
      state.chatMessages[orderId].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
    },
    setChatMessages: (state, action: PayloadAction<{ orderId: string; messages: ChatMessage[] }>) => {
      const { orderId, messages } = action.payload;
      state.chatMessages[orderId] = messages;
    },
    clearChatMessages: (state, action: PayloadAction<string>) => {
      delete state.chatMessages[action.payload];
    },
    
    // Offline Queue
    addToOfflineQueue: (state, action: PayloadAction<Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount'>>) => {
      const actionWithMeta: OfflineAction = {
        ...action.payload,
        id: `offline_${Date.now()}_${Math.random()}`,
        timestamp: new Date().toISOString(),
        retryCount: 0,
      };
      state.offlineQueue.push(actionWithMeta);
    },
    removeFromOfflineQueue: (state, action: PayloadAction<string>) => {
      state.offlineQueue = state.offlineQueue.filter((a) => a.id !== action.payload);
    },
    incrementRetryCount: (state, action: PayloadAction<string>) => {
      const queuedAction = state.offlineQueue.find((a) => a.id === action.payload);
      if (queuedAction) {
        queuedAction.retryCount += 1;
      }
    },
    clearOfflineQueue: (state) => {
      state.offlineQueue = [];
    },
    
    // Real-time sync
    setIsOffline: (state, action: PayloadAction<boolean>) => {
      state.isOffline = action.payload;
    },
    setSyncing: (state, action: PayloadAction<boolean>) => {
      state.isSyncing = action.payload;
    },
    setSyncError: (state, action: PayloadAction<string | null>) => {
      state.syncError = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Sync Offline Actions
    builder
      .addCase(syncOfflineActions.pending, (state) => {
        state.isSyncing = true;
        state.syncError = null;
      })
      .addCase(syncOfflineActions.fulfilled, (state, action) => {
        state.isSyncing = false;
        // Remove synced actions from queue
        action.payload.synced.forEach((id) => {
          state.offlineQueue = state.offlineQueue.filter((a) => a.id !== id);
        });
        // Increment retry count for failed actions
        action.payload.failed.forEach((id) => {
          const queuedAction = state.offlineQueue.find((a) => a.id === id);
          if (queuedAction) {
            queuedAction.retryCount += 1;
            // Remove if retry count exceeds limit (e.g., 3)
            if (queuedAction.retryCount > 3) {
              state.offlineQueue = state.offlineQueue.filter((a) => a.id !== id);
            }
          }
        });
      })
      .addCase(syncOfflineActions.rejected, (state, action) => {
        state.isSyncing = false;
        state.syncError = action.payload as string;
      });

    // Load Cached Orders
    builder
      .addCase(loadCachedOrders.fulfilled, (state, action) => {
        if (action.payload.orders.length > 0) {
          state.orders = action.payload.orders;
          state.filteredOrders = filterOrders(
            action.payload.orders,
            state.searchQuery,
            state.filters,
            state.activeTab
          );
          state.lastSyncTime = action.payload.lastSyncTime;
        }
      });

    // Cache Orders
    builder.addCase(cacheOrders.fulfilled, (state, action) => {
      if (action.payload) {
        state.lastSyncTime = new Date().toISOString();
      }
    });
  },
});

// Helper function to filter orders
function filterOrders(
  orders: Order[],
  searchQuery: string,
  filters: OrderFilters,
  activeTab: OrderStatus
): Order[] {
  let filtered = orders.filter((order) => {
    // Filter by status
    if (activeTab !== 'new' && order.status !== activeTab) {
      return false;
    }
    if (activeTab === 'new' && order.status !== 'new') {
      return false;
    }

    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        order.client.name.toLowerCase().includes(query) ||
        order.appliance.type.toLowerCase().includes(query) ||
        order.location.address.toLowerCase().includes(query) ||
        order.appliance.brand?.toLowerCase().includes(query) ||
        order.appliance.model?.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Price filters
    if (filters.minPrice && order.price.amount < filters.minPrice) return false;
    if (filters.maxPrice && order.price.amount > filters.maxPrice) return false;

    // Distance filter
    if (
      filters.maxDistance &&
      order.location.distance &&
      order.location.distance > filters.maxDistance
    ) {
      return false;
    }

    // Appliance types filter
    if (filters.applianceTypes && filters.applianceTypes.length > 0) {
      if (!filters.applianceTypes.includes(order.appliance.type)) return false;
    }

    return true;
  });

  // Sort
  if (filters.sortBy) {
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (filters.sortBy) {
        case 'distance':
          comparison = (a.location.distance || 0) - (b.location.distance || 0);
          break;
        case 'price':
          comparison = a.price.amount - b.price.amount;
          break;
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });
  }

  return filtered;
}

export const {
  setActiveTab,
  setOrders,
  addOrders,
  updateOrder,
  removeOrder,
  setActiveOrder,
  updateOrderStatus,
  setSearchQuery,
  setFilters,
  toggleMapView,
  setRefreshing,
  markOrderAsRead,
  setLastSyncTime,
  setPage,
  setPageSize,
  setPaginationTotal,
  setLoadingMore,
  incrementPage,
  addChatMessage,
  setChatMessages,
  clearChatMessages,
  addToOfflineQueue,
  removeFromOfflineQueue,
  incrementRetryCount,
  clearOfflineQueue,
  setIsOffline,
  setSyncing,
  setSyncError,
} = ordersSlice.actions;

export default ordersSlice.reducer;
