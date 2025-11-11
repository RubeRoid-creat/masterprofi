import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import * as Location from 'expo-location';
import { ServiceArea } from '../../types/profile';

interface ServiceAreaConfigProps {
  serviceArea: ServiceArea;
  onSave: (area: ServiceArea) => Promise<void>;
}

export const ServiceAreaConfig: React.FC<ServiceAreaConfigProps> = ({
  serviceArea,
  onSave,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ServiceArea>(serviceArea);
  const [isSaving, setIsSaving] = useState(false);

  const handleGetCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setFormData({
        ...formData,
        center: {
          ...formData.center,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to get location');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(formData);
      setIsEditing(false);
      Alert.alert('Success', 'Service area updated');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View className="bg-white rounded-lg p-4 mb-4">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-lg font-semibold text-gray-900">Service Area</Text>
        {!isEditing ? (
          <TouchableOpacity onPress={() => setIsEditing(true)}>
            <Text className="text-blue-600 font-medium">Edit</Text>
          </TouchableOpacity>
        ) : (
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => {
                setFormData(serviceArea);
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

      {/* Map Placeholder */}
      <View className="mb-4 h-48 bg-gray-100 rounded-lg items-center justify-center border border-gray-200">
        <Text className="text-gray-500 text-center px-4">
          Map view{'\n'}
          Center: {formData.center.latitude.toFixed(4)}, {formData.center.longitude.toFixed(4)}{'\n'}
          Radius: {formData.radius} km
        </Text>
      </View>

      {/* Address */}
      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-2">Center Address</Text>
        {isEditing ? (
          <TextInput
            className="px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900"
            placeholder="Street address"
            value={formData.center.address}
            onChangeText={(value) =>
              setFormData({
                ...formData,
                center: { ...formData.center, address: value },
              })
            }
          />
        ) : (
          <Text className="text-base text-gray-900">{formData.center.address}</Text>
        )}
      </View>

      {/* Radius */}
      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-2">Service Radius (km)</Text>
        {isEditing ? (
          <View>
            <TextInput
              className="px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900"
              placeholder="10"
              value={formData.radius.toString()}
              onChangeText={(text) =>
                setFormData({ ...formData, radius: parseInt(text) || 0 })
              }
              keyboardType="number-pad"
            />
            <View className="flex-row gap-2 mt-2">
              {[5, 10, 15, 20, 25, 30].map((r) => (
                <TouchableOpacity
                  key={r}
                  onPress={() => setFormData({ ...formData, radius: r })}
                  className={`flex-1 py-2 px-3 rounded-lg border-2 ${
                    formData.radius === r
                      ? 'bg-blue-50 border-blue-600'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  <Text
                    className={`text-center text-sm font-medium ${
                      formData.radius === r ? 'text-blue-600' : 'text-gray-700'
                    }`}
                  >
                    {r} km
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <Text className="text-base text-gray-900">{formData.radius} km</Text>
        )}
      </View>

      {/* Location Button */}
      {isEditing && (
        <TouchableOpacity
          onPress={handleGetCurrentLocation}
          className="bg-blue-600 py-3 rounded-lg items-center mb-4"
        >
          <Text className="text-white font-semibold">📍 Use Current Location</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};








