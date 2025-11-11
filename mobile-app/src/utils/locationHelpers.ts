/**
 * Location Helper Utilities
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface ServiceArea {
  center: Coordinates;
  radius: number; // in kilometers
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 * Returns distance in kilometers
 */
export function calculateDistance(
  coord1: Coordinates,
  coord2: Coordinates
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(coord2.latitude - coord1.latitude);
  const dLon = toRad(coord2.longitude - coord1.longitude);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coord1.latitude)) *
      Math.cos(toRad(coord2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

/**
 * Check if coordinates are within service area
 */
export function isWithinServiceArea(
  coordinates: Coordinates,
  serviceArea: ServiceArea
): boolean {
  const distance = calculateDistance(coordinates, serviceArea.center);
  return distance <= serviceArea.radius;
}

/**
 * Calculate estimated travel time
 * @param distance Distance in kilometers
 * @param averageSpeed Average speed in km/h (default: 30 for urban)
 * @returns Estimated time in minutes
 */
export function estimateTravelTime(
  distance: number,
  averageSpeed: number = 30
): number {
  const hours = distance / averageSpeed;
  return Math.round(hours * 60); // Convert to minutes
}

/**
 * Format travel time as human-readable string
 */
export function formatTravelTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${mins}min`;
}

/**
 * Format distance as human-readable string
 */
export function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${Math.round(distance * 1000)} m`;
  }
  return `${distance.toFixed(1)} km`;
}

/**
 * Convert degrees to radians
 */
function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Get bounding box for a service area
 */
export function getBoundingBox(serviceArea: ServiceArea): {
  northEast: Coordinates;
  southWest: Coordinates;
} {
  const radiusInDegrees = serviceArea.radius / 111; // Approximate conversion
  
  return {
    northEast: {
      latitude: serviceArea.center.latitude + radiusInDegrees,
      longitude: serviceArea.center.longitude + radiusInDegrees,
    },
    southWest: {
      latitude: serviceArea.center.latitude - radiusInDegrees,
      longitude: serviceArea.center.longitude - radiusInDegrees,
    },
  };
}

/**
 * Get center point of multiple coordinates
 */
export function getCenterPoint(coordinates: Coordinates[]): Coordinates {
  if (coordinates.length === 0) {
    throw new Error('No coordinates provided');
  }
  
  if (coordinates.length === 1) {
    return coordinates[0];
  }
  
  let sumLat = 0;
  let sumLon = 0;
  
  coordinates.forEach((coord) => {
    sumLat += coord.latitude;
    sumLon += coord.longitude;
  });
  
  return {
    latitude: sumLat / coordinates.length,
    longitude: sumLon / coordinates.length,
  };
}

/**
 * Calculate bearing between two points
 */
export function calculateBearing(from: Coordinates, to: Coordinates): number {
  const dLon = toRad(to.longitude - from.longitude);
  const lat1 = toRad(from.latitude);
  const lat2 = toRad(to.latitude);
  
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  
  let bearing = Math.atan2(y, x);
  bearing = (bearing * 180) / Math.PI;
  bearing = (bearing + 360) % 360;
  
  return bearing;
}

/**
 * Get direction name from bearing
 */
export function getDirectionFromBearing(bearing: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(bearing / 45) % 8;
  return directions[index];
}








