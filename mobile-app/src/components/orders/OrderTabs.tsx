import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { OrderStatus } from '../../types/order';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';

interface OrderTabsProps {
  activeTab: OrderStatus;
  onTabChange: (tab: OrderStatus) => void;
  newOrdersCount: number;
}

const TABS: Array<{ id: OrderStatus; label: string }> = [
  { id: 'new', label: 'Новые' },
  { id: 'assigned', label: 'Назначенные' },
  { id: 'in_progress', label: 'В работе' },
  { id: 'completed', label: 'Завершенные' },
];

export const OrderTabs: React.FC<OrderTabsProps> = ({
  activeTab,
  onTabChange,
  newOrdersCount,
}) => {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const showBadge = tab.id === 'new' && newOrdersCount > 0;

          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => onTabChange(tab.id)}
              style={[
                styles.tab,
                isActive && styles.tabActive,
              ]}
              activeOpacity={0.7}
            >
              <View style={styles.tabContent}>
                <Text style={[
                  styles.tabText,
                  isActive && styles.tabTextActive,
                ]}>
                  {tab.label}
                </Text>
                {showBadge && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{newOrdersCount}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  tab: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray[100],
    ...shadows.sm,
  },
  tabActive: {
    backgroundColor: colors.primary[600],
    ...shadows.md,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabText: {
    ...typography.label.medium,
    color: colors.text.secondary,
  },
  tabTextActive: {
    color: colors.text.inverse,
    fontWeight: '600',
  },
  badge: {
    marginLeft: spacing.sm,
    backgroundColor: colors.error[500],
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    ...typography.body.xsmall,
    color: colors.text.inverse,
    fontWeight: '700',
  },
});

