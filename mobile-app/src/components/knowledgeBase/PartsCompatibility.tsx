import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { PartsCompatibility as PartsCompatibilityType } from '../../types/knowledgeBase';

interface PartsCompatibilityProps {
  onSearch: (partNumber: string) => void;
  compatibility?: PartsCompatibilityType;
  isLoading?: boolean;
}

export const PartsCompatibility: React.FC<PartsCompatibilityProps> = ({
  onSearch,
  compatibility,
  isLoading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  const getCompatibilityColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <View className="bg-white rounded-lg p-4 mb-4">
      <Text className="text-lg font-semibold text-gray-900 mb-4">
        Parts Compatibility Database
      </Text>

      {/* Search */}
      <View className="flex-row gap-2 mb-4">
        <TextInput
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900"
          placeholder="Enter part number..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity
          onPress={handleSearch}
          className="bg-blue-600 px-6 py-3 rounded-lg"
          disabled={isLoading}
        >
          <Text className="text-white font-semibold">
            {isLoading ? '...' : 'Search'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Results */}
      {compatibility && (
        <View className="border-t border-gray-200 pt-4">
          <View className="mb-4">
            <Text className="text-xl font-bold text-gray-900 mb-1">
              {compatibility.partName}
            </Text>
            <Text className="text-sm text-gray-600">
              Part Number: {compatibility.partNumber}
            </Text>
            <Text className="text-sm text-gray-600">Brand: {compatibility.brand}</Text>
          </View>

          {/* Compatible Parts */}
          {compatibility.compatibleWith.length > 0 && (
            <View className="mb-4">
              <Text className="text-base font-semibold text-gray-900 mb-3">
                Compatible Parts ({compatibility.compatibleWith.length})
              </Text>
              <ScrollView showsVerticalScrollIndicator={false}>
                {compatibility.compatibleWith.map((part, index) => (
                  <View
                    key={index}
                    className="flex-row items-center justify-between p-3 mb-2 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-gray-900">
                        {part.partName}
                      </Text>
                      <Text className="text-sm text-gray-600">
                        {part.partNumber} • {part.brand}
                      </Text>
                      {part.notes && (
                        <Text className="text-xs text-gray-500 mt-1">{part.notes}</Text>
                      )}
                    </View>
                    <View className="items-end">
                      <View
                        className={`px-3 py-1 rounded-full ${getCompatibilityColor(
                          part.compatibilityScore
                        )}`}
                      >
                        <Text className="text-sm font-bold">{part.compatibilityScore}%</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Alternatives */}
          {compatibility.alternatives.length > 0 && (
            <View className="mb-4">
              <Text className="text-base font-semibold text-gray-900 mb-2">
                Alternative Parts
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {compatibility.alternatives.map((alt, index) => (
                  <View key={index} className="bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                    <Text className="text-sm text-blue-800">{alt}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Incompatible */}
          {compatibility.incompatibleWith.length > 0 && (
            <View>
              <Text className="text-base font-semibold text-red-900 mb-2">
                ⚠️ Not Compatible With
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {compatibility.incompatibleWith.map((inc, index) => (
                  <View key={index} className="bg-red-50 px-3 py-1 rounded-full border border-red-200">
                    <Text className="text-sm text-red-800">{inc}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
};








