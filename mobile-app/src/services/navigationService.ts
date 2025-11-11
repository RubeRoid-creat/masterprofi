/**
 * Navigation Service
 * Handles directions and navigation to addresses
 */

import { Linking, Platform, Alert } from 'react-native';
import { Coordinates } from '../utils/locationHelpers';
import { calculateDistance, estimateTravelTime, formatTravelTime } from '../utils/locationHelpers';
import { locationService } from './locationService';

export interface NavigationOptions {
  destination: Coordinates | string; // Can be coordinates or address
  mode?: 'driving' | 'walking' | 'transit';
  waypoints?: Coordinates[];
}

export interface NavigationInfo {
  distance: number; // in kilometers
  estimatedTime: number; // in minutes
  formattedTime: string;
  formattedDistance: string;
}

class NavigationService {
  /**
   * Open navigation in external app (Google Maps, Apple Maps)
   */
  async openNavigation(options: NavigationOptions): Promise<void> {
    try {
      let destinationUrl: string;

      if (typeof options.destination === 'string') {
        // Address string
        const encodedAddress = encodeURIComponent(options.destination);
        if (Platform.OS === 'ios') {
          destinationUrl = `maps://maps.apple.com/?daddr=${encodedAddress}&dirflg=${options.mode === 'walking' ? 'w' : 'd'}`;
        } else {
          destinationUrl = `google.navigation:q=${encodedAddress}&mode=${options.mode || 'd'}`;
        }
      } else {
        // Coordinates
        const { latitude, longitude } = options.destination;
        if (Platform.OS === 'ios') {
          destinationUrl = `maps://maps.apple.com/?daddr=${latitude},${longitude}&dirflg=${options.mode === 'walking' ? 'w' : 'd'}`;
        } else {
          destinationUrl = `google.navigation:q=${latitude},${longitude}`;
        }
      }

      const supported = await Linking.canOpenURL(destinationUrl);
      if (supported) {
        await Linking.openURL(destinationUrl);
      } else {
        // Fallback to web maps
        await this.openWebMaps(options);
      }
    } catch (error) {
      console.error('Error opening navigation:', error);
      Alert.alert('Error', 'Unable to open navigation. Please try again.');
    }
  }

  /**
   * Open web-based maps
   */
  async openWebMaps(options: NavigationOptions): Promise<void> {
    try {
      let url: string;

      if (typeof options.destination === 'string') {
        const encodedAddress = encodeURIComponent(options.destination);
        url = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}&travelmode=${options.mode || 'driving'}`;
      } else {
        const { latitude, longitude } = options.destination;
        url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=${options.mode || 'driving'}`;
      }

      await Linking.openURL(url);
    } catch (error) {
      console.error('Error opening web maps:', error);
      Alert.alert('Error', 'Unable to open maps. Please try again.');
    }
  }

  /**
   * Get navigation info (distance, estimated time) without opening navigation
   */
  async getNavigationInfo(
    destination: Coordinates | string,
    mode: 'driving' | 'walking' | 'transit' = 'driving'
  ): Promise<NavigationInfo | null> {
    try {
      let destinationCoords: Coordinates;

      // Get current location
      const currentLocation = await locationService.getCurrentLocation();
      
      if (typeof destination === 'string') {
        // Geocode address (simplified - in production, use proper geocoding service)
        // For now, return null if address provided
        console.warn('Address geocoding not implemented. Use coordinates.');
        return null;
      } else {
        destinationCoords = destination;
      }

      // Calculate distance
      const distance = calculateDistance(currentLocation, destinationCoords);

      // Estimate travel time based on mode
      let averageSpeed: number;
      switch (mode) {
        case 'walking':
          averageSpeed = 5; // km/h
          break;
        case 'transit':
          averageSpeed = 25; // km/h (average public transport)
          break;
        default: // driving
          averageSpeed = 30; // km/h (urban)
          break;
      }

      const estimatedTime = estimateTravelTime(distance, averageSpeed);

      return {
        distance,
        estimatedTime,
        formattedTime: formatTravelTime(estimatedTime),
        formattedDistance: distance < 1 
          ? `${Math.round(distance * 1000)} m`
          : `${distance.toFixed(1)} km`,
      };
    } catch (error) {
      console.error('Error getting navigation info:', error);
      return null;
    }
  }

  /**
   * Get directions URL for sharing
   */
  getDirectionsUrl(destination: Coordinates | string, mode: 'driving' | 'walking' | 'transit' = 'driving'): string {
    if (typeof destination === 'string') {
      const encodedAddress = encodeURIComponent(destination);
      return `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}&travelmode=${mode}`;
    } else {
      const { latitude, longitude } = destination;
      return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=${mode}`;
    }
  }
}

export const navigationService = new NavigationService();








