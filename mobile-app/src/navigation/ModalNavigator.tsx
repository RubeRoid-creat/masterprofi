import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ModalStackParamList } from './types';
import { OrderDetailsScreen } from '../screens/OrderDetailsScreen';
import { ChatScreen } from '../components/lazy';
// Import other modal screens when implemented

const Stack = createNativeStackNavigator<ModalStackParamList>();

export const ModalNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        presentation: 'modal',
        headerShown: true,
        headerStyle: {
          backgroundColor: '#3B82F6',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        animation: 'slide_from_bottom',
      }}
    >
      <Stack.Screen
        name="OrderDetailsModal"
        component={OrderDetailsScreen}
        options={{
          title: 'Order Details',
        }}
      />
      <Stack.Screen
        name="ChatModal"
        component={ChatScreen}
        options={{
          title: 'Chat',
        }}
      />
      {/* RepairCalculatorModal, SignatureModal, PDFViewerModal can be added when implemented */}
    </Stack.Navigator>
  );
};

