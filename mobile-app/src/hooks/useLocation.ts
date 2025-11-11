/**
 * Hook for current location tracking
 */

import { useState, useEffect, useCallback } from 'react';
import { locationService, LocationData } from '../services/locationService';
import { requestForegroundLocationPermission, showPermissionRationale } from '../utils/permissions';
import { Alert } from 'react-native';

export interface UseLocationOptions {
  autoStart?: boolean;
  accuracy?: number; // Location.Accuracy enum value
  updateInterval?: number;
  onError?: (error: Error) => void;
}

export interface UseLocationReturn {
  location: LocationData | null;
  isLoading: boolean;
  error: string | null;
  getCurrentLocation: () => Promise<void>;
  startWatching: () => Promise<void>;
  stopWatching: () => void;
  isWatching: boolean;
  lastUpdated: number | null;
}

export function useLocation(options: UseLocationOptions = {}): UseLocationReturn {
  const {
    autoStart = false,
    accuracy,
    updateInterval = 5000,
    onError,
  } = options;

  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isWatching, setIsWatching] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const getCurrentLocation = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const locationData = await locationService.getCurrentLocation({
        accuracy,
      });
      setLocation(locationData);
      setLastUpdated(Date.now());
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to get location';
      setError(errorMessage);
      
      if (err.message?.includes('permission')) {
        showPermissionRationale();
      }
      
      if (onError) {
        onError(err);
      }
    } finally {
      setIsLoading(false);
    }
  }, [accuracy, onError]);

  const startWatching = useCallback(async () => {
    if (isWatching) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await locationService.startWatchingLocation(
        (locationData) => {
          setLocation(locationData);
          setLastUpdated(Date.now());
          setIsWatching(true);
          setIsLoading(false);
        },
        {
          accuracy,
          timeInterval: updateInterval,
          distanceInterval: 10, // 10 meters
        }
      );
      setIsWatching(true);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to start location tracking';
      setError(errorMessage);
      
      if (err.message?.includes('permission')) {
        showPermissionRationale();
      }
      
      if (onError) {
        onError(err);
      }
      setIsLoading(false);
    }
  }, [accuracy, updateInterval, isWatching, onError]);

  const stopWatching = useCallback(() => {
    locationService.stopWatchingLocation();
    setIsWatching(false);
  }, []);

  // Auto-start on mount if enabled
  useEffect(() => {
    if (autoStart) {
      getCurrentLocation();
    }

    return () => {
      stopWatching();
    };
  }, [autoStart]); // Only run on mount/unmount

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopWatching();
    };
  }, []);

  return {
    location,
    isLoading,
    error,
    getCurrentLocation,
    startWatching,
    stopWatching,
    isWatching,
    lastUpdated,
  };
}








