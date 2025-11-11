/**
 * Analytics Service
 * Centralized analytics tracking with multiple provider support
 */

import { config } from '../config/environments';
import { AppState, AppStateStatus } from 'react-native';
import * as Device from 'expo-device';

export type AnalyticsEvent = 
  | 'screen_view'
  | 'order_created'
  | 'order_accepted'
  | 'order_completed'
  | 'message_sent'
  | 'payment_completed'
  | 'user_registered'
  | 'user_logged_in'
  | 'feature_used'
  | 'error_occurred'
  | 'custom';

export interface AnalyticsProperties {
  [key: string]: string | number | boolean | undefined;
}

class AnalyticsService {
  private enabled: boolean = false;
  private userId: string | null = null;
  private sessionId: string;
  private startTime: number;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    this.enabled = config.enableAnalytics && config.analytics.enabled === true;
  }

  /**
   * Initialize analytics
   */
  async initialize(): Promise<void> {
    if (!this.enabled) {
      console.log('Analytics disabled');
      return;
    }

    // Initialize analytics providers
    // This would initialize Firebase Analytics, Mixpanel, etc.
    console.log('Analytics initialized');

    // Track app open
    this.track('screen_view', {
      screen_name: 'app_launch',
    });

    // Track session start
    this.track('session_start', {
      session_id: this.sessionId,
      device_model: Device.modelName || 'unknown',
      os_version: Device.osVersion || 'unknown',
    });

    // Listen for app state changes
    AppState.addEventListener('change', this.handleAppStateChange);
  }

  /**
   * Set user ID for analytics
   */
  setUserId(userId: string): void {
    this.userId = userId;
    // Set user ID in analytics providers
    console.log(`Analytics: User ID set to ${userId}`);
  }

  /**
   * Clear user ID
   */
  clearUserId(): void {
    this.userId = null;
    console.log('Analytics: User ID cleared');
  }

  /**
   * Track event
   */
  track(event: AnalyticsEvent, properties?: AnalyticsProperties): void {
    if (!this.enabled) {
      return;
    }

    const eventData = {
      event,
      properties: {
        ...properties,
        user_id: this.userId,
        session_id: this.sessionId,
        timestamp: new Date().toISOString(),
        environment: config.environment,
      },
    };

    // Send to analytics providers
    this.sendToProviders(eventData);

    // Log in development
    if (config.environment === 'development') {
      console.log('Analytics Event:', event, eventData);
    }
  }

  /**
   * Track screen view
   */
  trackScreenView(screenName: string, properties?: AnalyticsProperties): void {
    this.track('screen_view', {
      screen_name: screenName,
      ...properties,
    });
  }

  /**
   * Track user action
   */
  trackAction(action: string, properties?: AnalyticsProperties): void {
    this.track('feature_used', {
      action,
      ...properties,
    });
  }

  /**
   * Track error
   */
  trackError(error: Error, context?: AnalyticsProperties): void {
    this.track('error_occurred', {
      error_message: error.message,
      error_stack: error.stack,
      ...context,
    });
  }

  /**
   * Track performance metric
   */
  trackPerformance(metricName: string, value: number, unit: string = 'ms'): void {
    this.track('performance_metric', {
      metric_name: metricName,
      value,
      unit,
    });
  }

  /**
   * Set user property
   */
  setUserProperty(name: string, value: string | number | boolean): void {
    if (!this.enabled) {
      return;
    }

    // Set in analytics providers
    console.log(`Analytics: User property set - ${name}: ${value}`);
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Send event to analytics providers
   */
  private sendToProviders(eventData: any): void {
    // Firebase Analytics
    // if (firebaseAnalytics) {
    //   firebaseAnalytics.logEvent(eventData.event, eventData.properties);
    // }

    // Mixpanel
    // if (mixpanel) {
    //   mixpanel.track(eventData.event, eventData.properties);
    // }

    // Custom API endpoint
    this.sendToCustomEndpoint(eventData);
  }

  /**
   * Send to custom analytics endpoint
   */
  private async sendToCustomEndpoint(eventData: any): Promise<void> {
    try {
      await fetch(`${config.apiUrl}/analytics/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });
    } catch (error) {
      // Silently fail - analytics shouldn't break the app
      console.warn('Failed to send analytics event:', error);
    }
  }

  /**
   * Handle app state changes
   */
  private handleAppStateChange = (nextAppState: AppStateStatus): void => {
    if (nextAppState === 'active') {
      // Track app foreground
      this.track('app_foreground', {
        session_duration: Date.now() - this.startTime,
      });
    } else if (nextAppState === 'background') {
      // Track app background
      this.track('app_background', {
        session_duration: Date.now() - this.startTime,
      });
    }
  };

  /**
   * End session
   */
  endSession(): void {
    const sessionDuration = Date.now() - this.startTime;
    this.track('session_end', {
      session_id: this.sessionId,
      duration: sessionDuration,
    });
  }
}

export const analyticsService = new AnalyticsService();








