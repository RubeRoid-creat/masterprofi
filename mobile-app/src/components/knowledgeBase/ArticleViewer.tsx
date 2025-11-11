import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Linking,
  Alert,
} from 'react-native';
import { KnowledgeArticle, Attachment } from '../../types/knowledgeBase';
// Note: FileSystem and MediaLibrary can be used for actual file downloads
// import * as FileSystem from 'expo-file-system';
// import * as MediaLibrary from 'expo-media-library';

interface ArticleViewerProps {
  article: KnowledgeArticle;
  onClose: () => void;
  onFavorite?: (articleId: string) => void;
  onDownload?: (articleId: string) => void;
}

export const ArticleViewer: React.FC<ArticleViewerProps> = ({
  article,
  onClose,
  onFavorite,
  onDownload,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours} hour${hours > 1 ? 's' : ''} ${mins > 0 ? `${mins} minutes` : ''}`;
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // Simulate download process
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // In production, download article content and attachments
      Alert.alert('Success', 'Article downloaded for offline access');
      onDownload?.(article.id);
    } catch (error) {
      Alert.alert('Error', 'Failed to download article');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleOpenAttachment = async (attachment: Attachment) => {
    try {
      if (attachment.type === 'link') {
        await Linking.openURL(attachment.url);
      } else {
        // Handle PDF, image, video
        Alert.alert('Open', `Opening ${attachment.title}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open attachment');
    }
  };

  return (
    <Modal
      visible={true}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-gray-200 bg-white">
          <TouchableOpacity onPress={onClose}>
            <Text className="text-blue-600 font-semibold text-base">← Back</Text>
          </TouchableOpacity>
          <View className="flex-row items-center gap-3">
            {onFavorite && (
              <TouchableOpacity onPress={() => onFavorite(article.id)}>
                <Text className="text-2xl">{article.isFavorite ? '❤️' : '🤍'}</Text>
              </TouchableOpacity>
            )}
            {onDownload && (
              <TouchableOpacity
                onPress={handleDownload}
                disabled={isDownloading || article.isDownloaded}
              >
                <Text className="text-lg">
                  {isDownloading ? '⏳' : article.isDownloaded ? '📥' : '⬇️'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
          {/* Title */}
          <Text className="text-2xl font-bold text-gray-900 mb-3">{article.title}</Text>

          {/* Meta Info */}
          <View className="flex-row flex-wrap items-center gap-3 mb-4 pb-4 border-b border-gray-200">
            <Text className="text-sm text-gray-600">⏱️ {formatTime(article.estimatedTime)}</Text>
            <Text className="text-sm text-gray-600 capitalize">Difficulty: {article.difficulty}</Text>
            <Text className="text-sm text-gray-600">👁️ {article.views} views</Text>
            <Text className="text-sm text-gray-600">👍 {article.likes} likes</Text>
          </View>

          {/* Description */}
          <Text className="text-base text-gray-700 mb-6 leading-6">{article.description}</Text>

          {/* Content */}
          <Text className="text-base text-gray-900 mb-6 leading-6">{article.content}</Text>

          {/* Tags */}
          {article.tags.length > 0 && (
            <View className="mb-6">
              <Text className="text-sm font-semibold text-gray-900 mb-2">Tags</Text>
              <View className="flex-row flex-wrap gap-2">
                {article.tags.map((tag, index) => (
                  <View key={index} className="bg-gray-100 px-3 py-1 rounded-full">
                    <Text className="text-sm text-gray-700">{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Attachments */}
          {article.attachments && article.attachments.length > 0 && (
            <View className="mb-6">
              <Text className="text-base font-semibold text-gray-900 mb-3">Attachments</Text>
              {article.attachments.map((attachment) => (
                <TouchableOpacity
                  key={attachment.id}
                  onPress={() => handleOpenAttachment(attachment)}
                  className="flex-row items-center p-3 mb-2 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <Text className="text-2xl mr-3">
                    {attachment.type === 'pdf'
                      ? '📄'
                      : attachment.type === 'video'
                      ? '🎥'
                      : attachment.type === 'image'
                      ? '🖼️'
                      : '🔗'}
                  </Text>
                  <View className="flex-1">
                    <Text className="text-base font-medium text-gray-900">
                      {attachment.title}
                    </Text>
                    {attachment.size && (
                      <Text className="text-xs text-gray-500">
                        {(attachment.size / 1024).toFixed(1)} KB
                      </Text>
                    )}
                    {attachment.duration && (
                      <Text className="text-xs text-gray-500">
                        {Math.floor(attachment.duration / 60)}:{String(attachment.duration % 60).padStart(2, '0')}
                      </Text>
                    )}
                  </View>
                  <Text className="text-gray-400">→</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Appliance Types */}
          {article.applianceTypes.length > 0 && (
            <View className="mb-6">
              <Text className="text-sm font-semibold text-gray-900 mb-2">Applies To</Text>
              <View className="flex-row flex-wrap gap-2">
                {article.applianceTypes.map((type, index) => (
                  <View key={index} className="bg-blue-50 px-3 py-1 rounded-full">
                    <Text className="text-sm text-blue-800 font-medium">{type}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

