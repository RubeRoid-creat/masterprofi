import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { EarningsProjection } from '../../types/earnings';

interface EarningsProjectionProps {
  projections: EarningsProjection[];
  currentEarnings: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const EarningsProjectionComponent: React.FC<EarningsProjectionProps> = ({
  projections,
  currentEarnings,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return '#10B981';
    if (confidence >= 60) return '#F59E0B';
    return '#EF4444';
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'week':
        return 'Week';
      case 'month':
        return 'Month';
      case 'quarter':
        return 'Quarter';
      case 'year':
        return 'Year';
      default:
        return period;
    }
  };

  return (
    <View className="bg-white rounded-lg p-4 mb-4">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-lg font-semibold text-gray-900">Earnings Projections</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row gap-4">
          {projections.map((projection, index) => {
            const growth = ((projection.projected - currentEarnings) / currentEarnings) * 100;

            return (
              <View
                key={index}
                className="min-w-[280px] bg-blue-50 rounded-xl p-5 border border-blue-200"
              >
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-base font-semibold text-gray-900">
                    {getPeriodLabel(projection.period)}
                  </Text>
                  <View
                    className="px-3 py-1 rounded-full"
                    style={{ backgroundColor: `${getConfidenceColor(projection.confidence)}20` }}
                  >
                    <Text
                      className="text-xs font-medium"
                      style={{ color: getConfidenceColor(projection.confidence) }}
                    >
                      {projection.confidence}% confidence
                    </Text>
                  </View>
                </View>

                <Text className="text-3xl font-bold text-gray-900 mb-2">
                  {formatCurrency(projection.projected)}
                </Text>

                <View className="flex-row items-center mb-4">
                  <Text
                    className={`text-sm font-medium ${
                      growth >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {growth >= 0 ? '↑' : '↓'} {Math.abs(growth).toFixed(1)}%
                  </Text>
                  <Text className="text-xs text-gray-500 ml-2">
                    from current
                  </Text>
                </View>

                <View className="bg-white rounded-lg p-3 mb-3">
                  <Text className="text-xs text-gray-600 mb-2">Based on: {projection.basedOn}</Text>
                  <View className="space-y-1">
                    <View className="flex-row justify-between">
                      <Text className="text-xs text-gray-500">Trend</Text>
                      <Text className="text-xs font-medium text-gray-900">
                        {projection.factors.currentTrend > 0 ? '+' : ''}
                        {projection.factors.currentTrend.toFixed(1)}%
                      </Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-xs text-gray-500">Average</Text>
                      <Text className="text-xs font-medium text-gray-900">
                        {formatCurrency(projection.factors.historicalAverage)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Simple progress indicator */}
                <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <View
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(projection.confidence, 100)}%`,
                      backgroundColor: getConfidenceColor(projection.confidence),
                    }}
                  />
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

