import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { IncomeBreakdown as IncomeBreakdownType } from '../../types/earnings';
import { getFirstChar } from '../../utils/stringHelpers';
import { Svg, Rect, Circle } from 'react-native-svg';
import { colors, typography, spacing, borderRadius } from '../../theme';

interface IncomeBreakdownProps {
  breakdown: IncomeBreakdownType;
}

const INCOME_COLORS = {
  serviceFees: colors.primary[600],
  commissions: colors.success[600],
  bonuses: colors.warning[600],
  referrals: colors.secondary[600],
};

export const IncomeBreakdown: React.FC<IncomeBreakdownProps> = ({ breakdown }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>(breakdown.period);
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'short',
    });
  };

  const breakdownItems = [
    { key: 'serviceFees', label: 'Плата за услуги', color: INCOME_COLORS.serviceFees },
    { key: 'commissions', label: 'Комиссии', color: INCOME_COLORS.commissions },
    { key: 'bonuses', label: 'Бонусы', color: INCOME_COLORS.bonuses },
    { key: 'referrals', label: 'Рефералы', color: INCOME_COLORS.referrals },
  ];

  const maxValue = Math.max(...breakdownItems.map((item) => breakdown[item.key as keyof IncomeBreakdownType] as number), 1);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Разбивка дохода</Text>
        <View style={styles.periodButtons}>
          {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((period) => (
            <TouchableOpacity
              key={period}
              onPress={() => setSelectedPeriod(period)}
              style={[
                styles.periodButton,
                selectedPeriod === period ? styles.periodButtonSelected : styles.periodButtonUnselected,
              ]}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === period ? styles.periodButtonTextSelected : styles.periodButtonTextUnselected,
                ]}
              >
                {getFirstChar(period)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Period Range */}
      <View style={styles.periodRange}>
        <Text style={styles.periodRangeText}>
          {formatDate(breakdown.periodStart)} - {formatDate(breakdown.periodEnd)}
        </Text>
      </View>

      {/* Total */}
      <View style={styles.totalSection}>
        <Text style={styles.totalAmount}>
          {formatCurrency(breakdown.total)}
        </Text>
        <Text style={styles.totalLabel}>Общий доход</Text>
      </View>

      {/* Breakdown Chart */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chartContainer}>
        <View style={styles.chart}>
          {breakdownItems.map((item) => {
            const value = breakdown[item.key as keyof IncomeBreakdownType] as number;
            const percentage = (value / breakdown.total) * 100;
            const barHeight = (value / maxValue) * 100;

            return (
              <View key={item.key} style={styles.chartItem}>
                <View style={styles.barContainer}>
                  <Svg width={50} height={130}>
                    <Rect
                      x="10"
                      y={130 - barHeight}
                      width="30"
                      height={barHeight}
                      fill={item.color}
                      rx={4}
                    />
                  </Svg>
                </View>
                <Text style={styles.chartValue}>{formatCurrency(value)}</Text>
                <Text style={styles.chartLabel}>{item.label}</Text>
                <Text style={styles.chartPercentage}>{percentage.toFixed(1)}%</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Legend */}
      <View style={styles.legend}>
        {breakdownItems.map((item) => {
          const value = breakdown[item.key as keyof IncomeBreakdownType] as number;
          return (
            <View key={item.key} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: item.color }]} />
              <Text style={styles.legendText}>{item.label}</Text>
              <Text style={styles.legendValue}>{formatCurrency(value)}</Text>
            </View>
          );
        })}
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
  periodButtons: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  periodButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  periodButtonSelected: {
    backgroundColor: colors.primary[600],
  },
  periodButtonUnselected: {
    backgroundColor: colors.gray[100],
  },
  periodButtonText: {
    ...typography.body.xsmall,
    fontWeight: '600',
  },
  periodButtonTextSelected: {
    color: colors.text.inverse,
  },
  periodButtonTextUnselected: {
    color: colors.text.secondary,
  },
  periodRange: {
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  periodRangeText: {
    ...typography.body.small,
    color: colors.text.tertiary,
  },
  totalSection: {
    marginBottom: spacing.md,
  },
  totalAmount: {
    ...typography.heading.h1,
    color: colors.text.primary,
    fontWeight: '700',
  },
  totalLabel: {
    ...typography.body.small,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  chartContainer: {
    marginBottom: spacing.md,
  },
  chart: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  chartItem: {
    alignItems: 'center',
    minWidth: 70,
  },
  barContainer: {
    justifyContent: 'flex-end',
    height: 128,
    marginBottom: spacing.xs,
  },
  chartValue: {
    ...typography.body.xsmall,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  chartLabel: {
    ...typography.body.xsmall,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  chartPercentage: {
    ...typography.body.xsmall,
    color: colors.primary[600],
    fontWeight: '600',
  },
  legend: {
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingTop: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.xs,
  },
  legendText: {
    ...typography.body.small,
    color: colors.text.secondary,
    flex: 1,
  },
  legendValue: {
    ...typography.body.small,
    color: colors.text.primary,
    fontWeight: '600',
  },
});
