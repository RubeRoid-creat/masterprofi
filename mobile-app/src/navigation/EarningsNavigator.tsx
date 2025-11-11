import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { EarningsStackParamList } from './types';
import { EarningsScreen } from '../screens/EarningsScreen';
import { useAppSelector } from '../store/hooks';

const Stack = createNativeStackNavigator<EarningsStackParamList>();

export const EarningsNavigator: React.FC = () => {
  const userId = useAppSelector((state) => state.auth.user?.id || 'demo-user');

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#10B981',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="EarningsHome"
        options={{
          title: 'Доходы',
        }}
      >
        {(props) => <EarningsScreen {...props} userId={userId} />}
      </Stack.Screen>
      {/* EarningsDetails, WithdrawalRequest, PaymentMethods can be added when implemented */}
    </Stack.Navigator>
  );
};
