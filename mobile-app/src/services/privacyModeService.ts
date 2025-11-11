/**
 * Privacy Mode Service
 * Handles privacy mode for sensitive data
 */

import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PrivacyModeConfig {
  autoEnableOnBackground: boolean;
  autoEnableOnScreenLock: boolean;
  blurScreenshots: boolean;
  hideNotifications: boolean;
}

class PrivacyModeService {
  private isEnabled: boolean = false;
  private config: PrivacyModeConfig = {
    autoEnableOnBackground: true,
    autoEnableOnScreenLock: true,
    blurScreenshots: true,
    hideNotifications: true,
  };

  private onPrivacyModeChangeCallbacks: Array<(enabled: boolean) => void> = [];
  private appState: AppStateStatus = 'active';

  /**
   * Initialize privacy mode service
   */
  async initialize(config?: Partial<PrivacyModeConfig>): Promise<void> {
    if (config) {
      this.config = { ...this.config, ...config };
    }

    // Load saved state
    await this.loadState();

    // On web platform, disable privacy mode by default
    // as it's mainly for mobile security
    const { Platform } = require('react-native');
    if (Platform.OS === 'web') {
      // Don't auto-enable on web, and disable if somehow enabled
      this.config.autoEnableOnBackground = false;
      this.config.autoEnableOnScreenLock = false;
      if (this.isEnabled) {
        await this.disable();
      }
      return;
    }

    // Listen to app state changes (only on native)
    AppState.addEventListener('change', this.handleAppStateChange);

    // Listen to screen lock events (if available)
    this.setupScreenLockListener();
  }

  /**
   * Enable privacy mode
   */
  async enable(): Promise<void> {
    if (this.isEnabled) {
      return;
    }

    this.isEnabled = true;
    await this.saveState();
    this.notifyCallbacks(true);
  }

  /**
   * Disable privacy mode
   */
  async disable(): Promise<void> {
    if (!this.isEnabled) {
      return;
    }

    this.isEnabled = false;
    await this.saveState();
    this.notifyCallbacks(false);
  }

  /**
   * Toggle privacy mode
   */
  async toggle(): Promise<void> {
    if (this.isEnabled) {
      await this.disable();
    } else {
      await this.enable();
    }
  }

  /**
   * Check if privacy mode is enabled
   */
  isPrivacyModeEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Handle app state changes
   */
  private handleAppStateChange = (nextAppState: AppStateStatus): void => {
    if (this.appState === 'active' && nextAppState.match(/inactive|background/)) {
      // App going to background
      if (this.config.autoEnableOnBackground) {
        this.enable();
      }
    } else if (this.appState.match(/inactive|background/) && nextAppState === 'active') {
      // App coming to foreground
      // Privacy mode stays enabled until manually disabled
    }
    this.appState = nextAppState;
  };

  /**
   * Setup screen lock listener
   */
  private setupScreenLockListener(): void {
    // In a real implementation, you would use platform-specific APIs
    // to detect screen lock events
    // For now, this is a placeholder
  }

  /**
   * Register callback for privacy mode changes
   */
  onPrivacyModeChange(callback: (enabled: boolean) => void): () => void {
    this.onPrivacyModeChangeCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.onPrivacyModeChangeCallbacks.indexOf(callback);
      if (index > -1) {
        this.onPrivacyModeChangeCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Notify all callbacks
   */
  private notifyCallbacks(enabled: boolean): void {
    this.onPrivacyModeChangeCallbacks.forEach((callback) => {
      try {
        callback(enabled);
      } catch (error) {
        console.error('Privacy mode callback error:', error);
      }
    });
  }

  /**
   * Mask sensitive data
   */
  maskSensitiveData(text: string, visibleChars: number = 4): string {
    if (!this.isEnabled) {
      return text;
    }

    if (text.length <= visibleChars) {
      return '*'.repeat(text.length);
    }

    const visible = text.slice(-visibleChars);
    const masked = '*'.repeat(text.length - visibleChars);
    return `${masked}${visible}`;
  }

  /**
   * Hide sensitive value
   */
  hideSensitiveValue(): string {
    return this.isEnabled ? '••••••••' : '';
  }

  /**
   * Should hide notifications
   */
  shouldHideNotifications(): boolean {
    return this.isEnabled && this.config.hideNotifications;
  }

  /**
   * Should blur screenshots
   */
  shouldBlurScreenshots(): boolean {
    return this.isEnabled && this.config.blurScreenshots;
  }

  /**
   * Load state
   */
  private async loadState(): Promise<void> {
    try {
      const saved = await AsyncStorage.getItem('privacy_mode_enabled');
      this.isEnabled = saved === 'true';
    } catch (error) {
      console.error('Failed to load privacy mode state:', error);
    }
  }

  /**
   * Save state
   */
  private async saveState(): Promise<void> {
    try {
      await AsyncStorage.setItem('privacy_mode_enabled', this.isEnabled.toString());
    } catch (error) {
      console.error('Failed to save privacy mode state:', error);
    }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<PrivacyModeConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

export const privacyModeService = new PrivacyModeService();

