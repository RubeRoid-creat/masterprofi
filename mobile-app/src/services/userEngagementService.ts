/**
 * User Engagement Analytics Service
 * Tracks user engagement metrics
 */

import { analyticsService } from './analyticsService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, AppStateStatus } from 'react-native';

export interface EngagementMetrics {
  sessionDuration: number;
  screenViews: number;
  interactions: number;
  activeDays: number;
  lastActiveDate: string;
  timeSpentPerScreen: { [screen: string]: number };
  featureUsageCount: { [feature: string]: number };
}

class UserEngagementService {
  private sessionStartTime: number = 0;
  private screenStartTime: { [screen: string]: number } = {};
  private interactionsCount: number = 0;
  private featureUsage: { [feature: string]: number } = {};
  private appState: AppStateStatus = 'active';

  /**
   * Initialize engagement tracking
   */
  initialize(): void {
    this.sessionStartTime = Date.now();
    this.trackSessionStart();
    
    // Load historical data
    this.loadEngagementData();
    
    // Track app state changes
    AppState.addEventListener('change', this.handleAppStateChange);
  }

  /**
   * Track screen view
   */
  trackScreenView(screenName: string, properties?: Record<string, any>): void {
    const now = Date.now();
    
    // Track time spent on previous screen
    if (Object.keys(this.screenStartTime).length > 0) {
      const previousScreen = Object.keys(this.screenStartTime)[0];
      const timeSpent = now - this.screenStartTime[previousScreen];
      this.recordScreenTime(previousScreen, timeSpent);
    }

    // Start tracking new screen
    this.screenStartTime = { [screenName]: now };
    
    analyticsService.trackScreenView(screenName, {
      ...properties,
      engagement: true,
    });

    // Track screen view count
    this.incrementMetric('screenViews');
  }

  /**
   * Track user interaction
   */
  trackInteraction(
    interactionType: 'tap' | 'swipe' | 'scroll' | 'input' | 'button_click',
    target?: string,
    properties?: Record<string, any>
  ): void {
    this.interactionsCount++;
    
    analyticsService.trackAction(`interaction_${interactionType}`, {
      target,
      interactionNumber: this.interactionsCount,
      ...properties,
    });

    this.incrementMetric('interactions');
    this.saveEngagementData();
  }

  /**
   * Track feature usage
   */
  trackFeatureUsage(featureName: string, properties?: Record<string, any>): void {
    if (!this.featureUsage[featureName]) {
      this.featureUsage[featureName] = 0;
    }
    this.featureUsage[featureName]++;

    analyticsService.trackAction('feature_used', {
      feature: featureName,
      usageCount: this.featureUsage[featureName],
      ...properties,
    });

    this.incrementMetric('featureUsage', featureName);
    this.saveEngagementData();
  }

  /**
   * Track time spent on screen
   */
  private recordScreenTime(screenName: string, timeSpent: number): void {
    analyticsService.trackPerformance('screen_time', timeSpent, 'ms', {
      screen: screenName,
    });
  }

  /**
   * Track session start
   */
  private trackSessionStart(): void {
    analyticsService.track('session_start', {
      timestamp: new Date().toISOString(),
    });

    // Update active days
    this.updateActiveDays();
  }

  /**
   * Track session end
   */
  trackSessionEnd(): void {
    const sessionDuration = Date.now() - this.sessionStartTime;
    
    analyticsService.track('session_end', {
      duration: sessionDuration,
      interactions: this.interactionsCount,
      screensViewed: Object.keys(this.screenStartTime).length,
    });

    // Track time spent on current screen
    if (Object.keys(this.screenStartTime).length > 0) {
      const currentScreen = Object.keys(this.screenStartTime)[0];
      const timeSpent = Date.now() - this.screenStartTime[currentScreen];
      this.recordScreenTime(currentScreen, timeSpent);
    }

    this.saveEngagementData();
  }

  /**
   * Get engagement metrics
   */
  async getMetrics(): Promise<EngagementMetrics> {
    const data = await this.loadStoredMetrics();
    const sessionDuration = Date.now() - this.sessionStartTime;

    return {
      sessionDuration,
      screenViews: data.screenViews || 0,
      interactions: this.interactionsCount + (data.interactions || 0),
      activeDays: data.activeDays || 0,
      lastActiveDate: data.lastActiveDate || new Date().toISOString(),
      timeSpentPerScreen: data.timeSpentPerScreen || {},
      featureUsageCount: { ...this.featureUsage, ...(data.featureUsage || {}) },
    };
  }

  /**
   * Update active days
   */
  private async updateActiveDays(): Promise<void> {
    try {
      const data = await this.loadStoredMetrics();
      const today = new Date().toISOString().split('T')[0];
      const lastActive = data.lastActiveDate?.split('T')[0];

      if (lastActive !== today) {
        data.activeDays = (data.activeDays || 0) + 1;
        data.lastActiveDate = new Date().toISOString();
        await this.saveMetrics(data);
      }
    } catch (error) {
      console.error('Failed to update active days:', error);
    }
  }

  /**
   * Increment metric
   */
  private incrementMetric(metric: string, feature?: string): void {
    if (metric === 'featureUsage' && feature) {
      // Handled separately
      return;
    }

    this.saveEngagementData();
  }

  /**
   * Handle app state changes
   */
  private handleAppStateChange = (nextAppState: AppStateStatus): void => {
    if (this.appState === 'active' && nextAppState.match(/inactive|background/)) {
      // App going to background - end session
      this.trackSessionEnd();
    } else if (this.appState.match(/inactive|background/) && nextAppState === 'active') {
      // App coming to foreground - start new session
      this.sessionStartTime = Date.now();
      this.trackSessionStart();
    }
    this.appState = nextAppState;
  };

  /**
   * Load stored metrics
   */
  private async loadStoredMetrics(): Promise<Partial<EngagementMetrics>> {
    try {
      const data = await AsyncStorage.getItem('engagement_metrics');
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Failed to load engagement metrics:', error);
      return {};
    }
  }

  /**
   * Save metrics
   */
  private async saveMetrics(data: Partial<EngagementMetrics>): Promise<void> {
    try {
      await AsyncStorage.setItem('engagement_metrics', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save engagement metrics:', error);
    }
  }

  /**
   * Save engagement data
   */
  private async saveEngagementData(): Promise<void> {
    const current = await this.loadStoredMetrics();
    const updated = {
      ...current,
      screenViews: (current.screenViews || 0) + Object.keys(this.screenStartTime).length,
      interactions: (current.interactions || 0) + this.interactionsCount,
      featureUsage: { ...(current.featureUsageCount || {}), ...this.featureUsage },
    };
    await this.saveMetrics(updated);
  }

  /**
   * Load engagement data
   */
  private async loadEngagementData(): Promise<void> {
    const data = await this.loadStoredMetrics();
    this.featureUsage = data.featureUsageCount || {};
  }

  /**
   * Reset metrics (for testing)
   */
  async resetMetrics(): Promise<void> {
    await AsyncStorage.removeItem('engagement_metrics');
    this.interactionsCount = 0;
    this.featureUsage = {};
    this.screenStartTime = {};
  }
}

export const userEngagementService = new UserEngagementService();








