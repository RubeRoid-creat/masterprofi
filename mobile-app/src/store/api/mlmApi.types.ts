/**
 * TypeScript definitions for MLM API
 */

import {
  MLMMember,
  NetworkStats,
  CommissionLevel,
  LeaderboardEntry,
  MonthlyBonus,
  InviteData,
} from '../../types/mlm';

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
  breakdown: Array<{
    level: number;
    sales: number;
    commission: number;
    percentage: number;
  }>;
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
  growthData: Array<{
    date: string;
    members: number;
    sales: number;
  }>;
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

// Error Types
export interface MLMApiError {
  message: string;
  code?: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
}

export interface NetworkError {
  status: 'FETCH_ERROR' | 'PARSING_ERROR' | 'TIMEOUT_ERROR' | 'OFFLINE';
  error: string;
  data?: unknown;
}

// Cache Tags
export type MLMCacheTag =
  | { type: 'Network'; id: string }
  | { type: 'Commissions' }
  | { type: 'TeamStats' }
  | { type: 'Leaderboard' }
  | { type: 'BonusHistory' }
  | { type: 'Invite' };








