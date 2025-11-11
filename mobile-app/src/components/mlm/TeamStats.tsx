import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NetworkStats } from '../../types/mlm';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { commonStyles } from '../../utils/commonStyles';

interface TeamStatsProps {
  stats: NetworkStats;
}

export const TeamStats: React.FC<TeamStatsProps> = ({ stats }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  return (
    <View style={commonStyles.card}>
      <Text style={commonStyles.cardTitle}>Статистика команды</Text>

      {/* Main Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={[commonStyles.statCard, commonStyles.statCardPrimary]}>
          <Text style={commonStyles.statLabel}>Всего участников</Text>
          <Text style={commonStyles.statValue}>{stats.totalMembers}</Text>
          <Text style={[commonStyles.statSubtext, { color: colors.success[600] }]}>
            {formatPercentage(stats.growthRate)} рост
          </Text>
        </View>

        <View style={[commonStyles.statCard, commonStyles.statCardSuccess]}>
          <Text style={commonStyles.statLabel}>Активных участников</Text>
          <Text style={commonStyles.statValue}>{stats.activeMembers}</Text>
          <Text style={commonStyles.statSubtext}>
            {((stats.activeMembers / stats.totalMembers) * 100).toFixed(1)}% активны
          </Text>
        </View>

        <View style={[commonStyles.statCard, styles.statCardPurple]}>
          <Text style={commonStyles.statLabel}>Продажи за месяц</Text>
          <Text style={[commonStyles.statValue, { fontSize: 20 }]}>
            {formatCurrency(stats.monthlyTeamSales)}
          </Text>
          <Text style={commonStyles.statSubtext}>Продажи команды</Text>
        </View>

        <View style={[commonStyles.statCard, commonStyles.statCardWarning]}>
          <Text style={commonStyles.statLabel}>Доход за месяц</Text>
          <Text style={[commonStyles.statValue, { fontSize: 20 }]}>
            {formatCurrency(stats.monthlyEarnings)}
          </Text>
          <Text style={commonStyles.statSubtext}>Ваш доход</Text>
        </View>
      </View>

      {/* New Members */}
      <View style={commonStyles.divider}>
        <View style={styles.newMembersRow}>
          <Text style={styles.newMembersLabel}>Новых участников в этом месяце</Text>
          <Text style={styles.newMembersValue}>
            {stats.newMembersThisMonth || 0}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statCardPurple: {
    backgroundColor: colors.secondary[50],
  },
  newMembersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  newMembersLabel: {
    ...typography.body.small,
    color: colors.text.secondary,
  },
  newMembersValue: {
    ...typography.heading.h4,
    color: colors.text.primary,
    fontWeight: '700',
  },
});

