import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useActionQueue } from '../../hooks/useActionQueue';
import { QueuedAction, ActionStatus } from '../../types/actionQueue';

interface ActionQueueListProps {
  visible: boolean;
  onClose: () => void;
}

export const ActionQueueList: React.FC<ActionQueueListProps> = ({
  visible,
  onClose,
}) => {
  const { actions, stats, resolveConflict, retryAction, dequeue } = useActionQueue();
  const [expandedAction, setExpandedAction] = useState<string | null>(null);

  const getStatusColor = (status: ActionStatus): string => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'conflict':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString('ru-RU');
  };

  const renderAction = ({ item }: { item: QueuedAction }) => {
    const isExpanded = expandedAction === item.id;

    return (
      <View className="bg-white rounded-lg p-4 mb-3 border border-gray-200">
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-1">
            <Text className="text-base font-semibold text-gray-900">
              {item.type.replace(/_/g, ' ').toUpperCase()}
            </Text>
            <View className="flex-row items-center mt-1 gap-2">
              <Text className={`text-xs px-2 py-1 rounded-full ${getStatusColor(item.status)}`}>
                {item.status}
              </Text>
              {item.progress !== undefined && item.status === 'processing' && (
                <View className="flex-1">
                  <View className="h-1 bg-gray-200 rounded-full overflow-hidden">
                    <View
                      className="h-full bg-blue-500"
                      style={{ width: `${item.progress}%` }}
                    />
                  </View>
                  <Text className="text-xs text-gray-500 mt-1">{item.progress}%</Text>
                </View>
              )}
            </View>
          </View>
          <TouchableOpacity
            onPress={() => setExpandedAction(isExpanded ? null : item.id)}
            className="ml-2"
          >
            <Text className="text-blue-600">{isExpanded ? '▼' : '▶'}</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-xs text-gray-500">
          {formatTime(item.createdAt)} • Retries: {item.retryCount}/{item.maxRetries}
        </Text>

        {item.error && (
          <View className="mt-2 bg-red-50 border border-red-200 rounded p-2">
            <Text className="text-xs text-red-800">{item.error}</Text>
          </View>
        )}

        {isExpanded && (
          <View className="mt-3 pt-3 border-t border-gray-200">
            <Text className="text-xs text-gray-600 mb-2">
              <Text className="font-semibold">Payload:</Text>
            </Text>
            <Text className="text-xs text-gray-500 font-mono">
              {JSON.stringify(item.payload, null, 2)}
            </Text>

            {item.status === 'failed' && item.retryCount < item.maxRetries && (
              <TouchableOpacity
                onPress={() => retryAction(item.id)}
                className="mt-3 bg-blue-600 px-4 py-2 rounded-lg"
              >
                <Text className="text-white text-sm font-semibold text-center">
                  Retry
                </Text>
              </TouchableOpacity>
            )}

            {item.status === 'conflict' && (
              <View className="mt-3">
                <Text className="text-xs font-semibold text-gray-900 mb-2">
                  Conflict Resolution:
                </Text>
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    onPress={() => resolveConflict(item.id, 'local_wins')}
                    className="flex-1 bg-yellow-600 px-3 py-2 rounded-lg"
                  >
                    <Text className="text-white text-xs font-semibold text-center">
                      Use Local
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => resolveConflict(item.id, 'server_wins')}
                    className="flex-1 bg-blue-600 px-3 py-2 rounded-lg"
                  >
                    <Text className="text-white text-xs font-semibold text-center">
                      Use Server
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {item.status === 'completed' && (
              <TouchableOpacity
                onPress={() => dequeue(item.id)}
                className="mt-3 bg-gray-200 px-4 py-2 rounded-lg"
              >
                <Text className="text-gray-700 text-sm font-semibold text-center">
                  Remove
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-gray-50">
        <View className="bg-white px-4 py-4 border-b border-gray-200">
          <View className="flex-row items-center justify-between">
            <Text className="text-xl font-bold text-gray-900">Action Queue</Text>
            <TouchableOpacity onPress={onClose}>
              <Text className="text-blue-600 font-semibold">Close</Text>
            </TouchableOpacity>
          </View>

          {/* Statistics */}
          <View className="flex-row gap-2 mt-4">
            <View className="flex-1 bg-yellow-50 rounded-lg p-2">
              <Text className="text-xs text-gray-600">Pending</Text>
              <Text className="text-lg font-bold text-yellow-700">{stats.pending}</Text>
            </View>
            <View className="flex-1 bg-blue-50 rounded-lg p-2">
              <Text className="text-xs text-gray-600">Processing</Text>
              <Text className="text-lg font-bold text-blue-700">{stats.processing}</Text>
            </View>
            <View className="flex-1 bg-red-50 rounded-lg p-2">
              <Text className="text-xs text-gray-600">Failed</Text>
              <Text className="text-lg font-bold text-red-700">{stats.failed}</Text>
            </View>
            <View className="flex-1 bg-green-50 rounded-lg p-2">
              <Text className="text-xs text-gray-600">Completed</Text>
              <Text className="text-lg font-bold text-green-700">{stats.completed}</Text>
            </View>
          </View>
        </View>

        <FlatList
          data={actions}
          renderItem={renderAction}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <View className="items-center justify-center py-12">
              <Text className="text-gray-500">No actions in queue</Text>
            </View>
          }
        />
      </View>
    </Modal>
  );
};








