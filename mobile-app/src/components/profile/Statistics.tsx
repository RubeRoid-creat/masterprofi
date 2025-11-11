import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Statistics as StatisticsType } from '../../types/profile';
import { Svg, Rect, Circle, Text as SvgText } from 'react-native-svg';

interface StatisticsProps {
  statistics: StatisticsType;
}

export const Statistics: React.FC<StatisticsProps> = ({ statistics }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const stats = [
    {
      label: 'Completed Orders',
      value: statistics.completedOrders.toLocaleString(),
      icon: '✅',
      color: '#10B981',
    },
    {
      label: 'Total Earnings',
      value: formatCurrency(statistics.totalEarnings),
      icon: '💰',
      color: '#F59E0B',
    },
    {
      label: 'Average Rating',
      value: statistics.averageRating.toFixed(1),
      icon: '⭐',
      color: '#3B82F6',
    },
    {
      label: 'Response Time',
      value: formatTime(statistics.responseTime),
      icon: '⏱️',
      color: '#8B5CF6',
    },
    {
      label: 'Completion Rate',
      value: `${statistics.completionRate.toFixed(1)}%`,
      icon: '📊',
      color: '#EC4899',
    },
    {
      label: 'On-Time Rate',
      value: `${statistics.onTimeRate.toFixed(1)}%`,
      icon: '⏰',
      color: '#14B8A6',
    },
  ];

  return (
    <View className="bg-white rounded-lg p-4 mb-4">
      <Text className="text-lg font-semibold text-gray-900 mb-4">Statistics</Text>

      <View className="flex-row flex-wrap gap-3">
        {stats.map((stat, index) => (
          <View
            key={index}
            className="flex-1 min-w-[48%] bg-gray-50 rounded-lg p-4 border border-gray-200"
          >
            <View className="flex-row items-center mb-2">
              <Text className="text-2xl mr-2">{stat.icon}</Text>
              <View className="flex-1">
                <Text className="text-xs text-gray-600 mb-1">{stat.label}</Text>
                <Text className="text-xl font-bold text-gray-900">{stat.value}</Text>
              </View>
            </View>

            {/* Progress bar for percentages */}
            {(stat.label.includes('Rate') || stat.label.includes('Rating')) && (
              <View className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
                <View
                  className="h-full rounded-full"
                  style={{
                    width: `${parseFloat(stat.value)}%`,
                    backgroundColor: stat.color,
                  }}
                />
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );
};








