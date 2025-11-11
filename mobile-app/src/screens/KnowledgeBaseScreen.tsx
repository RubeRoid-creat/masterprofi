import React, { useState, useMemo } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Text,
  StyleSheet,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../theme';
import {
  KnowledgeArticle,
  ArticleCategory,
  SearchFilters,
  TroubleshootingGuide,
  VideoTutorial,
  PartsCompatibility as PartsCompatibilityType,
  RepairEstimation as RepairEstimationType,
  CommonIssue,
} from '../types/knowledgeBase';
import { SearchBar } from '../components/knowledgeBase/SearchBar';
import { CategoryFilters } from '../components/knowledgeBase/CategoryFilters';
import { ArticleCard } from '../components/knowledgeBase/ArticleCard';
import { ArticleViewer } from '../components/knowledgeBase/ArticleViewer';
import { TroubleshootingGuide as TroubleshootingGuideComponent } from '../components/knowledgeBase/TroubleshootingGuide';
import { VideoTutorials } from '../components/knowledgeBase/VideoTutorials';
import { PartsCompatibility } from '../components/knowledgeBase/PartsCompatibility';
import { RepairEstimation } from '../components/knowledgeBase/RepairEstimation';
import { CommonIssues } from '../components/knowledgeBase/CommonIssues';
import { OfflineDownloads } from '../components/knowledgeBase/OfflineDownloads';
import { FavoritesSection } from '../components/knowledgeBase/FavoritesSection';

interface KnowledgeBaseScreenProps {
  userId?: string;
}

export const KnowledgeBaseScreen: React.FC<KnowledgeBaseScreenProps> = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<ArticleCategory[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);
  const [selectedTab, setSelectedTab] = useState<'articles' | 'troubleshooting' | 'videos' | 'parts' | 'favorites' | 'offline'>('articles');

  // Get articles from API
  // TODO: Create knowledge base API endpoint and use it here
  // For now, show empty state - all data will come from backend API
  const [articles] = useState<KnowledgeArticle[]>([]);
  const [troubleshootingGuides] = useState<TroubleshootingGuide[]>([]);
  const [videoTutorials] = useState<VideoTutorial[]>([]);
  const [commonIssues] = useState<CommonIssue[]>([]);

  const [favoriteArticles, setFavoriteArticles] = useState<KnowledgeArticle[]>([]);
  const [downloadedArticles, setDownloadedArticles] = useState<KnowledgeArticle[]>([]);

  const [partsCompatibility, setPartsCompatibility] = useState<PartsCompatibilityType | undefined>();
  const [repairEstimation, setRepairEstimation] = useState<RepairEstimationType | undefined>();

  const filteredArticles = useMemo(() => {
    let filtered = articles;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (article) =>
          article.title.toLowerCase().includes(query) ||
          article.description.toLowerCase().includes(query) ||
          article.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    if (selectedCategories.length > 0) {
      filtered = filtered.filter((article) =>
        selectedCategories.includes(article.category)
      );
    }

    if (filters.applianceType && filters.applianceType.length > 0) {
      filtered = filtered.filter((article) =>
        article.applianceTypes.some((type) => filters.applianceType!.includes(type))
      );
    }

    if (filters.difficulty && filters.difficulty.length > 0) {
      filtered = filtered.filter((article) =>
        filters.difficulty!.includes(article.difficulty)
      );
    }

    return filtered;
  }, [searchQuery, selectedCategories, filters, articles]);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Fetch latest data
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleFavorite = (articleId: string) => {
    const article = articles.find((a) => a.id === articleId);
    if (article) {
      article.isFavorite = !article.isFavorite;
      setFavoriteArticles(articles.filter((a) => a.isFavorite));
    }
  };

  const handleDownload = async (articleId: string) => {
    const article = articles.find((a) => a.id === articleId);
    if (article) {
      article.isDownloaded = !article.isDownloaded;
      setDownloadedArticles(articles.filter((a) => a.isDownloaded));
    }
  };

  const handlePartsSearch = async (partNumber: string) => {
    // TODO: Call real API endpoint for parts compatibility
    // For now, show empty state
    setPartsCompatibility(undefined);
  };

  const handleEstimate = async (
    issue: string,
    applianceType: string,
    brand?: string,
    model?: string
  ) => {
    // TODO: Call real API endpoint for repair estimation
    // For now, show empty state
    setRepairEstimation(undefined);
  };

  const getFilterCount = () => {
    let count = 0;
    if (selectedCategories.length > 0) count++;
    if (filters.applianceType && filters.applianceType.length > 0) count++;
    if (filters.difficulty && filters.difficulty.length > 0) count++;
    return count;
  };

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScrollContent}
        >
          {[
            { key: 'articles', label: 'Статьи' },
            { key: 'troubleshooting', label: 'Диагностика' },
            { key: 'videos', label: 'Видео' },
            { key: 'parts', label: 'Запчасти' },
            { key: 'favorites', label: 'Избранное' },
            { key: 'offline', label: 'Офлайн' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setSelectedTab(tab.key as any)}
              style={[
                styles.tab,
                selectedTab === tab.key ? styles.tabActive : styles.tabInactive,
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedTab === tab.key ? styles.tabTextActive : styles.tabTextInactive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Search Bar */}
        {(selectedTab === 'articles' || selectedTab === 'troubleshooting') && (
          <SearchBar
            onSearch={setSearchQuery}
            onFiltersPress={() => {}}
            filterCount={getFilterCount()}
          />
        )}

        {/* Category Filters */}
        {selectedTab === 'articles' && (
          <CategoryFilters
            selectedCategories={selectedCategories}
            onCategoryToggle={(category) => {
              setSelectedCategories((prev) =>
                prev.includes(category)
                  ? prev.filter((c) => c !== category)
                  : [...prev, category]
              );
            }}
          />
        )}

        {/* Content by Tab */}
        {selectedTab === 'articles' && (
          <View>
            {filteredArticles.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>Статьи не найдены</Text>
                <Text style={styles.emptySubtitle}>
                  Попробуйте изменить поиск или фильтры
                </Text>
              </View>
            ) : (
              filteredArticles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  onPress={setSelectedArticle}
                  onFavorite={handleFavorite}
                  onDownload={handleDownload}
                />
              ))
            )}
          </View>
        )}

        {selectedTab === 'troubleshooting' && (
          <View>
            {troubleshootingGuides.map((guide) => (
              <TroubleshootingGuideComponent
                key={guide.id}
                guide={guide}
                onSolutionSelect={(solutionId) => {
                  console.log('Solution selected:', solutionId);
                }}
              />
            ))}
          </View>
        )}

        {selectedTab === 'videos' && (
          <VideoTutorials
            tutorials={videoTutorials}
            onVideoPress={(tutorial) => {
              console.log('Video pressed:', tutorial.id);
            }}
          />
        )}

        {selectedTab === 'parts' && (
          <View>
            <PartsCompatibility
              onSearch={handlePartsSearch}
              compatibility={partsCompatibility}
            />
            <RepairEstimation
              onEstimate={handleEstimate}
              estimation={repairEstimation}
            />
          </View>
        )}

        {selectedTab === 'favorites' && (
          <FavoritesSection
            favoriteArticles={favoriteArticles}
            onArticlePress={setSelectedArticle}
            onUnfavorite={handleFavorite}
          />
        )}

        {selectedTab === 'offline' && (
          <OfflineDownloads
            downloadedArticles={downloadedArticles}
            onArticlePress={setSelectedArticle}
            onDelete={handleDownload}
          />
        )}
      </ScrollView>

      {/* Article Viewer Modal */}
      {selectedArticle && (
        <ArticleViewer
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
          onFavorite={handleFavorite}
          onDownload={handleDownload}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  tabContainer: {
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  tabScrollContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  tab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginRight: spacing.xs,
    borderRadius: borderRadius.full,
  },
  tabActive: {
    backgroundColor: colors.primary[600],
  },
  tabInactive: {
    backgroundColor: colors.gray[100],
  },
  tabText: {
    ...typography.body.small,
    fontWeight: '600',
  },
  tabTextActive: {
    color: colors.text.inverse,
  },
  tabTextInactive: {
    color: colors.text.secondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
  },
  emptyContainer: {
    paddingVertical: spacing['3xl'],
    alignItems: 'center',
  },
  emptyTitle: {
    ...typography.heading.h3,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    ...typography.body.small,
    color: colors.text.disabled,
  },
});

