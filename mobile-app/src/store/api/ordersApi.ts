import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { RootState } from '../store';
import { Order, OrderStatus, OrderFilters } from '../../types/order';
import { ChatMessage, OrderDetails } from '../../types/orderDetails';
import * as NetInfo from '@react-native-community/netinfo';

// Types
export interface GetOrdersRequest {
  status?: OrderStatus;
  filters?: OrderFilters;
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface GetOrdersResponse {
  orders: Order[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface AcceptOrderRequest {
  orderId: string;
  notes?: string;
  scheduledAt?: string;
}

export interface AcceptOrderResponse {
  order: Order;
  message: string;
}

export interface UpdateOrderStatusRequest {
  orderId: string;
  status: OrderStatus;
  notes?: string;
}

export interface UpdateOrderStatusResponse {
  order: Order;
  message: string;
}

export interface AddOrderMessageRequest {
  orderId: string;
  message: string;
  attachments?: string[];
}

export interface AddOrderMessageResponse {
  message: ChatMessage;
  order: Order;
}

export interface UploadOrderPhotosRequest {
  orderId: string;
  photos: Array<{
    uri: string;
    type: string;
    name: string;
  }>;
}

export interface UploadOrderPhotosResponse {
  photos: string[];
  order: Order;
}

export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
}

// Import environment-aware base query
import { ordersBaseQuery } from './baseQuery';

// Enhanced base query with offline detection
const baseQueryWithOffline: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  // Check network status
  const netInfo = await NetInfo.fetch();
  const isOffline = !netInfo.isConnected;

  if (isOffline) {
    // Return offline error
    return {
      error: {
        status: 'OFFLINE' as any,
        data: { message: 'No internet connection' },
      } as FetchBaseQueryError,
    };
  }

  // Proceed with environment-aware query
  return ordersBaseQuery(args, api, extraOptions);
};

// RTK Query API
export const ordersApi = createApi({
  reducerPath: 'ordersApi',
  baseQuery: baseQueryWithOffline,
  tagTypes: ['Order', 'OrderList', 'OrderMessages'],
  keepUnusedDataFor: 60, // Keep cached data for 60 seconds
  endpoints: (builder) => ({
    // Get Orders with pagination and filters
    getOrders: builder.query<GetOrdersResponse, GetOrdersRequest>({
      query: (params) => {
        const { status, filters, page = 1, pageSize = 20, search } = params;
        const queryParams: Record<string, string> = {
          page: page.toString(),
          pageSize: pageSize.toString(),
        };

        if (status) queryParams.status = status;
        if (search) queryParams.search = search;

        // Add filters
        if (filters) {
          if (filters.minPrice) queryParams.minPrice = filters.minPrice.toString();
          if (filters.maxPrice) queryParams.maxPrice = filters.maxPrice.toString();
          if (filters.maxDistance) queryParams.maxDistance = filters.maxDistance.toString();
          if (filters.applianceTypes?.length) {
            queryParams.applianceTypes = filters.applianceTypes.join(',');
          }
          if (filters.sortBy) queryParams.sortBy = filters.sortBy;
          if (filters.sortOrder) queryParams.sortOrder = filters.sortOrder;
        }

        return {
          url: '',
          params: queryParams,
        };
      },
      providesTags: (result) => {
        if (!result || !result.orders) return ['OrderList'];
        
        return [
          'OrderList',
          ...result.orders.map((order) => ({ type: 'Order' as const, id: order.id })),
        ];
      },
      // Merge paginated results
      merge: (currentCache, newItems) => {
        if (newItems.pagination.page === 1) {
          return newItems;
        }
        return {
          ...newItems,
          orders: [...(currentCache?.orders || []), ...newItems.orders],
        };
      },
      // Refetch on mount if data is stale
      forceRefetch: ({ currentArg, previousArg }) => {
        return currentArg?.page !== previousArg?.page || 
               currentArg?.status !== previousArg?.status;
      },
    }),

    // Get single order
    getOrder: builder.query<Order, string>({
      query: (orderId) => `/${orderId}`,
      providesTags: (result, error, orderId) => [
        { type: 'Order', id: orderId },
        { type: 'OrderMessages', id: orderId },
      ],
      transformResponse: (response: any): Order => {
        // Transform backend response to Order format
        return {
          id: response.id,
          client: {
            id: response.clientId || response.client?.id || '',
            name: response.clientName || response.client?.name || response.client?.firstName || 'Unknown',
            phone: response.clientPhone || response.client?.phone || '',
            avatar: response.client?.avatar,
          },
          appliance: {
            type: response.serviceType || response.appliance?.type || '',
            brand: response.brand || response.appliance?.brand,
            model: response.model || response.appliance?.model,
            issue: response.description || response.appliance?.issue,
          },
          location: {
            address: response.address || response.location?.address || '',
            city: response.city || response.location?.city || '',
            latitude: response.latitude || response.location?.latitude || 0,
            longitude: response.longitude || response.location?.longitude || 0,
            distance: response.distance || response.location?.distance,
          },
          price: {
            amount: response.amount || response.price?.amount || 0,
            currency: response.currency || response.price?.currency || 'RUB',
          },
          status: response.status || 'new',
          createdAt: response.createdAt || new Date().toISOString(),
          scheduledAt: response.scheduledAt,
          assignedTo: response.assignedTo || response.masterId,
          completedAt: response.completedAt,
          notes: response.notes,
        };
      },
    }),

    // Accept Order
    acceptOrder: builder.mutation<AcceptOrderResponse, AcceptOrderRequest>({
      query: ({ orderId, notes, scheduledAt }) => ({
        url: `/${orderId}/accept`,
        method: 'POST',
        body: { notes, scheduledAt },
      }),
      // Optimistic update
      async onQueryStarted({ orderId }, { dispatch, queryFulfilled, getState }) {
        // Optimistic update: immediately update the order status
        const patchResult = dispatch(
          ordersApi.util.updateQueryData('getOrders', { status: 'new' }, (draft) => {
            const order = draft.orders.find((o) => o.id === orderId);
            if (order) {
              order.status = 'assigned';
              order.assignedTo = (getState() as RootState).auth.user?.id;
            }
          })
        );

        // Also update single order query if it exists
        const singleOrderPatch = dispatch(
          ordersApi.util.updateQueryData('getOrder', orderId, (draft) => {
            draft.status = 'assigned';
            draft.assignedTo = (getState() as RootState).auth.user?.id;
          })
        );

        try {
          await queryFulfilled;
          // Invalidate to refetch fresh data
          dispatch(ordersApi.util.invalidateTags([{ type: 'Order', id: orderId }]));
        } catch (error) {
          // Revert optimistic update on error
          patchResult.undo();
          singleOrderPatch.undo();
        }
      },
      invalidatesTags: (result, error, { orderId }) => [
        { type: 'Order', id: orderId },
        { type: 'OrderList' },
      ],
    }),

    // Update Order Status
    updateOrderStatus: builder.mutation<UpdateOrderStatusResponse, UpdateOrderStatusRequest>({
      query: ({ orderId, status, notes }) => ({
        url: `/${orderId}/status`,
        method: 'PATCH',
        body: { status, notes },
      }),
      // Optimistic update
      async onQueryStarted({ orderId, status }, { dispatch, queryFulfilled, getState }) {
        // Optimistic update
        const patchResult = dispatch(
          ordersApi.util.updateQueryData('getOrders', {}, (draft) => {
            const order = draft.orders.find((o) => o.id === orderId);
            if (order) {
              order.status = status;
            }
          })
        );

        const singleOrderPatch = dispatch(
          ordersApi.util.updateQueryData('getOrder', orderId, (draft) => {
            draft.status = status;
            if (status === 'completed') {
              draft.completedAt = new Date().toISOString();
            }
          })
        );

        try {
          await queryFulfilled;
          dispatch(ordersApi.util.invalidateTags([{ type: 'Order', id: orderId }]));
        } catch (error) {
          patchResult.undo();
          singleOrderPatch.undo();
        }
      },
      invalidatesTags: (result, error, { orderId }) => [
        { type: 'Order', id: orderId },
        { type: 'OrderList' },
      ],
    }),

    // Add Order Message (Chat)
    addOrderMessage: builder.mutation<AddOrderMessageResponse, AddOrderMessageRequest>({
      query: ({ orderId, message, attachments }) => ({
        url: `/${orderId}/messages`,
        method: 'POST',
        body: { message, attachments },
      }),
      // Optimistic update
      async onQueryStarted({ orderId, message, attachments }, { dispatch, queryFulfilled, getState }) {
        const state = getState() as RootState;
        const user = state.auth.user;

        // Optimistic message
        const optimisticMessage: ChatMessage = {
          id: `temp_${Date.now()}`,
          senderId: user?.id || '',
          senderName: user?.name || 'You',
          senderType: 'master',
          message,
          timestamp: new Date().toISOString(),
          attachments,
        };

        const patchResult = dispatch(
          ordersApi.util.updateQueryData('getOrder', orderId, (draft) => {
            draft.chatMessages = [...(draft.chatMessages || []), optimisticMessage];
          })
        );

        try {
          const result = await queryFulfilled;
          // Replace optimistic message with real one
          dispatch(
            ordersApi.util.updateQueryData('getOrder', orderId, (draft) => {
              const index = draft.chatMessages.findIndex((m) => m.id === optimisticMessage.id);
              if (index !== -1) {
                draft.chatMessages[index] = result.data.message;
              }
            })
          );
        } catch (error) {
          // Remove optimistic message on error
          dispatch(
            ordersApi.util.updateQueryData('getOrder', orderId, (draft) => {
              draft.chatMessages = draft.chatMessages.filter(
                (m) => m.id !== optimisticMessage.id
              );
            })
          );
        }
      },
      invalidatesTags: (result, error, { orderId }) => [
        { type: 'OrderMessages', id: orderId },
        { type: 'Order', id: orderId },
      ],
    }),

    // Upload Order Photos
    uploadOrderPhotos: builder.mutation<UploadOrderPhotosResponse, UploadOrderPhotosRequest>({
      query: ({ orderId, photos }) => {
        // Create FormData for file upload
        const formData = new FormData();
        
        photos.forEach((photo, index) => {
          formData.append('photos', {
            uri: photo.uri,
            type: photo.type || 'image/jpeg',
            name: photo.name || `photo_${index}.jpg`,
          } as any);
        });

        return {
          url: `/${orderId}/photos`,
          method: 'POST',
          body: formData,
          // Override content type for FormData
          prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState).auth.token;
            if (token) {
              headers.set('authorization', `Bearer ${token}`);
            }
            // Don't set Content-Type, let the browser set it with boundary
            return headers;
          },
        };
      },
      // Optimistic update
      async onQueryStarted({ orderId, photos }, { dispatch, queryFulfilled }) {
        // Optimistic update: add photo URLs immediately
        const photoUris = photos.map((photo) => photo.uri);
        
        const patchResult = dispatch(
          ordersApi.util.updateQueryData('getOrder', orderId, (draft) => {
            draft.photos = [...(draft.photos || []), ...photoUris];
          })
        );

        try {
          const result = await queryFulfilled;
          // Update with actual photo URLs from server
          dispatch(
            ordersApi.util.updateQueryData('getOrder', orderId, (draft) => {
              draft.photos = result.data.photos;
            })
          );
        } catch (error) {
          // Revert optimistic update
          patchResult.undo();
        }
      },
      invalidatesTags: (result, error, { orderId }) => [
        { type: 'Order', id: orderId },
      ],
    }),

    // Decline Order
    declineOrder: builder.mutation<{ message: string }, { orderId: string; reason?: string }>({
      query: ({ orderId, reason }) => ({
        url: `/${orderId}/decline`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: (result, error, { orderId }) => [
        { type: 'Order', id: orderId },
        { type: 'OrderList' },
      ],
    }),
  }),
});

// Export hooks
export const {
  useGetOrdersQuery,
  useGetOrderQuery,
  useLazyGetOrdersQuery,
  useLazyGetOrderQuery,
  useAcceptOrderMutation,
  useUpdateOrderStatusMutation,
  useAddOrderMessageMutation,
  useUploadOrderPhotosMutation,
  useDeclineOrderMutation,
} = ordersApi;

// Export endpoints for use in other files
export const {
  endpoints: {
    getOrders,
    getOrder,
    acceptOrder,
    updateOrderStatus,
    addOrderMessage,
    uploadOrderPhotos,
    declineOrder,
  },
} = ordersApi;
