/**
 * Session Management Service
 * Handles session timeout and automatic logout
 */

import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { config } from '../config/environments';

export interface SessionConfig {
  timeout: number; // in milliseconds
  warningTime: number; // Show warning before timeout
  extendOnActivity: boolean; // Extend session on user activity
}

class SessionService {
  private config: SessionConfig = {
    timeout: 30 * 60 * 1000, // 30 minutes default
    warningTime: 5 * 60 * 1000, // 5 minutes warning
    extendOnActivity: true,
  };

  private sessionStartTime: number = 0;
  private lastActivityTime: number = 0;
  private timeoutTimer: NodeJS.Timeout | null = null;
  private warningTimer: NodeJS.Timeout | null = null;
  private onTimeoutCallback: (() => void) | null = null;
  private onWarningCallback: ((remainingSeconds: number) => void) | null = null;
  private appState: AppStateStatus = 'active';

  /**
   * Initialize session service
   */
  initialize(config?: Partial<SessionConfig>): void {
    if (config) {
      this.config = { ...this.config, ...config };
    }

    // Load session state
    this.loadSessionState();

    // Start session
    this.startSession();

    // Listen to app state changes
    AppState.addEventListener('change', this.handleAppStateChange);
  }

  /**
   * Start new session
   */
  startSession(): void {
    const now = Date.now();
    this.sessionStartTime = now;
    this.lastActivityTime = now;
    this.saveSessionState();

    this.clearTimers();
    this.setupTimers();
  }

  /**
   * Extend session on user activity
   */
  recordActivity(): void {
    if (!this.config.extendOnActivity) {
      return;
    }

    this.lastActivityTime = Date.now();
    this.saveSessionState();
    this.clearTimers();
    this.setupTimers();
  }

  /**
   * Get remaining session time
   */
  getRemainingTime(): number {
    const elapsed = Date.now() - this.lastActivityTime;
    const remaining = this.config.timeout - elapsed;
    return Math.max(0, remaining);
  }

  /**
   * Check if session is expired
   */
  isExpired(): boolean {
    return this.getRemainingTime() === 0;
  }

  /**
   * Setup timeout timers
   */
  private setupTimers(): void {
    // Warning timer
    const warningDelay = this.config.timeout - this.config.warningTime;
    if (warningDelay > 0) {
      this.warningTimer = setTimeout(() => {
        const remaining = Math.ceil(this.getRemainingTime() / 1000);
        this.onWarningCallback?.(remaining);
      }, warningDelay);
    }

    // Timeout timer
    this.timeoutTimer = setTimeout(() => {
      this.handleTimeout();
    }, this.config.timeout);
  }

  /**
   * Clear all timers
   */
  private clearTimers(): void {
    if (this.timeoutTimer) {
      clearTimeout(this.timeoutTimer);
      this.timeoutTimer = null;
    }
    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
      this.warningTimer = null;
    }
  }

  /**
   * Handle session timeout
   */
  private handleTimeout(): void {
    this.clearTimers();
    this.onTimeoutCallback?.();
  }

  /**
   * Handle app state changes
   */
  private handleAppStateChange = (nextAppState: AppStateStatus): void => {
    if (this.appState === 'active' && nextAppState.match(/inactive|background/)) {
      // App went to background - pause timers
      this.pauseSession();
    } else if (this.appState.match(/inactive|background/) && nextAppState === 'active') {
      // App came to foreground - check if session expired
      this.resumeSession();
    }
    this.appState = nextAppState;
  };

  /**
   * Pause session (app in background)
   */
  private pauseSession(): void {
    this.clearTimers();
    this.saveSessionState();
  }

  /**
   * Resume session (app in foreground)
   */
  private resumeSession(): void {
    this.loadSessionState();
    
    // Check if session expired while in background
    if (this.isExpired()) {
      this.handleTimeout();
      return;
    }

    // Resume timers with remaining time
    const remaining = this.getRemainingTime();
    if (remaining > 0) {
      this.setupTimers();
    }
  }

  /**
   * Set timeout callback
   */
  onTimeout(callback: () => void): void {
    this.onTimeoutCallback = callback;
  }

  /**
   * Set warning callback
   */
  onWarning(callback: (remainingSeconds: number) => void): void {
    this.onWarningCallback = callback;
  }

  /**
   * End session
   */
  endSession(): void {
    this.clearTimers();
    this.sessionStartTime = 0;
    this.lastActivityTime = 0;
    this.clearSessionState();
  }

  /**
   * Update session configuration
   */
  updateConfig(config: Partial<SessionConfig>): void {
    this.config = { ...this.config, ...config };
    this.clearTimers();
    this.setupTimers();
  }

  /**
   * Save session state
   */
  private async saveSessionState(): Promise<void> {
    try {
      await AsyncStorage.setItem('session_start_time', this.sessionStartTime.toString());
      await AsyncStorage.setItem('session_last_activity', this.lastActivityTime.toString());
    } catch (error) {
      console.error('Failed to save session state:', error);
    }
  }

  /**
   * Load session state
   */
  private async loadSessionState(): Promise<void> {
    try {
      const startTimeStr = await AsyncStorage.getItem('session_start_time');
      const lastActivityStr = await AsyncStorage.getItem('session_last_activity');

      if (startTimeStr) {
        this.sessionStartTime = parseInt(startTimeStr, 10);
      }
      if (lastActivityStr) {
        this.lastActivityTime = parseInt(lastActivityStr, 10);
      }
    } catch (error) {
      console.error('Failed to load session state:', error);
    }
  }

  /**
   * Clear session state
   */
  private async clearSessionState(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(['session_start_time', 'session_last_activity']);
    } catch (error) {
      console.error('Failed to clear session state:', error);
    }
  }

  /**
   * Get session info
   */
  getSessionInfo(): {
    startTime: number;
    lastActivity: number;
    remaining: number;
    isExpired: boolean;
  } {
    return {
      startTime: this.sessionStartTime,
      lastActivity: this.lastActivityTime,
      remaining: this.getRemainingTime(),
      isExpired: this.isExpired(),
    };
  }
}

export const sessionService = new SessionService();








