/**
 * Preferences Encryption Service
 * 
 * Handles encryption and decryption of sensitive preference data
 */

import { SecurityPreferences, AIPreferences } from '../types/preferences';

export class PreferencesEncryption {
  private static instance: PreferencesEncryption;
  private encryptionKey: CryptoKey | null = null;
  private readonly ALGORITHM = 'AES-GCM';
  private readonly KEY_LENGTH = 256;
  private readonly IV_LENGTH = 12;
  private readonly SALT_LENGTH = 16;

  private constructor() {}

  public static getInstance(): PreferencesEncryption {
    if (!PreferencesEncryption.instance) {
      PreferencesEncryption.instance = new PreferencesEncryption();
    }
    return PreferencesEncryption.instance;
  }

  /**
   * Initialize encryption with user's password
   */
  public async initialize(password: string): Promise<void> {
    try {
      // Generate a key from the password
      const encoder = new TextEncoder();
      const passwordBuffer = encoder.encode(password);
      
      // Use PBKDF2 to derive a key from the password
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        passwordBuffer,
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
      );

      // Generate a salt (in production, this should be stored)
      const salt = crypto.getRandomValues(new Uint8Array(this.SALT_LENGTH));
      
      // Derive the encryption key
      this.encryptionKey = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: 100000,
          hash: 'SHA-256'
        },
        keyMaterial,
        { name: this.ALGORITHM, length: this.KEY_LENGTH },
        false,
        ['encrypt', 'decrypt']
      );

      // Store salt in localStorage for key derivation
      this.storeSalt(salt);
    } catch (error) {
      console.error('Failed to initialize encryption:', error);
      throw new Error('Encryption initialization failed');
    }
  }

  /**
   * Initialize with stored salt (for returning users)
   */
  public async initializeWithStoredSalt(password: string): Promise<boolean> {
    try {
      const salt = this.getStoredSalt();
      if (!salt) {
        return false;
      }

      const encoder = new TextEncoder();
      const passwordBuffer = encoder.encode(password);
      
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        passwordBuffer,
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
      );
      
      this.encryptionKey = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: 100000,
          hash: 'SHA-256'
        },
        keyMaterial,
        { name: this.ALGORITHM, length: this.KEY_LENGTH },
        false,
        ['encrypt', 'decrypt']
      );

      return true;
    } catch (error) {
      console.error('Failed to initialize with stored salt:', error);
      return false;
    }
  }

  /**
   * Check if encryption is initialized
   */
  public isInitialized(): boolean {
    return this.encryptionKey !== null;
  }

  /**
   * Encrypt sensitive security preferences
   */
  public async encryptSecurityPreferences(
    preferences: SecurityPreferences
  ): Promise<{ encrypted: string; iv: string }> {
    if (!this.encryptionKey) {
      throw new Error('Encryption not initialized');
    }

    try {
      // Extract sensitive fields
      const sensitiveData = {
        trustedDevices: preferences.trustedDevices,
        // Add other sensitive fields as needed
      };

      const encoder = new TextEncoder();
      const data = encoder.encode(JSON.stringify(sensitiveData));
      
      // Generate IV
      const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));
      
      // Encrypt
      const encrypted = await crypto.subtle.encrypt(
        {
          name: this.ALGORITHM,
          iv: iv
        },
        this.encryptionKey,
        data
      );

      return {
        encrypted: this.arrayBufferToBase64(encrypted),
        iv: this.arrayBufferToBase64(iv)
      };
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt security preferences');
    }
  }

  /**
   * Decrypt sensitive security preferences
   */
  public async decryptSecurityPreferences(
    encryptedData: string,
    ivString: string
  ): Promise<Partial<SecurityPreferences>> {
    if (!this.encryptionKey) {
      throw new Error('Encryption not initialized');
    }

    try {
      const encrypted = this.base64ToArrayBuffer(encryptedData);
      const iv = this.base64ToArrayBuffer(ivString);
      
      const decrypted = await crypto.subtle.decrypt(
        {
          name: this.ALGORITHM,
          iv: iv
        },
        this.encryptionKey,
        encrypted
      );

      const decoder = new TextDecoder();
      const jsonString = decoder.decode(decrypted);
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt security preferences');
    }
  }

  /**
   * Encrypt sensitive AI preferences (API keys, etc.)
   */
  public async encryptAIPreferences(
    preferences: AIPreferences
  ): Promise<{ encrypted: string; iv: string }> {
    if (!this.encryptionKey) {
      throw new Error('Encryption not initialized');
    }

    try {
      // Extract sensitive fields
      const sensitiveData = {
        // In a real app, API keys would be here
        stopSequences: preferences.stopSequences,
        // Add other sensitive AI settings
      };

      const encoder = new TextEncoder();
      const data = encoder.encode(JSON.stringify(sensitiveData));
      
      const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));
      
      const encrypted = await crypto.subtle.encrypt(
        {
          name: this.ALGORITHM,
          iv: iv
        },
        this.encryptionKey,
        data
      );

      return {
        encrypted: this.arrayBufferToBase64(encrypted),
        iv: this.arrayBufferToBase64(iv)
      };
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt AI preferences');
    }
  }

  /**
   * Decrypt sensitive AI preferences
   */
  public async decryptAIPreferences(
    encryptedData: string,
    ivString: string
  ): Promise<Partial<AIPreferences>> {
    if (!this.encryptionKey) {
      throw new Error('Encryption not initialized');
    }

    try {
      const encrypted = this.base64ToArrayBuffer(encryptedData);
      const iv = this.base64ToArrayBuffer(ivString);
      
      const decrypted = await crypto.subtle.decrypt(
        {
          name: this.ALGORITHM,
          iv: iv
        },
        this.encryptionKey,
        encrypted
      );

      const decoder = new TextDecoder();
      const jsonString = decoder.decode(decrypted);
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt AI preferences');
    }
  }

  /**
   * Encrypt any JSON-serializable data
   */
  public async encryptData(data: any): Promise<{ encrypted: string; iv: string }> {
    if (!this.encryptionKey) {
      throw new Error('Encryption not initialized');
    }

    try {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(JSON.stringify(data));
      
      const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));
      
      const encrypted = await crypto.subtle.encrypt(
        {
          name: this.ALGORITHM,
          iv: iv
        },
        this.encryptionKey,
        dataBuffer
      );

      return {
        encrypted: this.arrayBufferToBase64(encrypted),
        iv: this.arrayBufferToBase64(iv)
      };
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt any JSON-serializable data
   */
  public async decryptData<T = any>(
    encryptedData: string,
    ivString: string
  ): Promise<T> {
    if (!this.encryptionKey) {
      throw new Error('Encryption not initialized');
    }

    try {
      const encrypted = this.base64ToArrayBuffer(encryptedData);
      const iv = this.base64ToArrayBuffer(ivString);
      
      const decrypted = await crypto.subtle.decrypt(
        {
          name: this.ALGORITHM,
          iv: iv
        },
        this.encryptionKey,
        encrypted
      );

      const decoder = new TextDecoder();
      const jsonString = decoder.decode(decrypted);
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Clear encryption key (for logout)
   */
  public clearKey(): void {
    this.encryptionKey = null;
  }

  /**
   * Change encryption password
   */
  public async changePassword(
    oldPassword: string,
    newPassword: string
  ): Promise<boolean> {
    try {
      // First verify old password by trying to decrypt something
      const testInitialized = await this.initializeWithStoredSalt(oldPassword);
      if (!testInitialized) {
        return false;
      }

      // Re-initialize with new password
      await this.initialize(newPassword);
      return true;
    } catch (error) {
      console.error('Failed to change password:', error);
      return false;
    }
  }

  // Utility methods

  private storeSalt(salt: Uint8Array): void {
    const saltString = this.arrayBufferToBase64(salt);
    localStorage.setItem('preferences_encryption_salt', saltString);
  }

  private getStoredSalt(): Uint8Array | null {
    const saltString = localStorage.getItem('preferences_encryption_salt');
    if (!saltString) {
      return null;
    }
    return new Uint8Array(this.base64ToArrayBuffer(saltString));
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * Generate a secure random password
   */
  public generateSecurePassword(length: number = 16): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=';
    const values = crypto.getRandomValues(new Uint8Array(length));
    let password = '';
    
    for (let i = 0; i < length; i++) {
      password += charset[values[i] % charset.length];
    }
    
    return password;
  }

  /**
   * Check if browser supports Web Crypto API
   */
  public static isSupported(): boolean {
    return !!(
      window.crypto &&
      window.crypto.subtle &&
      window.crypto.subtle.encrypt &&
      window.crypto.subtle.decrypt
    );
  }
}

// Export singleton instance
export const preferencesEncryption = PreferencesEncryption.getInstance();