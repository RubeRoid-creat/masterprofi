import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { PersonalInfo } from '../../types/registration';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { StyledInput } from '../common/StyledInput';
import { StyledButton } from '../common/StyledButton';

interface PersonalInfoStepProps {
  initialData?: Partial<PersonalInfo>;
  onNext: (data: { personalInfo: PersonalInfo }) => void;
  onCancel?: () => void;
}

export const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({
  initialData,
  onNext,
  onCancel,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<PersonalInfo>({
    defaultValues: {
      firstName: initialData?.firstName || '',
      lastName: initialData?.lastName || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      dateOfBirth: initialData?.dateOfBirth || '',
      city: initialData?.city || '',
      address: initialData?.address || '',
    },
  });

  const phone = watch('phone');

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) return 'Email обязателен';
    if (!emailRegex.test(value)) return 'Введите корректный email';
    return true;
  };

  const validatePhone = (value: string) => {
    const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
    if (!value) return 'Номер телефона обязателен';
    if (!phoneRegex.test(value.replace(/\s/g, ''))) {
      return 'Введите корректный номер телефона';
    }
    return true;
  };

  const onSubmit = (data: PersonalInfo) => {
    onNext({ personalInfo: data });
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.description}>
          Укажите вашу личную информацию для начала работы
        </Text>

        {/* First Name */}
        <Controller
          control={control}
          name="firstName"
          rules={{ required: 'Имя обязательно' }}
          render={({ field: { onChange, onBlur, value } }) => (
            <StyledInput
              label="Имя *"
              placeholder="Иван"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              autoCapitalize="words"
              error={errors.firstName?.message}
            />
          )}
        />

        {/* Last Name */}
        <Controller
          control={control}
          name="lastName"
          rules={{ required: 'Фамилия обязательна' }}
          render={({ field: { onChange, onBlur, value } }) => (
            <StyledInput
              label="Фамилия *"
              placeholder="Иванов"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              autoCapitalize="words"
              error={errors.lastName?.message}
            />
          )}
        />

        {/* Email */}
        <Controller
          control={control}
          name="email"
          rules={{ validate: validateEmail }}
          render={({ field: { onChange, onBlur, value } }) => (
            <StyledInput
              label="Email *"
              placeholder="ivan.ivanov@example.com"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              error={errors.email?.message}
            />
          )}
        />

        {/* Phone */}
        <Controller
          control={control}
          name="phone"
          rules={{ validate: validatePhone }}
          render={({ field: { onChange, onBlur, value } }) => (
            <StyledInput
              label="Номер телефона *"
              placeholder="+7 (999) 123-45-67"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="phone-pad"
              autoComplete="tel"
              error={errors.phone?.message}
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

        {/* Address (Optional) */}
        <Controller
          control={control}
          name="address"
          render={({ field: { onChange, onBlur, value } }) => (
            <StyledInput
              label="Адрес (необязательно)"
              placeholder="Улица, дом, квартира"
              value={value || ''}
              onChangeText={onChange}
              onBlur={onBlur}
              autoCapitalize="words"
              multiline
              numberOfLines={2}
            />
          )}
        />
      </View>

      {/* Buttons */}
      <View style={styles.buttonsContainer}>
        {onCancel && (
          <StyledButton
            title="Отмена"
            onPress={onCancel}
            variant="outline"
            size="large"
            style={styles.button}
          />
        )}
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
    marginBottom: spacing.xl,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  button: {
    flex: 1,
  },
});

