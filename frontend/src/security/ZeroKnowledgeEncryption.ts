/**
 * ZeroKnowledgeEncryption
 * 
 * Implements client-side zero-knowledge encryption where the server never
 * has access to unencrypted data or encryption keys.
 * 
 * This module provides:
 * - Password-based key derivation
 * - AES-GCM encryption/decryption
 * - Secure client-side key storage
 * - Data envelope pattern for content encryption
 */

import { AuditLogger, LogLevel, EventType } from './AuditLogger';

// Type definitions
export interface EncryptionKey {
  key: CryptoKey;
  salt: Uint8Array;
}

export interface EncryptedEnvelope {
  ciphertext: string;     // Base64 encoded encrypted data
  iv: string;             // Base64 encoded initialization vector
  salt: string;           // Base64 encoded salt used for key derivation
  authTag?: string;       // Base64 encoded authentication tag (if separate)
  keyId?: string;         // Optional identifier for the key used
  algorithm: string;      // Algorithm identifier (e.g., "AES-GCM")
  metadata?: {            // Optional metadata
    version: string;      // Encryption version
    createdAt: number;    // Timestamp
    keyDerivation?: string; // Key derivation method
  };
}

export class ZeroKnowledgeEncryption {
  private static instance: ZeroKnowledgeEncryption;
  private logger: AuditLogger;
  private keyCache: Map<string, EncryptionKey>;
  private storeName = 'zke_keystore';
  private dbName = 'secureKeyStorage';
  private dbVersion = 1;
  
  private constructor() {
    this.logger = new AuditLogger({
      enableConsoleLogging: false,
      enableRemoteLogging: true,
      maxLocalStorageEntries: 100
    });
    this.keyCache = new Map<string, EncryptionKey>();
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): ZeroKnowledgeEncryption {
    if (!ZeroKnowledgeEncryption.instance) {
      ZeroKnowledgeEncryption.instance = new ZeroKnowledgeEncryption();
    }
    return ZeroKnowledgeEncryption.instance;
  }

  /**
   * Initialize the secure key storage
   */
  public async initKeyStorage(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = (event) => {
        this.logger.log({
          level: LogLevel.ERROR,
          type: EventType.CONFIGURATION_CHANGE,
          description: 'Failed to initialize secure key storage',
          metadata: { error: (event.target as IDBRequest).error }
        });
        reject(new Error('Failed to initialize secure key storage'));
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id' });
        }
      };
      
      request.onsuccess = () => {
        this.logger.log({
          level: LogLevel.INFO,
          type: EventType.CONFIGURATION_CHANGE,
          description: 'Secure key storage initialized successfully'
        });
        resolve(true);
      };
    });
  }

  /**
   * Derive an encryption key from a password
   */
  public async deriveKeyFromPassword(
    password: string, 
    salt?: Uint8Array
  ): Promise<EncryptionKey> {
    // Generate salt if not provided
    if (!salt) {
      salt = crypto.getRandomValues(new Uint8Array(16));
    }
    
    // Convert password to key material
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);
    
    // Import key material
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordData,
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );
    
    // Derive the actual key using PBKDF2
    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      true, // extractable
      ['encrypt', 'decrypt']
    );
    
    this.logger.log({
      level: LogLevel.INFO,
      type: EventType.CONFIGURATION_CHANGE,
      description: 'Key derived from password successfully'
    });
    
    return { key, salt };
  }

  /**
   * Encrypt data using AES-GCM
   */
  public async encrypt(
    data: string,
    key: CryptoKey,
    keyId?: string
  ): Promise<EncryptedEnvelope> {
    try {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      
      // Create initialization vector
      const iv = crypto.getRandomValues(new Uint8Array(12));
      
      // Encrypt the data
      const encryptedBuffer = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        key,
        dataBuffer
      );
      
      // Convert binary data to Base64 strings
      const ciphertext = this.arrayBufferToBase64(encryptedBuffer);
      const ivString = this.arrayBufferToBase64(iv);
      
      // Get key details
      const keyDetails = await crypto.subtle.exportKey('jwk', key);
      const saltString = keyDetails.k?.substring(0, 16) || '';
      
      // Create the encrypted envelope
      const envelope: EncryptedEnvelope = {
        ciphertext,
        iv: ivString,
        salt: saltString,
        algorithm: 'AES-GCM',
        keyId,
        metadata: {
          version: '1.0',
          createdAt: Date.now(),
          keyDerivation: 'PBKDF2'
        }
      };
      
      this.logger.log({
        level: LogLevel.INFO,
        type: EventType.DATA_ACCESS,
        description: 'Data encrypted successfully',
        metadata: { keyId }
      });
      
      return envelope;
    } catch (error) {
      this.logger.log({
        level: LogLevel.ERROR,
        type: EventType.DATA_ACCESS,
        description: 'Encryption failed',
        metadata: { error }
      });
      throw new Error('Encryption failed: ' + (error as Error).message);
    }
  }

  /**
   * Decrypt data using AES-GCM
   */
  public async decrypt(
    envelope: EncryptedEnvelope,
    key: CryptoKey
  ): Promise<string> {
    try {
      // Convert Base64 strings back to binary data
      const ciphertextBuffer = this.base64ToArrayBuffer(envelope.ciphertext);
      const iv = this.base64ToArrayBuffer(envelope.iv);
      
      // Decrypt the data
      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        key,
        ciphertextBuffer
      );
      
      // Convert the decrypted data back to a string
      const decoder = new TextDecoder();
      const decryptedText = decoder.decode(decryptedBuffer);
      
      this.logger.log({
        level: LogLevel.INFO,
        type: EventType.DATA_ACCESS,
        description: 'Data decrypted successfully',
        metadata: { keyId: envelope.keyId }
      });
      
      return decryptedText;
    } catch (error) {
      this.logger.log({
        level: LogLevel.ERROR,
        type: EventType.DATA_ACCESS,
        description: 'Decryption failed',
        metadata: { error, keyId: envelope.keyId }
      });
      throw new Error('Decryption failed: ' + (error as Error).message);
    }
  }

  /**
   * Store an encryption key securely
   */
  public async storeKey(
    id: string,
    key: CryptoKey,
    salt: Uint8Array
  ): Promise<boolean> {
    try {
      // Export the key to JWK format
      const exportedKey = await crypto.subtle.exportKey('jwk', key);
      
      // Store in IndexedDB
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(this.dbName, this.dbVersion);
        
        request.onerror = () => {
          reject(new Error('Failed to open key storage database'));
        };
        
        request.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          const transaction = db.transaction([this.storeName], 'readwrite');
          const store = transaction.objectStore(this.storeName);
          
          const saltBase64 = this.arrayBufferToBase64(salt);
          
          const storeRequest = store.put({
            id,
            key: exportedKey,
            salt: saltBase64,
            createdAt: Date.now()
          });
          
          storeRequest.onsuccess = () => {
            // Update the cache
            this.keyCache.set(id, { key, salt });
            
            this.logger.log({
              level: LogLevel.INFO,
              type: EventType.CONFIGURATION_CHANGE,
              description: 'Key stored successfully',
              metadata: { keyId: id }
            });
            
            resolve(true);
          };
          
          storeRequest.onerror = () => {
            reject(new Error('Failed to store key'));
          };
        };
      });
    } catch (error) {
      this.logger.log({
        level: LogLevel.ERROR,
        type: EventType.CONFIGURATION_CHANGE,
        description: 'Failed to store key',
        metadata: { error, keyId: id }
      });
      throw new Error('Failed to store key: ' + (error as Error).message);
    }
  }

  /**
   * Retrieve an encryption key
   */
  public async retrieveKey(id: string): Promise<EncryptionKey | null> {
    // Check cache first
    if (this.keyCache.has(id)) {
      return this.keyCache.get(id) as EncryptionKey;
    }
    
    try {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(this.dbName, this.dbVersion);
        
        request.onerror = () => {
          reject(new Error('Failed to open key storage database'));
        };
        
        request.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          const transaction = db.transaction([this.storeName], 'readonly');
          const store = transaction.objectStore(this.storeName);
          const getRequest = store.get(id);
          
          getRequest.onsuccess = async () => {
            const result = getRequest.result;
            if (!result) {
              resolve(null);
              return;
            }
            
            // Import the key from JWK format
            const key = await crypto.subtle.importKey(
              'jwk',
              result.key,
              { name: 'AES-GCM', length: 256 },
              true,
              ['encrypt', 'decrypt']
            );
            
            // Convert the salt from Base64 back to Uint8Array
            const salt = this.base64ToArrayBuffer(result.salt);
            
            // Update the cache
            const encryptionKey: EncryptionKey = { 
              key, 
              salt: new Uint8Array(salt) 
            };
            this.keyCache.set(id, encryptionKey);
            
            this.logger.log({
              level: LogLevel.INFO,
              type: EventType.DATA_ACCESS,
              description: 'Key retrieved successfully',
              metadata: { keyId: id }
            });
            
            resolve(encryptionKey);
          };
          
          getRequest.onerror = () => {
            reject(new Error('Failed to retrieve key'));
          };
        };
      });
    } catch (error) {
      this.logger.log({
        level: LogLevel.ERROR,
        type: EventType.DATA_ACCESS,
        description: 'Failed to retrieve key',
        metadata: { error, keyId: id }
      });
      throw new Error('Failed to retrieve key: ' + (error as Error).message);
    }
  }

  /**
   * Delete an encryption key
   */
  public async deleteKey(id: string): Promise<boolean> {
    try {
      // Remove from cache
      this.keyCache.delete(id);
      
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(this.dbName, this.dbVersion);
        
        request.onerror = () => {
          reject(new Error('Failed to open key storage database'));
        };
        
        request.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          const transaction = db.transaction([this.storeName], 'readwrite');
          const store = transaction.objectStore(this.storeName);
          
          const deleteRequest = store.delete(id);
          
          deleteRequest.onsuccess = () => {
            this.logger.log({
              level: LogLevel.INFO,
              type: EventType.CONFIGURATION_CHANGE,
              description: 'Key deleted successfully',
              metadata: { keyId: id }
            });
            
            resolve(true);
          };
          
          deleteRequest.onerror = () => {
            reject(new Error('Failed to delete key'));
          };
        };
      });
    } catch (error) {
      this.logger.log({
        level: LogLevel.ERROR,
        type: EventType.CONFIGURATION_CHANGE,
        description: 'Failed to delete key',
        metadata: { error, keyId: id }
      });
      throw new Error('Failed to delete key: ' + (error as Error).message);
    }
  }

  /**
   * Encrypt data with a password, deriving the key on the fly
   */
  public async encryptWithPassword(
    data: string,
    password: string
  ): Promise<EncryptedEnvelope> {
    try {
      // Derive a key from the password
      const { key, salt } = await this.deriveKeyFromPassword(password);
      
      // Encrypt the data
      const envelope = await this.encrypt(data, key);
      
      // Add the salt to the envelope
      envelope.salt = this.arrayBufferToBase64(salt);
      
      return envelope;
    } catch (error) {
      this.logger.log({
        level: LogLevel.ERROR,
        type: EventType.DATA_ACCESS,
        description: 'Password-based encryption failed',
        metadata: { error }
      });
      throw new Error('Password-based encryption failed: ' + (error as Error).message);
    }
  }

  /**
   * Decrypt data with a password
   */
  public async decryptWithPassword(
    envelope: EncryptedEnvelope,
    password: string
  ): Promise<string> {
    try {
      // Get the salt from the envelope
      const salt = this.base64ToArrayBuffer(envelope.salt);
      
      // Derive the key from the password and salt
      const { key } = await this.deriveKeyFromPassword(password, new Uint8Array(salt));
      
      // Decrypt the data
      return await this.decrypt(envelope, key);
    } catch (error) {
      this.logger.log({
        level: LogLevel.ERROR,
        type: EventType.DATA_ACCESS,
        description: 'Password-based decryption failed',
        metadata: { error }
      });
      throw new Error('Password-based decryption failed: ' + (error as Error).message);
    }
  }

  /**
   * Generate a secure random key ID
   */
  public generateKeyId(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Convert an ArrayBuffer to a Base64 string
   */
  private arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Convert a Base64 string to an ArrayBuffer
   */
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }
} 