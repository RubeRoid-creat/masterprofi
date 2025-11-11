import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { NavigationContainer, NavigationState } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppSelector } from '../store/hooks';
import { RootStackParamList } from './types';
import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { ModalNavigator } from './ModalNavigator';
import { navigationRef } from './navigationRef';
import { linking } from './linking';
import { loadNavigationState } from './persistence';
import { navigationPreloader } from './preloading';
import { colors } from '../theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Helper to get current route from navigation state
function getCurrentRoute(state: any): any {
  const route = state.routes[state.index];
  if (route.state) {
    return getCurrentRoute(route.state);
  }
  return route;
}

interface RootNavigatorProps {
  onReady?: (state: NavigationState | undefined) => void;
  onStateChange?: (state: NavigationState | undefined) => void;
}

export const RootNavigator: React.FC<RootNavigatorProps> = ({
  onReady,
  onStateChange,
}) => {
  const { isAuthenticated, isInitialized } = useAppSelector((state) => state.auth);
  const [initialState, setInitialState] = useState<NavigationState | undefined>();

  useEffect(() => {
    // Load persisted navigation state
    loadNavigationState().then((state) => {
      if (state) {
        setInitialState(state);
      }
    });
  }, []);

  // Show loading screen while checking auth state
  if (!isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Загрузка...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      linking={linking}
      initialState={initialState}
      theme={{
        dark: false,
        colors: {
          primary: colors.primary[600],
          background: colors.background.secondary,
          card: colors.background.primary,
          text: colors.text.primary,
          border: colors.border.light,
          notification: colors.primary[600],
        },
      }}
      onReady={() => {
        const rootState = navigationRef.current?.getRootState();
        onReady?.(rootState || undefined);
        navigationPreloader.setNavigationRef(navigationRef.current!);
        if (rootState) {
          const route = getCurrentRoute(rootState);
          if (route) {
            navigationPreloader.preloadForRoute(route.name);
          }
        }
      }}
      onStateChange={() => {
        const rootState = navigationRef.current?.getRootState();
        onStateChange?.(rootState || undefined);
        if (rootState) {
          const route = getCurrentRoute(rootState);
          if (route) {
            navigationPreloader.preloadForRoute(route.name);
          }
        }
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Main" component={MainTabNavigator} />
            <Stack.Screen
              name="Modals"
              component={ModalNavigator}
              options={{
                presentation: 'transparentModal',
                headerShown: false,
              }}
            />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text.secondary,
  },
});

