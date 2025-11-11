/**
 * Environment Configuration
 * Multi-environment setup for Development, Staging, and Production
 */

import { Platform } from 'react-native';

export type Environment = 'development' | 'staging' | 'production';

export interface EnvironmentConfig {
  environment: Environment;
  apiUrl: string;
  wsUrl: string;
  apiTimeout: number;
  enableLogging: boolean;
  enableAnalytics: boolean;
  enableCrashReporting: boolean;
  enablePerformanceMonitoring: boolean;
  featureFlags: Record<string, boolean>;
  analytics: {
    trackingId?: string;
    enabled: boolean;
  };
  crashReporting: {
    dsn?: string;
    enabled: boolean;
    environment: string;
  };
}

const getEnvironment = (): Environment => {
  const env = process.env.EXPO_PUBLIC_ENV || process.env.NODE_ENV || 'development';
  
  if (env === 'production' || env === 'prod') {
    return 'production';
  }
  if (env === 'staging' || env === 'stage') {
    return 'staging';
  }
  return 'development';
};

const currentEnvironment = getEnvironment();

// Helper function to get the correct localhost URL for mobile devices
const getLocalhostUrl = (): string => {
  // If explicit URL is set via environment variable, use it
  if (process.env.EXPO_PUBLIC_API_URL_DEV) {
    return process.env.EXPO_PUBLIC_API_URL_DEV;
  }

  // For Android emulator, use 10.0.2.2 (special alias to host machine)
  if (Platform.OS === 'android') {
    // Check if running on emulator (you can also check for specific device IDs)
    return 'http://10.0.2.2:3000/api';
  }

  // For iOS simulator and web, use localhost
  return 'http://localhost:3000/api';
};

const getLocalhostWsUrl = (): string => {
  // If explicit URL is set via environment variable, use it
  if (process.env.EXPO_PUBLIC_WS_URL_DEV) {
    return process.env.EXPO_PUBLIC_WS_URL_DEV;
  }

  // For Android emulator, use 10.0.2.2
  if (Platform.OS === 'android') {
    return 'ws://10.0.2.2:3000';
  }

  // For iOS simulator and web, use localhost
  return 'ws://localhost:3000';
};

// Environment-specific configurations
const environments: Record<Environment, EnvironmentConfig> = {
  development: {
    environment: 'development',
    apiUrl: getLocalhostUrl(),
    wsUrl: getLocalhostWsUrl(),
    apiTimeout: 30000, // 30 seconds
    enableLogging: true,
    enableAnalytics: false, // Disable in dev to avoid noise
    enableCrashReporting: false,
    enablePerformanceMonitoring: false,
    featureFlags: {
      enableMLM: true,
      enableKnowledgeBase: true,
      enableOfflineMode: true,
      enablePushNotifications: true,
      enableBiometricAuth: true,
      enableAdvancedAnalytics: false,
      enableBetaFeatures: true,
    },
    analytics: {
      enabled: false,
    },
    crashReporting: {
      enabled: false,
      environment: 'development',
    },
  },
  staging: {
    environment: 'staging',
    apiUrl: process.env.EXPO_PUBLIC_API_URL_STAGING || 'https://api-staging.masterprofi.com/api',
    wsUrl: process.env.EXPO_PUBLIC_WS_URL_STAGING || 'wss://api-staging.masterprofi.com',
    apiTimeout: 20000,
    enableLogging: true,
    enableAnalytics: true,
    enableCrashReporting: true,
    enablePerformanceMonitoring: true,
    featureFlags: {
      enableMLM: true,
      enableKnowledgeBase: true,
      enableOfflineMode: true,
      enablePushNotifications: true,
      enableBiometricAuth: true,
      enableAdvancedAnalytics: true,
      enableBetaFeatures: true,
    },
    analytics: {
      enabled: true,
      trackingId: process.env.EXPO_PUBLIC_ANALYTICS_TRACKING_ID_STAGING,
    },
    crashReporting: {
      enabled: true,
      dsn: process.env.EXPO_PUBLIC_SENTRY_DSN_STAGING,
      environment: 'staging',
    },
  },
  production: {
    environment: 'production',
    apiUrl: process.env.EXPO_PUBLIC_API_URL_PROD || 'https://api.masterprofi.com/api',
    wsUrl: process.env.EXPO_PUBLIC_WS_URL_PROD || 'wss://api.masterprofi.com',
    apiTimeout: 15000,
    enableLogging: false,
    enableAnalytics: true,
    enableCrashReporting: true,
    enablePerformanceMonitoring: true,
    featureFlags: {
      enableMLM: true,
      enableKnowledgeBase: true,
      enableOfflineMode: true,
      enablePushNotifications: true,
      enableBiometricAuth: true,
      enableAdvancedAnalytics: true,
      enableBetaFeatures: false,
    },
    analytics: {
      enabled: true,
      trackingId: process.env.EXPO_PUBLIC_ANALYTICS_TRACKING_ID_PROD,
    },
    crashReporting: {
      enabled: true,
      dsn: process.env.EXPO_PUBLIC_SENTRY_DSN_PROD,
      environment: 'production',
    },
  },
};

export const config: EnvironmentConfig = environments[currentEnvironment];

export const isDevelopment = currentEnvironment === 'development';
export const isStaging = currentEnvironment === 'staging';
export const isProduction = currentEnvironment === 'production';

console.log(`🌍 Environment: ${currentEnvironment.toUpperCase()}`);
console.log(`📡 API URL: ${config.apiUrl}`);




