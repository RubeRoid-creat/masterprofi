import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { PersonalInfo } from '../../types/profile';
import { getFirstChar } from '../../utils/stringHelpers';

interface PersonalInfoEditorProps {
  personalInfo: PersonalInfo;
  onSave: (info: PersonalInfo) => Promise<void>;
  isEditing?: boolean;
}

export const PersonalInfoEditor: React.FC<PersonalInfoEditorProps> = ({
  personalInfo,
  onSave,
  isEditing: initialEditing = false,
}) => {
  const [isEditing, setIsEditing] = useState(initialEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<PersonalInfo>(personalInfo);

  const handleAvatarPick = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Photo library access is required');
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
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(formData);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field: keyof PersonalInfo, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <View className="bg-white rounded-lg p-4 mb-4">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-lg font-semibold text-gray-900">Personal Information</Text>
        {!isEditing ? (
          <TouchableOpacity onPress={() => setIsEditing(true)}>
            <Text className="text-blue-600 font-medium">Edit</Text>
          </TouchableOpacity>
        ) : (
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => {
                setFormData(personalInfo);
                setIsEditing(false);
              }}
            >
              <Text className="text-gray-600 font-medium">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              disabled={isSaving}
              className="bg-blue-600 px-4 py-2 rounded-lg"
            >
              <Text className="text-white font-semibold">
                {isSaving ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Avatar */}
      <View className="items-center mb-6">
        <TouchableOpacity
          onPress={isEditing ? handleAvatarPick : undefined}
          disabled={!isEditing}
        >
          {formData.avatar ? (
            <Image
              source={{ uri: formData.avatar }}
              className="w-24 h-24 rounded-full"
            />
          ) : (
            <View className="w-24 h-24 rounded-full bg-blue-500 items-center justify-center">
              <Text className="text-white text-3xl font-semibold">
                {getFirstChar(formData.firstName)}
              </Text>
            </View>
          )}
          {isEditing && (
            <View className="absolute bottom-0 right-0 bg-blue-600 rounded-full w-8 h-8 items-center justify-center border-2 border-white">
              <Text className="text-white text-lg">📷</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Form Fields */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View>
          {/* Name */}
          <View className="flex-row gap-3 mb-4">
            <View className="flex-1">
              <Text className="text-sm font-medium text-gray-700 mb-2">First Name</Text>
              <TextInput
                className="px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900"
                placeholder="John"
                value={formData.firstName}
                onChangeText={(value) => updateField('firstName', value)}
                editable={isEditing}
              />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-medium text-gray-700 mb-2">Last Name</Text>
              <TextInput
                className="px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900"
                placeholder="Doe"
                value={formData.lastName}
                onChangeText={(value) => updateField('lastName', value)}
                editable={isEditing}
              />
            </View>
          </View>

          {/* Contact */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Email</Text>
            <TextInput
              className="px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900"
              placeholder="john@example.com"
              value={formData.email}
              onChangeText={(value) => updateField('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={isEditing}
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Phone</Text>
            <TextInput
              className="px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900"
              placeholder="+7 (999) 123-45-67"
              value={formData.phone}
              onChangeText={(value) => updateField('phone', value)}
              keyboardType="phone-pad"
              editable={isEditing}
            />
          </View>

          {/* Location */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">City</Text>
            <TextInput
              className="px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900"
              placeholder="Moscow"
              value={formData.city}
              onChangeText={(value) => updateField('city', value)}
              editable={isEditing}
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Address</Text>
            <TextInput
              className="px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900"
              placeholder="Street, building, apartment"
              value={formData.address || ''}
              onChangeText={(value) => updateField('address', value)}
              editable={isEditing}
            />
          </View>

          {/* Bio */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Bio</Text>
            <TextInput
              className="px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900"
              placeholder="Tell us about yourself..."
              value={formData.bio || ''}
              onChangeText={(value) => updateField('bio', value)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              editable={isEditing}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

