import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { LocationInfo } from '../../types/registration';
import * as Location from 'expo-location';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { StyledInput } from '../common/StyledInput';
import { StyledButton } from '../common/StyledButton';

interface LocationStepProps {
  initialData?: Partial<LocationInfo>;
  onNext: (data: { location: LocationInfo }) => void;
  onBack: () => void;
}

export const LocationStep: React.FC<LocationStepProps> = ({
  initialData,
  onNext,
  onBack,
}) => {
  const [region, setRegion] = useState({
    latitude: initialData?.serviceArea?.latitude || 55.7558,
    longitude: initialData?.serviceArea?.longitude || 37.6173,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [radius, setRadius] = useState(initialData?.serviceArea?.radius || 10);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Omit<LocationInfo, 'serviceArea'>>({
    defaultValues: {
      address: initialData?.address || '',
      city: initialData?.city || '',
      postalCode: initialData?.postalCode || '',
    },
  });

  const handleGetCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Доступ запрещен',
          'Пожалуйста, включите доступ к геолокации в настройках'
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setRegion({
        ...region,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось получить текущее местоположение');
    }
  };

  const onSubmit = (data: Omit<LocationInfo, 'serviceArea'>) => {
    onNext({
      location: {
        ...data,
        serviceArea: {
          latitude: region.latitude,
          longitude: region.longitude,
          radius,
        },
      },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.description}>
          Установите зону обслуживания на карте
        </Text>

        {/* Map Placeholder */}
        <View style={styles.mapPlaceholder}>
          <Text style={styles.mapPlaceholderText}>
            Карта будет отображаться здесь{'\n'}
            Координаты: {region.latitude.toFixed(4)}, {region.longitude.toFixed(4)}{'\n'}
            Радиус: {radius} км
          </Text>
        </View>

        {/* Location Controls */}
        <View style={styles.locationControls}>
          <TouchableOpacity
            onPress={handleGetCurrentLocation}
            style={styles.locationButton}
          >
            <Text style={styles.locationButtonText}>
              Использовать текущее местоположение
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.locationButton, styles.locationButtonSecondary]}>
            <Text style={styles.locationButtonTextSecondary}>
              Поиск адреса
            </Text>
          </TouchableOpacity>
        </View>

        {/* Radius Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Радиус обслуживания: {radius} км
          </Text>
          <View style={styles.radiusGrid}>
            {[5, 10, 15, 20, 25, 30].map((r) => (
              <TouchableOpacity
                key={r}
                onPress={() => setRadius(r)}
                style={[
                  styles.radiusButton,
                  radius === r ? styles.radiusButtonSelected : styles.radiusButtonUnselected,
                ]}
              >
                <Text
                  style={[
                    styles.radiusButtonText,
                    radius === r ? styles.radiusButtonTextSelected : styles.radiusButtonTextUnselected,
                  ]}
                >
                  {r} км
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Address */}
        <Controller
          control={control}
          name="address"
          rules={{ required: 'Адрес обязателен' }}
          render={({ field: { onChange, onBlur, value } }) => (
            <StyledInput
              label="Адрес *"
              placeholder="Улица, дом, квартира"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              autoCapitalize="words"
              error={errors.address?.message}
            />
          )}
        />

        {/* City */}
        <Controller
          control={control}
          name="city"
          rules={{ required: 'Город обязателен' }}
          render={({ field: { onChange, onBlur, value } }) => (
            <StyledInput
              label="Город *"
              placeholder="Москва"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              autoCapitalize="words"
              error={errors.city?.message}
            />
          )}
        />
      </View>

      {/* Buttons */}
      <View style={styles.buttonsContainer}>
        <StyledButton
          title="Назад"
          onPress={onBack}
          variant="outline"
          size="large"
          style={styles.button}
        />
        <StyledButton
          title="Продолжить"
          onPress={handleSubmit(onSubmit)}
          variant="primary"
          size="large"
          style={styles.button}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    marginBottom: spacing.xl,
  },
  description: {
    ...typography.body.medium,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  mapPlaceholder: {
    height: 256,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  mapPlaceholderText: {
    ...typography.body.small,
    color: colors.text.tertiary,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  locationControls: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  locationButton: {
    flex: 1,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.primary[600],
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  locationButtonSecondary: {
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  locationButtonText: {
    ...typography.body.small,
    color: colors.text.inverse,
    fontWeight: '600',
  },
  locationButtonTextSecondary: {
    ...typography.body.small,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.label.medium,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  radiusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  radiusButton: {
    flex: 1,
    minWidth: '30%',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    alignItems: 'center',
  },
  radiusButtonSelected: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[600],
  },
  radiusButtonUnselected: {
    backgroundColor: colors.background.primary,
    borderColor: colors.border.default,
  },
  radiusButtonText: {
    ...typography.body.small,
    fontWeight: '600',
    textAlign: 'center',
  },
  radiusButtonTextSelected: {
    color: colors.primary[600],
  },
  radiusButtonTextUnselected: {
    color: colors.text.secondary,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  button: {
    flex: 1,
  },
});
