import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Order } from '../../types/order';
import { colors, typography, spacing, borderRadius } from '../../theme';
// Note: Uncomment after installing react-native-maps
// import MapView, { Marker } from 'react-native-maps';

interface OrderMapViewProps {
  orders: Order[];
  onOrderPress: (order: Order) => void;
}

export const OrderMapView: React.FC<OrderMapViewProps> = ({ orders, onOrderPress }) => {
  // Placeholder for map - Replace with actual MapView after setup
  return (
    <View style={styles.container}>
      <Text style={styles.placeholderText}>
        Карта будет отображаться здесь{'\n'}
        {orders.length} заказов на карте
      </Text>
      {/* Uncomment after installing react-native-maps:
      <MapView
        style={{ flex: 1, width: '100%' }}
        initialRegion={{
          latitude: orders[0]?.location.latitude || 55.7558,
          longitude: orders[0]?.location.longitude || 37.6173,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
      >
        {orders.map((order) => (
          <Marker
            key={order.id}
            coordinate={{
              latitude: order.location.latitude,
              longitude: order.location.longitude,
            }}
            title={order.client.name}
            description={order.appliance.type}
            onPress={() => onOrderPress(order)}
            pinColor={order.status === 'new' ? 'green' : 'blue'}
          />
        ))}
      </MapView>
      */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    ...typography.body.medium,
    color: colors.text.tertiary,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
});
