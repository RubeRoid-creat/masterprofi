import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet } from 'react-native';
import { LeaderboardEntry } from '../../types/mlm';
import { getFirstChar } from '../../utils/stringHelpers';
import { colors, typography, spacing, borderRadius } from '../../theme';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
  metric: 'sales' | 'referrals' | 'earnings' | 'teamSize';
}

const METRIC_LABELS = {
  sales: 'Продажи',
  referrals: 'Рефералы',
  earnings: 'Доходы',
  teamSize: 'Размер команды',
};

export const Leaderboard: React.FC<LeaderboardProps> = ({
  entries,
  currentUserId,
  metric,
}) => {
  const formatScore = (score: number, metric: string) => {
    if (metric === 'earnings') {
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0,
      }).format(score);
    }
    return score.toLocaleString();
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  const getRankBackground = (rank: number) => {
    if (rank <= 3) return colors.warning[100];
    return colors.background.primary;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Рейтинг</Text>
        <Text style={styles.metricLabel}>{METRIC_LABELS[metric]}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {entries.map((entry, index) => {
          const isCurrentUser = entry.memberId === currentUserId;
          const rankIcon = getRankIcon(entry.rank);

          return (
            <View
              key={entry.memberId}
              style={[
                styles.entry,
                isCurrentUser
                  ? styles.entryCurrentUser
                  : { backgroundColor: getRankBackground(entry.rank) },
              ]}
            >
              {/* Rank */}
              <View style={styles.rankContainer}>
                {rankIcon ? (
                  <Text style={styles.rankIcon}>{rankIcon}</Text>
                ) : (
                  <Text
                    style={[
                      styles.rankNumber,
                      isCurrentUser && styles.rankNumberCurrentUser,
                    ]}
                  >
                    #{entry.rank}
                  </Text>
                )}
                {entry.change && entry.change !== 0 && (
                  <Text
                    style={[
                      styles.rankChange,
                      entry.change > 0 ? styles.rankChangeUp : styles.rankChangeDown,
                    ]}
                  >
                    {entry.change > 0 ? '↑' : '↓'} {Math.abs(entry.change)}
                  </Text>
                )}
              </View>

              {/* Avatar */}
              {entry.memberAvatar ? (
                <Image
                  source={{ uri: entry.memberAvatar }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {getFirstChar(entry.memberName)}
                  </Text>
                </View>
              )}

              {/* Name and Score */}
              <View style={styles.infoContainer}>
                <View style={styles.nameRow}>
                  <Text
                    style={[
                      styles.memberName,
                      isCurrentUser && styles.memberNameCurrentUser,
                    ]}
                  >
                    {entry.memberName}
                  </Text>
                  {isCurrentUser && (
                    <View style={styles.youBadge}>
                      <Text style={styles.youBadgeText}>Вы</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.score}>
                  {formatScore(entry.score, metric)}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.heading.h3,
    color: colors.text.primary,
    fontWeight: '600',
  },
  metricLabel: {
    ...typography.body.small,
    color: colors.text.tertiary,
  },
  entry: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  entryCurrentUser: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[300],
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
  },
  rankIcon: {
    fontSize: 24,
  },
  rankNumber: {
    ...typography.body.medium,
    fontWeight: '700',
    color: colors.text.secondary,
  },
  rankNumberCurrentUser: {
    color: colors.primary[600],
  },
  rankChange: {
    ...typography.body.xsmall,
    marginTop: spacing.xs,
  },
  rankChangeUp: {
    color: colors.success[600],
  },
  rankChangeDown: {
    color: colors.error[600],
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  avatarText: {
    ...typography.body.medium,
    color: colors.text.inverse,
    fontWeight: '600',
  },
  infoContainer: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  memberName: {
    ...typography.body.medium,
    fontWeight: '600',
    color: colors.text.primary,
  },
  memberNameCurrentUser: {
    color: colors.primary[900],
  },
  youBadge: {
    marginLeft: spacing.xs,
    backgroundColor: colors.primary[600],
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  youBadgeText: {
    ...typography.body.xsmall,
    color: colors.text.inverse,
    fontWeight: '600',
  },
  score: {
    ...typography.body.small,
    fontWeight: '600',
    color: colors.text.secondary,
  },
});
