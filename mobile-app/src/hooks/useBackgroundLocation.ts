/**
 * Hook for background location tracking
 */

import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import {
  requestBackgroundLocationPermission,
  checkLocationPermission,
  showPermissionRationale,
} from '../utils/permissions';
import { LocationData } from '../services/locationService';

export interface UseBackgroundLocationOptions {
  autoStart?: boolean;
  accuracy?: Location.Accuracy;
  timeInterval?: number;
  distanceInterval?: number;
  onLocationUpdate?: (location: LocationData) => void;
  onError?: (error: Error) => void;
}

export interface UseBackgroundLocationReturn {
  isEnabled: boolean;
  isLoading: boolean;
  error: string | null;
  enable: () => Promise<void>;
  disable: () => void;
  lastLocation: LocationData | null;
}

export function useBackgroundLocation(
  options: UseBackgroundLocationOptions = {}
): UseBackgroundLocationReturn {
  const {
    autoStart = false,
    accuracy = Location.Accuracy.Balanced,
    timeInterval = 5000,
    distanceInterval = 10,
    onLocationUpdate,
    onError,
  } = options;

  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastLocation, setLastLocation] = useState<LocationData | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);

  const enable = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check permissions
      const permissions = await checkLocationPermission();
      
      if (permissions.background !== 'granted') {
        const result = await requestBackgroundLocationPermission();
        if (result.status !== 'granted') {
          if (result.needsRationale) {
            showPermissionRationale(
              'Background Location Required',
              'We need background location access to track your position while providing services, even when the app is in the background.'
            );
          }
          throw new Error('Background location permission not granted');
        }
      }

      // Check if location services are enabled
      const isLocationEnabled = await Location.hasServicesEnabledAsync();
      if (!isLocationEnabled) {
        throw new Error('Location services are disabled. Please enable them in settings.');
      }

      // Start background location task
      // Note: Background location tasks require additional setup in app.json
      // This is a placeholder implementation
      const locationTask = await Location.startLocationUpdatesAsync('background-location', {
        accuracy,
        timeInterval,
        distanceInterval,
        foregroundService: {
          notificationTitle: 'Location Tracking',
          notificationBody: 'Tracking your location for service delivery',
          notificationColor: '#3B82F6',
        },
        pausesUpdatesAutomatically: false,
        showsBackgroundLocationIndicator: true,
      });

      setTaskId(locationTask);
      setIsEnabled(true);

      // Note: Location updates from background task are handled via expo-task-manager
      // Create a separate task handler file (backgroundLocationTask.ts) to handle updates
      // The task manager will call the callback when location updates occur
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to enable background location';
      setError(errorMessage);
      
      if (onError) {
        onError(err);
      }
    } finally {
      setIsLoading(false);
    }
  }, [accuracy, timeInterval, distanceInterval, onLocationUpdate, onError]);

  const disable = useCallback(() => {
    if (taskId) {
      Location.stopLocationUpdatesAsync('background-location');
      setTaskId(null);
    }
    setIsEnabled(false);
  }, [taskId]);

  // Auto-start if enabled
  useEffect(() => {
    if (autoStart) {
      enable();
    }

    return () => {
      disable();
    };
  }, [autoStart]); // Only run on mount/unmount

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disable();
    };
  }, []);

  return {
    isEnabled,
    isLoading,
    error,
    enable,
    disable,
    lastLocation,
  };
}

