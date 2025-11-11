/**
 * Feature Usage Tracking Service
 * Tracks which features are used and how often
 */

import { analyticsService } from './analyticsService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface FeatureUsageStats {
  feature: string;
  usageCount: number;
  firstUsed: string;
  lastUsed: string;
  uniqueUsers: number;
  averageSessionTime?: number;
}

export interface FeatureCategory {
  name: string;
  features: string[];
}

class FeatureUsageService {
  private featureUsage: Map<string, {
    count: number;
    firstUsed: number;
    lastUsed: number;
    sessions: Array<{ start: number; end?: number }>;
  }> = new Map();

  /**
   * Initialize feature usage tracking
   */
  initialize(): void {
    this.loadFeatureUsage();
  }

  /**
   * Track feature usage start
   */
  trackFeatureStart(featureName: string, category?: string): void {
    const now = Date.now();
    const feature = this.featureUsage.get(featureName) || {
      count: 0,
      firstUsed: now,
      lastUsed: now,
      sessions: [],
    };

    feature.count++;
    feature.lastUsed = now;
    
    // Start new session
    feature.sessions.push({ start: now });

    this.featureUsage.set(featureName, feature);

    analyticsService.track('feature_started', {
      feature: featureName,
      category,
      usageCount: feature.count,
      timestamp: new Date().toISOString(),
    });

    this.saveFeatureUsage();
  }

  /**
   * Track feature usage end
   */
  trackFeatureEnd(featureName: string): void {
    const feature = this.featureUsage.get(featureName);
    if (!feature || feature.sessions.length === 0) {
      return;
    }

    const now = Date.now();
    const lastSession = feature.sessions[feature.sessions.length - 1];
    
    if (!lastSession.end) {
      lastSession.end = now;
      const sessionDuration = now - lastSession.start;

      analyticsService.track('feature_ended', {
        feature: featureName,
        sessionDuration,
        timestamp: new Date().toISOString(),
      });

      this.saveFeatureUsage();
    }
  }

  /**
   * Track feature interaction
   */
  trackFeatureInteraction(featureName: string, action: string, properties?: Record<string, any>): void {
    analyticsService.track('feature_interaction', {
      feature: featureName,
      action,
      ...properties,
      timestamp: new Date().toISOString(),
    });

    // Update last used
    const feature = this.featureUsage.get(featureName);
    if (feature) {
      feature.lastUsed = Date.now();
      this.saveFeatureUsage();
    }
  }

  /**
   * Get feature usage stats
   */
  async getFeatureStats(featureName?: string): Promise<FeatureUsageStats[] | FeatureUsageStats | null> {
    const stats: FeatureUsageStats[] = [];

    const featuresToProcess = featureName
      ? [featureName]
      : Array.from(this.featureUsage.keys());

    for (const feature of featuresToProcess) {
      const data = this.featureUsage.get(feature);
      if (!data) {
        continue;
      }

      const sessions = data.sessions.filter(s => s.end);
      const averageSessionTime = sessions.length > 0
        ? sessions.reduce((sum, s) => sum + ((s.end || 0) - s.start), 0) / sessions.length
        : undefined;

      stats.push({
        feature,
        usageCount: data.count,
        firstUsed: new Date(data.firstUsed).toISOString(),
        lastUsed: new Date(data.lastUsed).toISOString(),
        uniqueUsers: 1, // In a real app, track unique users per feature
        averageSessionTime,
      });
    }

    if (featureName) {
      return stats[0] || null;
    }

    return stats;
  }

  /**
   * Get most used features
   */
  async getMostUsedFeatures(limit: number = 10): Promise<FeatureUsageStats[]> {
    const allStats = await this.getFeatureStats();
    if (!Array.isArray(allStats)) {
      return [];
    }

    return allStats
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit);
  }

  /**
   * Track feature category usage
   */
  trackCategoryUsage(category: string, featureName: string): void {
    analyticsService.track('category_used', {
      category,
      feature: featureName,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Get feature adoption rate
   */
  async getAdoptionRate(featureName: string, totalUsers: number): Promise<number> {
    const stats = await this.getFeatureStats(featureName);
    if (!stats || !Array.isArray(stats)) {
      return 0;
    }

    const featureStats = typeof stats === 'object' && !Array.isArray(stats) ? stats : stats[0];
    if (!featureStats) {
      return 0;
    }

    return totalUsers > 0
      ? (featureStats.uniqueUsers / totalUsers) * 100
      : 0;
  }

  /**
   * Save feature usage data
   */
  private async saveFeatureUsage(): Promise<void> {
    try {
      const data = Object.fromEntries(this.featureUsage);
      await AsyncStorage.setItem('feature_usage_data', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save feature usage:', error);
    }
  }

  /**
   * Load feature usage data
   */
  private async loadFeatureUsage(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem('feature_usage_data');
      if (data) {
        const parsed = JSON.parse(data);
        this.featureUsage = new Map(Object.entries(parsed));
      }
    } catch (error) {
      console.error('Failed to load feature usage:', error);
    }
  }

  /**
   * Reset feature usage (for testing)
   */
  async resetFeatureUsage(): Promise<void> {
    this.featureUsage.clear();
    await AsyncStorage.removeItem('feature_usage_data');
  }
}

export const featureUsageService = new FeatureUsageService();








