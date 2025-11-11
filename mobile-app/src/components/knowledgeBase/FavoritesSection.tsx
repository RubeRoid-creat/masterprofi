import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { KnowledgeArticle } from '../../types/knowledgeBase';
import { ArticleCard } from './ArticleCard';

interface FavoritesSectionProps {
  favoriteArticles: KnowledgeArticle[];
  onArticlePress?: (article: KnowledgeArticle) => void;
  onUnfavorite?: (articleId: string) => void;
}

export const FavoritesSection: React.FC<FavoritesSectionProps> = ({
  favoriteArticles,
  onArticlePress,
  onUnfavorite,
}) => {
  return (
    <View className="bg-white rounded-lg p-4 mb-4">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-lg font-semibold text-gray-900">Favorites</Text>
        <Text className="text-sm text-gray-500">{favoriteArticles.length} saved</Text>
      </View>

      {favoriteArticles.length === 0 ? (
        <View className="py-12 items-center">
          <Text className="text-4xl mb-3">🤍</Text>
          <Text className="text-gray-500 text-lg mb-2">No favorites yet</Text>
          <Text className="text-gray-400 text-sm text-center">
            Save articles you find useful
          </Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {favoriteArticles.map((article) => (
            <View key={article.id}>
              <ArticleCard
                article={article}
                onPress={() => onArticlePress?.(article)}
                onFavorite={() => onUnfavorite?.(article.id)}
              />
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};








