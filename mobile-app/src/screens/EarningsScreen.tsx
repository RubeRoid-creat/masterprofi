import React, { useState } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Text,
  StyleSheet,
} from 'react-native';
import { colors, typography, spacing } from '../theme';
import { useAppSelector } from '../store/hooks';
import {
  EarningsBalance,
  IncomeBreakdown,
  Transaction,
  TransactionFilters,
  PaymentMethod,
  TaxCalculation,
  EarningsProjection,
} from '../types/earnings';
import { BalanceDisplay } from '../components/earnings/BalanceDisplay';
import { IncomeBreakdown as IncomeBreakdownComponent } from '../components/earnings/IncomeBreakdown';
import { PaymentHistory } from '../components/earnings/PaymentHistory';
import { WithdrawalRequest } from '../components/earnings/WithdrawalRequest';
import { TaxCalculator } from '../components/earnings/TaxCalculator';
import { EarningsProjectionComponent } from '../components/earnings/EarningsProjection';
import { PaymentMethodsManager } from '../components/earnings/PaymentMethodsManager';

interface EarningsScreenProps {
  userId?: string;
}

export const EarningsScreen: React.FC<EarningsScreenProps> = ({ userId }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState<TransactionFilters>({});

  // Get current user ID from Redux store
  const authUser = useAppSelector((state) => state.auth.user);
  const currentUserId = userId || authUser?.id;

  // Get payments/earnings data from API
  // TODO: Create payments API endpoint in backend and use it here
  // For now, show empty state if no data

  const balance: EarningsBalance | null = null; // Will be loaded from API
  const incomeBreakdown: IncomeBreakdown | null = null; // Will be loaded from API
  const transactions: Transaction[] = []; // Will be loaded from API
  const paymentMethods: PaymentMethod[] = []; // Will be loaded from API
  const projections: EarningsProjection[] = []; // Will be loaded from API

  if (!currentUserId) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Требуется авторизация</Text>
      </View>
    );
  }

  // Show empty state if no data available
  if (!balance) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Нет данных о доходах</Text>
        <Text style={styles.emptySubtext}>
          Данные будут отображаться после выполнения заказов
        </Text>
      </View>
    );
  }


  const handleRefresh = async () => {
    setRefreshing(true);
    // TODO: Refetch data from API
    // await refetchBalance();
    // await refetchTransactions();
    setRefreshing(false);
  };

  const handleWithdrawalRequest = async (amount: number, paymentMethodId: string) => {
    // API call to submit withdrawal request
    console.log('Withdrawal request:', { amount, paymentMethodId });
    await new Promise((resolve) => setTimeout(resolve, 1500));
  };

  const handleTaxCalculate = (calculation: TaxCalculation) => {
    console.log('Tax calculation:', calculation);
    // Save or use tax calculation
  };

  const filteredTransactions = transactions.filter((t) => {
    if (filters.type && !filters.type.includes(t.type)) return false;
    if (filters.status && !filters.status.includes(t.status)) return false;
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      if (!t.description.toLowerCase().includes(query)) return false;
    }
    return true;
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {balance && (
        <>
          {/* Balance */}
          <BalanceDisplay
            balance={balance}
            onWithdraw={() => {}}
          />

          {/* Income Breakdown */}
          {incomeBreakdown && (
            <>
              <IncomeBreakdownComponent breakdown={incomeBreakdown} />

              {/* Earnings Projections */}
              {projections.length > 0 && (
                <EarningsProjectionComponent
                  projections={projections}
                  currentEarnings={incomeBreakdown.total}
                />
              )}

              {/* Withdrawal Request */}
              <WithdrawalRequest
                availableBalance={balance.available}
                paymentMethods={paymentMethods}
                onRequest={handleWithdrawalRequest}
              />

              {/* Payment Methods */}
              {paymentMethods.length > 0 && (
                <PaymentMethodsManager
                  paymentMethods={paymentMethods}
                  onAdd={() => console.log('Add payment method')}
                  onEdit={(method) => console.log('Edit:', method)}
                  onDelete={(id) => console.log('Delete:', id)}
                  onSetDefault={(id) => console.log('Set default:', id)}
                />
              )}

              {/* Tax Calculator */}
              <TaxCalculator
                earnings={incomeBreakdown.total}
                period="Current Month"
                onCalculate={handleTaxCalculate}
              />
            </>
          )}

          {/* Payment History */}
          {filteredTransactions.length > 0 && (
            <PaymentHistory
              transactions={filteredTransactions}
              filters={filters}
              onFiltersChange={setFilters}
            />
          )}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  content: {
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background.primary,
  },
  emptyText: {
    ...typography.heading.h3,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    ...typography.body.medium,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});

