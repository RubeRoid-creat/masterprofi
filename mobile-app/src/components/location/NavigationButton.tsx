import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { navigationService } from '../../services/navigationService';
import { Coordinates } from '../../utils/locationHelpers';

interface NavigationButtonProps {
  destination: Coordinates | string;
  mode?: 'driving' | 'walking' | 'transit';
  showInfo?: boolean;
  className?: string;
}

export const NavigationButton: React.FC<NavigationButtonProps> = ({
  destination,
  mode = 'driving',
  showInfo = true,
  className = '',
}) => {
  const [navigationInfo, setNavigationInfo] = React.useState<{
    distance: string;
    time: string;
  } | null>(null);

  React.useEffect(() => {
    if (showInfo) {
      navigationService.getNavigationInfo(destination, mode).then((info) => {
        if (info) {
          setNavigationInfo({
            distance: info.formattedDistance,
            time: info.formattedTime,
          });
        }
      });
    }
  }, [destination, mode, showInfo]);

  const handlePress = () => {
    navigationService.openNavigation({ destination, mode });
  };

  return (
    <View className={className}>
      <TouchableOpacity
        onPress={handlePress}
        className="bg-green-600 px-4 py-3 rounded-lg flex-row items-center justify-center"
      >
        <Text className="text-white text-lg mr-2">🧭</Text>
        <Text className="text-white font-semibold">Get Directions</Text>
      </TouchableOpacity>
      {navigationInfo && (
        <View className="mt-2 items-center">
          <Text className="text-gray-600 text-sm">
            {navigationInfo.distance} • {navigationInfo.time}
          </Text>
        </View>
      )}
    </View>
  );
};








