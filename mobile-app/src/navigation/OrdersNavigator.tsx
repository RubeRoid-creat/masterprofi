import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OrdersStackParamList } from './types';
import { OrderFeedScreen } from '../screens/OrderFeedScreen';
import { OrderDetailsScreen } from '../screens/OrderDetailsScreen';
import { ChatScreen } from '../components/lazy';

const Stack = createNativeStackNavigator<OrdersStackParamList>();

export const OrdersNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#3B82F6',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="OrderFeed"
        component={OrderFeedScreen}
        options={{
          title: 'Orders',
        }}
      />
      <Stack.Screen
        name="OrderDetails"
        component={OrderDetailsScreen}
        options={{
          title: 'Order Details',
        }}
      />
      <Stack.Screen
        name="OrderChat"
        component={ChatScreen}
        options={{
          title: 'Chat',
        }}
      />
    </Stack.Navigator>
  );
};

