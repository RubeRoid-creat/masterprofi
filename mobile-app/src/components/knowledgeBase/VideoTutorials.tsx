import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Modal } from 'react-native';
import { VideoTutorial } from '../../types/knowledgeBase';

interface VideoTutorialsProps {
  tutorials: VideoTutorial[];
  onVideoPress?: (tutorial: VideoTutorial) => void;
}

export const VideoTutorials: React.FC<VideoTutorialsProps> = ({
  tutorials,
  onVideoPress,
}) => {
  const [selectedVideo, setSelectedVideo] = useState<VideoTutorial | null>(null);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  return (
    <View className="bg-white rounded-lg p-4 mb-4">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-lg font-semibold text-gray-900">Video Tutorials</Text>
        <TouchableOpacity>
          <Text className="text-blue-600 font-medium text-sm">View All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row gap-3">
          {tutorials.map((tutorial) => (
            <TouchableOpacity
              key={tutorial.id}
              onPress={() => {
                setSelectedVideo(tutorial);
                onVideoPress?.(tutorial);
              }}
              className="w-72 bg-gray-50 rounded-lg overflow-hidden border border-gray-200"
            >
              {/* Thumbnail */}
              <View className="relative">
                <Image
                  source={{ uri: tutorial.thumbnailUrl }}
                  className="w-full h-40"
                  resizeMode="cover"
                />
                <View className="absolute bottom-2 right-2 bg-black bg-opacity-70 px-2 py-1 rounded">
                  <Text className="text-white text-xs font-medium">
                    {formatDuration(tutorial.duration)}
                  </Text>
                </View>
                <View className="absolute inset-0 items-center justify-center">
                  <View className="bg-black bg-opacity-50 rounded-full p-4">
                    <Text className="text-white text-2xl">▶</Text>
                  </View>
                </View>
              </View>

              {/* Info */}
              <View className="p-3">
                <Text className="text-base font-semibold text-gray-900 mb-1" numberOfLines={2}>
                  {tutorial.title}
                </Text>
                <Text className="text-xs text-gray-500 mb-2" numberOfLines={1}>
                  {tutorial.applianceType} • {tutorial.category}
                </Text>
                <View className="flex-row items-center justify-between">
                  <Text className="text-xs text-gray-500">
                    👁️ {formatViews(tutorial.views)} • 👍 {tutorial.likes}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    {new Date(tutorial.createdAt).toLocaleDateString('ru-RU', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Video Player Modal */}
      {selectedVideo && (
        <Modal
          visible={selectedVideo !== null}
          animationType="fade"
          transparent
          onRequestClose={() => setSelectedVideo(null)}
        >
          <View className="flex-1 bg-black items-center justify-center p-4">
            <TouchableOpacity
              onPress={() => setSelectedVideo(null)}
              className="absolute top-12 right-4 z-10 bg-white bg-opacity-20 rounded-full w-10 h-10 items-center justify-center"
            >
              <Text className="text-white text-2xl font-bold">×</Text>
            </TouchableOpacity>
            <View className="w-full h-64 bg-gray-900 rounded-lg items-center justify-center">
              <Text className="text-white text-center px-4">
                Video player would be displayed here{'\n'}
                {selectedVideo.title}
              </Text>
              {/* In production, use react-native-video or expo-av */}
            </View>
            <View className="mt-4 w-full">
              <Text className="text-white text-lg font-semibold mb-2">
                {selectedVideo.title}
              </Text>
              <Text className="text-gray-300 text-sm">{selectedVideo.description}</Text>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};








