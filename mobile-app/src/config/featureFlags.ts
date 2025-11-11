/**
 * Feature Flags System
 * Centralized feature flag management with remote overrides
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { config } from './environments';
import * as Updates from 'expo-updates';

const FEATURE_FLAGS_STORAGE_KEY = 'feature_flags';
const REMOTE_FLAGS_CHECK_INTERVAL = 3600000; // 1 hour

export interface FeatureFlags {
  enableMLM: boolean;
  enableKnowledgeBase: boolean;
  enableOfflineMode: boolean;
  enablePushNotifications: boolean;
  enableBiometricAuth: boolean;
  enableAdvancedAnalytics: boolean;
  enableBetaFeatures: boolean;
  [key: string]: boolean; // Allow custom flags
}

class FeatureFlagsService {
  private flags: FeatureFlags = { ...config.featureFlags };
  private remoteFlags: Partial<FeatureFlags> = {};
  private lastCheckTime: number = 0;

  /**
   * Initialize feature flags
   */
  async initialize(): Promise<void> {
    // Load local overrides
    await this.loadLocalFlags();

    // Fetch remote flags if enabled
    if (config.enableAnalytics) {
      await this.fetchRemoteFlags();
    }

    // Set up periodic remote flag checks
    if (config.enableAnalytics) {
      setInterval(() => {
        this.fetchRemoteFlags();
      }, REMOTE_FLAGS_CHECK_INTERVAL);
    }
  }

  /**
   * Get feature flag value
   */
  isEnabled(flag: keyof FeatureFlags): boolean {
    // Remote flags override local flags
    if (this.remoteFlags.hasOwnProperty(flag)) {
      return this.remoteFlags[flag] ?? false;
    }
    return this.flags[flag] ?? false;
  }

  /**
   * Get all feature flags
   */
  getAllFlags(): FeatureFlags {
    return {
      ...this.flags,
      ...this.remoteFlags,
    };
  }

  /**
   * Override feature flag locally
   */
  async setFlag(flag: keyof FeatureFlags, value: boolean): Promise<void> {
    this.flags[flag] = value;
    await this.saveLocalFlags();
  }

  /**
   * Reset feature flags to defaults
   */
  async resetFlags(): Promise<void> {
    this.flags = { ...config.featureFlags };
    this.remoteFlags = {};
    await AsyncStorage.removeItem(FEATURE_FLAGS_STORAGE_KEY);
  }

  /**
   * Fetch remote feature flags
   */
  private async fetchRemoteFlags(): Promise<void> {
    try {
      const now = Date.now();
      
      // Skip if checked recently
      if (now - this.lastCheckTime < REMOTE_FLAGS_CHECK_INTERVAL / 2) {
        return;
      }

      // Fetch from remote API
      const response = await fetch(`${config.apiUrl}/feature-flags`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const remoteFlags = await response.json();
        this.remoteFlags = remoteFlags;
        this.lastCheckTime = now;
      }
    } catch (error) {
      console.warn('Failed to fetch remote feature flags:', error);
      // Continue with local flags
    }
  }

  /**
   * Load local feature flags from storage
   */
  private async loadLocalFlags(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(FEATURE_FLAGS_STORAGE_KEY);
      if (stored) {
        const storedFlags = JSON.parse(stored);
        this.flags = { ...this.flags, ...storedFlags };
      }
    } catch (error) {
      console.warn('Failed to load local feature flags:', error);
    }
  }

  /**
   * Save local feature flags to storage
   */
  private async saveLocalFlags(): Promise<void> {
    try {
      await AsyncStorage.setItem(FEATURE_FLAGS_STORAGE_KEY, JSON.stringify(this.flags));
    } catch (error) {
      console.warn('Failed to save local feature flags:', error);
    }
  }

  /**
   * Get flag value with fallback
   */
  getFlag(flag: keyof FeatureFlags, defaultValue: boolean = false): boolean {
    return this.isEnabled(flag) ?? defaultValue;
  }
}

export const featureFlags = new FeatureFlagsService();








