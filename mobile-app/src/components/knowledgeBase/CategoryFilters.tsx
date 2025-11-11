import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { ArticleCategory } from '../../types/knowledgeBase';
import { colors, typography, spacing, borderRadius } from '../../theme';

interface CategoryFiltersProps {
  selectedCategories: ArticleCategory[];
  onCategoryToggle: (category: ArticleCategory) => void;
}

const CATEGORIES: Array<{ key: ArticleCategory; label: string; icon: string }> = [
  { key: 'manual', label: 'Руководства', icon: '📖' },
  { key: 'troubleshooting', label: 'Диагностика', icon: '🔧' },
  { key: 'tutorial', label: 'Уроки', icon: '🎓' },
  { key: 'parts', label: 'Запчасти', icon: '🔩' },
  { key: 'common_issue', label: 'Частые проблемы', icon: '⚠️' },
  { key: 'repair_guide', label: 'Руководства по ремонту', icon: '📋' },
];

export const CategoryFilters: React.FC<CategoryFiltersProps> = ({
  selectedCategories,
  onCategoryToggle,
}) => {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {CATEGORIES.map((category) => {
          const isSelected = selectedCategories.includes(category.key);
          return (
            <TouchableOpacity
              key={category.key}
              onPress={() => onCategoryToggle(category.key)}
              style={[
                styles.categoryButton,
                isSelected ? styles.categoryButtonSelected : styles.categoryButtonUnselected,
              ]}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text
                style={[
                  styles.categoryText,
                  isSelected ? styles.categoryTextSelected : styles.categoryTextUnselected,
                ]}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  categoryButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginRight: spacing.xs,
    borderRadius: borderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryButtonSelected: {
    backgroundColor: colors.primary[600],
  },
  categoryButtonUnselected: {
    backgroundColor: colors.gray[100],
  },
  categoryIcon: {
    ...typography.body.medium,
    marginRight: spacing.xs,
  },
  categoryText: {
    ...typography.body.small,
    fontWeight: '600',
  },
  categoryTextSelected: {
    color: colors.text.inverse,
  },
  categoryTextUnselected: {
    color: colors.text.secondary,
  },
});
