/**
 * Location Service
 * Handles current location tracking and updates
 */

import * as Location from 'expo-location';
import { Coordinates } from '../utils/locationHelpers';
import { requestForegroundLocationPermission, checkLocationPermission } from '../utils/permissions';

export interface LocationData extends Coordinates {
  accuracy?: number;
  altitude?: number;
  heading?: number;
  speed?: number;
  timestamp: number;
}

export interface LocationOptions {
  accuracy?: Location.Accuracy;
  timeInterval?: number;
  distanceInterval?: number;
}

class LocationService {
  private watchSubscription: Location.LocationSubscription | null = null;
  private lastKnownLocation: LocationData | null = null;
  private listeners: Set<(location: LocationData) => void> = new Set();

  /**
   * Get current location
   */
  async getCurrentLocation(options: LocationOptions = {}): Promise<LocationData> {
    try {
      // Check permission
      const permission = await checkLocationPermission();
      if (permission.foreground !== 'granted') {
        const result = await requestForegroundLocationPermission();
        if (result.status !== 'granted') {
          throw new Error('Location permission not granted');
        }
      }

      // Check if location services are enabled
      const isEnabled = await Location.hasServicesEnabledAsync();
      if (!isEnabled) {
        throw new Error('Location services are disabled');
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: options.accuracy || Location.Accuracy.Balanced,
      });

      const locationData: LocationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || undefined,
        altitude: location.coords.altitude || undefined,
        heading: location.coords.heading || undefined,
        speed: location.coords.speed || undefined,
        timestamp: location.timestamp,
      };

      this.lastKnownLocation = locationData;
      return locationData;
    } catch (error: any) {
      console.error('Error getting current location:', error);
      throw new Error(error.message || 'Failed to get current location');
    }
  }

  /**
   * Start watching location changes
   */
  async startWatchingLocation(
    callback: (location: LocationData) => void,
    options: LocationOptions = {}
  ): Promise<void> {
    try {
      // Check permission
      const permission = await checkLocationPermission();
      if (permission.foreground !== 'granted') {
        const result = await requestForegroundLocationPermission();
        if (result.status !== 'granted') {
          throw new Error('Location permission not granted');
        }
      }

      // Check if location services are enabled
      const isEnabled = await Location.hasServicesEnabledAsync();
      if (!isEnabled) {
        throw new Error('Location services are disabled');
      }

      // Stop existing watch if any
      if (this.watchSubscription) {
        this.stopWatchingLocation();
      }

      // Add listener
      this.listeners.add(callback);

      // Start watching
      this.watchSubscription = await Location.watchPositionAsync(
        {
          accuracy: options.accuracy || Location.Accuracy.Balanced,
          timeInterval: options.timeInterval || 5000, // 5 seconds
          distanceInterval: options.distanceInterval || 10, // 10 meters
        },
        (location) => {
          const locationData: LocationData = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy || undefined,
            altitude: location.coords.altitude || undefined,
            heading: location.coords.heading || undefined,
            speed: location.coords.speed || undefined,
            timestamp: location.timestamp,
          };

          this.lastKnownLocation = locationData;
          
          // Notify all listeners
          this.listeners.forEach((listener) => {
            try {
              listener(locationData);
            } catch (error) {
              console.error('Error in location listener:', error);
            }
          });
        }
      );
    } catch (error: any) {
      console.error('Error starting location watch:', error);
      throw new Error(error.message || 'Failed to start location watching');
    }
  }

  /**
   * Stop watching location changes
   */
  stopWatchingLocation(): void {
    if (this.watchSubscription) {
      this.watchSubscription.remove();
      this.watchSubscription = null;
    }
    this.listeners.clear();
  }

  /**
   * Add location listener
   */
  addListener(callback: (location: LocationData) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Remove location listener
   */
  removeListener(callback: (location: LocationData) => void): void {
    this.listeners.delete(callback);
  }

  /**
   * Get last known location
   */
  getLastKnownLocation(): LocationData | null {
    return this.lastKnownLocation;
  }

  /**
   * Check if location watching is active
   */
  isWatching(): boolean {
    return this.watchSubscription !== null;
  }
}

export const locationService = new LocationService();








