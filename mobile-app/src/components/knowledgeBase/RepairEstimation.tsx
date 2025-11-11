import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { RepairEstimation as RepairEstimationType } from '../../types/knowledgeBase';

interface RepairEstimationProps {
  onEstimate: (issue: string, applianceType: string, brand?: string, model?: string) => void;
  estimation?: RepairEstimationType;
  isLoading?: boolean;
}

export const RepairEstimation: React.FC<RepairEstimationProps> = ({
  onEstimate,
  estimation,
  isLoading = false,
}) => {
  const [issue, setIssue] = useState('');
  const [applianceType, setApplianceType] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
    return `${hours}h ${mins}m`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const APPLIANCE_TYPES = [
    'Washing Machine',
    'Refrigerator',
    'Dishwasher',
    'Oven',
    'Microwave',
    'Air Conditioner',
  ];

  return (
    <View className="bg-white rounded-lg p-4 mb-4">
      <Text className="text-lg font-semibold text-gray-900 mb-4">
        Repair Time Estimation
      </Text>

      {/* Form */}
      <View className="mb-4">
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">Appliance Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              {APPLIANCE_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => setApplianceType(type)}
                  className={`px-4 py-2 rounded-full border-2 ${
                    applianceType === type
                      ? 'bg-blue-50 border-blue-600'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      applianceType === type ? 'text-blue-600' : 'text-gray-700'
                    }`}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">Issue Description</Text>
          <TextInput
            className="px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900"
            placeholder="Describe the issue..."
            placeholderTextColor="#9CA3AF"
            value={issue}
            onChangeText={setIssue}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <View className="flex-row gap-3 mb-4">
          <View className="flex-1">
            <Text className="text-sm font-medium text-gray-700 mb-2">Brand (Optional)</Text>
            <TextInput
              className="px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900"
              placeholder="LG, Samsung..."
              placeholderTextColor="#9CA3AF"
              value={brand}
              onChangeText={setBrand}
            />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-medium text-gray-700 mb-2">Model (Optional)</Text>
            <TextInput
              className="px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900"
              placeholder="Model number"
              placeholderTextColor="#9CA3AF"
              value={model}
              onChangeText={setModel}
            />
          </View>
        </View>

        <TouchableOpacity
          onPress={() => onEstimate(issue, applianceType, brand, model)}
          disabled={!issue || !applianceType || isLoading}
          className={`py-3 rounded-lg items-center ${
            !issue || !applianceType || isLoading
              ? 'bg-gray-300'
              : 'bg-blue-600'
          }`}
        >
          <Text className="text-white font-semibold">
            {isLoading ? 'Estimating...' : 'Get Estimate'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Estimation Results */}
      {estimation && (
        <View className="border-t border-gray-200 pt-4">
          <View className="bg-blue-50 rounded-lg p-4 mb-4">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              Estimated Repair Time
            </Text>
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-sm text-gray-600">Average</Text>
              <Text className="text-xl font-bold text-blue-600">
                {formatTime(estimation.estimatedTime.average)}
              </Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-xs text-gray-500">
                Range: {formatTime(estimation.estimatedTime.min)} -{' '}
                {formatTime(estimation.estimatedTime.max)}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center justify-between mb-4">
            <View className={`px-3 py-2 rounded-full ${getDifficultyColor(estimation.difficulty)}`}>
              <Text className="font-semibold capitalize">{estimation.difficulty}</Text>
            </View>
          </View>

          {estimation.requiredParts && estimation.requiredParts.length > 0 && (
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-900 mb-2">Required Parts</Text>
              <View className="flex-row flex-wrap gap-2">
                {estimation.requiredParts.map((part, index) => (
                  <View key={index} className="bg-gray-100 px-3 py-1 rounded-full">
                    <Text className="text-sm text-gray-700">{part}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {estimation.estimatedCost && (
            <View className="border-t border-gray-200 pt-4">
              <Text className="text-base font-semibold text-gray-900 mb-3">
                Estimated Cost
              </Text>
              <View>
                <View className="flex-row justify-between mb-2">
                  <Text className="text-sm text-gray-600">Parts</Text>
                  <Text className="text-sm font-semibold text-gray-900">
                    {formatCurrency(estimation.estimatedCost.parts)}
                  </Text>
                </View>
                <View className="flex-row justify-between mb-2">
                  <Text className="text-sm text-gray-600">Labor</Text>
                  <Text className="text-sm font-semibold text-gray-900">
                    {formatCurrency(estimation.estimatedCost.labor)}
                  </Text>
                </View>
                <View className="flex-row justify-between pt-2 border-t border-gray-200">
                  <Text className="text-base font-bold text-gray-900">Total</Text>
                  <Text className="text-base font-bold text-blue-600">
                    {formatCurrency(estimation.estimatedCost.total)}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

