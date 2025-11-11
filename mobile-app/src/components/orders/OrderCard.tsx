import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  PanResponder,
  Image,
  StyleSheet,
} from 'react-native';
import { OrderStatus } from '../../types/order';
import { getFirstChar } from '../../utils/stringHelpers';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { StyledButton } from '../common/StyledButton';

export interface OrderCardProps {
  orderId: string;
  clientName: string;
  applianceType: string;
  address: string;
  distance: number;
  price: number;
  status: OrderStatus;
  urgency: 'low' | 'medium' | 'high';
  onPress: () => void;
  clientRating?: number;
  clientAvatar?: string;
  onAccept?: () => void;
  onDecline?: () => void;
  currency?: string;
}

export const OrderCard = React.memo<OrderCardProps>(({
  orderId,
  clientName,
  applianceType,
  address,
  distance,
  price,
  status,
  urgency,
  onPress,
  clientRating,
  clientAvatar,
  onAccept,
  onDecline,
  currency = 'RUB',
}) => {
  const pan = useRef(new Animated.ValueXY()).current;
  const swipeThreshold = 80;

  const formatDistance = (km: number): string => {
    if (km < 1) {
      return `${Math.round(km * 1000)} m`;
    }
    return `${km.toFixed(1)} km`;
  };

  const estimateTravelTime = (km: number): string => {
    // Assume average speed of 30 km/h in city
    const minutes = Math.round((km / 30) * 60);
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
  };

  const formatPrice = (amount: number, currencyCode: string): string => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatRating = (rating?: number): string => {
    if (!rating) return '—';
    return rating.toFixed(1);
  };

  const getStatusConfig = (orderStatus: OrderStatus) => {
    switch (orderStatus) {
      case 'new':
        return {
          label: 'Новый',
          backgroundColor: colors.success[50],
          textColor: colors.success[700],
          borderColor: colors.success[200],
        };
      case 'assigned':
        return {
          label: 'Назначен',
          backgroundColor: colors.primary[50],
          textColor: colors.primary[700],
          borderColor: colors.primary[200],
        };
      case 'in_progress':
        return {
          label: 'В работе',
          backgroundColor: colors.warning[50],
          textColor: colors.warning[700],
          borderColor: colors.warning[200],
        };
      case 'completed':
        return {
          label: 'Завершен',
          backgroundColor: colors.gray[100],
          textColor: colors.gray[700],
          borderColor: colors.gray[300],
        };
      case 'cancelled':
        return {
          label: 'Отменен',
          backgroundColor: colors.error[50],
          textColor: colors.error[700],
          borderColor: colors.error[200],
        };
      default:
        return {
          label: orderStatus,
          backgroundColor: colors.gray[100],
          textColor: colors.gray[700],
          borderColor: colors.gray[300],
        };
    }
  };

  const getUrgencyConfig = (urgencyLevel: 'low' | 'medium' | 'high') => {
    switch (urgencyLevel) {
      case 'high':
        return {
          label: 'Высокий приоритет',
          backgroundColor: colors.error[50],
          textColor: colors.error[700],
          borderColor: colors.error[200],
          dotColor: colors.error[500],
        };
      case 'medium':
        return {
          label: 'Средний приоритет',
          backgroundColor: colors.warning[50],
          textColor: colors.warning[700],
          borderColor: colors.warning[200],
          dotColor: colors.warning[500],
        };
      case 'low':
        return {
          label: 'Низкий приоритет',
          backgroundColor: colors.success[50],
          textColor: colors.success[700],
          borderColor: colors.success[200],
          dotColor: colors.success[500],
        };
    }
  };

  const statusConfig = getStatusConfig(status);
  const urgencyConfig = getUrgencyConfig(urgency);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10 || Math.abs(gestureState.dy) > 10;
      },
      onPanResponderGrant: () => {
        pan.setOffset({
          x: (pan.x as any)._value,
          y: (pan.y as any)._value,
        });
      },
      onPanResponderMove: (_, gestureState) => {
        // Only allow horizontal swiping
        pan.setValue({ x: gestureState.dx, y: 0 });
      },
      onPanResponderRelease: (_, gestureState) => {
        pan.flattenOffset();
        
        if (gestureState.dx > swipeThreshold && onAccept) {
          // Swipe right - Accept
          Animated.spring(pan, {
            toValue: { x: 300, y: 0 },
            useNativeDriver: false,
          }).start(() => {
            onAccept();
            pan.setValue({ x: 0, y: 0 });
          });
        } else if (gestureState.dx < -swipeThreshold && onDecline) {
          // Swipe left - Decline
          Animated.spring(pan, {
            toValue: { x: -300, y: 0 },
            useNativeDriver: false,
          }).start(() => {
            onDecline();
            pan.setValue({ x: 0, y: 0 });
          });
        } else {
          // Snap back
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  const cardStyle = {
    transform: [
      {
        translateX: pan.x,
      },
    ],
  };

  const leftActionOpacity = pan.x.interpolate({
    inputRange: [-100, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const rightActionOpacity = pan.x.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      {/* Swipe Actions Background */}
      <View style={styles.swipeActionsContainer}>
        {/* Decline Action (Left) */}
        {onDecline && (
          <Animated.View
            style={[styles.swipeAction, styles.declineAction, { opacity: leftActionOpacity }]}
          >
            <Text style={styles.swipeActionText}>Отклонить</Text>
          </Animated.View>
        )}

        {/* Accept Action (Right) */}
        {onAccept && (
          <Animated.View
            style={[styles.swipeAction, styles.acceptAction, { opacity: rightActionOpacity }]}
          >
            <Text style={styles.swipeActionText}>Принять</Text>
          </Animated.View>
        )}
      </View>

      {/* Main Card */}
      <Animated.View
        {...panResponder.panHandlers}
        style={[styles.card, cardStyle]}
        accessibilityRole="button"
        accessibilityLabel={`Заказ ${orderId} от ${clientName}, ${applianceType}, ${formatPrice(price, currency)}`}
        accessibilityHint="Двойное нажатие для просмотра деталей заказа"
      >
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.7}
          style={styles.cardContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.clientSection}>
              {/* Client Avatar */}
              {clientAvatar ? (
                <Image
                  source={{ uri: clientAvatar }}
                  style={styles.avatar}
                  accessibilityLabel={`Аватар ${clientName}`}
                />
              ) : (
                <View
                  style={styles.avatarPlaceholder}
                  accessibilityLabel={`Аватар ${clientName}`}
                >
                  <Text style={styles.avatarText}>
                    {getFirstChar(clientName)}
                  </Text>
                </View>
              )}

              {/* Client Info */}
              <View style={styles.clientInfo}>
                <View style={styles.clientNameRow}>
                  <Text
                    style={styles.clientName}
                    numberOfLines={1}
                    accessibilityLabel={`Клиент: ${clientName}`}
                  >
                    {clientName}
                  </Text>
                  {clientRating !== undefined && (
                    <View style={styles.ratingBadge}>
                      <Text style={styles.ratingIcon}>⭐</Text>
                      <Text
                        style={styles.ratingText}
                        accessibilityLabel={`Рейтинг клиента: ${formatRating(clientRating)}`}
                      >
                        {formatRating(clientRating)}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.orderIdRow}>
                  <Text
                    style={styles.orderIdLabel}
                    accessibilityLabel={`ID заказа: ${orderId}`}
                  >
                    Заказ #{orderId}
                  </Text>
                </View>
              </View>
            </View>

            {/* Status Badge */}
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: statusConfig.backgroundColor,
                  borderColor: statusConfig.borderColor,
                },
              ]}
              accessibilityLabel={`Статус заказа: ${statusConfig.label}`}
            >
              <Text style={[styles.statusText, { color: statusConfig.textColor }]}>
                {statusConfig.label}
              </Text>
            </View>
          </View>

          {/* Appliance Info */}
          <View style={styles.applianceSection}>
            <Text
              style={styles.applianceType}
              accessibilityLabel={`Тип техники: ${applianceType}`}
            >
              {applianceType}
            </Text>
            <View style={styles.addressRow}>
              <Text style={styles.addressIcon}>📍</Text>
              <Text
                style={styles.address}
                numberOfLines={2}
                accessibilityLabel={`Адрес: ${address}`}
              >
                {address}
              </Text>
            </View>
          </View>

          {/* Details Row */}
          <View style={styles.detailsRow}>
            {/* Distance & Time */}
            <View style={styles.metricsContainer}>
              <View style={styles.metricBadge}>
                <Text style={styles.metricLabel}>Расстояние</Text>
                <Text
                  style={styles.metricValue}
                  accessibilityLabel={`Расстояние: ${formatDistance(distance)}`}
                >
                  {formatDistance(distance)}
                </Text>
              </View>
              <View style={[styles.metricBadge, styles.metricBadgeSecondary]}>
                <Text style={styles.metricLabel}>Время в пути</Text>
                <Text
                  style={[styles.metricValue, styles.metricValueSecondary]}
                  accessibilityLabel={`Примерное время в пути: ${estimateTravelTime(distance)}`}
                >
                  {estimateTravelTime(distance)}
                </Text>
              </View>
            </View>

            {/* Price */}
            <View style={styles.priceContainer}>
              <Text
                style={styles.price}
                accessibilityLabel={`Цена: ${formatPrice(price, currency)}`}
              >
                {formatPrice(price, currency)}
              </Text>
            </View>
          </View>

          {/* Urgency Indicator */}
          {urgency === 'high' && (
            <View
              style={[
                styles.urgencyIndicator,
                {
                  backgroundColor: urgencyConfig.backgroundColor,
                  borderColor: urgencyConfig.borderColor,
                },
              ]}
              accessibilityLabel="Заказ с высоким приоритетом"
            >
              <View style={[styles.urgencyDot, { backgroundColor: urgencyConfig.dotColor }]} />
              <Text style={[styles.urgencyText, { color: urgencyConfig.textColor }]}>
                {urgencyConfig.label}
              </Text>
            </View>
          )}

          {/* Quick Actions */}
          {status === 'new' && (onAccept || onDecline) && (
            <View style={styles.actionsRow}>
              {onDecline && (
                <StyledButton
                  title="Отклонить"
                  onPress={onDecline}
                  variant="outline"
                  size="large"
                  style={{ flex: 1 }}
                  textStyle={{ color: colors.error[600], fontWeight: '700' }}
                />
              )}
              {onAccept && (
                <StyledButton
                  title="Принять заказ"
                  onPress={onAccept}
                  variant="primary"
                  size="large"
                  style={{ flex: 2 }}
                  textStyle={{ fontWeight: '700', fontSize: 16 }}
                />
              )}
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for React.memo optimization
  return (
    prevProps.orderId === nextProps.orderId &&
    prevProps.status === nextProps.status &&
    prevProps.price === nextProps.price &&
    prevProps.distance === nextProps.distance &&
    prevProps.urgency === nextProps.urgency &&
    prevProps.clientName === nextProps.clientName &&
    prevProps.applianceType === nextProps.applianceType &&
    prevProps.address === nextProps.address &&
    prevProps.clientRating === nextProps.clientRating &&
    prevProps.clientAvatar === nextProps.clientAvatar
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
    position: 'relative',
  },
  swipeActionsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
  },
  swipeAction: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.lg,
  },
  declineAction: {
    backgroundColor: colors.error[600],
  },
  acceptAction: {
    backgroundColor: colors.success[600],
  },
  swipeActionText: {
    ...typography.button.large,
    color: colors.text.inverse,
    fontWeight: '700',
  },
  card: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    borderWidth: 0,
    overflow: 'hidden',
    ...shadows.lg,
  },
  cardContent: {
    padding: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  clientSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    marginRight: spacing.md,
    borderWidth: 2,
    borderColor: colors.border.light,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    ...typography.heading.h4,
    color: colors.text.inverse,
  },
  clientInfo: {
    flex: 1,
  },
  clientNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  clientName: {
    ...typography.heading.h3,
    fontWeight: '700',
    color: colors.text.primary,
    marginRight: spacing.sm,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.warning[300],
  },
  ratingIcon: {
    fontSize: 14,
    marginRight: spacing.xs / 2,
  },
  ratingText: {
    ...typography.label.small,
    fontWeight: '700',
    color: colors.warning[800],
  },
  orderIdRow: {
    marginTop: spacing.xs,
  },
  orderIdLabel: {
    ...typography.body.small,
    color: colors.text.tertiary,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 0,
    minWidth: 80,
    alignItems: 'center',
  },
  statusText: {
    ...typography.label.medium,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  applianceSection: {
    marginBottom: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  applianceType: {
    ...typography.heading.h2,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    fontWeight: '700',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  addressIconContainer: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  addressIcon: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  address: {
    ...typography.body.medium,
    color: colors.text.secondary,
    flex: 1,
    lineHeight: 22,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  metricsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  metricBadge: {
    backgroundColor: colors.primary[50],
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    minWidth: 80,
    alignItems: 'center',
  },
  metricBadgeSecondary: {
    backgroundColor: colors.success[50],
  },
  metricLabel: {
    ...typography.body.xsmall,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metricValue: {
    ...typography.heading.h4,
    fontWeight: '700',
    color: colors.primary[700],
  },
  metricValueSecondary: {
    color: colors.success[700],
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    ...typography.display.medium,
    color: colors.text.primary,
    fontWeight: '800',
  },
  urgencyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    borderWidth: 2,
  },
  urgencyDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.sm,
  },
  urgencyText: {
    ...typography.label.medium,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
});

OrderCard.displayName = 'OrderCard';
