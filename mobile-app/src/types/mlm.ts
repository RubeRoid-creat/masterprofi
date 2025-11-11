// MLM types

export interface MLMMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  level: number; // Level in the network (0 = root)
  status: 'active' | 'inactive' | 'pending';
  joinDate: string;
  personalSales: number;
  teamSales: number;
  directReferrals: number;
  totalDownline: number;
  monthlyEarnings: number;
  totalEarnings: number;
  rank: string; // Bronze, Silver, Gold, Platinum, Diamond
  children?: MLMMember[];
}

export interface NetworkStats {
  totalMembers: number;
  activeMembers: number;
  newMembersThisMonth: number;
  totalTeamSales: number;
  monthlyTeamSales: number;
  personalSales: number;
  monthlyEarnings: number;
  totalEarnings: number;
  commissionByLevel: CommissionLevel[];
  growthRate: number; // Percentage
}

export interface CommissionLevel {
  level: number;
  members: number;
  sales: number;
  commission: number;
  percentage: number;
}

export interface RecruitmentProgress {
  current: number;
  target: number;
  period: 'month' | 'quarter' | 'year';
  nextBonus?: {
    target: number;
    reward: number;
    deadline: string;
  };
}

export interface LeaderboardEntry {
  rank: number;
  memberId: string;
  memberName: string;
  memberAvatar?: string;
  score: number;
  metric: 'sales' | 'referrals' | 'earnings' | 'teamSize';
  change?: number; // Position change
}

export interface MonthlyBonus {
  month: string;
  target: number;
  achieved: number;
  bonus: number;
  status: 'achieved' | 'in_progress' | 'missed';
}

export interface TeamGrowth {
  date: string;
  members: number;
  sales: number;
  period: 'day' | 'week' | 'month';
}

export interface InviteData {
  code: string;
  link: string;
  qrCode?: string;
  shareText: string;
}









