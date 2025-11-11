import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileStackParamList } from './types';
import { MasterProfileScreen } from '../screens/MasterProfileScreen';
import { KnowledgeBaseScreen } from '../components/lazy';
import { PrivacyPolicyScreen } from '../screens/PrivacyPolicyScreen';
import { CrmSyncScreen } from '../screens/CrmSyncScreen';
import { useAppSelector } from '../store/hooks';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export const ProfileNavigator: React.FC = () => {
  const userId = useAppSelector((state) => state.auth.user?.id || 'demo-user');

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#6366F1',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="ProfileHome"
        options={{
          title: 'Профиль',
        }}
      >
        {(props) => <MasterProfileScreen {...props} profileId={userId} />}
      </Stack.Screen>
      <Stack.Screen
        name="KnowledgeBase"
        component={KnowledgeBaseScreen}
        options={{
          title: 'База Знаний',
        }}
      />
      <Stack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
        options={{
          title: 'Политика Конфиденциальности',
        }}
      />
      <Stack.Screen
        name="CrmSync"
        component={CrmSyncScreen}
        options={{
          title: 'Синхронизация CRM',
        }}
      />
      {/* ProfileEdit, Settings, Certificates can be added when implemented */}
    </Stack.Navigator>
  );
};

