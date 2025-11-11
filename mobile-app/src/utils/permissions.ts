/**
 * Location Permissions Utility
 */

import * as Location from 'expo-location';
import { Alert, Linking, Platform } from 'react-native';

export type PermissionStatus = 'granted' | 'denied' | 'undetermined';

export interface PermissionResult {
  status: PermissionStatus;
  canAskAgain: boolean;
  needsRationale?: boolean;
}

/**
 * Request foreground location permission
 */
export async function requestForegroundLocationPermission(): Promise<PermissionResult> {
  try {
    const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();
    
    return {
      status: status === 'granted' ? 'granted' : status === 'denied' ? 'denied' : 'undetermined',
      canAskAgain,
      needsRationale: Platform.OS === 'android' && status === 'denied' && !canAskAgain,
    };
  } catch (error) {
    console.error('Error requesting location permission:', error);
    return {
      status: 'denied',
      canAskAgain: false,
    };
  }
}

/**
 * Request background location permission
 */
export async function requestBackgroundLocationPermission(): Promise<PermissionResult> {
  try {
    // First check if foreground permission is granted
    const foregroundStatus = await Location.getForegroundPermissionsAsync();
    if (foregroundStatus.status !== 'granted') {
      const foregroundResult = await requestForegroundLocationPermission();
      if (foregroundResult.status !== 'granted') {
        return foregroundResult;
      }
    }

    // Request background permission
    const { status, canAskAgain } = await Location.requestBackgroundPermissionsAsync();
    
    return {
      status: status === 'granted' ? 'granted' : status === 'denied' ? 'denied' : 'undetermined',
      canAskAgain,
      needsRationale: Platform.OS === 'android' && status === 'denied' && !canAskAgain,
    };
  } catch (error) {
    console.error('Error requesting background location permission:', error);
    return {
      status: 'denied',
      canAskAgain: false,
    };
  }
}

/**
 * Check current permission status
 */
export async function checkLocationPermission(): Promise<{
  foreground: PermissionStatus;
  background: PermissionStatus;
}> {
  try {
    const foreground = await Location.getForegroundPermissionsAsync();
    const background = await Location.getBackgroundPermissionsAsync();
    
    return {
      foreground: foreground.status === 'granted' ? 'granted' : foreground.status === 'denied' ? 'denied' : 'undetermined',
      background: background.status === 'granted' ? 'granted' : background.status === 'denied' ? 'denied' : 'undetermined',
    };
  } catch (error) {
    console.error('Error checking location permission:', error);
    return {
      foreground: 'undetermined',
      background: 'undetermined',
    };
  }
}

/**
 * Show permission rationale dialog
 */
export function showPermissionRationale(
  title: string = 'Location Permission Required',
  message: string = 'We need location access to provide directions, track your service area, and improve our services.',
  onOpenSettings?: () => void
) {
  Alert.alert(
    title,
    message,
    [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Open Settings',
        onPress: () => {
          if (onOpenSettings) {
            onOpenSettings();
          } else {
            Linking.openSettings();
          }
        },
      },
    ]
  );
}

/**
 * Open app settings
 */
export async function openAppSettings(): Promise<void> {
  try {
    await Linking.openSettings();
  } catch (error) {
    console.error('Error opening settings:', error);
  }
}

/**
 * Check if location services are enabled
 */
export async function isLocationEnabled(): Promise<boolean> {
  try {
    return await Location.hasServicesEnabledAsync();
  } catch (error) {
    console.error('Error checking location services:', error);
    return false;
  }
}








