import { createHash, randomBytes, createCipheriv, createDecipheriv } from 'crypto';
import { promisify } from 'util';
import { Buffer } from 'buffer';
import { KeyVault } from './KeyVault';
import { AnalyticsEncryption } from './AnalyticsEncryption';
import { EncryptionService } from './EncryptionService';
import { SecurityConfig } from './SecurityConfig';
import { SecurityUtils } from './SecurityUtils';
import { SecurityConstants } from './SecurityConstants';
import { SecurityTypes } from './SecurityTypes';
import { SecurityValidation } from './SecurityValidation';
import { SecurityLogger } from './SecurityLogger';
import { SecurityMetrics } from './SecurityMetrics';
import { SecurityMonitor } from './SecurityMonitor';
import { SecurityManager } from './SecurityManager';

// Re-export all security modules
export { KeyVault } from './KeyVault';
export { AnalyticsEncryption } from './AnalyticsEncryption';
export { EncryptionService } from './EncryptionService';
export { SecurityConfig } from './SecurityConfig';
export { SecurityUtils } from './SecurityUtils';
export { SecurityConstants } from './SecurityConstants';
export { SecurityTypes } from './SecurityTypes';
export { SecurityValidation } from './SecurityValidation';
export { SecurityLogger } from './SecurityLogger';
export { SecurityMetrics } from './SecurityMetrics';
export { SecurityMonitor } from './SecurityMonitor';
export { SecurityManager } from './SecurityManager';

// Utility crypto functions
export const hashData = (data: string): string => {
  return createHash('sha256').update(data).digest('hex');
};

export const generateRandomKey = (length = 32): Buffer => {
  return randomBytes(length);
};

// Remove all imports from the body of the file 