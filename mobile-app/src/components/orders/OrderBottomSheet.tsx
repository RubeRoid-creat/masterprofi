/**
 * Order Bottom Sheet Component
 * Displays order details in a bottom sheet (Yandex Go style)
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Order } from '../../types/order';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { BottomSheet } from '../ui/BottomSheet';
import { StyledButton } from '../common/StyledButton';
import { Badge } from '../ui/Badge';
import { ModernCard } from '../common/ModernCard';

interface OrderBottomSheetProps {
  visible: boolean;
  orders: Order[];
  selectedOrder: Order | null;
  onClose: () => void;
  onOrderSelect: (order: Order) => void;
  onAcceptOrder?: (orderId: string) => void;
  onViewDetails?: (order: Order) => void;
}

const getStatusLabel = (status: Order['status']): string => {
  switch (status) {
    case 'new':
      return 'Новый';
    case 'assigned':
      return 'Назначен';
    case 'in_progress':
      return 'В работе';
    case 'completed':
      return 'Завершен';
    case 'cancelled':
      return 'Отменен';
    default:
      return status;
  }
};

const getStatusColor = (status: Order['status']): string => {
  switch (status) {
    case 'new':
      return colors.status.new;
    case 'assigned':
      return colors.status.assigned;
    case 'in_progress':
      return colors.status.inProgress;
    case 'completed':
      return colors.status.completed;
    case 'cancelled':
      return colors.status.cancelled;
    default:
      return colors.gray[500];
  }
};

export const OrderBottomSheet: React.FC<OrderBottomSheetProps> = ({
  visible,
  orders,
  selectedOrder,
  onClose,
  onOrderSelect,
  onAcceptOrder,
  onViewDetails,
}) => {
  const [snapPointIndex, setSnapPointIndex] = useState(0);

  const handleOrderPress = useCallback(
    (order: Order) => {
      onOrderSelect(order);
      setSnapPointIndex(1); // Expand to show details
    },
    [onOrderSelect]
  );

  const handleAccept = useCallback(() => {
    if (selectedOrder && onAcceptOrder) {
      onAcceptOrder(selectedOrder.id);
    }
  }, [selectedOrder, onAcceptOrder]);

  const handleViewDetails = useCallback(() => {
    if (selectedOrder && onViewDetails) {
      onViewDetails(selectedOrder);
      onClose();
    }
  }, [selectedOrder, onViewDetails, onClose]);

  // If single order selected, show details
  if (selectedOrder) {
    return (
      <BottomSheet
        visible={visible}
        onClose={onClose}
        snapPoints={[300, 500]}
        initialSnapPoint={snapPointIndex}
        title="Детали заказа"
        showHandle
      >
        <ScrollView style={styles.detailsContainer} showsVerticalScrollIndicator={false}>
          {/* Order Header */}
          <ModernCard variant="flat" padding="medium" style={styles.orderHeader}>
            <View style={styles.orderHeaderTop}>
              <View style={styles.orderInfo}>
                <Text style={styles.orderClientName}>{selectedOrder.client.name}</Text>
                <Text style={styles.orderClientPhone}>{selectedOrder.client.phone}</Text>
              </View>
              <Badge
                variant="primary"
                style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedOrder.status) }]}
              >
                {getStatusLabel(selectedOrder.status)}
              </Badge>
            </View>

            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>Стоимость:</Text>
              <Text style={styles.priceValue}>
                {selectedOrder.price.amount} {selectedOrder.price.currency}
              </Text>
            </View>
          </ModernCard>

          {/* Appliance Info */}
          <ModernCard variant="flat" padding="medium" style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Техника</Text>
            <Text style={styles.sectionText}>
              {selectedOrder.appliance.type}
              {selectedOrder.appliance.brand && ` • ${selectedOrder.appliance.brand}`}
              {selectedOrder.appliance.model && ` • ${selectedOrder.appliance.model}`}
            </Text>
            {selectedOrder.appliance.issue && (
              <Text style={styles.sectionSubtext}>{selectedOrder.appliance.issue}</Text>
            )}
          </ModernCard>

          {/* Location Info */}
          <ModernCard variant="flat" padding="medium" style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Адрес</Text>
            <Text style={styles.sectionText}>
              {selectedOrder.location.address}
            </Text>
            <Text style={styles.sectionSubtext}>{selectedOrder.location.city}</Text>
            {selectedOrder.location.distance && (
              <Text style={styles.distanceText}>
                📍 {selectedOrder.location.distance.toFixed(1)} км
              </Text>
            )}
          </ModernCard>

          {/* Notes */}
          {selectedOrder.notes && (
            <ModernCard variant="flat" padding="medium" style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Примечания</Text>
              <Text style={styles.sectionText}>{selectedOrder.notes}</Text>
            </ModernCard>
          )}

          {/* Actions */}
          <View style={styles.actionsContainer}>
            {selectedOrder.status === 'new' && onAcceptOrder && (
              <StyledButton
                variant="primary"
                size="large"
                onPress={handleAccept}
                style={styles.actionButton}
              >
                Принять заказ
              </StyledButton>
            )}
            {onViewDetails && (
              <StyledButton
                variant="outline"
                size="large"
                onPress={handleViewDetails}
                style={styles.actionButton}
              >
                Подробнее
              </StyledButton>
            )}
          </View>
        </ScrollView>
      </BottomSheet>
    );
  }

  // Show list of orders
  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      snapPoints={[200, 400, 600]}
      initialSnapPoint={0}
      title={`Заказы рядом (${orders.length})`}
      showHandle
    >
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleOrderPress(item)}
            activeOpacity={0.7}
          >
            <ModernCard variant="flat" padding="medium" style={styles.orderCard}>
              <View style={styles.orderCardHeader}>
                <View style={styles.orderCardInfo}>
                  <Text style={styles.orderCardClient}>{item.client.name}</Text>
                  <Text style={styles.orderCardAppliance}>{item.appliance.type}</Text>
                  <Text style={styles.orderCardAddress}>
                    📍 {item.location.address}
                  </Text>
                </View>
                <View style={styles.orderCardRight}>
                  <Text style={styles.orderCardPrice}>
                    {item.price.amount} {item.price.currency}
                  </Text>
                  <Badge
                    variant="primary"
                    style={[
                      styles.orderCardBadge,
                      { backgroundColor: getStatusColor(item.status) },
                    ]}
                  >
                    {getStatusLabel(item.status)}
                  </Badge>
                </View>
              </View>
              {item.location.distance && (
                <Text style={styles.orderCardDistance}>
                  {item.location.distance.toFixed(1)} км
                </Text>
              )}
            </ModernCard>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.ordersList}
        showsVerticalScrollIndicator={false}
      />
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  detailsContainer: {
    flex: 1,
  },
  orderHeader: {
    marginBottom: spacing.md,
  },
  orderHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  orderInfo: {
    flex: 1,
  },
  orderClientName: {
    ...typography.heading.h3,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  orderClientPhone: {
    ...typography.body.medium,
    color: colors.text.secondary,
  },
  statusBadge: {
    marginLeft: spacing.md,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  priceLabel: {
    ...typography.body.medium,
    color: colors.text.secondary,
  },
  priceValue: {
    ...typography.heading.h2,
    color: colors.primary[600],
  },
  sectionCard: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.heading.h4,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  sectionText: {
    ...typography.body.medium,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  sectionSubtext: {
    ...typography.body.small,
    color: colors.text.secondary,
  },
  distanceText: {
    ...typography.body.small,
    color: colors.primary[600],
    marginTop: spacing.xs,
  },
  actionsContainer: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  actionButton: {
    width: '100%',
  },
  ordersList: {
    paddingBottom: spacing.xl,
  },
  orderCard: {
    marginBottom: spacing.md,
  },
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderCardInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  orderCardClient: {
    ...typography.heading.h4,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  orderCardAppliance: {
    ...typography.body.medium,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  orderCardAddress: {
    ...typography.body.small,
    color: colors.text.tertiary,
  },
  orderCardRight: {
    alignItems: 'flex-end',
  },
  orderCardPrice: {
    ...typography.heading.h4,
    color: colors.primary[600],
    marginBottom: spacing.xs,
  },
  orderCardBadge: {
    marginTop: spacing.xs,
  },
  orderCardDistance: {
    ...typography.body.small,
    color: colors.primary[600],
    marginTop: spacing.sm,
  },
});

