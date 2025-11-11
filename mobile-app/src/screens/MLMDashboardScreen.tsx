import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../theme';
import {
  MLMMember,
  NetworkStats,
  CommissionLevel,
  RecruitmentProgress,
  LeaderboardEntry,
  MonthlyBonus,
  TeamGrowth,
  InviteData,
} from '../types/mlm';
import { NetworkTree } from '../components/mlm/NetworkTree';
import { TeamStats } from '../components/mlm/TeamStats';
import { CommissionBreakdown } from '../components/mlm/CommissionBreakdown';
import { RecruitmentProgress as RecruitmentProgressComponent } from '../components/mlm/RecruitmentProgress';
import { Leaderboard } from '../components/mlm/Leaderboard';
import { MonthlyBonusTracker } from '../components/mlm/MonthlyBonusTracker';
import { TeamGrowthChart } from '../components/mlm/TeamGrowthChart';
import { InviteComponent } from '../components/mlm/InviteComponent';
import {
  useGetNetworkStructureQuery,
  useGetCommissionsQuery,
  useGetTeamStatsQuery,
  useGetLeaderboardQuery,
  useGetBonusHistoryQuery,
  useGetMyReferralCodeQuery,
} from '../store/api/mlmApi';
import { useAppSelector } from '../store/hooks';

interface MLMDashboardScreenProps {
  currentUserId?: string;
  onMemberPress?: (member: MLMMember) => void;
}

export const MLMDashboardScreen: React.FC<MLMDashboardScreenProps> = ({
  currentUserId: propsCurrentUserId,
  onMemberPress,
}) => {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'network' | 'leaders'>('overview');

  // Get current user ID from Redux store
  const authUser = useAppSelector((state) => state.auth.user);
  const currentUserId = propsCurrentUserId || authUser?.id;

  // Get real data from API
  const { 
    data: networkData, 
    isLoading: isLoadingNetwork,
    error: networkError,
    refetch: refetchNetwork,
  } = useGetNetworkStructureQuery(
    currentUserId ? { memberId: currentUserId, maxDepth: 5, includeStats: true } : { maxDepth: 5, includeStats: true },
    { skip: !currentUserId }
  );

  const { 
    data: commissionsData, 
    isLoading: isLoadingCommissions,
    error: commissionsError,
    refetch: refetchCommissions,
  } = useGetCommissionsQuery({ period: 'month' }, { skip: !currentUserId });

  const { 
    data: teamStatsData, 
    isLoading: isLoadingTeamStats,
    error: teamStatsError,
    refetch: refetchTeamStats,
  } = useGetTeamStatsQuery(
    currentUserId ? { period: 'month', memberId: currentUserId } : { period: 'month' },
    { skip: !currentUserId }
  );

  const { 
    data: leaderboardData, 
    isLoading: isLoadingLeaderboard,
    error: leaderboardError,
    refetch: refetchLeaderboard,
  } = useGetLeaderboardQuery({ metric: 'earnings', period: 'month', limit: 100 }, { skip: !currentUserId });

  const { 
    data: bonusHistoryData, 
    isLoading: isLoadingBonusHistory,
    error: bonusHistoryError,
    refetch: refetchBonusHistory,
  } = useGetBonusHistoryQuery({ period: 'year' }, { skip: !currentUserId });

  const { 
    data: inviteData, 
    isLoading: isLoadingInvite,
    refetch: refetchInvite,
  } = useGetMyReferralCodeQuery(undefined, { skip: !currentUserId });

  // Extract real data from API responses
  const rootMember: MLMMember | undefined = networkData?.member;
  const networkStats: NetworkStats | undefined = networkData?.stats || teamStatsData?.stats;
  const commissionLevels: CommissionLevel[] = commissionsData?.commissions || teamStatsData?.commissionByLevel || [];
  const leaderboardEntries: LeaderboardEntry[] = leaderboardData?.entries || [];
  const monthlyBonuses: MonthlyBonus[] = bonusHistoryData?.bonuses || [];
  const teamGrowthData: TeamGrowth[] = teamStatsData?.growthData || [];

  const isLoading = isLoadingNetwork || isLoadingCommissions || isLoadingTeamStats || isLoadingLeaderboard || isLoadingBonusHistory;
  const hasError = networkError || commissionsError || teamStatsError || leaderboardError || bonusHistoryError;

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchNetwork(),
        refetchCommissions(),
        refetchTeamStats(),
        refetchLeaderboard(),
        refetchBonusHistory(),
        refetchInvite(),
      ]);
    } catch (error) {
      console.error('Error refreshing MLM data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Recruitment progress from API or calculated
  const recruitmentProgress: RecruitmentProgress | undefined = teamStatsData?.stats ? {
    current: teamStatsData.stats.newMembersThisMonth || 0,
    target: 15, // TODO: Get from API
    period: 'month',
    nextBonus: bonusHistoryData?.nextBonus,
  } : undefined;

  const renderOverview = () => {
    if (!networkStats) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Нет данных о сети</Text>
        </View>
      );
    }

    return (
      <View>
        {networkStats && <TeamStats stats={networkStats} />}
        {recruitmentProgress && <RecruitmentProgressComponent progress={recruitmentProgress} />}
        {commissionLevels.length > 0 && <CommissionBreakdown commissions={commissionLevels} />}
        {monthlyBonuses.length > 0 && <MonthlyBonusTracker bonuses={monthlyBonuses} />}
        {teamGrowthData.length > 0 && (
          <>
            <TeamGrowthChart data={teamGrowthData} type="members" />
            <TeamGrowthChart data={teamGrowthData} type="sales" />
          </>
        )}
        {inviteData && <InviteComponent inviteData={inviteData} />}
      </View>
    );
  };

  const renderNetwork = () => {
    if (!rootMember) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Сеть не найдена</Text>
        </View>
      );
    }

    return (
      <View>
        <NetworkTree
          rootMember={rootMember}
          maxDepth={5}
          onMemberPress={onMemberPress}
        />
      </View>
    );
  };

  const renderLeaders = () => {
    if (leaderboardEntries.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Рейтинг пуст</Text>
        </View>
      );
    }

    return (
      <View>
        <Leaderboard
          entries={leaderboardEntries}
          currentUserId={currentUserId}
          metric="earnings"
        />
      </View>
    );
  };

  if (isLoading && !networkData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
        <Text style={styles.loadingText}>Загрузка данных MLM...</Text>
      </View>
    );
  }

  if (hasError && !networkData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Ошибка загрузки данных</Text>
        <Text style={styles.errorSubtext}>
          {networkError || commissionsError || teamStatsError ? 'Проверьте подключение к серверу' : 'Неизвестная ошибка'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScrollContent}
        >
          <TouchableOpacity
            onPress={() => setSelectedTab('overview')}
            style={[
              styles.tab,
              selectedTab === 'overview' && styles.tabActive,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === 'overview' && styles.tabTextActive,
              ]}
            >
              Обзор
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSelectedTab('network')}
            style={[
              styles.tab,
              selectedTab === 'network' && styles.tabActive,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === 'network' && styles.tabTextActive,
              ]}
            >
              Сеть
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSelectedTab('leaders')}
            style={[
              styles.tab,
              selectedTab === 'leaders' && styles.tabActive,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === 'leaders' && styles.tabTextActive,
              ]}
            >
              Лидеры
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {selectedTab === 'overview' && renderOverview()}
        {selectedTab === 'network' && renderNetwork()}
        {selectedTab === 'leaders' && renderLeaders()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  tabContainer: {
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  tabScrollContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  tab: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray[100],
  },
  tabActive: {
    backgroundColor: colors.primary[600],
  },
  tabText: {
    ...typography.label.medium,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  tabTextActive: {
    color: colors.text.inverse,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
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
    backgroundColor: colors.background.primary,
    padding: spacing.xl,
  },
  errorText: {
    ...typography.heading.h3,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  errorSubtext: {
    ...typography.body.medium,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyText: {
    ...typography.body.medium,
    color: colors.text.tertiary,
  },
});
