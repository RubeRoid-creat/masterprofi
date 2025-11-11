import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { KnowledgeArticle } from '../../types/knowledgeBase';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';

interface ArticleCardProps {
  article: KnowledgeArticle;
  onPress: (article: KnowledgeArticle) => void;
  onFavorite?: (articleId: string) => void;
  onDownload?: (articleId: string) => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  onPress,
  onFavorite,
  onDownload,
}) => {
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}м`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}ч ${mins}м`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return { bg: colors.success[100], text: colors.success[800] };
      case 'medium':
        return { bg: colors.warning[100], text: colors.warning[800] };
      case 'hard':
        return { bg: colors.error[100], text: colors.error[800] };
      default:
        return { bg: colors.gray[100], text: colors.gray[800] };
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'manual':
        return '📖';
      case 'troubleshooting':
        return '🔧';
      case 'tutorial':
        return '🎓';
      case 'parts':
        return '🔩';
      case 'common_issue':
        return '⚠️';
      case 'repair_guide':
        return '📋';
      default:
        return '📄';
    }
  };

  const difficultyColors = getDifficultyColor(article.difficulty);

  return (
    <TouchableOpacity
      onPress={() => onPress(article)}
      style={styles.container}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.categoryIcon}>{getCategoryIcon(article.category)}</Text>
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={2}>
              {article.title}
            </Text>
            <Text style={styles.description} numberOfLines={1}>
              {article.description}
            </Text>
          </View>
        </View>
      </View>

      {/* Tags and Info */}
      <View style={styles.tagsContainer}>
        {article.applianceTypes.slice(0, 2).map((type, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>{type}</Text>
          </View>
        ))}
        <View style={[styles.difficultyBadge, { backgroundColor: difficultyColors.bg }]}>
          <Text style={[styles.difficultyText, { color: difficultyColors.text }]}>
            {article.difficulty === 'easy' ? 'Легко' : article.difficulty === 'medium' ? 'Средне' : 'Сложно'}
          </Text>
        </View>
        <Text style={styles.timeText}>⏱ {formatTime(article.estimatedTime)}</Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>👁 {article.views}</Text>
          <Text style={styles.metaText}>❤️ {article.likes}</Text>
        </View>
        <View style={styles.actionsRow}>
          {onFavorite && (
            <TouchableOpacity
              onPress={() => onFavorite(article.id)}
              style={styles.actionButton}
            >
              <Text style={styles.actionIcon}>{article.isFavorite ? '❤️' : '🤍'}</Text>
            </TouchableOpacity>
          )}
          {onDownload && (
            <TouchableOpacity
              onPress={() => onDownload(article.id)}
              style={styles.actionButton}
            >
              <Text style={styles.actionIcon}>{article.isDownloaded ? '📥' : '⬇️'}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: spacing.xs,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    ...typography.body.medium,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.body.small,
    color: colors.text.tertiary,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  tag: {
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  tagText: {
    ...typography.body.xsmall,
    color: colors.primary[700],
  },
  difficultyBadge: {
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  difficultyText: {
    ...typography.body.xsmall,
    fontWeight: '600',
  },
  timeText: {
    ...typography.body.xsmall,
    color: colors.text.tertiary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  metaText: {
    ...typography.body.xsmall,
    color: colors.text.tertiary,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  actionButton: {
    padding: spacing.xs,
  },
  actionIcon: {
    fontSize: 18,
  },
});
