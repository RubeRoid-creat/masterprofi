import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types';
import { OrdersNavigator } from './OrdersNavigator';
import { NetworkNavigator } from './NetworkNavigator';
import { EarningsNavigator } from './EarningsNavigator';
import { ProfileNavigator } from './ProfileNavigator';
import { TabPreloader } from '../components/preloaders/TabPreloader';
import { colors } from '../theme';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabNavigator: React.FC = () => {
  return (
    <>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary[600],
          tabBarInactiveTintColor: colors.text.tertiary,
          tabBarStyle: {
            backgroundColor: colors.background.primary,
            borderTopWidth: 1,
            borderTopColor: colors.border.light,
            paddingBottom: 5,
            paddingTop: 5,
            height: 60,
            elevation: 8,
            shadowColor: colors.gray[900],
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
        }}
      >
        <Tab.Screen
          name="OrdersTab"
          component={OrdersNavigator}
          options={{
            title: 'Заказы',
            tabBarIcon: ({ color, size }) => (
              <TabBarIcon name="list" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="NetworkTab"
          component={NetworkNavigator}
          options={{
            title: 'Сеть',
            tabBarIcon: ({ color, size }) => (
              <TabBarIcon name="users" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="EarningsTab"
          component={EarningsNavigator}
          options={{
            title: 'Доходы',
            tabBarIcon: ({ color, size }) => (
              <TabBarIcon name="dollar-sign" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="ProfileTab"
          component={ProfileNavigator}
          options={{
            title: 'Профиль',
            tabBarIcon: ({ color, size }) => (
              <TabBarIcon name="user" color={color} size={size} />
            ),
          }}
        />
      </Tab.Navigator>
      {/* Preloaders for each tab */}
      <TabPreloader tabName="OrdersTab" />
      <TabPreloader tabName="NetworkTab" />
      <TabPreloader tabName="EarningsTab" />
      <TabPreloader tabName="ProfileTab" />
    </>
  );
};

// Simple icon component (replace with react-native-vector-icons in production)
import { Text } from 'react-native';

const TabBarIcon: React.FC<{ name: string; color: string; size: number }> = ({
  name,
  color,
  size,
}) => {
  // Placeholder icon - replace with actual icon library like @expo/vector-icons
  const iconMap: Record<string, string> = {
    list: '📋',
    users: '👥',
    'dollar-sign': '💰',
    user: '👤',
  };

  return (
    <Text style={{ fontSize: size, color }}>
      {iconMap[name] || '•'}
    </Text>
  );
};
