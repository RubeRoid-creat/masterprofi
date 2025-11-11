/**
 * Order Map View Component
 * Displays orders on a map with markers
 */

import React, { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import MapView, { Marker, Region, PROVIDER_GOOGLE } from 'react-native-maps';
import { Order } from '../../types/order';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { Badge } from '../ui/Badge';

interface OrderMapViewProps {
  orders: Order[];
  onOrderPress: (order: Order) => void;
  selectedOrder?: Order | null;
  onShowBottomSheet?: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Default region (Moscow)
const DEFAULT_REGION: Region = {
  latitude: 55.7558,
  longitude: 37.6173,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
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

export const OrderMapView: React.FC<OrderMapViewProps> = ({
  orders,
  onOrderPress,
  selectedOrder,
  onShowBottomSheet,
}) => {
  const mapRef = useRef<MapView>(null);
  const [region, setRegion] = useState<Region>(() => {
    if (orders.length > 0 && orders[0].location) {
      return {
        latitude: orders[0].location.latitude,
        longitude: orders[0].location.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    }
    return DEFAULT_REGION;
  });

  const handleMarkerPress = useCallback(
    (order: Order) => {
      onOrderPress(order);
      // Center map on selected order
      if (mapRef.current) {
        mapRef.current.animateToRegion(
          {
            latitude: order.location.latitude,
            longitude: order.location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          },
          500
        );
      }
    },
    [onOrderPress]
  );

  const handleRegionChangeComplete = useCallback((newRegion: Region) => {
    setRegion(newRegion);
  }, []);

  // Center on user location or first order
  const centerOnLocation = useCallback(() => {
    if (orders.length > 0 && orders[0].location && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: orders[0].location.latitude,
          longitude: orders[0].location.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        },
        500
      );
    }
  }, [orders]);

  if (orders.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Нет заказов для отображения на карте</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={region}
        onRegionChangeComplete={handleRegionChangeComplete}
        showsUserLocation
        showsMyLocationButton={false}
        mapType="standard"
      >
        {orders.map((order) => {
          if (!order.location?.latitude || !order.location?.longitude) {
            return null;
          }

          const isSelected = selectedOrder?.id === order.id;
          const statusColor = getStatusColor(order.status);

          return (
            <Marker
              key={order.id}
              coordinate={{
                latitude: order.location.latitude,
                longitude: order.location.longitude,
              }}
              onPress={() => handleMarkerPress(order)}
              pinColor={statusColor}
            >
              <View style={[styles.markerContainer, isSelected && styles.markerSelected]}>
                <View style={[styles.markerDot, { backgroundColor: statusColor }]} />
                {isSelected && (
                  <View style={styles.markerBadge}>
                    <Text style={styles.markerBadgeText}>{order.price.amount} ₽</Text>
                  </View>
                )}
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* Center button */}
      <TouchableOpacity style={styles.centerButton} onPress={centerOnLocation}>
        <Text style={styles.centerButtonText}>📍</Text>
      </TouchableOpacity>

      {/* Orders count badge */}
      <View style={styles.ordersCountBadge}>
        <Badge variant="primary" size="medium">
          {orders.length} {orders.length === 1 ? 'заказ' : 'заказов'}
        </Badge>
      </View>

      {/* Show bottom sheet button */}
      {onShowBottomSheet && (
        <TouchableOpacity style={styles.bottomSheetButton} onPress={onShowBottomSheet}>
          <Text style={styles.bottomSheetButtonText}>📋</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
  },
  emptyText: {
    ...typography.body.medium,
    color: colors.text.tertiary,
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerSelected: {
    transform: [{ scale: 1.2 }],
  },
  markerDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: colors.background.primary,
    ...typography.shadows.small,
  },
  markerBadge: {
    position: 'absolute',
    top: -30,
    backgroundColor: colors.background.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.md,
    ...typography.shadows.small,
  },
  markerBadgeText: {
    ...typography.body.small,
    fontWeight: '600',
    color: colors.text.primary,
  },
  centerButton: {
    position: 'absolute',
    bottom: 100,
    right: spacing.md,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...typography.shadows.medium,
  },
  centerButtonText: {
    fontSize: 24,
  },
  ordersCountBadge: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
  },
  bottomSheetButton: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.md,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...typography.shadows.medium,
  },
  bottomSheetButtonText: {
    fontSize: 24,
  },
});
