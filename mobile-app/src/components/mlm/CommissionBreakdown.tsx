import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { CommissionLevel } from '../../types/mlm';
import { Svg, Rect, Text as SvgText } from 'react-native-svg';
import { colors, typography, spacing, borderRadius } from '../../theme';

interface CommissionBreakdownProps {
  commissions: CommissionLevel[];
}

export const CommissionBreakdown: React.FC<CommissionBreakdownProps> = ({
  commissions,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const maxCommission = Math.max(...commissions.map((c) => c.commission), 0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Комиссии по уровням
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.chart}>
          {commissions.map((level, index) => {
            const barHeight = maxCommission > 0 ? (level.commission / maxCommission) * 150 : 0;

            return (
              <View key={level.level} style={styles.chartItem}>
                {/* Bar Chart */}
                <View style={styles.barContainer}>
                  <Svg width={60} height={160}>
                    <Rect
                      x="10"
                      y={160 - barHeight}
                      width="40"
                      height={barHeight}
                      fill={colors.primary[600]}
                      rx={4}
                    />
                    <SvgText
                      x="30"
                      y={150 - barHeight}
                      fontSize="10"
                      fill={colors.text.secondary}
                      textAnchor="middle"
                    >
                      {formatCurrency(level.commission).replace('₽', '')}
                    </SvgText>
                  </Svg>
                </View>

                {/* Level Info */}
                <Text style={styles.levelLabel}>
                  Уровень {level.level}
                </Text>
                <Text style={styles.levelMembers}>
                  {level.members} участников
                </Text>
                <Text style={styles.levelPercentage}>
                  {level.percentage}%
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Detailed List */}
      <View style={styles.detailsList}>
        {commissions.map((level) => (
          <View
            key={level.level}
            style={styles.detailItem}
          >
            <View style={styles.detailLeft}>
              <Text style={styles.detailLevel}>Уровень {level.level}</Text>
              <Text style={styles.detailMembers}>{level.members} участников</Text>
            </View>
            <View style={styles.detailRight}>
              <Text style={styles.detailAmount}>{formatCurrency(level.commission)}</Text>
              <Text style={styles.detailPercent}>{level.percentage}%</Text>
            </View>
          </View>
        ))}
      </View>
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
  title: {
    ...typography.heading.h3,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  chart: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  chartItem: {
    alignItems: 'center',
    minWidth: 80,
  },
  barContainer: {
    justifyContent: 'flex-end',
    height: 160,
    marginBottom: spacing.xs,
  },
  levelLabel: {
    ...typography.body.xsmall,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  levelMembers: {
    ...typography.body.xsmall,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
  },
  levelPercentage: {
    ...typography.body.xsmall,
    fontWeight: '600',
    color: colors.primary[600],
  },
  detailsList: {
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    marginTop: spacing.md,
    paddingTop: spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  detailLeft: {
    flex: 1,
  },
  detailLevel: {
    ...typography.body.small,
    fontWeight: '600',
    color: colors.text.primary,
  },
  detailMembers: {
    ...typography.body.xsmall,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  detailRight: {
    alignItems: 'flex-end',
  },
  detailAmount: {
    ...typography.body.small,
    fontWeight: '600',
    color: colors.text.primary,
  },
  detailPercent: {
    ...typography.body.xsmall,
    color: colors.primary[600],
    marginTop: spacing.xs,
  },
});
