/**
 * Biometric Authentication Service
 * Enhanced biometric authentication with security features
 */

import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { config } from '../config/environments';

export interface BiometricAuthResult {
  success: boolean;
  error?: string;
  errorCode?: string;
}

class BiometricService {
  private maxAttempts: number = 5;
  private lockoutDuration: number = 30000; // 30 seconds
  private attemptCount: number = 0;
  private lockedUntil: number = 0;

  /**
   * Check if biometric authentication is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      return compatible && enrolled;
    } catch (error) {
      console.error('Biometric availability check failed:', error);
      return false;
    }
  }

  /**
   * Get available biometric types
   */
  async getSupportedTypes(): Promise<LocalAuthentication.AuthenticationType[]> {
    try {
      return await LocalAuthentication.supportedAuthenticationTypesAsync();
    } catch (error) {
      console.error('Failed to get biometric types:', error);
      return [];
    }
  }

  /**
   * Authenticate with biometric
   */
  async authenticate(
    reason: string = 'Authenticate to access your account',
    options?: LocalAuthentication.LocalAuthenticationOptions
  ): Promise<BiometricAuthResult> {
    // Check if locked out
    if (this.isLockedOut()) {
      const remainingTime = Math.ceil((this.lockedUntil - Date.now()) / 1000);
      return {
        success: false,
        error: `Too many attempts. Please try again in ${remainingTime} seconds.`,
        errorCode: 'LOCKED_OUT',
      };
    }

    // Check availability
    const available = await this.isAvailable();
    if (!available) {
      return {
        success: false,
        error: 'Biometric authentication is not available',
        errorCode: 'NOT_AVAILABLE',
      };
    }

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: reason,
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
        fallbackLabel: 'Use Password',
        ...options,
      });

      if (result.success) {
        // Reset attempt count on success
        this.attemptCount = 0;
        await this.saveAttemptCount(0);
        return { success: true };
      } else {
        // Increment attempt count on failure
        this.attemptCount++;
        await this.saveAttemptCount(this.attemptCount);

        if (this.attemptCount >= this.maxAttempts) {
          this.lockedUntil = Date.now() + this.lockoutDuration;
          await this.saveLockoutTime(this.lockedUntil);
        }

        return {
          success: false,
          error: result.error || 'Authentication failed',
          errorCode: result.error || 'AUTH_FAILED',
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Authentication error',
        errorCode: 'AUTH_ERROR',
      };
    }
  }

  /**
   * Check if account is locked out
   */
  private isLockedOut(): boolean {
    if (this.lockedUntil === 0) {
      return false;
    }
    if (Date.now() >= this.lockedUntil) {
      this.lockedUntil = 0;
      return false;
    }
    return true;
  }

  /**
   * Load attempt count and lockout time
   */
  async loadSecurityState(): Promise<void> {
    try {
      const attemptCountStr = await AsyncStorage.getItem('biometric_attempt_count');
      const lockoutTimeStr = await AsyncStorage.getItem('biometric_locked_until');

      if (attemptCountStr) {
        this.attemptCount = parseInt(attemptCountStr, 10);
      }

      if (lockoutTimeStr) {
        this.lockedUntil = parseInt(lockoutTimeStr, 10);
        // Check if lockout has expired
        if (Date.now() >= this.lockedUntil) {
          this.lockedUntil = 0;
          await this.saveLockoutTime(0);
        }
      }
    } catch (error) {
      console.error('Failed to load security state:', error);
    }
  }

  /**
   * Save attempt count
   */
  private async saveAttemptCount(count: number): Promise<void> {
    try {
      await AsyncStorage.setItem('biometric_attempt_count', count.toString());
    } catch (error) {
      console.error('Failed to save attempt count:', error);
    }
  }

  /**
   * Save lockout time
   */
  private async saveLockoutTime(time: number): Promise<void> {
    try {
      await AsyncStorage.setItem('biometric_locked_until', time.toString());
    } catch (error) {
      console.error('Failed to save lockout time:', error);
    }
  }

  /**
   * Reset security state (for testing or after successful password auth)
   */
  async resetSecurityState(): Promise<void> {
    this.attemptCount = 0;
    this.lockedUntil = 0;
    await AsyncStorage.multiRemove(['biometric_attempt_count', 'biometric_locked_until']);
  }

  /**
   * Enable biometric authentication for user
   */
  async enable(userId: string): Promise<boolean> {
    const available = await this.isAvailable();
    if (!available) {
      return false;
    }

    // Authenticate first to enable
    const authResult = await this.authenticate('Enable biometric authentication');
    if (authResult.success) {
      await AsyncStorage.setItem(`biometric_enabled_${userId}`, 'true');
      return true;
    }
    return false;
  }

  /**
   * Disable biometric authentication
   */
  async disable(userId: string): Promise<void> {
    await AsyncStorage.removeItem(`biometric_enabled_${userId}`);
  }

  /**
   * Check if biometric is enabled for user
   */
  async isEnabled(userId: string): Promise<boolean> {
    const enabled = await AsyncStorage.getItem(`biometric_enabled_${userId}`);
    return enabled === 'true';
  }
}

export const biometricService = new BiometricService();








