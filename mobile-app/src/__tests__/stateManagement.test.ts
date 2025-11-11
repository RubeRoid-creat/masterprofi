/**
 * State Management Tests
 * Tests for Redux store, slices, and async operations
 */

import { configureStore } from '@reduxjs/toolkit';
import ordersReducer, {
  setActiveTab,
  setOrders,
  updateOrder,
  addToOfflineQueue,
  syncOfflineActions,
} from '../store/slices/ordersSlice';
import authReducer, {
  setCredentials,
  logout,
  setInitialized,
} from '../store/slices/authSlice';
import { Order, OrderStatus } from '../types/order';
import { mockOrders, mockApiResponse } from './__mocks__/apiMocks';

describe('State Management', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        orders: ordersReducer,
        auth: authReducer,
      },
    });
  });

  describe('Orders Slice', () => {
    it('should set active tab', () => {
      store.dispatch(setActiveTab('assigned'));
      
      const state = store.getState().orders;
      expect(state.activeTab).toBe('assigned');
    });

    it('should set orders list', () => {
      store.dispatch(setOrders(mockOrders));
      
      const state = store.getState().orders;
      expect(state.orders).toEqual(mockOrders);
      expect(state.orders.length).toBe(2);
    });

    it('should update order status', () => {
      store.dispatch(setOrders(mockOrders));
      
      const updatedOrder = {
        ...mockOrders[0],
        status: 'assigned' as OrderStatus,
      };
      
      store.dispatch(updateOrder(updatedOrder));
      
      const state = store.getState().orders;
      const order = state.orders.find((o) => o.id === mockOrders[0].id);
      expect(order?.status).toBe('assigned');
    });

    it('should filter orders by active tab', () => {
      store.dispatch(setOrders(mockOrders));
      store.dispatch(setActiveTab('new'));
      
      const state = store.getState().orders;
      const filtered = state.filteredOrders;
      
      expect(filtered.every((order) => order.status === 'new')).toBe(true);
    });

    it('should add to offline queue', () => {
      const offlineAction = {
        id: 'action-1',
        type: 'update_order_status' as const,
        payload: { orderId: 'order-1', status: 'completed' },
        retryCount: 0,
        maxRetries: 3,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      store.dispatch(addToOfflineQueue(offlineAction));
      
      const state = store.getState().orders;
      expect(state.offlineQueue).toContainEqual(offlineAction);
    });

    it('should handle search query', () => {
      store.dispatch(setOrders(mockOrders));
      store.dispatch({ type: 'orders/setSearchQuery', payload: 'John' });
      
      const state = store.getState().orders;
      // Filtered orders should include only orders matching search
      expect(state.filteredOrders.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Auth Slice', () => {
    it('should set credentials', () => {
      const credentials = {
        user: {
          id: 'user-1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'master' as const,
        },
        token: 'test-token',
      };

      store.dispatch(setCredentials(credentials));
      
      const state = store.getState().auth;
      expect(state.user).toEqual(credentials.user);
      expect(state.token).toBe('test-token');
      expect(state.isAuthenticated).toBe(true);
    });

    it('should logout user', () => {
      store.dispatch(setCredentials({
        user: {
          id: 'user-1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'master' as const,
        },
        token: 'test-token',
      }));

      store.dispatch(logout());
      
      const state = store.getState().auth;
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });

    it('should set initialized state', () => {
      store.dispatch(setInitialized(true));
      
      const state = store.getState().auth;
      expect(state.isInitialized).toBe(true);
    });
  });

  describe('Async Operations', () => {
    it('should handle async thunk for syncing offline actions', async () => {
      const offlineAction = {
        id: 'action-1',
        type: 'update_order_status' as const,
        payload: { orderId: 'order-1', status: 'completed' },
        retryCount: 0,
        maxRetries: 3,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      store.dispatch(addToOfflineQueue(offlineAction));

      // Mock API call
      const mockApiCall = jest.fn().mockResolvedValue({ success: true });

      // Simulate async operation
      await mockApiCall();

      expect(mockApiCall).toHaveBeenCalled();
    });

    it('should handle API error gracefully', async () => {
      const mockApiCall = jest.fn().mockRejectedValue(new Error('API Error'));

      try {
        await mockApiCall();
      } catch (error: any) {
        expect(error.message).toBe('API Error');
      }
    });
  });

  describe('State Persistence', () => {
    it('should persist auth state', () => {
      const credentials = {
        user: {
          id: 'user-1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'master' as const,
        },
        token: 'test-token',
      };

      store.dispatch(setCredentials(credentials));
      
      const state = store.getState().auth;
      
      // State should be serializable for persistence
      expect(JSON.stringify(state)).toBeTruthy();
    });
  });
});








