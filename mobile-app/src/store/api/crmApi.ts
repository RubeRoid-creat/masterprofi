import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { config } from "../../config/environments";
import { RootState } from "../store";

export interface CrmContact {
  id: string;
  crmId?: string;
  crmType?: string;
  name: string;
  phone?: string;
  email?: string;
  company?: string;
  position?: string;
  notes?: string;
  status: string;
  syncVersion: number;
  lastSyncedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CrmDeal {
  id: string;
  crmId?: string;
  crmType?: string;
  title: string;
  contactId?: string;
  amount: number;
  currency?: string;
  stage?: string;
  description?: string;
  syncVersion: number;
  lastSyncedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CrmTask {
  id: string;
  crmId?: string;
  crmType?: string;
  title: string;
  description?: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
  dueDate?: string;
  status: string;
  assignedToUserId?: string;
  syncVersion: number;
  lastSyncedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SyncInitialResponse {
  success: boolean;
  contacts: number;
  deals: number;
  tasks: number;
  syncedAt: string;
  data?: {
    contacts?: any[];
    deals?: any[];
    tasks?: any[];
  };
}

export interface SyncIncrementalResponse {
  success: boolean;
  contacts: number;
  deals: number;
  tasks: number;
  communications: number;
  products: number;
  syncedAt: string;
  data?: {
    contacts?: any[];
    deals?: any[];
    tasks?: any[];
  };
}

export interface SyncStatus {
  id: string;
  userId: string;
  crmType?: string;
  lastSyncAt?: string;
  lastFullSyncAt?: string;
  isSyncing: boolean;
  totalContacts: number;
  totalDeals: number;
  totalTasks: number;
  pendingChanges: number;
  lastError?: string;
}

export interface SyncOutgoingChange {
  entityId: string;
  entityType: string;
  operation: "CREATE" | "UPDATE" | "DELETE";
  payload: Record<string, any>;
  version?: number;
  lastModified?: string;
}

export interface SyncOutgoingRequest {
  changes: SyncOutgoingChange[];
  batchId?: string;
  lastBatch?: boolean;
}

export interface SyncOutgoingResponse {
  success: boolean;
  batchId?: string;
  lastBatch?: boolean;
  processed?: number;
  message?: string;
  results: Array<{
    entityId: string;
    status: "sent" | "error";
    error?: string;
  }>;
}


const baseQueryWithAuth = fetchBaseQuery({
  baseUrl: `${config.apiUrl}/sync`,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

export const crmApi = createApi({
  reducerPath: "crmApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["CrmSync", "CrmContact", "CrmDeal", "CrmTask"],
  endpoints: (builder) => ({
    // Первоначальная синхронизация
    initialSync: builder.query<SyncInitialResponse, void>({
      query: () => ({
        url: "/initial",
      }),
      providesTags: ["CrmSync"],
    }),

    // Инкрементальная синхронизация
    incrementalSync: builder.query<
      SyncIncrementalResponse,
      {
        since?: string;
        entityTypes?: string[];
      }
    >({
      query: (params) => ({
        url: "/incremental",
        params,
      }),
      providesTags: ["CrmSync"],
    }),

    // Отправка изменений
    outgoingSync: builder.mutation<
      SyncOutgoingResponse,
      SyncOutgoingRequest
    >({
      query: (body) => ({
        url: "/outgoing",
        method: "POST",
        body,
      }),
      invalidatesTags: ["CrmSync"],
    }),

    // Статус синхронизации
    getSyncStatus: builder.query<SyncStatus, void>({
      query: () => "/status",
      providesTags: ["CrmSync"],
    }),

  }),
});

export const {
  useInitialSyncQuery,
  useLazyInitialSyncQuery,
  useIncrementalSyncQuery,
  useLazyIncrementalSyncQuery,
  useOutgoingSyncMutation,
  useGetSyncStatusQuery,
} = crmApi;

