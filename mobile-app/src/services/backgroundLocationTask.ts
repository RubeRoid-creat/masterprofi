/**
 * Background Location Task Handler
 * This file should be imported in the root of your app (App.tsx) to register the task
 */

import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import { LocationData } from './locationService';

const BACKGROUND_LOCATION_TASK = 'background-location';

// Define the task
TaskManager.defineTask(BACKGROUND_LOCATION_TASK, ({ data, error }) => {
  if (error) {
    console.error('Background location task error:', error);
    return;
  }

  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    
    locations.forEach((location) => {
      const locationData: LocationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || undefined,
        altitude: location.coords.altitude || undefined,
        heading: location.coords.heading || undefined,
        speed: location.coords.speed || undefined,
        timestamp: location.timestamp,
      };

      // Store location or send to server
      // You can use AsyncStorage, Redux, or send to API
      console.log('Background location update:', locationData);
      
      // Example: Send to API
      // fetch('/api/location/update', {
      //   method: 'POST',
      //   body: JSON.stringify(locationData),
      // });
    });
  }
});

// Export task name for use in other files
export { BACKGROUND_LOCATION_TASK };








