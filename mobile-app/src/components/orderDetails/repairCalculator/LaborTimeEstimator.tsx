import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { LaborEstimate } from '../../../types/repairCalculator';

interface LaborTimeEstimatorProps {
  laborEstimate: LaborEstimate;
  onLaborChange: (estimate: LaborEstimate) => void;
  applianceType: string;
  onBack: () => void;
  onNext: () => void;
}

const estimatedTimes: Record<string, { min: number; max: number }> = {
  'washing-machine': { min: 60, max: 180 },
  'refrigerator': { min: 90, max: 240 },
  'dishwasher': { min: 60, max: 150 },
  'oven': { min: 45, max: 120 },
  'dryer': { min: 45, max: 120 },
  'default': { min: 60, max: 180 },
};

const laborCategories = [
  { value: 'diagnosis', label: 'Diagnosis', hourlyRate: 1000 },
  { value: 'repair', label: 'Repair', hourlyRate: 1500 },
  { value: 'installation', label: 'Installation', hourlyRate: 2000 },
  { value: 'maintenance', label: 'Maintenance', hourlyRate: 1200 },
];

export const LaborTimeEstimator: React.FC<LaborTimeEstimatorProps> = ({
  laborEstimate,
  onLaborChange,
  applianceType,
  onBack,
  onNext,
}) => {
  const [hours, setHours] = useState(laborEstimate.hours);
  const [minutes, setMinutes] = useState(laborEstimate.minutes);
  const [category, setCategory] = useState(laborEstimate.category);
  const [description, setDescription] = useState(laborEstimate.description);

  const applianceEstimate = estimatedTimes[applianceType] || estimatedTimes.default;

  const handleQuickSelect = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    setHours(h);
    setMinutes(m);
    updateEstimate(h, m, category, description);
  };

  const updateEstimate = (
    h: number,
    m: number,
    cat: typeof category,
    desc: string
  ) => {
    const selectedCategory = laborCategories.find((c) => c.value === cat);
    const hourlyRate = selectedCategory?.hourlyRate || 1500;

    onLaborChange({
      hours: h,
      minutes: m,
      hourlyRate,
      description: desc,
      category: cat,
    });
  };

  const handleCategoryChange = (cat: typeof category) => {
    setCategory(cat);
    updateEstimate(hours, minutes, cat, description);
  };

  const handleDescriptionChange = (desc: string) => {
    setDescription(desc);
    updateEstimate(hours, minutes, category, desc);
  };

  const formatTime = (h: number, m: number) => {
    const parts = [];
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}min`);
    return parts.join(' ') || '0min';
  };

  const totalMinutes = hours * 60 + minutes;
  const laborCost = (hours + minutes / 60) * laborEstimate.hourlyRate;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <View className="flex-1">
      <Text className="text-lg font-semibold text-gray-900 mb-4">Labor Time Estimation</Text>

      {/* Category Selection */}
      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-2">Work Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2">
            {laborCategories.map((cat) => (
              <TouchableOpacity
                key={cat.value}
                onPress={() => handleCategoryChange(cat.value as any)}
                className={`px-4 py-2 rounded-lg border ${
                  category === cat.value
                    ? 'bg-blue-600 border-blue-600'
                    : 'bg-white border-gray-300'
                }`}
              >
                <Text
                  className={`font-medium ${
                    category === cat.value ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  {cat.label}
                </Text>
                <Text
                  className={`text-xs ${
                    category === cat.value ? 'text-blue-100' : 'text-gray-500'
                  }`}
                >
                  {formatCurrency(cat.hourlyRate)}/hr
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Quick Time Estimates */}
      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-2">
          Quick Select (Typical for {applianceType})
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {[
            { label: '30 min', value: 30 },
            { label: '1 hour', value: 60 },
            { label: '1.5 hours', value: 90 },
            { label: '2 hours', value: 120 },
            { label: '3 hours', value: 180 },
          ]
            .filter((t) => t.value >= applianceEstimate.min && t.value <= applianceEstimate.max)
            .map((time) => (
              <TouchableOpacity
                key={time.value}
                onPress={() => handleQuickSelect(time.value)}
                className={`px-4 py-2 rounded-lg border ${
                  totalMinutes === time.value
                    ? 'bg-blue-600 border-blue-600'
                    : 'bg-white border-gray-300'
                }`}
              >
                <Text
                  className={`font-medium ${
                    totalMinutes === time.value ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  {time.label}
                </Text>
              </TouchableOpacity>
            ))}
        </View>
      </View>

      {/* Manual Time Input */}
      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-2">Manual Input</Text>
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Text className="text-xs text-gray-500 mb-1">Hours</Text>
            <TextInput
              className="px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900"
              placeholder="0"
              value={hours.toString()}
              onChangeText={(text) => {
                const h = parseInt(text) || 0;
                setHours(h);
                updateEstimate(h, minutes, category, description);
              }}
              keyboardType="number-pad"
            />
          </View>
          <View className="flex-1">
            <Text className="text-xs text-gray-500 mb-1">Minutes</Text>
            <TextInput
              className="px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900"
              placeholder="0"
              value={minutes.toString()}
              onChangeText={(text) => {
                const m = Math.max(0, Math.min(59, parseInt(text) || 0));
                setMinutes(m);
                updateEstimate(hours, m, category, description);
              }}
              keyboardType="number-pad"
            />
          </View>
        </View>
        <Text className="text-xs text-gray-500 mt-1">
          Total: {formatTime(hours, minutes)}
        </Text>
      </View>

      {/* Description */}
      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-2">Work Description</Text>
        <TextInput
          className="px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900"
          placeholder="Describe the work to be performed..."
          value={description}
          onChangeText={handleDescriptionChange}
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Labor Cost Preview */}
      <View className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-sm text-gray-600">Time</Text>
          <Text className="text-sm font-semibold text-gray-900">
            {formatTime(hours, minutes)}
          </Text>
        </View>
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-sm text-gray-600">Rate</Text>
          <Text className="text-sm font-semibold text-gray-900">
            {formatCurrency(laborEstimate.hourlyRate)}/hr
          </Text>
        </View>
        <View className="flex-row justify-between items-center pt-2 border-t border-blue-200">
          <Text className="text-base font-bold text-gray-900">Labor Cost</Text>
          <Text className="text-lg font-bold text-blue-600">
            {formatCurrency(laborCost)}
          </Text>
        </View>
      </View>

      {/* Navigation */}
      <View className="flex-row gap-3">
        <TouchableOpacity
          onPress={onBack}
          className="flex-1 bg-gray-200 px-4 py-3 rounded-lg"
        >
          <Text className="text-gray-800 font-semibold text-center">Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onNext}
          className="flex-1 bg-blue-600 px-4 py-3 rounded-lg"
        >
          <Text className="text-white font-semibold text-center">Next: Review</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};








