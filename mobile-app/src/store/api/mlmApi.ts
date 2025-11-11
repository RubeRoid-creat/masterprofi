import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { RootState } from '../store';
import {
  MLMMember,
  NetworkStats,
  CommissionLevel,
  LeaderboardEntry,
  MonthlyBonus,
  InviteData,
} from '../../types/mlm';
import * as NetInfo from '@react-native-community/netinfo';
import { config } from '../../config/environments';

// Request Types
export interface GetNetworkStructureRequest {
  memberId?: string;
  maxDepth?: number;
  includeStats?: boolean;
}

export interface GetCommissionsRequest {
  period?: 'day' | 'week' | 'month' | 'year' | 'all';
  startDate?: string;
  endDate?: string;
  level?: number;
}

export interface GetTeamStatsRequest {
  period?: 'day' | 'week' | 'month' | 'quarter' | 'year';
  memberId?: string;
}

export interface InviteUserRequest {
  email?: string;
  phone?: string;
  name?: string;
  inviteCode?: string;
  message?: string;
}

export interface GetBonusHistoryRequest {
  period?: 'month' | 'quarter' | 'year' | 'all';
  startDate?: string;
  endDate?: string;
}

export interface GetLeaderboardRequest {
  metric?: 'sales' | 'referrals' | 'earnings' | 'teamSize';
  period?: 'day' | 'week' | 'month' | 'year' | 'all';
  limit?: number;
}

// Response Types
export interface GetNetworkStructureResponse {
  member: MLMMember;
  totalMembers: number;
  totalDownline: number;
  stats?: NetworkStats;
}

export interface GetCommissionsResponse {
  commissions: CommissionLevel[];
  total: number;
  period: string;
  breakdown: {
    level: number;
    sales: number;
    commission: number;
    percentage: number;
  }[];
  summary: {
    personalCommissions: number;
    teamCommissions: number;
    totalCommissions: number;
    pendingCommissions: number;
  };
}

export interface GetTeamStatsResponse {
  stats: NetworkStats;
  commissionByLevel: CommissionLevel[];
  growthData: {
    date: string;
    members: number;
    sales: number;
  }[];
  topPerformers: Array<{
    memberId: string;
    memberName: string;
    sales: number;
    referrals: number;
  }>;
}

export interface InviteUserResponse {
  invite: InviteData;
  message: string;
  expiresAt: string;
}

export interface GetBonusHistoryResponse {
  bonuses: MonthlyBonus[];
  totalBonuses: number;
  period: string;
  nextBonus?: {
    target: number;
    reward: number;
    deadline: string;
    progress: number;
  };
}

export interface GetLeaderboardResponse {
  entries: LeaderboardEntry[];
  currentUserRank?: number;
  period: string;
  metric: string;
}

// Custom base query with offline support
const baseQueryWithAuth = fetchBaseQuery({
  baseUrl: `${config.apiUrl}/mlm`,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

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
    return {
      error: {
        status: 'OFFLINE',
        data: { message: 'No internet connection' },
      } as FetchBaseQueryError,
    };
  }

  return baseQueryWithAuth(args, api, extraOptions);
};

// RTK Query API
export const mlmApi = createApi({
  reducerPath: 'mlmApi',
  baseQuery: baseQueryWithOffline,
  tagTypes: ['Network', 'Commissions', 'TeamStats', 'Leaderboard', 'BonusHistory', 'Invite'],
  keepUnusedDataFor: 300, // Keep cached data for 5 minutes (MLM data changes less frequently)
  endpoints: (builder) => ({
    // Get Network Structure
    getNetworkStructure: builder.query<GetNetworkStructureResponse, GetNetworkStructureRequest>({
      query: (params) => {
        const { memberId, maxDepth = 5, includeStats = true } = params;
        // Use existing backend endpoint: /api/mlm/structure/:userId
        const userId = memberId || (params as any).userId || 'current';
        return {
          url: `/structure/${userId}`,
          params: {
            maxDepth: maxDepth.toString(),
            includeStats: includeStats.toString(),
          },
        };
      },
      providesTags: (result, error, params) => [
        { type: 'Network', id: params.memberId || 'root' },
      ],
      // Refetch every 5 minutes for real-time updates
      pollingInterval: 5 * 60 * 1000,
    }),

    // Get Commissions
    getCommissions: builder.query<GetCommissionsResponse, GetCommissionsRequest>({
      query: (params) => {
        const { period = 'month', startDate, endDate, level, userId } = params;
        // Use existing backend endpoint: /api/mlm/realtime-commissions/:userId
        const targetUserId = userId || (params as any).userId || 'current';
        return {
          url: `/realtime-commissions/${targetUserId}`,
          params: {
            period,
            ...(startDate && { startDate }),
            ...(endDate && { endDate }),
            ...(level !== undefined && { level: level.toString() }),
          },
        };
      },
      providesTags: ['Commissions'],
      // Cache for 2 minutes (commissions update frequently)
      keepUnusedDataFor: 120,
    }),

    // Get Team Stats - Use stats endpoint instead
    getTeamStats: builder.query<GetTeamStatsResponse, GetTeamStatsRequest>({
      query: (params) => {
        const { period = 'month', memberId } = params;
        // Use existing backend endpoint: /api/mlm/stats/:userId
        const userId = memberId || (params as any).userId || 'current';
        return {
          url: `/stats/${userId}`,
          params: { period },
        };
      },
      providesTags: ['TeamStats'],
      // Cache for 3 minutes
      keepUnusedDataFor: 180,
    }),

    // Invite User (Mutation)
    inviteUser: builder.mutation<InviteUserResponse, InviteUserRequest>({
      query: (data) => ({
        url: '/invite',
        method: 'POST',
        body: data,
      }),
      // Optimistic update
      async onQueryStarted(arg, { dispatch, queryFulfilled, getState }) {
        // Optimistic update: immediately show invite generation
        const patchResult = dispatch(
          mlmApi.util.updateQueryData('getTeamStats', { period: 'month' }, (draft) => {
            // Increment pending referrals count optimistically
            if (draft.stats) {
              // Stats will update when refetched
            }
          })
        );

        try {
          await queryFulfilled;
          // Invalidate network and stats to refetch fresh data
          dispatch(mlmApi.util.invalidateTags(['Network', 'TeamStats']));
        } catch (error) {
          // Revert optimistic update on error
          patchResult.undo();
        }
      },
      invalidatesTags: ['Invite', 'Network', 'TeamStats'],
    }),

    // Get Bonus History - Use bonuses endpoint instead
    getBonusHistory: builder.query<GetBonusHistoryResponse, GetBonusHistoryRequest>({
      query: (params) => {
        const { period = 'year', startDate, endDate, userId } = params;
        // Use existing backend endpoint: /api/mlm/bonuses/:userId
        const targetUserId = userId || (params as any).userId || 'current';
        return {
          url: `/bonuses/${targetUserId}`,
          params: {
            period,
            ...(startDate && { startDate }),
            ...(endDate && { endDate }),
          },
        };
      },
      providesTags: ['BonusHistory'],
      // Cache for 5 minutes (bonus history changes infrequently)
      keepUnusedDataFor: 300,
    }),

    // Get Leaderboard - Not implemented on backend, return empty data
    getLeaderboard: builder.query<GetLeaderboardResponse, GetLeaderboardRequest>({
      query: () => {
        // Backend doesn't have leaderboard endpoint, return empty result
        return {
          url: '/overall', // Use overall stats as fallback
        };
      },
      transformResponse: () => {
        // Return empty leaderboard until backend implements it
        return { entries: [], period: 'month', metric: 'earnings' } as GetLeaderboardResponse;
      },
      providesTags: ['Leaderboard'],
      // Cache for 10 minutes (leaderboard updates less frequently)
      keepUnusedDataFor: 600,
    }),

    // Get My Referral Code (helper endpoint)
    getMyReferralCode: builder.query<InviteData, { userId?: string } | void>({
      query: (params) => {
        // Use existing backend endpoint: /api/mlm/referral-code/:userId
        const userId = (params as any)?.userId || 'current';
        return `/referral-code/${userId}`;
      },
      providesTags: ['Invite'],
    }),

    // Get Commission Details by Level
    getCommissionByLevel: builder.query<
      { level: number; commission: number; sales: number; members: number },
      number
    >({
      query: (level) => `/commissions/level/${level}`,
      providesTags: (result, error, level) => [
        { type: 'Commissions', id: `level-${level}` },
      ],
    }),
  }),
});

// Export hooks
export const {
  useGetNetworkStructureQuery,
  useLazyGetNetworkStructureQuery,
  useGetCommissionsQuery,
  useLazyGetCommissionsQuery,
  useGetTeamStatsQuery,
  useLazyGetTeamStatsQuery,
  useInviteUserMutation,
  useGetBonusHistoryQuery,
  useLazyGetBonusHistoryQuery,
  useGetLeaderboardQuery,
  useLazyGetLeaderboardQuery,
  useGetMyReferralCodeQuery,
  useGetCommissionByLevelQuery,
} = mlmApi;

// Export endpoints for use in other files
export const {
  endpoints: {
    getNetworkStructure,
    getCommissions,
    getTeamStats,
    inviteUser,
    getBonusHistory,
    getLeaderboard,
    getMyReferralCode,
    getCommissionByLevel,
  },
} = mlmApi;




