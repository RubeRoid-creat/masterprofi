import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import { useLocation } from '../../hooks/useLocation';

interface CurrentLocationButtonProps {
  onLocationUpdate?: (latitude: number, longitude: number) => void;
  className?: string;
}

export const CurrentLocationButton: React.FC<CurrentLocationButtonProps> = ({
  onLocationUpdate,
  className = '',
}) => {
  const { location, isLoading, error, getCurrentLocation } = useLocation();

  const handlePress = async () => {
    await getCurrentLocation();
    if (location && onLocationUpdate) {
      onLocationUpdate(location.latitude, location.longitude);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isLoading}
      className={`bg-blue-600 px-4 py-3 rounded-lg flex-row items-center justify-center ${className}`}
    >
      {isLoading ? (
        <>
          <ActivityIndicator color="white" size="small" />
          <Text className="text-white font-semibold ml-2">Getting Location...</Text>
        </>
      ) : (
        <>
          <Text className="text-white text-lg mr-2">📍</Text>
          <Text className="text-white font-semibold">Use Current Location</Text>
        </>
      )}
      {error && (
        <Text className="text-red-200 text-xs mt-1">Error: {error}</Text>
      )}
    </TouchableOpacity>
  );
};








