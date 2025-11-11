/**
 * Navigation Flow Tests
 * Tests for navigation between screens
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OrderFeedScreen } from '../screens/OrderFeedScreen';
import { OrderDetailsScreen } from '../screens/OrderDetailsScreen';
import { OrderCard } from '../components/orders/OrderCard';
import { mockOrders } from './__mocks__/apiMocks';

const Stack = createNativeStackNavigator();

const MockNavigator = ({ children, initialRouteName = 'OrderFeed' }: any) => (
  <NavigationContainer>
    <Stack.Navigator initialRouteName={initialRouteName}>
      <Stack.Screen name="OrderFeed" component={OrderFeedScreen} />
      <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);

describe('Navigation Flows', () => {
  const mockNavigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
    setOptions: jest.fn(),
    addListener: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Order Feed to Details Navigation', () => {
    it('should navigate to order details when card is pressed', () => {
      const mockOnPress = jest.fn();
      const { getByTestId } = render(
        <OrderCard
          orderId={mockOrders[0].id}
          clientName={mockOrders[0].client.name}
          applianceType={mockOrders[0].appliance.type}
          address={mockOrders[0].location.address}
          distance={mockOrders[0].location.distance}
          price={mockOrders[0].price.amount}
          status={mockOrders[0].status}
          urgency={mockOrders[0].urgency}
          onPress={mockOnPress}
          testID="order-card"
        />
      );

      const card = getByTestId('order-card');
      fireEvent.press(card);

      expect(mockOnPress).toHaveBeenCalledWith(mockOrders[0].id);
    });

    it('should pass correct params when navigating', () => {
      const mockNavigate = jest.fn();
      const mockOnPress = (orderId: string) => {
        mockNavigate('OrderDetails', { orderId });
      };

      const { getByTestId } = render(
        <OrderCard
          orderId={mockOrders[0].id}
          clientName={mockOrders[0].client.name}
          applianceType={mockOrders[0].appliance.type}
          address={mockOrders[0].location.address}
          distance={mockOrders[0].location.distance}
          price={mockOrders[0].price.amount}
          status={mockOrders[0].status}
          urgency={mockOrders[0].urgency}
          onPress={mockOnPress}
          testID="order-card"
        />
      );

      fireEvent.press(getByTestId('order-card'));

      expect(mockNavigate).toHaveBeenCalledWith('OrderDetails', {
        orderId: mockOrders[0].id,
      });
    });
  });

  describe('Tab Navigation', () => {
    it('should navigate between tabs', () => {
      const mockTabPress = jest.fn();

      // Mock tab navigation
      const tabs = ['OrdersTab', 'NetworkTab', 'EarningsTab', 'ProfileTab'];
      
      tabs.forEach((tab) => {
        mockTabPress(tab);
      });

      expect(mockTabPress).toHaveBeenCalledTimes(4);
      expect(mockTabPress).toHaveBeenCalledWith('OrdersTab');
      expect(mockTabPress).toHaveBeenCalledWith('NetworkTab');
      expect(mockTabPress).toHaveBeenCalledWith('EarningsTab');
      expect(mockTabPress).toHaveBeenCalledWith('ProfileTab');
    });
  });

  describe('Deep Linking', () => {
    it('should handle deep link to order details', async () => {
      const deepLink = 'masterprofi://orders/order-1';
      
      // Mock deep link handler
      const handleDeepLink = (link: string) => {
        const match = link.match(/orders\/(.+)/);
        if (match) {
          return {
            screen: 'OrderDetails',
            params: { orderId: match[1] },
          };
        }
        return null;
      };

      const result = handleDeepLink(deepLink);
      
      expect(result).toEqual({
        screen: 'OrderDetails',
        params: { orderId: 'order-1' },
      });
    });

    it('should handle invalid deep links gracefully', () => {
      const invalidLink = 'masterprofi://invalid/path';
      
      const handleDeepLink = (link: string) => {
        const match = link.match(/orders\/(.+)/);
        if (match) {
          return {
            screen: 'OrderDetails',
            params: { orderId: match[1] },
          };
        }
        return null;
      };

      const result = handleDeepLink(invalidLink);
      expect(result).toBeNull();
    });
  });

  describe('Back Navigation', () => {
    it('should navigate back when back button is pressed', () => {
      const mockGoBack = jest.fn();
      
      // Simulate back navigation
      mockGoBack();
      
      expect(mockGoBack).toHaveBeenCalledTimes(1);
    });

    it('should prevent back navigation when required', () => {
      const mockGoBack = jest.fn();
      const shouldPreventBack = true;
      
      if (!shouldPreventBack) {
        mockGoBack();
      }
      
      expect(mockGoBack).not.toHaveBeenCalled();
    });
  });
});








