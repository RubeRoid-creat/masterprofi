/**
 * Personal Info Editor Component
 * Allows editing personal information with modern UI components
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { PersonalInfo } from '../../types/profile';
import { getFirstChar } from '../../utils/stringHelpers';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { StyledInput } from '../common/StyledInput';
import { StyledButton } from '../common/StyledButton';
import { ModernCard } from '../common/ModernCard';
import { Alert } from '../ui/Alert';

interface PersonalInfoEditorProps {
  personalInfo: PersonalInfo;
  onSave: (info: PersonalInfo) => Promise<void>;
  isEditing?: boolean;
  showHeader?: boolean;
}

export const PersonalInfoEditor: React.FC<PersonalInfoEditorProps> = ({
  personalInfo,
  onSave,
  isEditing: initialEditing = false,
  showHeader = true,
  onEditToggle,
}) => {
  const [isEditing, setIsEditing] = useState(initialEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<PersonalInfo>(personalInfo);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Update form data when personalInfo changes
  useEffect(() => {
    setFormData(personalInfo);
  }, [personalInfo]);

  const handleAvatarPick = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        setError('Доступ к галерее необходим для выбора фото');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setFormData({ ...formData, avatar: result.assets[0].uri });
      }
    } catch (error) {
      setError('Не удалось выбрать изображение');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // Basic validation
      if (!formData.firstName.trim()) {
        setError('Имя обязательно для заполнения');
        setIsSaving(false);
        return;
      }

      if (!formData.email.trim()) {
        setError('Email обязателен для заполнения');
        setIsSaving(false);
        return;
      }

      await onSave(formData);
      setIsEditing(false);
      onEditToggle?.(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) {
      setError(error.message || 'Не удалось сохранить профиль');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(personalInfo);
    setIsEditing(false);
    onEditToggle?.(false);
    setError(null);
    setSuccess(false);
  };

  const updateField = (field: keyof PersonalInfo, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <ModernCard variant="flat" padding="medium" style={styles.container}>
      {showHeader && (
        <View style={styles.header}>
          <Text style={styles.title}>Личная информация</Text>
          {!isEditing ? (
            <TouchableOpacity 
              onPress={() => {
                setIsEditing(true);
                onEditToggle?.(true);
              }}
            >
              <Text style={styles.editButton}>Редактировать</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={handleCancel}>
                <Text style={styles.cancelButton}>Отмена</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {error && (
        <Alert
          variant="error"
          message={error}
          onClose={() => setError(null)}
          style={styles.alert}
        />
      )}

      {success && (
        <Alert
          variant="success"
          message="Профиль успешно обновлен"
          onClose={() => setSuccess(false)}
          style={styles.alert}
        />
      )}

      {/* Avatar */}
      {isEditing && (
        <View style={styles.avatarContainer}>
          <TouchableOpacity onPress={handleAvatarPick} style={styles.avatarButton}>
            {formData.avatar ? (
              <Image source={{ uri: formData.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {getFirstChar(formData.firstName || 'U')}
                </Text>
              </View>
            )}
            <View style={styles.avatarEditBadge}>
              <Text style={styles.avatarEditIcon}>📷</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarHint}>Нажмите для изменения фото</Text>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          {/* Name */}
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <StyledInput
                label="Имя"
                placeholder="Имя"
                value={formData.firstName}
                onChangeText={(value) => updateField('firstName', value)}
                editable={isEditing}
              />
            </View>
            <View style={[styles.halfWidth, styles.rightField]}>
              <StyledInput
                label="Фамилия"
                placeholder="Фамилия"
                value={formData.lastName || ''}
                onChangeText={(value) => updateField('lastName', value)}
                editable={isEditing}
              />
            </View>
          </View>

          {/* Contact */}
          <StyledInput
            label="Email"
            placeholder="email@example.com"
            value={formData.email}
            onChangeText={(value) => updateField('email', value)}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={isEditing}
          />

          <StyledInput
            label="Телефон"
            placeholder="+7 (999) 123-45-67"
            value={formData.phone || ''}
            onChangeText={(value) => updateField('phone', value)}
            keyboardType="phone-pad"
            editable={isEditing}
          />

          {/* Location */}
          <StyledInput
            label="Город"
            placeholder="Москва"
            value={formData.city || ''}
            onChangeText={(value) => updateField('city', value)}
            editable={isEditing}
          />

          <StyledInput
            label="Адрес"
            placeholder="Улица, дом, квартира"
            value={formData.address || ''}
            onChangeText={(value) => updateField('address', value)}
            editable={isEditing}
          />

          {/* Bio */}
          {isEditing ? (
            <StyledInput
              label="О себе"
              placeholder="Расскажите о себе..."
              value={formData.bio || ''}
              onChangeText={(value) => updateField('bio', value)}
              multiline
              numberOfLines={4}
              style={styles.bioTextInput}
            />
          ) : (
            formData.bio && (
              <View style={styles.bioContainer}>
                <Text style={styles.bioLabel}>О себе</Text>
                <Text style={styles.bioDisplay}>{formData.bio}</Text>
              </View>
            )
          )}

          {/* Save Button */}
          {isEditing && (
            <View style={styles.saveButtonContainer}>
              <StyledButton
                title={isSaving ? 'Сохранение...' : 'Сохранить'}
                onPress={handleSave}
                variant="primary"
                size="large"
                loading={isSaving}
                disabled={isSaving}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </ModernCard>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.heading.h3,
    color: colors.text.primary,
    fontWeight: '700',
  },
  editButton: {
    ...typography.body.medium,
    color: colors.primary[600],
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  cancelButton: {
    ...typography.body.medium,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  alert: {
    marginBottom: spacing.md,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatarButton: {
    position: 'relative',
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.full,
    borderWidth: 3,
    borderColor: colors.primary[300],
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  avatarText: {
    ...typography.heading.h1,
    color: colors.text.inverse,
    fontWeight: '700',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.background.primary,
  },
  avatarEditIcon: {
    fontSize: 16,
  },
  avatarHint: {
    ...typography.body.small,
    color: colors.text.tertiary,
  },
  form: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfWidth: {
    flex: 1,
  },
  rightField: {
    marginLeft: 0,
  },
  bioContainer: {
    marginTop: spacing.sm,
  },
  bioLabel: {
    ...typography.label.medium,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  bioDisplay: {
    ...typography.body.medium,
    color: colors.text.primary,
    lineHeight: 22,
    padding: spacing.md,
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.lg,
  },
  bioTextInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  saveButtonContainer: {
    marginTop: spacing.lg,
  },
});
