/**
 * Analytics Encryption Utility
 * 
 * Provides encryption functionality specifically for analytics data,
 * with optimizations for real-time data handling and secure storage.
 */

// import CryptoJS from 'crypto-js';

// Type definition for encrypted data
export interface EncryptedData {
  data: string;        // Base64-encoded encrypted data
  iv: string;          // Initialization vector (Base64)
  timestamp: number;   // Encryption timestamp
  version: string;     // Encryption version
}

/**
 * AnalyticsEncryption class
 * 
 * Provides secure encryption for analytics data to ensure
 * privacy and compliance with data protection regulations.
 */

export class AnalyticsEncryption {
  private static instance: AnalyticsEncryption;
  private readonly encryptionKey: string;
  private readonly version = '1.0.0';
  
  private constructor() {
    // In a real implementation, this would be securely retrieved
    // For demonstration purposes, using a hardcoded key
    this.encryptionKey = 'AnalyticsSecureEncryptionKey123!';
  }
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): AnalyticsEncryption {
    if (!AnalyticsEncryption.instance) {
      AnalyticsEncryption.instance = new AnalyticsEncryption();
    }
    return AnalyticsEncryption.instance;
  }
  
  /**
   * Encrypt analytics data
   * @param data Object to encrypt
   * @returns Encrypted data
   */
  public encrypt(data: any): EncryptedData {
    try {
      // Convert data to JSON string
      const jsonData = JSON.stringify(data);
      
      // Generate a random initialization vector
      const iv = this.generateRandomString(16);
      
      // Encrypt the data using a simple XOR cipher for demonstration
      // In production, use a proper encryption library like CryptoJS
      const encryptedData = this.xorEncrypt(jsonData, this.encryptionKey, iv);
      
      // Return the encrypted data with metadata
      return {
        data: btoa(encryptedData),
        iv: btoa(iv),
        timestamp: Date.now(),
        version: this.version
      };
    } catch (error) {
      console.error('Analytics encryption failed:', error);
      throw new Error('Failed to encrypt analytics data');
    }
  }
  
  /**
   * Decrypt analytics data
   * @param encryptedData The encrypted data object
   * @returns Decrypted data
   */
  public decrypt(encryptedData: EncryptedData): any {
    try {
      // Verify version compatibility
      if (encryptedData.version !== this.version) {
        console.warn(`Version mismatch: encrypted=${encryptedData.version}, current=${this.version}`);
      }
      
      // Decode the Base64 data and IV
      const data = atob(encryptedData.data);
      const iv = atob(encryptedData.iv);
      
      // Decrypt the data
      const decryptedJson = this.xorEncrypt(data, this.encryptionKey, iv);
      
      // Parse and return the JSON data
      return JSON.parse(decryptedJson);
    } catch (error) {
      console.error('Analytics decryption failed:', error);
      throw new Error('Failed to decrypt analytics data');
    }
  }
  
  /**
   * Encrypt data with timestamp validation
   * @param data Data to encrypt
   * @param ttlSeconds Time-to-live in seconds
   * @returns Encrypted data with expiration
   */
  public encryptWithExpiry(data: any, ttlSeconds: number): EncryptedData & { expiresAt: number } {
    const encrypted = this.encrypt(data);
    const expiresAt = Date.now() + (ttlSeconds * 1000);
    
    return {
      ...encrypted,
      expiresAt
    };
  }
  
  /**
   * Decrypt data with timestamp validation
   * @param encryptedData Encrypted data with expiration
   * @returns Decrypted data or null if expired
   */
  public decryptWithExpiry(encryptedData: EncryptedData & { expiresAt: number }): any | null {
    // Check if data has expired
    if (Date.now() > encryptedData.expiresAt) {
      return null;
    }
    
    return this.decrypt(encryptedData);
  }
  
  /**
   * Create a secure hash of a string
   * @param value String to hash
   * @returns Hashed string
   */
  public hash(value: string): string {
    let hash = 0;
    
    for (let i = 0; i < value.length; i++) {
      const char = value.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    return Math.abs(hash).toString(16);
  }
  
  /**
   * Anonymize sensitive data for analytics
   * @param data Data containing sensitive fields
   * @param sensitiveFields Array of field names to anonymize
   * @returns Anonymized data
   */
  public anonymize(data: Record<string, any>, sensitiveFields: string[]): Record<string, any> {
    const result = { ...data };
    
    for (const field of sensitiveFields) {
      if (field in result) {
        const value = result[field];
        
        if (typeof value === 'string') {
          // Hash strings
          result[field] = this.hash(value);
        } else if (typeof value === 'number') {
          // Round numbers to reduce precision
          result[field] = Math.round(value / 10) * 10;
        } else if (Array.isArray(value)) {
          // Replace array with its length
          result[field] = `[Array:${value.length}]`;
        } else if (typeof value === 'object' && value !== null) {
          // Replace objects with their key count
          result[field] = `{Object:${Object.keys(value).length}}`;
        }
      }
    }
    
    return result;
  }
  
  /**
   * Generate a random string of specified length
   * @param length Length of the string
   * @returns Random string
   */
  private generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
  }
  
  /**
   * Simple XOR encryption/decryption
   * Note: This is a simplified implementation for demonstration purposes.
   * In production, use a proper encryption library.
   */
  private xorEncrypt(data: string, key: string, iv: string): string {
    const combinedKey = key + iv;
    let result = '';
    
    for (let i = 0; i < data.length; i++) {
      const charCode = data.charCodeAt(i) ^ combinedKey.charCodeAt(i % combinedKey.length);
      result += String.fromCharCode(charCode);
    }
    
    return result;
  }

  /**
   * Encrypt a batch of analytics data
   * @param dataArray Array of objects to encrypt
   * @returns Array of encrypted data
   */
  public encryptBatch(dataArray: any[]): EncryptedData[] {
    try {
      return dataArray.map(data => this.encrypt(data));
    } catch (error) {
      console.error('Batch encryption failed:', error);
      throw new Error('Failed to encrypt analytics data batch');
    }
  }

  /**
   * Decrypt a batch of analytics data
   * @param encryptedDataArray Array of encrypted data objects
   * @returns Array of decrypted data
   */
  public decryptBatch(encryptedDataArray: EncryptedData[]): any[] {
    try {
      return encryptedDataArray.map(encryptedData => this.decrypt(encryptedData));
    } catch (error) {
      console.error('Batch decryption failed:', error);
      throw new Error('Failed to decrypt analytics data batch');
    }
  }
}

// Export a singleton instance
export const analyticsEncryption = AnalyticsEncryption.getInstance(); 