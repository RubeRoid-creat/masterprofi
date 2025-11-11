import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { EarningsBalance } from '../../types/earnings';
import { colors, typography, spacing, borderRadius } from '../../theme';

interface BalanceDisplayProps {
  balance: EarningsBalance;
  onWithdraw?: () => void;
}

export const BalanceDisplay: React.FC<BalanceDisplayProps> = ({
  balance,
  onWithdraw,
}) => {
  const formatCurrency = (amount: number, currency: string = 'RUB') => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerLabel}>Общий баланс</Text>
        <TouchableOpacity onPress={() => {}}>
          <Text style={styles.infoIcon}>💡</Text>
        </TouchableOpacity>
      </View>

      {/* Current Balance */}
      <View style={styles.balanceSection}>
        <Text style={styles.balanceAmount}>
          {formatCurrency(balance.current, balance.currency)}
        </Text>
        <Text style={styles.availableLabel}>
          Доступно: {formatCurrency(balance.available, balance.currency)}
        </Text>
      </View>

      {/* Breakdown */}
      <View style={styles.breakdown}>
        <View style={styles.breakdownItem}>
          <Text style={styles.breakdownLabel}>Доступно</Text>
          <Text style={styles.breakdownValue}>
            {formatCurrency(balance.available, balance.currency)}
          </Text>
        </View>
        <View style={styles.breakdownItem}>
          <Text style={styles.breakdownLabel}>В обработке</Text>
          <Text style={styles.breakdownValue}>
            {formatCurrency(balance.pending, balance.currency)}
          </Text>
        </View>
        {balance.onHold > 0 && (
          <View style={styles.breakdownItem}>
            <Text style={styles.breakdownLabel}>Заблокировано</Text>
            <Text style={styles.breakdownValue}>
              {formatCurrency(balance.onHold, balance.currency)}
            </Text>
          </View>
        )}
      </View>

      {/* Withdraw Button */}
      {onWithdraw && balance.available > 0 && (
        <TouchableOpacity
          onPress={onWithdraw}
          style={styles.withdrawButton}
        >
          <Text style={styles.withdrawButtonText}>Вывести средства</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary[600],
    borderRadius: borderRadius['2xl'],
    padding: spacing['2xl'],
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  headerLabel: {
    ...typography.body.small,
    color: colors.text.inverse,
    opacity: 0.8,
  },
  infoIcon: {
    ...typography.body.small,
    color: colors.text.inverse,
    opacity: 0.8,
  },
  balanceSection: {
    marginBottom: spacing['2xl'],
  },
  balanceAmount: {
    ...typography.display.large,
    color: colors.text.inverse,
    fontWeight: '800',
    marginBottom: spacing.sm,
  },
  availableLabel: {
    ...typography.body.small,
    color: colors.text.inverse,
    opacity: 0.7,
  },
  breakdown: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  breakdownItem: {
    flex: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  breakdownLabel: {
    ...typography.body.xsmall,
    color: colors.text.inverse,
    opacity: 0.8,
    marginBottom: spacing.xs,
  },
  breakdownValue: {
    ...typography.body.medium,
    color: colors.text.inverse,
    fontWeight: '700',
  },
  withdrawButton: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  withdrawButtonText: {
    ...typography.button.medium,
    color: colors.primary[600],
    fontWeight: '700',
  },
});

