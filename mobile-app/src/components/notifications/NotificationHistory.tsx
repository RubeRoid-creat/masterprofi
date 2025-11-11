import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { NotificationHistoryItem, NotificationCategory } from '../../types/notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATION_HISTORY_KEY = 'notification_history';

interface NotificationHistoryProps {
  category?: NotificationCategory;
  limit?: number;
}

export const NotificationHistory: React.FC<NotificationHistoryProps> = ({
  category,
  limit = 50,
}) => {
  const [notifications, setNotifications] = useState<NotificationHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const stored = await AsyncStorage.getItem(NOTIFICATION_HISTORY_KEY);
      if (stored) {
        let history: NotificationHistoryItem[] = JSON.parse(stored);
        
        // Filter by category if specified
        if (category) {
          history = history.filter((item) => item.category === category);
        }
        
        // Limit results
        history = history.slice(0, limit);
        
        // Sort by timestamp (newest first)
        history.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        
        setNotifications(history);
      }
    } catch (error) {
      console.error('Error loading notification history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [category, limit]);

  const handleMarkAsRead = async (id: string) => {
    try {
      const stored = await AsyncStorage.getItem(NOTIFICATION_HISTORY_KEY);
      if (stored) {
        const history: NotificationHistoryItem[] = JSON.parse(stored);
        const updated = history.map((item) =>
          item.id === id ? { ...item, read: true } : item
        );
        await AsyncStorage.setItem(NOTIFICATION_HISTORY_KEY, JSON.stringify(updated));
        await loadHistory();
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('ru-RU');
  };

  const categoryColors: Record<NotificationCategory, string> = {
    new_order: 'bg-blue-100 text-blue-800',
    message: 'bg-green-100 text-green-800',
    payment: 'bg-yellow-100 text-yellow-800',
    reminder: 'bg-purple-100 text-purple-800',
    system: 'bg-gray-100 text-gray-800',
    mlm: 'bg-indigo-100 text-indigo-800',
  };

  const renderItem = ({ item }: { item: NotificationHistoryItem }) => (
    <TouchableOpacity
      onPress={() => handleMarkAsRead(item.id)}
      className={`p-4 border-b border-gray-200 ${
        !item.read ? 'bg-blue-50' : 'bg-white'
      }`}
    >
      <View className="flex-row items-start">
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <Text
              className={`text-xs px-2 py-1 rounded-full mr-2 ${categoryColors[item.category]}`}
            >
              {item.category}
            </Text>
            <Text className="text-xs text-gray-500">{formatTime(item.timestamp)}</Text>
          </View>
          <Text className="text-base font-medium text-gray-900 mb-1">
            {item.title}
          </Text>
          <Text className="text-sm text-gray-600">{item.body}</Text>
        </View>
        {!item.read && (
          <View className="w-2 h-2 bg-blue-600 rounded-full mt-2" />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={notifications}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={loadHistory} />
      }
      ListEmptyComponent={
        <View className="p-8 items-center">
          <Text className="text-gray-500">No notifications</Text>
        </View>
      }
    />
  );
};








