import React from 'react';
import { View, Text } from 'react-native';
import { QueuedAction } from '../../types/actionQueue';

interface ActionProgressBarProps {
  action: QueuedAction;
  showPercentage?: boolean;
}

export const ActionProgressBar: React.FC<ActionProgressBarProps> = ({
  action,
  showPercentage = true,
}) => {
  if (action.status !== 'processing' || action.progress === undefined) {
    return null;
  }

  return (
    <View className="w-full">
      <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <View
          className="h-full bg-blue-500 rounded-full"
          style={{ width: `${action.progress}%` }}
        />
      </View>
      {showPercentage && (
        <Text className="text-xs text-gray-500 mt-1">{action.progress}%</Text>
      )}
    </View>
  );
};








