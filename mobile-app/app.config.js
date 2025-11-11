/**
 * Expo App Configuration
 * Enhanced configuration for store deployment
 */

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const IS_STAGING = process.env.EXPO_PUBLIC_ENV === 'staging';
const IS_DEVELOPMENT = !IS_PRODUCTION && !IS_STAGING;
const APP_VERSION = process.env.APP_VERSION || '1.0.0';
const BUILD_NUMBER = process.env.BUILD_NUMBER || '1';

module.exports = {
  expo: {
    name: IS_PRODUCTION 
      ? 'MasterProfi' 
      : IS_STAGING 
        ? 'MasterProfi (Staging)' 
        : 'MasterProfi (Dev)',
    slug: 'masterprofi-mobile',
    version: APP_VERSION,
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#3B82F6',
    },
    assetBundlePatterns: [
      '**/*',
      'assets/**/*',
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: IS_PRODUCTION
        ? 'com.masterprofi.app'
        : IS_STAGING
          ? 'com.masterprofi.app.staging'
          : 'com.masterprofi.app.dev',
      buildNumber: BUILD_NUMBER,
      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          'This app needs access to your location to show nearby orders and navigate to client locations.',
        NSLocationAlwaysUsageDescription:
          'This app needs access to your location for background tracking while on service calls.',
        NSCameraUsageDescription:
          'This app needs access to your camera to take photos of appliances and repairs.',
        NSPhotoLibraryUsageDescription:
          'This app needs access to your photo library to upload images for orders.',
        NSMicrophoneUsageDescription:
          'This app needs access to your microphone to record voice messages in chat.',
        NSUserNotificationsUsageDescription:
          'This app needs to send you notifications about new orders, messages, and updates.',
        CFBundleAllowMixedLocalizations: true,
      },
      privacyManifests: {
        NSPrivacyAccessedAPITypes: [
          {
            NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategoryFileTimestamp',
            NSPrivacyAccessedAPITypeReasons: ['C617.1'], // System boot time or time since system boot
          },
          {
            NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategorySystemBootTime',
            NSPrivacyAccessedAPITypeReasons: ['35F9.1'], // Active user detection
          },
        ],
      },
      config: {
        usesNonExemptEncryption: false,
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#3B82F6',
      },
      package: IS_PRODUCTION
        ? 'com.masterprofi.app'
        : IS_STAGING
          ? 'com.masterprofi.app.staging'
          : 'com.masterprofi.app.dev',
      versionCode: parseInt(BUILD_NUMBER, 10),
      permissions: [
        'ACCESS_FINE_LOCATION',
        'ACCESS_COARSE_LOCATION',
        'ACCESS_BACKGROUND_LOCATION',
        'CAMERA',
        'READ_EXTERNAL_STORAGE',
        'WRITE_EXTERNAL_STORAGE',
        'RECORD_AUDIO',
        'VIBRATE',
        'RECEIVE_BOOT_COMPLETED',
      ],
      // googleServicesFile: './google-services.json', // Uncomment and add file when Firebase is configured
      intentFilters: [
        {
          action: 'VIEW',
          autoVerify: true,
          data: [
            {
              scheme: 'https',
              host: 'masterprofi.com',
              pathPrefix: '/orders',
            },
            {
              scheme: 'masterprofi',
              host: 'orders',
            },
          ],
          category: ['BROWSABLE', 'DEFAULT'],
        },
      ],
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: [
      'expo-local-authentication',
      [
        'expo-notifications',
        {
          icon: './assets/notification-icon.png',
          color: '#3B82F6',
          sounds: ['./assets/notification-sound.wav'],
        },
      ],
      [
        'expo-build-properties',
        {
          ios: {
            useFrameworks: 'static',
          },
          android: {
            compileSdkVersion: 34,
            targetSdkVersion: 34,
            minSdkVersion: 24,
          },
        },
      ],
    ],
    extra: {
      eas: {
        projectId: 'your-project-id',
      },
      apiUrl: IS_PRODUCTION
        ? 'http://212.74.227.208:3000/api'
        : 'http://212.74.227.208:3000/api',
    },
    runtimeVersion: {
      policy: 'appVersion',
    },
    updates: {
      url: 'https://u.expo.dev/your-project-id',
      enabled: true,
      checkAutomatically: 'ON_LOAD',
      fallbackToCacheTimeout: 0,
    },
    privacy: 'public',
    scheme: 'masterprofi',
    description:
      'MasterProfi - Service Platform for Home Appliance Repair Professionals. Manage orders, communicate with clients, track earnings, and grow your MLM network.',
    keywords: [
      'repair',
      'appliance',
      'service',
      'master',
      'technician',
      'home repair',
      'MLM',
      'service platform',
    ],
    primaryColor: '#3B82F6',
    githubUrl: 'https://github.com/your-org/masterprofi-mobile',
  },
};

