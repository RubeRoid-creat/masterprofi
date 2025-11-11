import { configureStore } from '@reduxjs/toolkit';
import ordersReducer from './slices/ordersSlice';
import authReducer from './slices/authSlice';
import { ordersApi } from './api/ordersApi';
import { authApi } from './api/authApi';
import { mlmApi } from './api/mlmApi';
import { crmApi } from './api/crmApi';
import { persistenceMiddleware } from './persistence';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    orders: ordersReducer,
    [ordersApi.reducerPath]: ordersApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [mlmApi.reducerPath]: mlmApi.reducer,
    [crmApi.reducerPath]: crmApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore FormData in file uploads and Request objects from fetch
        ignoredActions: [
          'ordersApi/executeQuery',
          'ordersApi/executeMutation',
          'authApi/executeQuery',
          'authApi/executeMutation',
          'mlmApi/executeQuery',
          'mlmApi/executeMutation',
          'crmApi/executeQuery',
          'crmApi/executeMutation',
        ],
        ignoredActionPaths: [
          'meta.arg.body',
          'meta.baseQueryMeta.request', // Request object from fetch
          'meta.baseQueryMeta.response', // Response object from fetch
        ],
        ignoredPaths: ['ordersApi', 'authApi', 'mlmApi', 'crmApi'],
      },
    })
      .concat(ordersApi.middleware, authApi.middleware, mlmApi.middleware, crmApi.middleware)
      .concat(persistenceMiddleware as any),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

