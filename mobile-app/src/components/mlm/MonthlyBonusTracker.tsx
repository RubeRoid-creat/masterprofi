import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { MonthlyBonus } from '../../types/mlm';

interface MonthlyBonusTrackerProps {
  bonuses: MonthlyBonus[];
}

export const MonthlyBonusTracker: React.FC<MonthlyBonusTrackerProps> = ({
  bonuses,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatMonth = (monthString: string) => {
    const date = new Date(monthString);
    return date.toLocaleDateString('ru-RU', { month: 'short', year: 'numeric' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'achieved':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'missed':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <View className="bg-white rounded-lg p-4 mb-4">
      <Text className="text-lg font-semibold text-gray-900 mb-4">
        Monthly Bonus Tracker
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row gap-3">
          {bonuses.map((bonus) => {
            const percentage = (bonus.achieved / bonus.target) * 100;

            return (
              <View
                key={bonus.month}
                className={`min-w-[200px] p-4 rounded-lg border-2 ${getStatusColor(
                  bonus.status
                )}`}
              >
                <Text className="text-sm font-semibold mb-2">
                  {formatMonth(bonus.month)}
                </Text>

                <View className="mb-3">
                  <View className="flex-row items-center justify-between mb-1">
                    <Text className="text-xs opacity-80">Progress</Text>
                    <Text className="text-xs font-medium">
                      {percentage.toFixed(0)}%
                    </Text>
                  </View>
                  <View className="h-2 bg-white bg-opacity-50 rounded-full overflow-hidden">
                    <View
                      className="h-full bg-white rounded-full"
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </View>
                </View>

                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-xs opacity-80">Achieved</Text>
                  <Text className="text-xs font-semibold">{bonus.achieved}</Text>
                </View>
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-xs opacity-80">Target</Text>
                  <Text className="text-xs font-semibold">{bonus.target}</Text>
                </View>

                <View className="border-t border-current border-opacity-20 pt-2 mt-2">
                  <Text className="text-lg font-bold">
                    {formatCurrency(bonus.bonus)}
                  </Text>
                  <Text className="text-xs capitalize opacity-80 mt-1">
                    {bonus.status.replace('_', ' ')}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};









