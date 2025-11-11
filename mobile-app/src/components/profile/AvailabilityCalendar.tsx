import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { Availability, DaySchedule, TimeSlot } from '../../types/profile';

interface AvailabilityCalendarProps {
  availability: Availability;
  onSave: (availability: Availability) => Promise<void>;
}

const DAYS = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
];

export const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  availability,
  onSave,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Availability>(availability);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const toggleDayAvailability = (dayKey: keyof typeof formData.schedule) => {
    setFormData({
      ...formData,
      schedule: {
        ...formData.schedule,
        [dayKey]: {
          ...formData.schedule[dayKey],
          isAvailable: !formData.schedule[dayKey].isAvailable,
        },
      },
    });
  };

  const addTimeSlot = (dayKey: keyof typeof formData.schedule) => {
    const newSlot: TimeSlot = { start: '09:00', end: '18:00' };
    setFormData({
      ...formData,
      schedule: {
        ...formData.schedule,
        [dayKey]: {
          ...formData.schedule[dayKey],
          timeSlots: [...formData.schedule[dayKey].timeSlots, newSlot],
        },
      },
    });
  };

  const removeTimeSlot = (dayKey: keyof typeof formData.schedule, index: number) => {
    setFormData({
      ...formData,
      schedule: {
        ...formData.schedule,
        [dayKey]: {
          ...formData.schedule[dayKey],
          timeSlots: formData.schedule[dayKey].timeSlots.filter((_, i) => i !== index),
        },
      },
    });
  };

  const handleSave = async () => {
    await onSave(formData);
    setIsEditing(false);
  };

  return (
    <View className="bg-white rounded-lg p-4 mb-4">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-lg font-semibold text-gray-900">Availability</Text>
        {!isEditing ? (
          <TouchableOpacity onPress={() => setIsEditing(true)}>
            <Text className="text-blue-600 font-medium">Edit</Text>
          </TouchableOpacity>
        ) : (
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => {
                setFormData(availability);
                setIsEditing(false);
              }}
            >
              <Text className="text-gray-600 font-medium">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} className="bg-blue-600 px-4 py-2 rounded-lg">
              <Text className="text-white font-semibold">Save</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Availability Status */}
      <View className="flex-row items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
        <Text className="text-base font-medium text-gray-900">Status</Text>
        <View className="flex-row items-center">
          <View
            className={`w-3 h-3 rounded-full mr-2 ${
              formData.isAvailable ? 'bg-green-500' : 'bg-gray-400'
            }`}
          />
          <Text className="text-base font-semibold text-gray-900">
            {formData.isAvailable ? 'Available' : 'Unavailable'}
          </Text>
        </View>
      </View>

      {/* Weekly Schedule */}
      <View>
        {DAYS.map((day) => {
          const dayKey = day.key as keyof typeof formData.schedule;
          const schedule = formData.schedule[dayKey];

          return (
            <View key={day.key} className="mb-3 pb-3 border-b border-gray-100">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-base font-medium text-gray-900">{day.label}</Text>
                {isEditing && (
                  <TouchableOpacity
                    onPress={() => toggleDayAvailability(dayKey)}
                    className={`px-3 py-1 rounded-full ${
                      schedule.isAvailable ? 'bg-green-100' : 'bg-gray-100'
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        schedule.isAvailable ? 'text-green-700' : 'text-gray-600'
                      }`}
                    >
                      {schedule.isAvailable ? 'Available' : 'Unavailable'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {schedule.isAvailable && schedule.timeSlots.length > 0 && (
                <View className="flex-row flex-wrap gap-2 mt-2">
                  {schedule.timeSlots.map((slot, index) => (
                    <View
                      key={index}
                      className="flex-row items-center bg-blue-50 px-3 py-2 rounded-lg"
                    >
                      <Text className="text-sm font-medium text-blue-900">
                        {slot.start} - {slot.end}
                      </Text>
                      {isEditing && (
                        <TouchableOpacity
                          onPress={() => removeTimeSlot(dayKey, index)}
                          className="ml-2"
                        >
                          <Text className="text-red-600 text-sm">×</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                  {isEditing && (
                    <TouchableOpacity
                      onPress={() => addTimeSlot(dayKey)}
                      className="bg-blue-600 px-3 py-2 rounded-lg"
                    >
                      <Text className="text-white text-sm font-medium">+ Add Time</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {schedule.isAvailable && schedule.timeSlots.length === 0 && isEditing && (
                <TouchableOpacity
                  onPress={() => addTimeSlot(dayKey)}
                  className="bg-gray-100 px-4 py-2 rounded-lg mt-2"
                >
                  <Text className="text-gray-700 text-sm font-medium">+ Add Time Slot</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
};








