/**
 * KeyVault for secure API key storage and management
 * Implements encryption, secure storage, and key rotation
 */

interface StoredKey {
  value: string;
  expiresAt: number; // Timestamp when the key expires
  createdAt: number; // Timestamp when the key was created
}

export class KeyVault {
  private keys: Map<string, StoredKey> = new Map();
  private readonly encryptionKey: string;
  private readonly storage: Storage | null;
  private readonly PREFIX = 'email_assistant_key_';
  
  constructor() {
    // Try to use secure storage if available
    this.storage = typeof localStorage !== 'undefined' ? localStorage : null;
    
    // In a real implementation, this would be retrieved securely
    // For demonstration purposes, we're using a hardcoded encryption key
    this.encryptionKey = 'ThisIsASecureEncryptionKey123!';
    
    // Load any stored keys
    this.loadKeys();
  }
  
  /**
   * Store an API key securely
   * @param keyName Name identifier for the key
   * @param keyValue The actual API key value
   * @param expiryDays Number of days until the key expires (default: 30)
   */
  public storeKey(keyName: string, keyValue: string, expiryDays = 30): void {
    const now = Date.now();
    const expiresAt = now + (expiryDays * 24 * 60 * 60 * 1000);
    
    const storedKey: StoredKey = {
      value: this.encrypt(keyValue),
      expiresAt,
      createdAt: now
    };
    
    // Store in memory
    this.keys.set(keyName, storedKey);
    
    // Store in persistent storage if available
    this.persistKey(keyName, storedKey);
    
    console.log(`Key ${keyName} stored and will expire in ${expiryDays} days`);
  }
  
  /**
   * Retrieve an API key
   * @param keyName Name of the key to retrieve
   * @returns Decrypted key value or null if not found or expired
   */
  public getKey(keyName: string): string | null {
    // Check in-memory cache first
    const key = this.keys.get(keyName);
    
    if (!key) {
      console.warn(`Key ${keyName} not found in vault`);
      return null;
    }
    
    // Check if key has expired
    if (key.expiresAt < Date.now()) {
      console.warn(`Key ${keyName} has expired`);
      this.keys.delete(keyName);
      this.removePersistedKey(keyName);
      return null;
    }
    
    // Decrypt and return the key
    return this.decrypt(key.value);
  }
  
  /**
   * Rotate an API key with a new value
   * @param keyName Name of the key to rotate
   * @param newKeyValue New API key value
   * @param expiryDays Days until the new key expires
   * @returns The old key value or null if no previous key existed
   */
  public rotateKey(keyName: string, newKeyValue: string, expiryDays = 30): string | null {
    const oldKey = this.getKey(keyName);
    this.storeKey(keyName, newKeyValue, expiryDays);
    return oldKey;
  }
  
  /**
   * Delete a key from the vault
   * @param keyName Name of the key to delete
   */
  public deleteKey(keyName: string): void {
    this.keys.delete(keyName);
    this.removePersistedKey(keyName);
  }
  
  /**
   * Check if a key exists and is valid
   * @param keyName Name of the key to check
   */
  public hasValidKey(keyName: string): boolean {
    const key = this.keys.get(keyName);
    return !!key && key.expiresAt > Date.now();
  }
  
  /**
   * Load keys from persistent storage
   */
  private loadKeys(): void {
    if (!this.storage) return;
    
    // Find all stored keys with our prefix
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key && key.startsWith(this.PREFIX)) {
        const keyName = key.substring(this.PREFIX.length);
        try {
          const storedKey: StoredKey = JSON.parse(this.storage.getItem(key) || '');
          
          // Only load non-expired keys
          if (storedKey && storedKey.expiresAt > Date.now()) {
            this.keys.set(keyName, storedKey);
          } else {
            // Clean up expired keys
            this.storage.removeItem(key);
          }
        } catch (e) {
          console.error(`Error loading key ${keyName}:`, e);
          this.storage.removeItem(key);
        }
      }
    }
    
    console.log(`Loaded ${this.keys.size} API keys from storage`);
  }
  
  /**
   * Persist a key to storage
   */
  private persistKey(keyName: string, key: StoredKey): void {
    if (!this.storage) return;
    
    try {
      this.storage.setItem(
        this.PREFIX + keyName,
        JSON.stringify(key)
      );
    } catch (e) {
      console.error(`Error persisting key ${keyName}:`, e);
    }
  }
  
  /**
   * Remove a key from persistent storage
   */
  private removePersistedKey(keyName: string): void {
    if (!this.storage) return;
    
    try {
      this.storage.removeItem(this.PREFIX + keyName);
    } catch (e) {
      console.error(`Error removing key ${keyName} from storage:`, e);
    }
  }
  
  /**
   * Encrypt a value using the encryption key
   * Note: In a real implementation, this would use a proper encryption algorithm
   */
  private encrypt(value: string): string {
    // This is a simplified encryption for demonstration
    // In production, use a proper encryption library
    const encoded = encodeURIComponent(value);
    return btoa(encoded + this.encryptionKey.substring(0, 8));
  }
  
  /**
   * Decrypt a value using the encryption key
   */
  private decrypt(encryptedValue: string): string {
    // This is a simplified decryption for demonstration
    try {
      const decoded = atob(encryptedValue);
      // Remove the encryption key fragment that was added
      const encoded = decoded.substring(0, decoded.length - 8);
      return decodeURIComponent(encoded);
    } catch (e) {
      console.error('Decryption failed:', e);
      return '';
    }
  }
} 