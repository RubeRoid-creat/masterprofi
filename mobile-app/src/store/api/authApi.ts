import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';
import { config } from '../../config/environments';

export interface LoginRequest {
  emailOrPhone: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email: string;
  phone: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    phone?: string;
    name: string;
    role: 'client' | 'master' | 'admin';
    avatar?: string;
  };
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${config.apiUrl}/auth`, // Использует тот же API, что и админ-панель
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['User'],
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/login',
        method: 'POST',
        body: {
          emailOrPhone: credentials.emailOrPhone,
          password: credentials.password,
          rememberMe: credentials.rememberMe,
        },
      }),
      transformResponse: (response: any) => ({
        user: {
          id: response.user?.id,
          email: response.user?.email,
          phone: response.user?.phone,
          name: response.user?.name || response.user?.firstName || response.user?.email,
          role: response.user?.role,
          avatar: response.user?.avatar,
        },
        token: response.token || response.access_token,
        refreshToken: response.refreshToken || response.refresh_token,
        expiresIn: response.expiresIn || 3600,
      }),
      invalidatesTags: ['User'],
    }),
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (data) => ({
        url: '/register',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: any) => ({
        user: {
          id: response.user?.id,
          email: response.user?.email,
          phone: response.user?.phone,
          name: response.user?.name || response.user?.firstName || response.user?.email,
          role: response.user?.role,
          avatar: response.user?.avatar,
        },
        token: response.token || response.access_token,
        refreshToken: response.refreshToken || response.refresh_token,
        expiresIn: response.expiresIn || 3600,
      }),
      invalidatesTags: ['User'],
    }),
    refreshToken: builder.mutation<RefreshTokenResponse, RefreshTokenRequest>({
      query: (data) => ({
        url: '/refresh',
        method: 'POST',
        body: {
          refresh_token: data.refreshToken, // Преобразуем формат для backend
        },
      }),
      transformResponse: (response: any) => ({
        token: response.token || response.access_token,
        refreshToken: response.refreshToken || response.refresh_token,
        expiresIn: response.expiresIn || 3600,
      }),
    }),
    logout: builder.mutation<void, void>({
      query: (_, { getState }) => {
        // Получаем refresh token из store для отправки на сервер
        // Используем getState вместо прямого импорта store для избежания циклической зависимости
        const state = (getState() as any) as RootState;
        const refreshToken = state?.auth?.refreshToken;
        
        return {
          url: '/logout',
          method: 'POST',
          body: refreshToken ? { refresh_token: refreshToken } : {},
        };
      },
      invalidatesTags: ['User'],
    }),
    getCurrentUser: builder.query<AuthResponse['user'], void>({
      query: () => '/me',
      providesTags: ['User'],
    }),
    updateProfile: builder.mutation<AuthResponse['user'], Partial<AuthResponse['user']>>({
      query: (data) => ({
        url: '/profile',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useRefreshTokenMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,
  useUpdateProfileMutation,
} = authApi;

