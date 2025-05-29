/**
 * Storage Types
 * 
 * Defines types for storage operations and error handling
 */

// Storage error types
export enum StorageErrorType {
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  NOT_AVAILABLE = 'NOT_AVAILABLE',
  INVALID_DATA = 'INVALID_DATA',
  UNKNOWN = 'UNKNOWN',
}

// Storage error
export interface StorageError {
  type: StorageErrorType;
  message: string;
  originalError?: Error;
}

// Storage options
export interface StorageOptions {
  useSessionStorage?: boolean;
  useCookies?: boolean;
  encryptionKey?: string;
  compression?: boolean;
}

// Storage result
export interface StorageResult<T> {
  success: boolean;
  data?: T;
  error?: StorageError;
}

// Storage version
export interface StorageVersion {
  version: string;
  timestamp: number;
}

// Storage item with version
export interface VersionedStorageItem<T> {
  data: T;
  version: StorageVersion;
}

// Storage quota information
export interface StorageQuota {
  used: number;
  remaining: number;
  total: number;
} 