import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Modal, StyleSheet, ScrollView } from 'react-native';
import { Transaction, TransactionFilters } from '../../types/earnings';
import { TransactionDetails } from './TransactionDetails';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { StyledButton } from '../common/StyledButton';
import { StyledInput } from '../common/StyledInput';

interface PaymentHistoryProps {
  transactions: Transaction[];
  filters: TransactionFilters;
  onFiltersChange: (filters: TransactionFilters) => void;
  onTransactionPress?: (transaction: Transaction) => void;
}

export const PaymentHistory: React.FC<PaymentHistoryProps> = ({
  transactions,
  filters,
  onFiltersChange,
  onTransactionPress,
}) => {
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTypeIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'income':
        return '💰';
      case 'withdrawal':
        return '💸';
      case 'refund':
        return '↩️';
      case 'bonus':
        return '🎁';
      case 'commission':
        return '💼';
      default:
        return '💳';
    }
  };

  const getStatusColors = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return { bg: colors.success[100], text: colors.success[800] };
      case 'pending':
        return { bg: colors.warning[100], text: colors.warning[800] };
      case 'failed':
        return { bg: colors.error[100], text: colors.error[800] };
      case 'cancelled':
        return { bg: colors.gray[100], text: colors.gray[800] };
      default:
        return { bg: colors.gray[100], text: colors.gray[800] };
    }
  };

  const getFilterCount = () => {
    let count = 0;
    if (filters.type && filters.type.length > 0) count++;
    if (filters.status && filters.status.length > 0) count++;
    if (filters.dateFrom || filters.dateTo) count++;
    if (filters.minAmount || filters.maxAmount) count++;
    if (filters.searchQuery) count++;
    return count;
  };

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const isIncome = item.type === 'income' || item.type === 'commission' || item.type === 'bonus';
    const statusColors = getStatusColors(item.status);

    return (
      <TouchableOpacity
        onPress={() => {
          setSelectedTransaction(item);
          onTransactionPress?.(item);
        }}
        style={styles.transactionCard}
      >
        <View style={styles.transactionRow}>
          <View style={styles.transactionLeft}>
            <View style={styles.iconContainer}>
              <Text style={styles.iconText}>{getTypeIcon(item.type)}</Text>
            </View>
            <View style={styles.transactionInfo}>
              <Text style={styles.transactionDescription} numberOfLines={1}>
                {item.description}
              </Text>
              <Text style={styles.transactionDate}>{formatDate(item.timestamp)}</Text>
            </View>
          </View>
          <View style={styles.transactionRight}>
            <Text
              style={[
                styles.transactionAmount,
                isIncome ? styles.transactionAmountIncome : styles.transactionAmountExpense,
              ]}
            >
              {isIncome ? '+' : '-'}
              {formatCurrency(Math.abs(item.amount), item.currency)}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
              <Text style={[styles.statusText, { color: statusColors.text }]}>
                {item.status === 'completed' ? 'Завершено' :
                 item.status === 'pending' ? 'В обработке' :
                 item.status === 'failed' ? 'Ошибка' : 'Отменено'}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>История платежей</Text>
        <TouchableOpacity
          onPress={() => setIsFilterModalVisible(true)}
          style={styles.filterButton}
        >
          <Text style={styles.filterButtonText}>Фильтр</Text>
          {getFilterCount() > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{getFilterCount()}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {transactions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Транзакции не найдены</Text>
          <Text style={styles.emptySubtext}>Попробуйте изменить фильтры</Text>
        </View>
      ) : (
        <FlatList
          data={transactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          ListFooterComponent={<View style={styles.footer} />}
        />
      )}

      {/* Filter Modal */}
      <FilterModal
        visible={isFilterModalVisible}
        filters={filters}
        onClose={() => setIsFilterModalVisible(false)}
        onApply={(newFilters) => {
          onFiltersChange(newFilters);
          setIsFilterModalVisible(false);
        }}
      />

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <TransactionDetails
          transaction={selectedTransaction}
          visible={!!selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}
    </View>
  );
};

// Filter Modal Component
const FilterModal: React.FC<{
  visible: boolean;
  filters: TransactionFilters;
  onClose: () => void;
  onApply: (filters: TransactionFilters) => void;
}> = ({ visible, filters, onClose, onApply }) => {
  const [localFilters, setLocalFilters] = useState<TransactionFilters>(filters);

  const transactionTypes: Transaction['type'][] = ['income', 'withdrawal', 'refund', 'bonus', 'commission'];
  const transactionStatuses: Transaction['status'][] = ['pending', 'completed', 'failed', 'cancelled'];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Фильтры</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.modalCloseText}>Закрыть</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <Text style={styles.modalSectionTitle}>Тип транзакции</Text>
          <View style={styles.filterTags}>
            {transactionTypes.map((type) => {
              const isSelected = localFilters.type?.includes(type);
              return (
                <TouchableOpacity
                  key={type}
                  onPress={() => {
                    const current = localFilters.type || [];
                    setLocalFilters({
                      ...localFilters,
                      type: isSelected
                        ? current.filter((t) => t !== type)
                        : [...current, type],
                    });
                  }}
                  style={[
                    styles.filterTag,
                    isSelected ? styles.filterTagSelected : styles.filterTagUnselected,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterTagText,
                      isSelected ? styles.filterTagTextSelected : styles.filterTagTextUnselected,
                    ]}
                  >
                    {type === 'income' ? 'Доход' :
                     type === 'withdrawal' ? 'Вывод' :
                     type === 'refund' ? 'Возврат' :
                     type === 'bonus' ? 'Бонус' : 'Комиссия'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <StyledButton
            title="Применить фильтры"
            onPress={() => onApply(localFilters)}
            variant="primary"
            size="large"
            style={styles.applyButton}
          />
        </ScrollView>
      </View>
    </Modal>
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
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  filterButtonText: {
    ...typography.body.medium,
    color: colors.primary[600],
    fontWeight: '600',
    marginRight: spacing.xs,
  },
  filterBadge: {
    backgroundColor: colors.primary[600],
    borderRadius: borderRadius.full,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    ...typography.body.xsmall,
    color: colors.text.inverse,
    fontWeight: '700',
  },
  emptyContainer: {
    paddingVertical: spacing['3xl'],
    alignItems: 'center',
  },
  emptyText: {
    ...typography.heading.h3,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    ...typography.body.small,
    color: colors.text.disabled,
  },
  transactionCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  iconText: {
    fontSize: 24,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    ...typography.body.medium,
    fontWeight: '600',
    color: colors.text.primary,
  },
  transactionDate: {
    ...typography.body.small,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    ...typography.heading.h3,
    fontWeight: '700',
  },
  transactionAmountIncome: {
    color: colors.success[600],
  },
  transactionAmountExpense: {
    color: colors.error[600],
  },
  statusBadge: {
    marginTop: spacing.xs,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  statusText: {
    ...typography.body.xsmall,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  footer: {
    height: spacing.md,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  modalTitle: {
    ...typography.heading.h2,
    color: colors.text.primary,
    fontWeight: '600',
  },
  modalCloseText: {
    ...typography.body.medium,
    color: colors.primary[600],
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: spacing.md,
  },
  modalSectionTitle: {
    ...typography.heading.h3,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  filterTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.xl,
  },
  filterTag: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 2,
  },
  filterTagSelected: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },
  filterTagUnselected: {
    backgroundColor: colors.background.primary,
    borderColor: colors.border.default,
  },
  filterTagText: {
    ...typography.body.small,
    fontWeight: '600',
  },
  filterTagTextSelected: {
    color: colors.text.inverse,
  },
  filterTagTextUnselected: {
    color: colors.text.secondary,
  },
  applyButton: {
    marginTop: spacing.md,
  },
});
