import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useGallery } from '../../hooks/useGallery';
import { MediaItem } from '../../types/media';
import { offlineMediaQueue } from '../../services/offlineMediaQueue';

interface MediaGalleryProps {
  orderId?: string;
  type?: MediaItem['type'];
  onMediaSelect?: (media: MediaItem) => void;
  showUploadStatus?: boolean;
}

export const MediaGallery: React.FC<MediaGalleryProps> = ({
  orderId,
  type,
  onMediaSelect,
  showUploadStatus = true,
}) => {
  const { media, isLoading, refresh, removeMedia } = useGallery({
    orderId,
    type,
    autoLoad: true,
  });

  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [queueCount, setQueueCount] = useState(0);

  React.useEffect(() => {
    const updateQueueCount = () => {
      setQueueCount(offlineMediaQueue.getQueueCount());
    };

    updateQueueCount();
    const unsubscribe = offlineMediaQueue.addListener(updateQueueCount);

    return unsubscribe;
  }, []);

  const handleMediaPress = (item: MediaItem) => {
    setSelectedMedia(item);
    onMediaSelect?.(item);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <View className="items-center justify-center p-8">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-500 mt-2">Loading gallery...</Text>
      </View>
    );
  }

  if (media.length === 0) {
    return (
      <View className="items-center justify-center p-8">
        <Text className="text-gray-500">No media items</Text>
      </View>
    );
  }

  return (
    <View className="bg-white rounded-lg p-4">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-lg font-semibold text-gray-900">
          Gallery ({media.length})
        </Text>
        {showUploadStatus && queueCount > 0 && (
          <View className="bg-yellow-100 px-3 py-1 rounded-full">
            <Text className="text-yellow-800 text-xs font-semibold">
              {queueCount} pending upload
            </Text>
          </View>
        )}
      </View>

      <FlatList
        data={media}
        numColumns={3}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleMediaPress(item)}
            className="m-1"
          >
            <View className="relative">
              {item.type === 'photo' || item.type === 'scan' ? (
                <Image
                  source={{ uri: item.thumbnailUri || item.uri }}
                  className="w-24 h-24 rounded-lg"
                  resizeMode="cover"
                />
              ) : item.type === 'video' ? (
                <View className="w-24 h-24 rounded-lg bg-gray-900 items-center justify-center">
                  <Text className="text-white text-2xl">▶</Text>
                  {item.thumbnailUri && (
                    <Image
                      source={{ uri: item.thumbnailUri }}
                      className="absolute inset-0 rounded-lg"
                      resizeMode="cover"
                    />
                  )}
                </View>
              ) : (
                <View className="w-24 h-24 rounded-lg bg-gray-200 items-center justify-center">
                  <Text className="text-gray-600 text-2xl">📄</Text>
                </View>
              )}

              {/* Status Indicators */}
              {item.uploaded && (
                <View className="absolute top-1 right-1 bg-green-500 rounded-full w-3 h-3" />
              )}
              {!item.uploaded && item.cloudUrl && (
                <View className="absolute top-1 right-1 bg-blue-500 rounded-full w-3 h-3" />
              )}
              {showUploadStatus && !item.uploaded && !item.cloudUrl && (
                <View className="absolute top-1 right-1 bg-yellow-500 rounded-full w-3 h-3" />
              )}
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View className="items-center justify-center p-8">
            <Text className="text-gray-500">No media items</Text>
          </View>
        }
      />

      {/* Media Viewer Modal */}
      <Modal
        visible={selectedMedia !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedMedia(null)}
      >
        <View className="flex-1 bg-black items-center justify-center">
          <TouchableOpacity
            onPress={() => setSelectedMedia(null)}
            className="absolute top-12 right-4 z-10 bg-white bg-opacity-20 px-4 py-2 rounded-full"
          >
            <Text className="text-white font-semibold">Close</Text>
          </TouchableOpacity>

          {selectedMedia && (
            <View className="items-center">
              {selectedMedia.type === 'photo' || selectedMedia.type === 'scan' ? (
                <Image
                  source={{ uri: selectedMedia.uri }}
                  className="w-full h-96"
                  resizeMode="contain"
                />
              ) : selectedMedia.type === 'video' ? (
                <View className="w-full h-96 items-center justify-center">
                  <Text className="text-white">Video Player</Text>
                  <Text className="text-gray-400 mt-2">{selectedMedia.name}</Text>
                </View>
              ) : (
                <View className="w-full h-96 items-center justify-center">
                  <Text className="text-white text-6xl mb-4">📄</Text>
                  <Text className="text-white text-lg">{selectedMedia.name}</Text>
                  <Text className="text-gray-400 mt-2">
                    {formatFileSize(selectedMedia.size)}
                  </Text>
                </View>
              )}

              <View className="mt-4 px-4">
                <Text className="text-white font-semibold">{selectedMedia.name}</Text>
                <Text className="text-gray-400 text-sm">
                  {formatDate(selectedMedia.createdAt)} • {formatFileSize(selectedMedia.size)}
                </Text>
              </View>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
};








