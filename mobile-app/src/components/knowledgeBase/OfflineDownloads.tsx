import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { KnowledgeArticle } from '../../types/knowledgeBase';

interface OfflineDownloadsProps {
  downloadedArticles: KnowledgeArticle[];
  onArticlePress?: (article: KnowledgeArticle) => void;
  onDelete?: (articleId: string) => void;
}

export const OfflineDownloads: React.FC<OfflineDownloadsProps> = ({
  downloadedArticles,
  onArticlePress,
  onDelete,
}) => {
  const formatSize = (size?: number) => {
    if (!size) return 'Unknown';
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getTotalSize = () => {
    // Calculate total size of downloaded articles
    return downloadedArticles.reduce((total, article) => {
      const articleSize = article.attachments?.reduce(
        (sum, att) => sum + (att.size || 0),
        0
      ) || 0;
      return total + articleSize;
    }, 0);
  };

  return (
    <View className="bg-white rounded-lg p-4 mb-4">
      <View className="flex-row items-center justify-between mb-4">
        <View>
          <Text className="text-lg font-semibold text-gray-900">Offline Downloads</Text>
          <Text className="text-sm text-gray-500">
            {downloadedArticles.length} articles • {formatSize(getTotalSize())}
          </Text>
        </View>
      </View>

      {downloadedArticles.length === 0 ? (
        <View className="py-12 items-center">
          <Text className="text-4xl mb-3">📥</Text>
          <Text className="text-gray-500 text-lg mb-2">No offline content</Text>
          <Text className="text-gray-400 text-sm text-center">
            Download articles to access them offline
          </Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {downloadedArticles.map((article) => (
            <TouchableOpacity
              key={article.id}
              onPress={() => onArticlePress?.(article)}
              className="flex-row items-center justify-between p-3 mb-2 bg-gray-50 rounded-lg border border-gray-200"
            >
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900 mb-1" numberOfLines={1}>
                  {article.title}
                </Text>
                <Text className="text-xs text-gray-500">
                  {article.category} • {formatSize(
                    article.attachments?.reduce((sum, att) => sum + (att.size || 0), 0)
                  )}
                </Text>
              </View>
              {onDelete && (
                <TouchableOpacity
                  onPress={() => onDelete(article.id)}
                  className="ml-2 bg-red-100 px-3 py-2 rounded-lg"
                >
                  <Text className="text-red-600 text-xs font-medium">Delete</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};








