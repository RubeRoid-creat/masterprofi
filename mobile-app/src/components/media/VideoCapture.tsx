import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useMediaCapture } from '../../hooks/useMediaCapture';
import { MediaItem } from '../../types/media';

interface VideoCaptureProps {
  orderId?: string;
  maxVideos?: number;
  onVideosChange?: (videos: MediaItem[]) => void;
  existingVideos?: MediaItem[];
  maxDuration?: number;
}

export const VideoCapture: React.FC<VideoCaptureProps> = ({
  orderId,
  maxVideos = 3,
  onVideosChange,
  existingVideos = [],
  maxDuration = 300, // 5 minutes
}) => {
  const { recordVideo, selectVideo, isCapturing, error } = useMediaCapture({
    orderId,
    autoUpload: true,
    autoAddToGallery: true,
  });

  const [videos, setVideos] = useState<MediaItem[]>(existingVideos);

  const handleRecord = async () => {
    if (videos.length >= maxVideos) {
      Alert.alert('Limit Reached', `Maximum ${maxVideos} videos allowed`);
      return;
    }

    const video = await recordVideo({
      quality: 'high',
      maxDuration,
      allowsEditing: true,
    });

    if (video) {
      const newVideos = [...videos, video];
      setVideos(newVideos);
      onVideosChange?.(newVideos);
    }
  };

  const handleSelect = async () => {
    if (videos.length >= maxVideos) {
      Alert.alert('Limit Reached', `Maximum ${maxVideos} videos allowed`);
      return;
    }

    const video = await selectVideo({
      quality: 'high',
      maxDuration,
      allowsEditing: true,
    });

    if (video) {
      const newVideos = [...videos, video];
      setVideos(newVideos);
      onVideosChange?.(newVideos);
    }
  };

  const handleRemove = (videoId: string) => {
    Alert.alert('Remove Video', 'Are you sure you want to remove this video?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          const newVideos = videos.filter((v) => v.id !== videoId);
          setVideos(newVideos);
          onVideosChange?.(newVideos);
        },
      },
    ]);
  };

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View className="bg-white rounded-lg p-4">
      <Text className="text-lg font-semibold text-gray-900 mb-4">
        Videos ({videos.length}/{maxVideos})
      </Text>

      {error && (
        <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <Text className="text-red-800 text-sm">{error}</Text>
        </View>
      )}

      {/* Action Buttons */}
      <View className="flex-row gap-3 mb-4">
        <TouchableOpacity
          onPress={handleRecord}
          disabled={isCapturing || videos.length >= maxVideos}
          className={`flex-1 bg-purple-600 px-4 py-3 rounded-lg ${
            isCapturing || videos.length >= maxVideos ? 'opacity-50' : ''
          }`}
        >
          {isCapturing ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold text-center">🎥 Record</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSelect}
          disabled={isCapturing || videos.length >= maxVideos}
          className={`flex-1 bg-indigo-600 px-4 py-3 rounded-lg ${
            isCapturing || videos.length >= maxVideos ? 'opacity-50' : ''
          }`}
        >
          <Text className="text-white font-semibold text-center">📹 Gallery</Text>
        </TouchableOpacity>
      </View>

      {/* Videos List */}
      {videos.length > 0 && (
        <View className="gap-3">
          {videos.map((video) => (
            <View key={video.id} className="flex-row items-center bg-gray-50 rounded-lg p-3">
              {video.thumbnailUri && (
                <Image
                  source={{ uri: video.thumbnailUri }}
                  className="w-16 h-16 rounded-lg mr-3"
                  resizeMode="cover"
                />
              )}
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-900" numberOfLines={1}>
                  {video.name}
                </Text>
                {video.duration && (
                  <Text className="text-xs text-gray-500">
                    Duration: {formatDuration(video.duration)}
                  </Text>
                )}
                {video.size && (
                  <Text className="text-xs text-gray-500">
                    Size: {(video.size / 1024 / 1024).toFixed(2)} MB
                  </Text>
                )}
              </View>
              <TouchableOpacity
                onPress={() => handleRemove(video.id)}
                className="bg-red-100 px-3 py-1 rounded"
              >
                <Text className="text-red-600 text-xs font-semibold">Remove</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};








