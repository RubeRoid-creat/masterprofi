import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { RecruitmentProgress as RecruitmentProgressType } from '../../types/mlm';
import { Svg, Circle, Path } from 'react-native-svg';

interface RecruitmentProgressProps {
  progress: RecruitmentProgressType;
}

export const RecruitmentProgress: React.FC<RecruitmentProgressProps> = ({
  progress,
}) => {
  const percentage = (progress.current / progress.target) * 100;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'short',
    });
  };

  return (
    <View className="bg-white rounded-lg p-4 mb-4">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-lg font-semibold text-gray-900">
          Recruitment Progress
        </Text>
        <Text className="text-sm text-gray-500 capitalize">{progress.period}</Text>
      </View>

      {/* Circular Progress */}
      <View className="items-center mb-4">
        <Svg width={120} height={120}>
          {/* Background Circle */}
          <Circle
            cx="60"
            cy="60"
            r={radius}
            stroke="#E5E7EB"
            strokeWidth="8"
            fill="none"
          />
          {/* Progress Circle */}
          <Circle
            cx="60"
            cy="60"
            r={radius}
            stroke={percentage >= 100 ? '#10B981' : '#3B82F6'}
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform="rotate(-90 60 60)"
          />
        </Svg>
        <View className="absolute items-center justify-center" style={{ top: 20, left: 0, right: 0, bottom: 0 }}>
          <Text className="text-2xl font-bold text-gray-900">{progress.current}</Text>
          <Text className="text-xs text-gray-500">of {progress.target}</Text>
          <Text className="text-xs font-medium text-blue-600 mt-1">
            {percentage.toFixed(0)}%
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View className="mb-4">
        <View className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <View
            className="h-full bg-blue-600 rounded-full"
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </View>
      </View>

      {/* Next Bonus */}
      {progress.nextBonus && (
        <View className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-sm font-semibold text-gray-900">Next Bonus</Text>
            <Text className="text-lg font-bold text-blue-600">
              {progress.nextBonus.reward.toLocaleString()} ₽
            </Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-xs text-gray-600">
              {progress.current} / {progress.nextBonus.target} referrals
            </Text>
            <Text className="text-xs text-gray-500">
              Until {formatDate(progress.nextBonus.deadline)}
            </Text>
          </View>
        </View>
      )}

      {/* Quick Action */}
      <TouchableOpacity className="mt-4 bg-blue-600 py-3 rounded-lg items-center">
        <Text className="text-white font-semibold">Invite New Members</Text>
      </TouchableOpacity>
    </View>
  );
};









