import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNotifications } from '../../hooks/useNotifications';
import { NotificationCategory, NotificationPreferences } from '../../types/notifications';

interface NotificationPreferencesProps {
  onClose?: () => void;
}

export const NotificationPreferencesScreen: React.FC<NotificationPreferencesProps> = ({
  onClose,
}) => {
  const { preferences, updatePreferences, isLoading } = useNotifications();
  const [localPreferences, setLocalPreferences] = useState<NotificationPreferences>(
    preferences
  );

  React.useEffect(() => {
    setLocalPreferences(preferences);
  }, [preferences]);

  const handleToggleEnabled = (enabled: boolean) => {
    setLocalPreferences({ ...localPreferences, enabled });
  };

  const handleCategoryToggle = (category: NotificationCategory, field: 'enabled' | 'sound' | 'vibrate', value: boolean) => {
    setLocalPreferences({
      ...localPreferences,
      categories: {
        ...localPreferences.categories,
        [category]: {
          ...localPreferences.categories[category],
          [field]: value,
        },
      },
    });
  };

  const handleCategoryPriority = (category: NotificationCategory, priority: 'high' | 'normal' | 'low') => {
    setLocalPreferences({
      ...localPreferences,
      categories: {
        ...localPreferences.categories,
        [category]: {
          ...localPreferences.categories[category],
          priority,
        },
      },
    });
  };

  const handleSave = async () => {
    try {
      await updatePreferences(localPreferences);
      Alert.alert('Success', 'Notification preferences saved');
      onClose?.();
    } catch (error) {
      Alert.alert('Error', 'Failed to save preferences');
    }
  };

  const handleToggleQuietHours = (enabled: boolean) => {
    setLocalPreferences({
      ...localPreferences,
      quietHours: localPreferences.quietHours
        ? { ...localPreferences.quietHours, enabled }
        : {
            enabled,
            startTime: '22:00',
            endTime: '08:00',
          },
    });
  };

  const categoryLabels: Record<NotificationCategory, string> = {
    new_order: 'New Orders',
    message: 'Messages',
    payment: 'Payments',
    reminder: 'Reminders',
    system: 'System',
    mlm: 'MLM Updates',
  };

  const priorityLabels = {
    high: 'High',
    normal: 'Normal',
    low: 'Low',
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Loading preferences...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        {/* Global Toggle */}
        <View className="bg-gray-50 rounded-lg p-4 mb-4">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-lg font-semibold text-gray-900">
              Notifications Enabled
            </Text>
            <Switch
              value={localPreferences.enabled}
              onValueChange={handleToggleEnabled}
            />
          </View>
          <Text className="text-sm text-gray-500">
            Turn off all notifications
          </Text>
        </View>

        {/* Category Settings */}
        <Text className="text-lg font-semibold text-gray-900 mb-3">
          Notification Categories
        </Text>

        {(Object.keys(localPreferences.categories) as NotificationCategory[]).map((category) => (
          <View key={category} className="bg-gray-50 rounded-lg p-4 mb-3">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-base font-medium text-gray-900">
                {categoryLabels[category]}
              </Text>
              <Switch
                value={localPreferences.categories[category].enabled && localPreferences.enabled}
                onValueChange={(value) => handleCategoryToggle(category, 'enabled', value)}
                disabled={!localPreferences.enabled}
              />
            </View>

            {localPreferences.categories[category].enabled && localPreferences.enabled && (
              <View className="ml-4 space-y-3">
                {/* Sound */}
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-gray-700">Sound</Text>
                  <Switch
                    value={localPreferences.categories[category].sound}
                    onValueChange={(value) => handleCategoryToggle(category, 'sound', value)}
                  />
                </View>

                {/* Vibrate */}
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-gray-700">Vibrate</Text>
                  <Switch
                    value={localPreferences.categories[category].vibrate}
                    onValueChange={(value) => handleCategoryToggle(category, 'vibrate', value)}
                  />
                </View>

                {/* Priority */}
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-gray-700">Priority</Text>
                  <View className="flex-row gap-2">
                    {(['low', 'normal', 'high'] as const).map((priority) => (
                      <TouchableOpacity
                        key={priority}
                        onPress={() => handleCategoryPriority(category, priority)}
                        className={`px-3 py-1 rounded ${
                          localPreferences.categories[category].priority === priority
                            ? 'bg-blue-600'
                            : 'bg-gray-200'
                        }`}
                      >
                        <Text
                          className={`text-xs font-medium ${
                            localPreferences.categories[category].priority === priority
                              ? 'text-white'
                              : 'text-gray-700'
                          }`}
                        >
                          {priorityLabels[priority]}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            )}
          </View>
        ))}

        {/* Quiet Hours */}
        <View className="bg-gray-50 rounded-lg p-4 mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <View>
              <Text className="text-base font-medium text-gray-900">
                Quiet Hours
              </Text>
              <Text className="text-sm text-gray-500">
                No notifications during these hours
              </Text>
            </View>
            <Switch
              value={localPreferences.quietHours?.enabled || false}
              onValueChange={handleToggleQuietHours}
            />
          </View>

          {localPreferences.quietHours?.enabled && (
            <View className="ml-4 mt-2">
              <Text className="text-sm text-gray-700">
                {localPreferences.quietHours.startTime} - {localPreferences.quietHours.endTime}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  // TODO: Open time picker
                  Alert.alert('Time Picker', 'Select quiet hours start and end time');
                }}
                className="mt-2"
              >
                <Text className="text-blue-600 text-sm">Change Time</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Badge Settings */}
        <View className="bg-gray-50 rounded-lg p-4 mb-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-base font-medium text-gray-900">
                Badge Count
              </Text>
              <Text className="text-sm text-gray-500">
                Show notification count on app icon
              </Text>
            </View>
            <Switch
              value={localPreferences.badgeEnabled}
              onValueChange={(value) =>
                setLocalPreferences({ ...localPreferences, badgeEnabled: value })
              }
            />
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSave}
          className="bg-blue-600 px-6 py-4 rounded-lg items-center"
        >
          <Text className="text-white font-semibold text-base">Save Preferences</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};








