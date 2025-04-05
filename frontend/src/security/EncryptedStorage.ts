/**
 * EncryptedStorage
 * 
 * Provides secure client-side storage using zero-knowledge encryption.
 * The server never has access to unencrypted data or encryption keys.
 * 
 * This service is used for:
 * - Email content encryption/decryption
 * - Attachment encryption
 * - Contact information protection
 * - Securely storing user preferences
 */

import { AuditLogger, LogLevel, EventType } from './AuditLogger';
import { ZeroKnowledgeEncryption, type EncryptedEnvelope } from './ZeroKnowledgeEncryption';

export enum StorageCategory {
  EMAIL = 'email',
  ATTACHMENT = 'attachment',
  CONTACT = 'contact',
  PREFERENCE = 'preference',
  CREDENTIAL = 'credential',
}

export interface StorageItem {
  id: string;
  category: StorageCategory;
  content: any;
  metadata?: Record<string, any>;
  createdAt: number;
  updatedAt: number;
}

export interface EncryptedStorageItem {
  id: string;
  category: StorageCategory;
  encryptedData: EncryptedEnvelope;
  metadata?: Record<string, any>; // Unencrypted metadata
  createdAt: number;
  updatedAt: number;
}

export class EncryptedStorage {
  private static instance: EncryptedStorage;
  private encryption: ZeroKnowledgeEncryption;
  private logger: AuditLogger;
  private initialized = false;
  private masterKeyId: string | null = null;
  private dbName = 'encryptedStorage';
  private dbVersion = 1;
  private storeName = 'encryptedItems';
  private isAuthenticated = false;
  
  private constructor() {
    this.encryption = ZeroKnowledgeEncryption.getInstance();
    this.logger = new AuditLogger({
      enableConsoleLogging: false,
      enableRemoteLogging: true,
      maxLocalStorageEntries: 100
    });
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): EncryptedStorage {
    if (!EncryptedStorage.instance) {
      EncryptedStorage.instance = new EncryptedStorage();
    }
    return EncryptedStorage.instance;
  }

  /**
   * Initialize the encrypted storage
   */
  public async initialize(): Promise<boolean> {
    if (this.initialized) {
      return true;
    }

    try {
      // Initialize encryption key storage
      await this.encryption.initKeyStorage();
      
      // Initialize the database
      await this.initDatabase();
      
      this.initialized = true;
      
      this.logger.log({
        level: LogLevel.INFO,
        type: EventType.CONFIGURATION_CHANGE,
        description: 'Encrypted storage initialized successfully'
      });
      
      return true;
    } catch (error) {
      this.logger.log({
        level: LogLevel.ERROR,
        type: EventType.CONFIGURATION_CHANGE,
        description: 'Failed to initialize encrypted storage',
        metadata: { error }
      });
      throw new Error('Failed to initialize encrypted storage: ' + (error as Error).message);
    }
  }

  /**
   * Initialize the database
   */
  private async initDatabase(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = (event) => {
        this.logger.log({
          level: LogLevel.ERROR,
          type: EventType.CONFIGURATION_CHANGE,
          description: 'Failed to initialize encrypted storage database',
          metadata: { error: (event.target as IDBRequest).error }
        });
        reject(new Error('Failed to initialize encrypted storage database'));
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object store for encrypted items
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          store.createIndex('category', 'category', { unique: false });
          store.createIndex('updatedAt', 'updatedAt', { unique: false });
        }
      };
      
      request.onsuccess = () => {
        this.logger.log({
          level: LogLevel.INFO,
          type: EventType.CONFIGURATION_CHANGE,
          description: 'Encrypted storage database initialized successfully'
        });
        resolve(true);
      };
    });
  }

  /**
   * Set up a master key for the encrypted storage
   * This should be called after user authentication
   */
  public async setupWithPassword(password: string): Promise<boolean> {
    try {
      // Generate a random ID for the master key
      const keyId = this.encryption.generateKeyId();
      
      // Derive a key from the password
      const { key, salt } = await this.encryption.deriveKeyFromPassword(password);
      
      // Store the key
      await this.encryption.storeKey(keyId, key, salt);
      
      // Set as the master key
      this.masterKeyId = keyId;
      this.isAuthenticated = true;
      
      this.logger.log({
        level: LogLevel.INFO,
        type: EventType.AUTHENTICATION,
        description: 'Master key set up successfully'
      });
      
      return true;
    } catch (error) {
      this.logger.log({
        level: LogLevel.ERROR,
        type: EventType.AUTHENTICATION,
        description: 'Failed to set up master key',
        metadata: { error }
      });
      throw new Error('Failed to set up master key: ' + (error as Error).message);
    }
  }

  /**
   * Authenticate with a password to unlock the encrypted storage
   */
  public async unlock(password: string, keyId?: string): Promise<boolean> {
    try {
      // If a key ID is provided, use it; otherwise, try to retrieve the master key ID
      const targetKeyId = keyId || this.masterKeyId;
      
      if (!targetKeyId) {
        throw new Error('No master key ID available');
      }
      
      // Retrieve the key salt
      const keyInfo = await this.encryption.retrieveKey(targetKeyId);
      
      if (!keyInfo) {
        throw new Error('Key not found');
      }
      
      // Derive the key from the password and salt
      const { key } = await this.encryption.deriveKeyFromPassword(password, keyInfo.salt);
      
      // Verify the key by trying to encrypt and decrypt a test string
      const testString = 'test_encryption_' + Date.now();
      const encrypted = await this.encryption.encrypt(testString, key);
      const decrypted = await this.encryption.decrypt(encrypted, key);
      
      if (decrypted !== testString) {
        throw new Error('Key verification failed');
      }
      
      // Set as the master key
      this.masterKeyId = targetKeyId;
      this.isAuthenticated = true;
      
      this.logger.log({
        level: LogLevel.INFO,
        type: EventType.AUTHENTICATION,
        description: 'Encrypted storage unlocked successfully'
      });
      
      return true;
    } catch (error) {
      this.logger.log({
        level: LogLevel.ERROR,
        type: EventType.AUTHENTICATION,
        description: 'Failed to unlock encrypted storage',
        metadata: { error }
      });
      
      this.isAuthenticated = false;
      return false;
    }
  }

  /**
   * Lock the encrypted storage
   */
  public lock(): void {
    this.isAuthenticated = false;
    
    this.logger.log({
      level: LogLevel.INFO,
      type: EventType.AUTHENTICATION,
      description: 'Encrypted storage locked'
    });
  }

  /**
   * Store an item in encrypted storage
   */
  public async storeItem(
    id: string,
    category: StorageCategory,
    content: any,
    metadata?: Record<string, any>
  ): Promise<string> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    if (!this.isAuthenticated || !this.masterKeyId) {
      throw new Error('Not authenticated');
    }
    
    try {
      // Retrieve the master key
      const keyInfo = await this.encryption.retrieveKey(this.masterKeyId);
      
      if (!keyInfo) {
        throw new Error('Master key not found');
      }
      
      // Convert content to JSON string
      const contentString = JSON.stringify(content);
      
      // Encrypt the content
      const encryptedData = await this.encryption.encrypt(
        contentString,
        keyInfo.key,
        this.masterKeyId
      );
      
      // Create storage item
      const timestamp = Date.now();
      const storageItem: EncryptedStorageItem = {
        id,
        category,
        encryptedData,
        metadata,
        createdAt: timestamp,
        updatedAt: timestamp
      };
      
      // Store in database
      await this.saveToDatabase(storageItem);
      
      this.logger.log({
        level: LogLevel.INFO,
        type: EventType.DATA_ACCESS,
        description: 'Item stored in encrypted storage',
        metadata: { id, category }
      });
      
      return id;
    } catch (error) {
      this.logger.log({
        level: LogLevel.ERROR,
        type: EventType.DATA_ACCESS,
        description: 'Failed to store item in encrypted storage',
        metadata: { error, id, category }
      });
      throw new Error('Failed to store item: ' + (error as Error).message);
    }
  }

  /**
   * Retrieve an item from encrypted storage
   */
  public async retrieveItem<T = any>(id: string): Promise<T | null> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    if (!this.isAuthenticated || !this.masterKeyId) {
      throw new Error('Not authenticated');
    }
    
    try {
      // Retrieve the encrypted item from the database
      const encryptedItem = await this.getFromDatabase(id);
      
      if (!encryptedItem) {
        return null;
      }
      
      // Retrieve the master key
      const keyInfo = await this.encryption.retrieveKey(this.masterKeyId);
      
      if (!keyInfo) {
        throw new Error('Master key not found');
      }
      
      // Decrypt the content
      const decryptedContent = await this.encryption.decrypt(
        encryptedItem.encryptedData,
        keyInfo.key
      );
      
      // Parse the JSON content
      const content = JSON.parse(decryptedContent) as T;
      
      this.logger.log({
        level: LogLevel.INFO,
        type: EventType.DATA_ACCESS,
        description: 'Item retrieved from encrypted storage',
        metadata: { id, category: encryptedItem.category }
      });
      
      return content;
    } catch (error) {
      this.logger.log({
        level: LogLevel.ERROR,
        type: EventType.DATA_ACCESS,
        description: 'Failed to retrieve item from encrypted storage',
        metadata: { error, id }
      });
      throw new Error('Failed to retrieve item: ' + (error as Error).message);
    }
  }

  /**
   * Delete an item from encrypted storage
   */
  public async deleteItem(id: string): Promise<boolean> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    try {
      // Delete from database
      await this.deleteFromDatabase(id);
      
      this.logger.log({
        level: LogLevel.INFO,
        type: EventType.DATA_ACCESS,
        description: 'Item deleted from encrypted storage',
        metadata: { id }
      });
      
      return true;
    } catch (error) {
      this.logger.log({
        level: LogLevel.ERROR,
        type: EventType.DATA_ACCESS,
        description: 'Failed to delete item from encrypted storage',
        metadata: { error, id }
      });
      throw new Error('Failed to delete item: ' + (error as Error).message);
    }
  }

  /**
   * List items by category
   */
  public async listItemsByCategory(
    category: StorageCategory
  ): Promise<Array<{ id: string; metadata?: Record<string, any>; updatedAt: number }>> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    try {
      // Get items from database
      const items = await this.getItemsByCategory(category);
      
      // Return simplified list with just id, metadata and updatedAt
      return items.map(item => ({
        id: item.id,
        metadata: item.metadata,
        updatedAt: item.updatedAt
      }));
    } catch (error) {
      this.logger.log({
        level: LogLevel.ERROR,
        type: EventType.DATA_ACCESS,
        description: 'Failed to list items by category',
        metadata: { error, category }
      });
      throw new Error('Failed to list items: ' + (error as Error).message);
    }
  }

  /**
   * Change master password
   */
  public async changeMasterPassword(
    currentPassword: string,
    newPassword: string
  ): Promise<boolean> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    if (!this.masterKeyId) {
      throw new Error('No master key set');
    }
    
    try {
      // Verify current password
      const isAuthenticated = await this.unlock(currentPassword, this.masterKeyId);
      
      if (!isAuthenticated) {
        throw new Error('Current password is incorrect');
      }
      
      // Generate a new master key ID
      const newKeyId = this.encryption.generateKeyId();
      
      // Derive a key from the new password
      const { key, salt } = await this.encryption.deriveKeyFromPassword(newPassword);
      
      // Store the new key
      await this.encryption.storeKey(newKeyId, key, salt);
      
      // Re-encrypt all stored items with the new key
      await this.reEncryptAllItems(this.masterKeyId, newKeyId);
      
      // Delete the old key
      await this.encryption.deleteKey(this.masterKeyId);
      
      // Set the new master key
      this.masterKeyId = newKeyId;
      
      this.logger.log({
        level: LogLevel.INFO,
        type: EventType.CONFIGURATION_CHANGE,
        description: 'Master password changed successfully'
      });
      
      return true;
    } catch (error) {
      this.logger.log({
        level: LogLevel.ERROR,
        type: EventType.CONFIGURATION_CHANGE,
        description: 'Failed to change master password',
        metadata: { error }
      });
      throw new Error('Failed to change master password: ' + (error as Error).message);
    }
  }

  /**
   * Re-encrypt all items with a new key
   */
  private async reEncryptAllItems(oldKeyId: string, newKeyId: string): Promise<void> {
    try {
      // Get the old key
      const oldKeyInfo = await this.encryption.retrieveKey(oldKeyId);
      
      if (!oldKeyInfo) {
        throw new Error('Old key not found');
      }
      
      // Get the new key
      const newKeyInfo = await this.encryption.retrieveKey(newKeyId);
      
      if (!newKeyInfo) {
        throw new Error('New key not found');
      }
      
      // Get all stored items
      const allItems = await this.getAllItems();
      
      // Re-encrypt each item
      for (const item of allItems) {
        // Decrypt with old key
        const decryptedContent = await this.encryption.decrypt(
          item.encryptedData,
          oldKeyInfo.key
        );
        
        // Re-encrypt with new key
        const newEncryptedData = await this.encryption.encrypt(
          decryptedContent,
          newKeyInfo.key,
          newKeyId
        );
        
        // Update the item
        const updatedItem: EncryptedStorageItem = {
          ...item,
          encryptedData: newEncryptedData,
          updatedAt: Date.now()
        };
        
        // Save back to database
        await this.saveToDatabase(updatedItem);
      }
      
      this.logger.log({
        level: LogLevel.INFO,
        type: EventType.DATA_ACCESS,
        description: 'All items re-encrypted successfully',
        metadata: { itemCount: allItems.length }
      });
    } catch (error) {
      this.logger.log({
        level: LogLevel.ERROR,
        type: EventType.DATA_ACCESS,
        description: 'Failed to re-encrypt items',
        metadata: { error }
      });
      throw new Error('Failed to re-encrypt items: ' + (error as Error).message);
    }
  }

  /**
   * Save an item to the database
   */
  private async saveToDatabase(item: EncryptedStorageItem): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => {
        reject(new Error('Failed to open storage database'));
      };
      
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        
        const storeRequest = store.put(item);
        
        storeRequest.onsuccess = () => {
          resolve();
        };
        
        storeRequest.onerror = () => {
          reject(new Error('Failed to store item in database'));
        };
      };
    });
  }

  /**
   * Retrieve an item from the database
   */
  private async getFromDatabase(id: string): Promise<EncryptedStorageItem | null> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => {
        reject(new Error('Failed to open storage database'));
      };
      
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        
        const getRequest = store.get(id);
        
        getRequest.onsuccess = () => {
          resolve(getRequest.result || null);
        };
        
        getRequest.onerror = () => {
          reject(new Error('Failed to retrieve item from database'));
        };
      };
    });
  }

  /**
   * Delete an item from the database
   */
  private async deleteFromDatabase(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => {
        reject(new Error('Failed to open storage database'));
      };
      
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        
        const deleteRequest = store.delete(id);
        
        deleteRequest.onsuccess = () => {
          resolve();
        };
        
        deleteRequest.onerror = () => {
          reject(new Error('Failed to delete item from database'));
        };
      };
    });
  }

  /**
   * Get items by category
   */
  private async getItemsByCategory(category: StorageCategory): Promise<EncryptedStorageItem[]> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => {
        reject(new Error('Failed to open storage database'));
      };
      
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const index = store.index('category');
        
        const getRequest = index.getAll(category);
        
        getRequest.onsuccess = () => {
          resolve(getRequest.result || []);
        };
        
        getRequest.onerror = () => {
          reject(new Error('Failed to retrieve items by category'));
        };
      };
    });
  }

  /**
   * Get all items
   */
  private async getAllItems(): Promise<EncryptedStorageItem[]> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => {
        reject(new Error('Failed to open storage database'));
      };
      
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        
        const getRequest = store.getAll();
        
        getRequest.onsuccess = () => {
          resolve(getRequest.result || []);
        };
        
        getRequest.onerror = () => {
          reject(new Error('Failed to retrieve all items'));
        };
      };
    });
  }
}

// Export singleton instance
export const encryptedStorage = EncryptedStorage.getInstance(); 