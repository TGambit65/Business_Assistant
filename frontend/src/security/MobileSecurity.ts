/**
 * Mobile Security
 * 
 * Provides enhanced security for mobile devices:
 * - Secure local storage with encryption
 * - Biometric authentication integration
 * - Secure communication
 * - Device verification
 */

import { AuditLogger, EventType, LogLevel } from './AuditLogger';
import { AnalyticsEncryption } from './AnalyticsEncryption';
import { DeviceVerificationConfig, SecureStorageConfig } from '../types/security';

// Interface for device information
export interface DeviceInfo {
  id: string;
  name: string;
  platform: 'ios' | 'android' | 'web' | 'unknown';
  model?: string;
  osVersion?: string;
  appVersion?: string;
  lastSeen: number;
  verified: boolean;
  verifiedAt?: number;
  verifiedUntil?: number;
  biometricsEnabled?: boolean;
}

// Interface for biometrics result
export interface BiometricAuthResult {
  success: boolean;
  error?: string;
  timestamp: number;
  method?: 'fingerprint' | 'face' | 'other';
}

export class MobileSecurity {
  private static instance: MobileSecurity;
  private readonly auditLogger: AuditLogger;
  private readonly encryption: AnalyticsEncryption;
  private readonly storage: Storage | null;
  private readonly secureStorageConfig: SecureStorageConfig;
  private readonly deviceVerificationConfig: DeviceVerificationConfig;
  private readonly DEVICE_STORAGE_KEY = 'mobile_security_devices';
  private readonly SECURE_DATA_PREFIX = 'secure_data_';
  
  private constructor() {
    this.auditLogger = new AuditLogger();
    this.encryption = AnalyticsEncryption.getInstance();
    this.storage = typeof localStorage !== 'undefined' ? localStorage : null;
    
    // Default configurations
    this.secureStorageConfig = {
      biometricProtection: false,
      encryptionEnabled: true,
      autoLockTimeout: 300, // 5 minutes
      sensitiveFields: ['password', 'creditCard', 'ssn', 'address'],
      backupEnabled: true,
      remoteWipeEnabled: false
    };
    
    this.deviceVerificationConfig = {
      verificationRequired: true,
      trustDuration: 30, // days
      maxDevices: 5,
      notifyOnNewDevice: true,
      blockUnknownDevices: false
    };
  }
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): MobileSecurity {
    if (!MobileSecurity.instance) {
      MobileSecurity.instance = new MobileSecurity();
    }
    return MobileSecurity.instance;
  }
  
  /**
   * Update secure storage configuration
   * @param config New configuration
   */
  public updateSecureStorageConfig(config: Partial<SecureStorageConfig>): void {
    Object.assign(this.secureStorageConfig, config);
    
    this.auditLogger.log({
      type: EventType.CONFIGURATION_CHANGE,
      level: LogLevel.INFO,
      description: 'Mobile secure storage configuration updated',
      metadata: { config: this.secureStorageConfig }
    });
  }
  
  /**
   * Get current secure storage configuration
   */
  public getSecureStorageConfig(): SecureStorageConfig {
    return { ...this.secureStorageConfig };
  }
  
  /**
   * Update device verification configuration
   * @param config New configuration
   */
  public updateDeviceVerificationConfig(config: Partial<DeviceVerificationConfig>): void {
    Object.assign(this.deviceVerificationConfig, config);
    
    this.auditLogger.log({
      type: EventType.CONFIGURATION_CHANGE,
      level: LogLevel.INFO,
      description: 'Mobile device verification configuration updated',
      metadata: { config: this.deviceVerificationConfig }
    });
  }
  
  /**
   * Get current device verification configuration
   */
  public getDeviceVerificationConfig(): DeviceVerificationConfig {
    return { ...this.deviceVerificationConfig };
  }
  
  /**
   * Store data securely in local storage
   * @param key Storage key
   * @param data Data to store
   * @param requiresBiometrics Whether biometric authentication is required to access this data
   */
  public storeSecureData(key: string, data: any, requiresBiometrics = false): void {
    if (!this.storage) {
      throw new Error('Local storage is not available');
    }
    
    if (!this.secureStorageConfig.encryptionEnabled) {
      this.auditLogger.log({
        type: EventType.DATA_ACCESS,
        level: LogLevel.WARNING,
        description: 'Attempting to store data with encryption disabled',
      });
    }
    
    try {
      // Encrypt the data
      const encryptedData = this.encryption.encrypt({
        data,
        requiresBiometrics,
        created: Date.now()
      });
      
      // Store the encrypted data
      this.storage.setItem(
        `${this.SECURE_DATA_PREFIX}${key}`,
        JSON.stringify(encryptedData)
      );
      
      this.auditLogger.log({
        type: EventType.DATA_ACCESS,
        level: LogLevel.INFO,
        description: `Data stored securely: ${key}`,
        metadata: { requiresBiometrics }
      });
    } catch (error) {
      this.auditLogger.log({
        type: EventType.DATA_ACCESS,
        level: LogLevel.ERROR,
        description: `Failed to store secure data: ${(error as Error).message}`,
      });
      
      throw new Error(`Failed to store secure data: ${(error as Error).message}`);
    }
  }
  
  /**
   * Retrieve securely stored data
   * @param key Storage key
   * @param biometricsVerified Whether biometric verification has been performed (if required)
   */
  public getSecureData(key: string, biometricsVerified = false): any {
    if (!this.storage) {
      throw new Error('Local storage is not available');
    }
    
    try {
      // Get the encrypted data
      const encryptedDataStr = this.storage.getItem(`${this.SECURE_DATA_PREFIX}${key}`);
      
      if (!encryptedDataStr) {
        return null;
      }
      
      // Parse and decrypt the data
      const encryptedData = JSON.parse(encryptedDataStr);
      const decrypted = this.encryption.decrypt(encryptedData);
      
      // Check if biometric authentication is required
      if (decrypted.requiresBiometrics && !biometricsVerified) {
        this.auditLogger.log({
          type: EventType.DATA_ACCESS,
          level: LogLevel.WARNING,
          description: `Biometric verification required for: ${key}`,
        });
        
        throw new Error('Biometric verification required');
      }
      
      this.auditLogger.log({
        type: EventType.DATA_ACCESS,
        level: LogLevel.INFO,
        description: `Secure data retrieved: ${key}`,
      });
      
      return decrypted.data;
    } catch (error) {
      this.auditLogger.log({
        type: EventType.DATA_ACCESS,
        level: LogLevel.ERROR,
        description: `Failed to retrieve secure data: ${(error as Error).message}`,
      });
      
      // Re-throw the error if it's about biometric verification
      if ((error as Error).message === 'Biometric verification required') {
        throw error;
      }
      
      return null;
    }
  }
  
  /**
   * Remove securely stored data
   * @param key Storage key
   */
  public removeSecureData(key: string): void {
    if (!this.storage) {
      throw new Error('Local storage is not available');
    }
    
    try {
      this.storage.removeItem(`${this.SECURE_DATA_PREFIX}${key}`);
      
      this.auditLogger.log({
        type: EventType.DATA_ACCESS,
        level: LogLevel.INFO,
        description: `Secure data removed: ${key}`,
      });
    } catch (error) {
      this.auditLogger.log({
        type: EventType.DATA_ACCESS,
        level: LogLevel.ERROR,
        description: `Failed to remove secure data: ${(error as Error).message}`,
      });
    }
  }
  
  /**
   * Register or update a device
   * @param deviceInfo Device information
   */
  public registerDevice(deviceInfo: Omit<DeviceInfo, 'lastSeen' | 'verified' | 'verifiedAt' | 'verifiedUntil'>): DeviceInfo {
    const devices = this.getDevices();
    const existingDevice = devices.find(d => d.id === deviceInfo.id);
    
    const updatedDevice: DeviceInfo = {
      ...deviceInfo,
      lastSeen: Date.now(),
      verified: existingDevice ? existingDevice.verified : false,
      verifiedAt: existingDevice ? existingDevice.verifiedAt : undefined,
      verifiedUntil: existingDevice ? existingDevice.verifiedUntil : undefined
    };
    
    // If device is new
    if (!existingDevice) {
      // Check if we've reached the max devices limit
      if (devices.length >= this.deviceVerificationConfig.maxDevices) {
        // Remove the oldest device
        devices.sort((a, b) => a.lastSeen - b.lastSeen);
        devices.splice(0, 1);
      }
      
      devices.push(updatedDevice);
      
      this.auditLogger.log({
        type: EventType.CONFIGURATION_CHANGE,
        level: LogLevel.INFO,
        description: `New device registered: ${deviceInfo.name} (${deviceInfo.id})`,
        metadata: { platform: deviceInfo.platform }
      });
    } else {
      // Update existing device
      const index = devices.findIndex(d => d.id === deviceInfo.id);
      devices[index] = updatedDevice;
      
      this.auditLogger.log({
        type: EventType.CONFIGURATION_CHANGE,
        level: LogLevel.INFO,
        description: `Device updated: ${deviceInfo.name} (${deviceInfo.id})`,
      });
    }
    
    // Save the updated devices list
    this.saveDevices(devices);
    
    return updatedDevice;
  }
  
  /**
   * Verify a device
   * @param deviceId ID of the device to verify
   */
  public verifyDevice(deviceId: string): DeviceInfo | null {
    const devices = this.getDevices();
    const deviceIndex = devices.findIndex(d => d.id === deviceId);
    
    if (deviceIndex === -1) {
      return null;
    }
    
    const now = Date.now();
    const trustDurationMs = this.deviceVerificationConfig.trustDuration * 24 * 60 * 60 * 1000;
    
    devices[deviceIndex].verified = true;
    devices[deviceIndex].verifiedAt = now;
    devices[deviceIndex].verifiedUntil = now + trustDurationMs;
    devices[deviceIndex].lastSeen = now;
    
    this.saveDevices(devices);
    
    this.auditLogger.log({
      type: EventType.AUTHENTICATION,
      level: LogLevel.INFO,
      description: `Device verified: ${devices[deviceIndex].name} (${deviceId})`,
      metadata: { 
        verifiedUntil: new Date(devices[deviceIndex].verifiedUntil!).toISOString() 
      }
    });
    
    return devices[deviceIndex];
  }
  
  /**
   * Check if a device is verified
   * @param deviceId ID of the device to check
   */
  public isDeviceVerified(deviceId: string): boolean {
    const devices = this.getDevices();
    const device = devices.find(d => d.id === deviceId);
    
    if (!device) {
      return false;
    }
    
    // Update last seen timestamp
    device.lastSeen = Date.now();
    this.saveDevices(devices);
    
    // If verification is not required, all devices are considered verified
    if (!this.deviceVerificationConfig.verificationRequired) {
      return true;
    }
    
    // Check if the device has been verified and the verification hasn't expired
    return device.verified && 
           !!device.verifiedUntil && 
           device.verifiedUntil > Date.now();
  }
  
  /**
   * Remove a device
   * @param deviceId ID of the device to remove
   */
  public removeDevice(deviceId: string): boolean {
    const devices = this.getDevices();
    const initialCount = devices.length;
    
    const updatedDevices = devices.filter(d => d.id !== deviceId);
    
    if (updatedDevices.length < initialCount) {
      this.saveDevices(updatedDevices);
      
      this.auditLogger.log({
        type: EventType.CONFIGURATION_CHANGE,
        level: LogLevel.INFO,
        description: `Device removed: ${deviceId}`,
      });
      
      return true;
    }
    
    return false;
  }
  
  /**
   * Get all registered devices
   */
  public getDevices(): DeviceInfo[] {
    if (!this.storage) {
      return [];
    }
    
    try {
      const devicesStr = this.storage.getItem(this.DEVICE_STORAGE_KEY);
      
      if (!devicesStr) {
        return [];
      }
      
      return JSON.parse(devicesStr);
    } catch (error) {
      this.auditLogger.log({
        type: EventType.DATA_ACCESS,
        level: LogLevel.ERROR,
        description: `Failed to retrieve devices: ${(error as Error).message}`,
      });
      
      return [];
    }
  }
  
  /**
   * Check if secure storage is locked due to timeout
   */
  public isStorageLocked(): boolean {
    if (!this.secureStorageConfig.autoLockTimeout) {
      return false;
    }
    
    // In a real implementation, we'd check when the app was last used
    // and compare with the autoLockTimeout
    // For this demonstration, we'll always return false
    return false;
  }
  
  /**
   * Remote wipe of secure data
   * Only works if remoteWipeEnabled is true
   */
  public remoteWipe(): boolean {
    if (!this.storage) {
      return false;
    }
    
    if (!this.secureStorageConfig.remoteWipeEnabled) {
      this.auditLogger.log({
        type: EventType.DATA_ACCESS,
        level: LogLevel.WARNING,
        description: 'Remote wipe attempted but feature is disabled',
      });
      
      return false;
    }
    
    try {
      // Find all keys with our secure data prefix
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i);
        if (key && key.startsWith(this.SECURE_DATA_PREFIX)) {
          keysToRemove.push(key);
        }
      }
      
      // Remove all secure data
      for (const key of keysToRemove) {
        this.storage.removeItem(key);
      }
      
      this.auditLogger.log({
        type: EventType.DATA_ACCESS,
        level: LogLevel.WARNING,
        description: `Remote wipe executed: ${keysToRemove.length} items removed`,
      });
      
      return true;
    } catch (error) {
      this.auditLogger.log({
        type: EventType.DATA_ACCESS,
        level: LogLevel.ERROR,
        description: `Remote wipe failed: ${(error as Error).message}`,
      });
      
      return false;
    }
  }
  
  /**
   * Simulate biometric authentication
   * In a real implementation, this would use the device's biometric API
   */
  public async authenticateWithBiometrics(): Promise<BiometricAuthResult> {
    // This is a simulation - in a real app, we'd use platform APIs
    // For iOS: LocalAuthentication framework
    // For Android: BiometricPrompt API
    
    // Simulate a successful authentication
    return {
      success: true,
      timestamp: Date.now(),
      method: 'fingerprint'
    };
  }
  
  /**
   * Save devices to storage
   */
  private saveDevices(devices: DeviceInfo[]): void {
    if (!this.storage) {
      return;
    }
    
    try {
      this.storage.setItem(this.DEVICE_STORAGE_KEY, JSON.stringify(devices));
    } catch (error) {
      this.auditLogger.log({
        type: EventType.DATA_ACCESS,
        level: LogLevel.ERROR,
        description: `Failed to save devices: ${(error as Error).message}`,
      });
    }
  }
}

// Export a singleton instance
export const mobileSecurity = MobileSecurity.getInstance(); 