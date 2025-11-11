/**
 * Encryption Service
 * Provides secure encryption/decryption for local storage
 */

import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { config } from '../config/environments';

/**
 * Generate a secure key from user credentials
 */
async function generateKey(password: string, salt: string): Promise<Crypto.CryptoDigestOptions> {
  // Use PBKDF2 to derive key from password
  // This is a simplified version - in production use proper key derivation
  const combined = `${password}${salt}`;
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    combined
  );
  return {
    algorithm: Crypto.CryptoDigestAlgorithm.SHA256,
    data: hash,
  };
}

class EncryptionService {
  private encryptionKey: string | null = null;
  private isInitialized: boolean = false;

  /**
   * Initialize encryption service
   */
  async initialize(userId: string): Promise<void> {
    // Generate or retrieve encryption key
    const key = await this.getOrCreateKey(userId);
    this.encryptionKey = key;
    this.isInitialized = true;
  }

  /**
   * Get or create encryption key for user
   */
  private async getOrCreateKey(userId: string): Promise<string> {
    const keyStorageKey = `encryption_key_${userId}`;
    
    // Try to get existing key
    let key = await AsyncStorage.getItem(keyStorageKey);
    
    if (!key) {
      // Generate new key
      key = await this.generateEncryptionKey();
      await AsyncStorage.setItem(keyStorageKey, key);
    }
    
    return key;
  }

  /**
   * Generate encryption key
   */
  private async generateEncryptionKey(): Promise<string> {
    // Generate random key using crypto
    const randomBytes = await Crypto.getRandomBytesAsync(32);
    return Array.from(randomBytes)
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Encrypt data
   */
  async encrypt(data: string): Promise<string> {
    if (!this.isInitialized || !this.encryptionKey) {
      throw new Error('Encryption service not initialized');
    }

    // Simple XOR encryption (for demo - use AES in production)
    // In production, use expo-crypto with AES or native encryption
    const encrypted = this.simpleEncrypt(data, this.encryptionKey);
    return encrypted;
  }

  /**
   * Decrypt data
   */
  async decrypt(encryptedData: string): Promise<string> {
    if (!this.isInitialized || !this.encryptionKey) {
      throw new Error('Encryption service not initialized');
    }

    const decrypted = this.simpleDecrypt(encryptedData, this.encryptionKey);
    return decrypted;
  }

  /**
   * Simple XOR encryption (replace with proper AES in production)
   */
  private simpleEncrypt(data: string, key: string): string {
    let result = '';
    for (let i = 0; i < data.length; i++) {
      const charCode = data.charCodeAt(i);
      const keyCharCode = key.charCodeAt(i % key.length);
      const encrypted = charCode ^ keyCharCode;
      result += String.fromCharCode(encrypted);
    }
    // Use Buffer for React Native compatibility
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(result, 'binary').toString('base64');
    }
    // Fallback for environments with btoa
    if (typeof btoa !== 'undefined') {
      return btoa(result);
    }
    // Last resort: return as is (not secure, but won't break)
    return result;
  }

  /**
   * Simple XOR decryption (replace with proper AES in production)
   */
  private simpleDecrypt(encryptedData: string, key: string): string {
    let data: string;
    // Use Buffer for React Native compatibility
    if (typeof Buffer !== 'undefined') {
      data = Buffer.from(encryptedData, 'base64').toString('binary');
    } else if (typeof atob !== 'undefined') {
      data = atob(encryptedData);
    } else {
      // Fallback: treat as plain text (not secure)
      data = encryptedData;
    }
    
    let result = '';
    for (let i = 0; i < data.length; i++) {
      const charCode = data.charCodeAt(i);
      const keyCharCode = key.charCodeAt(i % key.length);
      const decrypted = charCode ^ keyCharCode;
      result += String.fromCharCode(decrypted);
    }
    return result;
  }

  /**
   * Encrypt object and store
   */
  async encryptAndStore(key: string, data: any): Promise<void> {
    const jsonData = JSON.stringify(data);
    const encrypted = await this.encrypt(jsonData);
    await AsyncStorage.setItem(key, encrypted);
  }

  /**
   * Retrieve and decrypt data
   */
  async retrieveAndDecrypt<T>(key: string): Promise<T | null> {
    const encrypted = await AsyncStorage.getItem(key);
    if (!encrypted) {
      return null;
    }

    try {
      const decrypted = await this.decrypt(encrypted);
      return JSON.parse(decrypted) as T;
    } catch (error) {
      console.error('Decryption failed:', error);
      return null;
    }
  }

  /**
   * Clear encryption key (for logout)
   */
  async clearKey(userId: string): Promise<void> {
    const keyStorageKey = `encryption_key_${userId}`;
    await AsyncStorage.removeItem(keyStorageKey);
    this.encryptionKey = null;
    this.isInitialized = false;
  }

  /**
   * Check if encryption is available
   */
  isAvailable(): boolean {
    return this.isInitialized && this.encryptionKey !== null;
  }
}

export const encryptionService = new EncryptionService();

