import React from 'react';
import { TouchableOpacity, Text, Linking, Alert, Platform, StyleSheet } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { StyledButton } from '../common/StyledButton';

interface NavigationButtonProps {
  address: string;
  latitude: number;
  longitude: number;
}

export const NavigationButton: React.FC<NavigationButtonProps> = ({
  address,
  latitude,
  longitude,
}) => {
  const openNavigation = async () => {
    try {
      const url = Platform.select({
        ios: `maps://app?daddr=${latitude},${longitude}`,
        android: `google.navigation:q=${latitude},${longitude}`,
      });

      if (url) {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
        } else {
          const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
          await Linking.openURL(webUrl);
        }
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось открыть навигацию');
    }
  };

  return (
    <StyledButton
      title={`🗺️ Навигация: ${address}`}
      onPress={openNavigation}
      variant="primary"
      size="large"
      fullWidth
      style={styles.button}
    />
  );
};

const styles = StyleSheet.create({
  button: {
    marginBottom: spacing.md,
  },
});
