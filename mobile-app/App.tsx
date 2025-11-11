// Import polyfill for crypto.getRandomValues() FIRST, before any other imports
import 'react-native-get-random-values';

import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Provider, useDispatch } from 'react-redux';
import './global.css';
import { store } from './src/store/store';
import { RootNavigator } from './src/navigation/RootNavigator';
import { setInitialized, setCredentials, logout } from './src/store/slices/authSlice';
import { encryptionService } from './src/services/encryptionService';
import { sessionService } from './src/services/sessionService';
import { remoteWipeService } from './src/services/remoteWipeService';
import { saveNavigationState } from './src/navigation/persistence';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationState } from '@react-navigation/native';
// Import background location task (must be imported at root level)
import './src/services/backgroundLocationTask';
// Initialize services
import { offlineMediaQueue } from './src/services/offlineMediaQueue';
import { galleryService } from './src/services/galleryService';
import { notificationService } from './src/services/notificationService';
import { fcmService } from './src/services/fcmService';
import { databaseSyncService } from './src/services/databaseSyncService';
import { actionQueueService } from './src/services/actionQueueService';
import { imageService } from './src/services/imageService';
import { featureFlags } from './src/config/featureFlags';
import { analyticsService } from './src/services/analyticsService';
import { crashReportingService } from './src/services/crashReportingService';
import { errorHandler } from './src/utils/errorHandler';
import { sslPinningService } from './src/services/sslPinningService';
import { biometricService } from './src/services/biometricService';
import { privacyModeService } from './src/services/privacyModeService';
import { PrivacyModeOverlay } from './src/components/PrivacyModeOverlay';
import { EnvironmentIndicator } from './src/components/EnvironmentIndicator';
import { userEngagementService } from './src/services/userEngagementService';
import { orderAnalyticsService } from './src/services/orderAnalyticsService';
import { featureUsageService } from './src/services/featureUsageService';
import { performanceMonitoringService } from './src/services/performanceMonitoringService';
import { userFlowService } from './src/services/userFlowService';

// Suppress browser extension errors (non-critical)
if (typeof window !== 'undefined' && window.chrome && window.chrome.runtime) {
  const originalSendMessage = window.chrome.runtime.sendMessage;
  if (originalSendMessage) {
    window.chrome.runtime.sendMessage = function(...args: any[]) {
      try {
        return originalSendMessage.apply(this, args);
      } catch (error: any) {
        // Ignore "message port closed" errors from browser extensions
        if (error?.message?.includes('message port closed') || 
            error?.message?.includes('Extension context invalidated')) {
          return;
        }
        throw error;
      }
    };
  }
  
  // Suppress lastError warnings
  if (window.chrome.runtime.lastError) {
    const originalLastError = window.chrome.runtime.lastError;
    Object.defineProperty(window.chrome.runtime, 'lastError', {
      get() {
        try {
          return originalLastError;
        } catch {
          return null;
        }
      },
      configurable: true,
    });
  }
}

// Initialize error handling first
try {
  errorHandler.initialize();
} catch (error) {
  console.warn('Error initializing error handler:', error);
}

// Initialize crash reporting early (with error handling)
crashReportingService.initialize().then(async () => {
  try {
    // Initialize security services
    await sslPinningService.initialize();
    await biometricService.loadSecurityState();
    // Initialize privacy mode (disabled on web by default)
    await privacyModeService.initialize({
      autoEnableOnBackground: false, // Disable auto-enable for development
      autoEnableOnScreenLock: false,
    });

    // Initialize other services
    offlineMediaQueue.initialize();
    galleryService.initialize();
    notificationService.initialize();
    fcmService.initialize();
    databaseSyncService.initialize();
    actionQueueService.initialize({
      maxRetries: 3,
      retryDelay: 1000,
      retryBackoff: 'exponential',
      conflictResolution: 'server_wins',
    });
    imageService.initialize();
    featureFlags.initialize();
    analyticsService.initialize();
    
    // Initialize analytics services
    userEngagementService.initialize();
    orderAnalyticsService.initialize();
    featureUsageService.initialize();
    performanceMonitoringService.initialize();
    userFlowService.initialize();
  } catch (error) {
    console.error('Error initializing services:', error);
  }
}).catch((error) => {
  console.error('Error initializing crash reporting:', error);
});

// Component to initialize auth state
const AppInitializer: React.FC = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Check for stored auth token
    const initializeAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('auth_token');
        const userData = await AsyncStorage.getItem('user_data');

        if (token && userData) {
          const user = JSON.parse(userData);
          dispatch(
            setCredentials({
              user,
              token,
            })
          );
          
          // Initialize security services for logged in user
          await encryptionService.initialize(user.id);
          sessionService.initialize({
            timeout: 30 * 60 * 1000, // 30 minutes
            warningTime: 5 * 60 * 1000, // 5 minutes warning
            extendOnActivity: true,
          });
          
          // Setup session timeout callback
          sessionService.onTimeout(() => {
            dispatch(logout());
          });
          
          remoteWipeService.initialize(user.id);
        }
      } catch (error) {
        console.warn('Failed to load auth state:', error);
      } finally {
        dispatch(setInitialized(true));
      }
    };

    initializeAuth();
  }, [dispatch]);

  const handleNavigationReady = (navigationState: NavigationState | undefined) => {
    if (navigationState) {
      saveNavigationState(navigationState);
    }
  };

  const handleNavigationStateChange = (navigationState: NavigationState | undefined) => {
    if (navigationState) {
      saveNavigationState(navigationState);
    }
  };

  return (
    <PrivacyModeOverlay>
      <RootNavigator
        onReady={handleNavigationReady}
        onStateChange={handleNavigationStateChange}
      />
      <EnvironmentIndicator />
    </PrivacyModeOverlay>
  );
};

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
            Произошла ошибка
          </Text>
          <Text style={{ fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 20 }}>
            {this.state.error?.message || 'Неизвестная ошибка'}
          </Text>
          <TouchableOpacity
            style={{
              marginTop: 20,
              paddingVertical: 12,
              paddingHorizontal: 24,
              backgroundColor: '#3B82F6',
              borderRadius: 8,
            }}
            onPress={() => this.setState({ hasError: false, error: undefined })}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>
              Попробовать снова
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <AppInitializer />
      </Provider>
    </ErrorBoundary>
  );
}

