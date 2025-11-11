import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useActionQueue } from '../../hooks/useActionQueue';

interface ActionQueueIndicatorProps {
  onPress?: () => void;
  showCount?: boolean;
  className?: string;
}

export const ActionQueueIndicator: React.FC<ActionQueueIndicatorProps> = ({
  onPress,
  showCount = true,
  className = '',
}) => {
  const { stats } = useActionQueue();

  const hasPendingActions = stats.pending > 0 || stats.processing > 0 || stats.failed > 0;

  if (!hasPendingActions) {
    return null;
  }

  const getStatusColor = () => {
    if (stats.failed > 0) return 'bg-red-500';
    if (stats.processing > 0) return 'bg-blue-500';
    return 'bg-yellow-500';
  };

  const getStatusText = () => {
    if (stats.failed > 0) return 'Failed';
    if (stats.processing > 0) return 'Processing';
    return 'Pending';
  };

  const getTotalPending = () => {
    return stats.pending + stats.processing + stats.failed;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`${getStatusColor()} px-3 py-2 rounded-full flex-row items-center ${className}`}
    >
      {stats.processing > 0 && (
        <ActivityIndicator size="small" color="white" className="mr-2" />
      )}
      <Text className="text-white text-xs font-semibold">
        {getStatusText()}
        {showCount && ` (${getTotalPending()})`}
      </Text>
    </TouchableOpacity>
  );
};








