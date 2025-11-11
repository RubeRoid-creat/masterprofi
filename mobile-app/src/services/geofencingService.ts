/**
 * Geofencing Service
 * Handles service area boundary checking
 */

import * as Location from 'expo-location';
import { Coordinates, ServiceArea, isWithinServiceArea } from '../utils/locationHelpers';
import { locationService, LocationData } from './locationService';
import { requestForegroundLocationPermission } from '../utils/permissions';

export interface GeofenceEvent {
  type: 'enter' | 'exit';
  serviceArea: ServiceArea;
  location: Coordinates;
  timestamp: number;
}

export interface GeofenceMonitor {
  serviceArea: ServiceArea;
  onEnter?: (event: GeofenceEvent) => void;
  onExit?: (event: GeofenceEvent) => void;
  isInside: boolean;
}

class GeofencingService {
  private monitors: Map<string, GeofenceMonitor> = new Map();
  private watchSubscription: Location.LocationSubscription | null = null;
  private isMonitoring: boolean = false;
  private checkInterval: NodeJS.Timeout | null = null;

  /**
   * Add geofence monitor
   */
  addMonitor(
    id: string,
    serviceArea: ServiceArea,
    callbacks: {
      onEnter?: (event: GeofenceEvent) => void;
      onExit?: (event: GeofenceEvent) => void;
    }
  ): void {
    // Check initial state
    locationService.getCurrentLocation().then((location) => {
      const inside = isWithinServiceArea(location, serviceArea);
      
      this.monitors.set(id, {
        serviceArea,
        onEnter: callbacks.onEnter,
        onExit: callbacks.onExit,
        isInside: inside,
      });

      // Start monitoring if not already started
      if (!this.isMonitoring) {
        this.startMonitoring();
      }
    }).catch((error) => {
      console.error('Error getting initial location for geofence:', error);
      // Add monitor anyway, will check on next location update
      this.monitors.set(id, {
        serviceArea,
        onEnter: callbacks.onEnter,
        onExit: callbacks.onExit,
        isInside: false,
      });
      
      if (!this.isMonitoring) {
        this.startMonitoring();
      }
    });
  }

  /**
   * Remove geofence monitor
   */
  removeMonitor(id: string): void {
    this.monitors.delete(id);
    
    // Stop monitoring if no monitors left
    if (this.monitors.size === 0) {
      this.stopMonitoring();
    }
  }

  /**
   * Check if location is within service area
   */
  checkServiceArea(coordinates: Coordinates, serviceArea: ServiceArea): boolean {
    return isWithinServiceArea(coordinates, serviceArea);
  }

  /**
   * Start monitoring geofences
   */
  private async startMonitoring(): Promise<void> {
    if (this.isMonitoring) {
      return;
    }

    try {
      // Check permission
      const permissionResult = await requestForegroundLocationPermission();
      if (permissionResult.status !== 'granted') {
        throw new Error('Location permission not granted');
      }

      this.isMonitoring = true;

      // Start watching location
      await locationService.startWatchingLocation(
        (location) => {
          this.checkGeofences(location);
        },
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 10000, // Check every 10 seconds
          distanceInterval: 50, // Or when moved 50 meters
        }
      );
    } catch (error) {
      console.error('Error starting geofence monitoring:', error);
      this.isMonitoring = false;
    }
  }

  /**
   * Stop monitoring geofences
   */
  private stopMonitoring(): void {
    if (!this.isMonitoring) {
      return;
    }

    locationService.stopWatchingLocation();
    
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }

    this.isMonitoring = false;
  }

  /**
   * Check all geofences against current location
   */
  private checkGeofences(location: LocationData): void {
    const coordinates: Coordinates = {
      latitude: location.latitude,
      longitude: location.longitude,
    };

    this.monitors.forEach((monitor, id) => {
      const isInside = isWithinServiceArea(coordinates, monitor.serviceArea);

      // Check if state changed
      if (isInside !== monitor.isInside) {
        monitor.isInside = isInside;

        const event: GeofenceEvent = {
          type: isInside ? 'enter' : 'exit',
          serviceArea: monitor.serviceArea,
          location: coordinates,
          timestamp: Date.now(),
        };

        if (isInside && monitor.onEnter) {
          monitor.onEnter(event);
        } else if (!isInside && monitor.onExit) {
          monitor.onExit(event);
        }
      }
    });
  }

  /**
   * Get all active monitors
   */
  getMonitors(): Map<string, GeofenceMonitor> {
    return new Map(this.monitors);
  }

  /**
   * Clear all monitors
   */
  clearAll(): void {
    this.monitors.clear();
    this.stopMonitoring();
  }
}

export const geofencingService = new GeofencingService();








