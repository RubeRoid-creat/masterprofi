import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NetworkStackParamList } from './types';
import { MLMDashboardScreen } from '../screens/MLMDashboardScreen';
import { useAppSelector } from '../store/hooks';

const Stack = createNativeStackNavigator<NetworkStackParamList>();

export const NetworkNavigator: React.FC = () => {
  const userId = useAppSelector((state) => state.auth.user?.id || 'demo-user');

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#8B5CF6',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="MLMDashboard"
        options={{
          title: 'Моя Сеть',
        }}
      >
        {(props) => <MLMDashboardScreen {...props} currentUserId={userId} />}
      </Stack.Screen>
      {/* MLMMemberDetails and MLMInvite can be added when implemented */}
    </Stack.Navigator>
  );
};
