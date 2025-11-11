/**
 * Hook for service area boundary checking
 */

import { useState, useEffect, useCallback } from 'react';
import { Coordinates, ServiceArea, isWithinServiceArea } from '../utils/locationHelpers';
import { geofencingService, GeofenceEvent } from '../services/geofencingService';
import { useLocation } from './useLocation';

export interface UseServiceAreaOptions {
  serviceArea: ServiceArea;
  autoCheck?: boolean;
  onEnter?: (event: GeofenceEvent) => void;
  onExit?: (event: GeofenceEvent) => void;
  checkInterval?: number;
}

export interface UseServiceAreaReturn {
  isWithinArea: boolean | null;
  distance: number | null;
  isMonitoring: boolean;
  startMonitoring: () => void;
  stopMonitoring: () => void;
  checkNow: () => Promise<void>;
}

export function useServiceArea(
  options: UseServiceAreaOptions
): UseServiceAreaReturn {
  const {
    serviceArea,
    autoCheck = true,
    onEnter,
    onExit,
    checkInterval = 30000, // 30 seconds
  } = options;

  const { location, getCurrentLocation } = useLocation({ autoStart: false });
  const [isWithinArea, setIsWithinArea] = useState<boolean | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [monitorId] = useState(() => `monitor_${Date.now()}_${Math.random()}`);
  const [isMonitoring, setIsMonitoring] = useState(false);

  // Calculate distance from center
  const calculateDistance = useCallback((coordinates: Coordinates): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = ((coordinates.latitude - serviceArea.center.latitude) * Math.PI) / 180;
    const dLon = ((coordinates.longitude - serviceArea.center.longitude) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((serviceArea.center.latitude * Math.PI) / 180) *
        Math.cos((coordinates.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, [serviceArea.center]);

  // Check if current location is within area
  const checkNow = useCallback(async () => {
    try {
      await getCurrentLocation();
      // Location will be updated via useLocation hook
      // Check will happen in useEffect when location changes
    } catch (error) {
      console.error('Error checking service area:', error);
    }
  }, [getCurrentLocation]);

  // Start monitoring
  const startMonitoring = useCallback(() => {
    if (isMonitoring) {
      return;
    }

    geofencingService.addMonitor(
      monitorId,
      serviceArea,
      {
        onEnter: (event) => {
          setIsWithinArea(true);
          setDistance(calculateDistance(event.location));
          if (onEnter) {
            onEnter(event);
          }
        },
        onExit: (event) => {
          setIsWithinArea(false);
          setDistance(calculateDistance(event.location));
          if (onExit) {
            onExit(event);
          }
        },
      }
    );

    setIsMonitoring(true);

    // Initial check - will use location from useLocation hook
    if (location) {
      const coordinates: Coordinates = {
        latitude: location.latitude,
        longitude: location.longitude,
      };
      const within = isWithinServiceArea(coordinates, serviceArea);
      const dist = calculateDistance(coordinates);
      setIsWithinArea(within);
      setDistance(dist);
    } else {
      checkNow();
    }
  }, [monitorId, serviceArea, onEnter, onExit, isMonitoring, location, checkNow, calculateDistance]);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    geofencingService.removeMonitor(monitorId);
    setIsMonitoring(false);
  }, [monitorId]);

  // Auto-check on location update
  useEffect(() => {
    if (location && (autoCheck || isMonitoring)) {
      const coordinates: Coordinates = {
        latitude: location.latitude,
        longitude: location.longitude,
      };

      const within = isWithinServiceArea(coordinates, serviceArea);
      const dist = calculateDistance(coordinates);

      setIsWithinArea(within);
      setDistance(dist);
    }
  }, [location, serviceArea, autoCheck, isMonitoring, calculateDistance]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMonitoring();
    };
  }, []);

  return {
    isWithinArea,
    distance,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    checkNow,
  };
}

