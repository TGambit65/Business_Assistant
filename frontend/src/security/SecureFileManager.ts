/**
 * SecureFileManager
 * 
 * Provides secure file handling capabilities:
 * - Content validation
 * - MIME type verification
 * - Metadata stripping
 * - File encryption/decryption
 * - Virus scanning integration
 */

import { AuditLogger, LogLevel, EventType } from './AuditLogger';
import { ZeroKnowledgeEncryption, EncryptedEnvelope } from './ZeroKnowledgeEncryption';

// Common mime types and their file extensions
export const MIME_TYPES = {
  // Images
  'image/jpeg': ['jpg', 'jpeg'],
  'image/png': ['png'],
  'image/gif': ['gif'],
  'image/webp': ['webp'],
  'image/svg+xml': ['svg'],
  
  // Documents
  'application/pdf': ['pdf'],
  'application/msword': ['doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx'],
  'application/vnd.ms-excel': ['xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['xlsx'],
  'application/vnd.ms-powerpoint': ['ppt'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['pptx'],
  'text/plain': ['txt', 'text'],
  'text/csv': ['csv'],
  'text/html': ['html', 'htm'],
  'text/markdown': ['md', 'markdown'],
  
  // Archives
  'application/zip': ['zip'],
  'application/x-rar-compressed': ['rar'],
  'application/x-7z-compressed': ['7z'],
  'application/x-tar': ['tar'],
  
  // Audio
  'audio/mpeg': ['mp3'],
  'audio/wav': ['wav'],
  'audio/ogg': ['ogg'],
  
  // Video
  'video/mp4': ['mp4'],
  'video/webm': ['webm'],
  'video/ogg': ['ogv'],
  
  // Other
  'application/json': ['json'],
  'application/xml': ['xml']
} as const;

// Suspicious file extensions
export const SUSPICIOUS_EXTENSIONS = [
  'exe', 'dll', 'bat', 'cmd', 'sh', 'ps1', 'vbs', 'js', 'jar', 'msi', 'com', 'scr'
];

export interface FileValidationOptions {
  maxSizeBytes?: number;
  allowedMimeTypes?: string[];
  stripMetadata?: boolean;
  scanForViruses?: boolean;
  validateExtension?: boolean;
  enforceFilenameLength?: boolean;
  maxFilenameLength?: number;
  allowHiddenFiles?: boolean;
  requireExtension?: boolean;
}

export interface FileValidationResult {
  valid: boolean;
  file?: File;
  sanitizedFile?: File;
  error?: string;
  warnings?: string[];
  mimeType?: string;
  fileExtension?: string;
  scanned?: boolean;
  scanResult?: {
    clean: boolean;
    threatName?: string;
    scanEngine?: string;
  };
}

export interface EncryptedFile {
  filename: string;
  encryptedData: EncryptedEnvelope;
  mimeType: string;
  size: number;
  metadata?: Record<string, any>;
  createdAt: number;
}

export class SecureFileManager {
  private static instance: SecureFileManager;
  private logger: AuditLogger;
  private encryption: ZeroKnowledgeEncryption;
  
  // Default validation options
  private defaultValidationOptions: FileValidationOptions = {
    maxSizeBytes: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: Object.keys(MIME_TYPES),
    stripMetadata: true,
    scanForViruses: false, // Set to false by default as actual scanning requires server-side implementation
    validateExtension: true,
    enforceFilenameLength: true,
    maxFilenameLength: 255,
    allowHiddenFiles: false,
    requireExtension: true
  };
  
  private constructor() {
    this.logger = new AuditLogger({
      enableConsoleLogging: false,
      enableRemoteLogging: true,
      maxLocalStorageEntries: 100
    });
    
    this.encryption = ZeroKnowledgeEncryption.getInstance();
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): SecureFileManager {
    if (!SecureFileManager.instance) {
      SecureFileManager.instance = new SecureFileManager();
    }
    return SecureFileManager.instance;
  }

  /**
   * Validate a file for security concerns
   */
  public async validateFile(
    file: File,
    options?: Partial<FileValidationOptions>
  ): Promise<FileValidationResult> {
    const validationOptions = {
      ...this.defaultValidationOptions,
      ...options
    };
    
    const result: FileValidationResult = {
      valid: true,
      file,
      warnings: []
    };
    
    try {
      // Check file size
      if (validationOptions.maxSizeBytes && file.size > validationOptions.maxSizeBytes) {
        result.valid = false;
        result.error = `File exceeds maximum allowed size of ${validationOptions.maxSizeBytes} bytes`;
        
        this.logger.log({
          level: LogLevel.WARNING,
          type: EventType.DATA_ACCESS,
          description: 'File size validation failed',
          metadata: { filename: file.name, size: file.size, maxSize: validationOptions.maxSizeBytes }
        });
        
        return result;
      }
      
      // Get actual MIME type from file content (not just the extension)
      const actualMimeType = await this.detectMimeType(file);
      result.mimeType = actualMimeType;
      
      // Check if the MIME type is allowed
      if (validationOptions.allowedMimeTypes && 
          validationOptions.allowedMimeTypes.length > 0 && 
          !validationOptions.allowedMimeTypes.includes(actualMimeType)) {
        result.valid = false;
        result.error = `File type ${actualMimeType} is not allowed`;
        
        this.logger.log({
          level: LogLevel.WARNING,
          type: EventType.DATA_ACCESS,
          description: 'File type validation failed',
          metadata: { filename: file.name, mimeType: actualMimeType }
        });
        
        return result;
      }
      
      // Get the file extension
      const fileNameParts = file.name.split('.');
      const fileExtension = fileNameParts.length > 1 ? fileNameParts.pop()?.toLowerCase() : '';
      result.fileExtension = fileExtension;
      
      // Check if extension is required
      if (validationOptions.requireExtension && !fileExtension) {
        result.valid = false;
        result.error = 'File extension is required';
        
        this.logger.log({
          level: LogLevel.WARNING,
          type: EventType.DATA_ACCESS,
          description: 'File extension validation failed',
          metadata: { filename: file.name }
        });
        
        return result;
      }
      
      // Check if the file extension matches the MIME type
      if (validationOptions.validateExtension && fileExtension) {
        const validExtensionsForMime = MIME_TYPES[actualMimeType as keyof typeof MIME_TYPES] || [];
        
        if (validExtensionsForMime.length > 0 && !(validExtensionsForMime as readonly string[]).includes(fileExtension)) {
          result.valid = false;
          result.error = `File extension ${fileExtension} does not match the detected file type ${actualMimeType}`;
          
          this.logger.log({
            level: LogLevel.WARNING,
            type: EventType.DATA_ACCESS,
            description: 'File extension mismatch with content type',
            metadata: { filename: file.name, extension: fileExtension, mimeType: actualMimeType }
          });
          
          return result;
        }
      }
      
      // Check for suspicious file extensions
      if (fileExtension && SUSPICIOUS_EXTENSIONS.includes(fileExtension)) {
        result.valid = false;
        result.error = `File extension ${fileExtension} is potentially dangerous`;
        
        this.logger.log({
          level: LogLevel.WARNING,
          type: EventType.DATA_ACCESS,
          description: 'Suspicious file extension detected',
          metadata: { filename: file.name, extension: fileExtension }
        });
        
        return result;
      }
      
      // Check for hidden files (starting with a dot)
      if (!validationOptions.allowHiddenFiles && file.name.startsWith('.')) {
        result.valid = false;
        result.error = 'Hidden files are not allowed';
        
        this.logger.log({
          level: LogLevel.WARNING,
          type: EventType.DATA_ACCESS,
          description: 'Hidden file detected',
          metadata: { filename: file.name }
        });
        
        return result;
      }
      
      // Check filename length
      if (validationOptions.enforceFilenameLength && 
          validationOptions.maxFilenameLength && 
          file.name.length > validationOptions.maxFilenameLength) {
        result.valid = false;
        result.error = `Filename exceeds maximum allowed length of ${validationOptions.maxFilenameLength} characters`;
        
        this.logger.log({
          level: LogLevel.WARNING,
          type: EventType.DATA_ACCESS,
          description: 'Filename length validation failed',
          metadata: { filename: file.name, length: file.name.length, maxLength: validationOptions.maxFilenameLength }
        });
        
        return result;
      }
      
      // Strip metadata if requested
      if (validationOptions.stripMetadata) {
        try {
          const sanitizedFile = await this.stripMetadata(file);
          result.sanitizedFile = sanitizedFile;
          result.warnings?.push('Metadata stripped from file');
        } catch (error) {
          result.warnings?.push(`Failed to strip metadata: ${(error as Error).message}`);
        }
      }
      
      // Scan for viruses if requested and available
      if (validationOptions.scanForViruses) {
        try {
          const scanResult = await this.scanForViruses(file);
          result.scanned = true;
          result.scanResult = scanResult;
          
          if (!scanResult.clean) {
            result.valid = false;
            result.error = `File failed virus scan: ${scanResult.threatName || 'Unknown threat'}`;
            
            this.logger.log({
              level: LogLevel.ERROR,
              type: EventType.DATA_ACCESS,
              description: 'Virus scan failed',
              metadata: { filename: file.name, threat: scanResult.threatName }
            });
            
            return result;
          }
        } catch (error) {
          result.warnings?.push(`Virus scan unavailable: ${(error as Error).message}`);
        }
      }
      
      this.logger.log({
        level: LogLevel.INFO,
        type: EventType.DATA_ACCESS,
        description: 'File validation successful',
        metadata: { filename: file.name, mimeType: actualMimeType }
      });
      
      return result;
    } catch (error) {
      result.valid = false;
      result.error = `File validation failed: ${(error as Error).message}`;
      
      this.logger.log({
        level: LogLevel.ERROR,
        type: EventType.DATA_ACCESS,
        description: 'File validation error',
        metadata: { error, filename: file.name }
      });
      
      return result;
    }
  }

  /**
   * Encrypt a file for secure storage
   */
  public async encryptFile(
    file: File,
    password: string,
    metadata?: Record<string, any>
  ): Promise<EncryptedFile> {
    try {
      // Read the file as array buffer
      const fileBuffer = await this.readFileAsArrayBuffer(file);
      
      // Convert array buffer to base64 string
      const fileBase64 = this.arrayBufferToBase64(fileBuffer);
      
      // Encrypt the file content
      const encryptedData = await this.encryption.encryptWithPassword(fileBase64, password);
      
      const encryptedFile: EncryptedFile = {
        filename: file.name,
        encryptedData,
        mimeType: file.type,
        size: file.size,
        metadata,
        createdAt: Date.now()
      };
      
      this.logger.log({
        level: LogLevel.INFO,
        type: EventType.DATA_ACCESS,
        description: 'File encrypted successfully',
        metadata: { filename: file.name, size: file.size }
      });
      
      return encryptedFile;
    } catch (error) {
      this.logger.log({
        level: LogLevel.ERROR,
        type: EventType.DATA_ACCESS,
        description: 'File encryption failed',
        metadata: { error, filename: file.name }
      });
      
      throw new Error(`Failed to encrypt file: ${(error as Error).message}`);
    }
  }

  /**
   * Decrypt a file
   */
  public async decryptFile(
    encryptedFile: EncryptedFile,
    password: string
  ): Promise<File> {
    try {
      // Decrypt the file content
      const decryptedBase64 = await this.encryption.decryptWithPassword(
        encryptedFile.encryptedData,
        password
      );
      
      // Convert base64 back to array buffer
      const fileBuffer = this.base64ToArrayBuffer(decryptedBase64);
      
      // Create a new File object
      const file = new File(
        [fileBuffer],
        encryptedFile.filename,
        { type: encryptedFile.mimeType }
      );
      
      this.logger.log({
        level: LogLevel.INFO,
        type: EventType.DATA_ACCESS,
        description: 'File decrypted successfully',
        metadata: { filename: encryptedFile.filename, size: encryptedFile.size }
      });
      
      return file;
    } catch (error) {
      this.logger.log({
        level: LogLevel.ERROR,
        type: EventType.DATA_ACCESS,
        description: 'File decryption failed',
        metadata: { error, filename: encryptedFile.filename }
      });
      
      throw new Error(`Failed to decrypt file: ${(error as Error).message}`);
    }
  }

  /**
   * Detect the MIME type of a file based on file signature (magic bytes)
   */
  private async detectMimeType(file: File): Promise<string> {
    // First, use the browser-provided MIME type as a starting point
    let mimeType = file.type;
    
    if (!mimeType || mimeType === 'application/octet-stream') {
      // If MIME type is unknown, try to determine from file signature
      try {
        const buffer = await this.readFileHeader(file, 16); // Read first 16 bytes
        const signature = new Uint8Array(buffer);
        
        // Check file signatures
        if (signature[0] === 0xFF && signature[1] === 0xD8) {
          mimeType = 'image/jpeg';
        } else if (signature[0] === 0x89 && signature[1] === 0x50 && signature[2] === 0x4E && signature[3] === 0x47) {
          mimeType = 'image/png';
        } else if (signature[0] === 0x47 && signature[1] === 0x49 && signature[2] === 0x46) {
          mimeType = 'image/gif';
        } else if (signature[0] === 0x25 && signature[1] === 0x50 && signature[2] === 0x44 && signature[3] === 0x46) {
          mimeType = 'application/pdf';
        } else if (signature[0] === 0x50 && signature[1] === 0x4B) {
          // Could be a ZIP file or Office Open XML format (docx, xlsx, pptx)
          // Further inspection would be needed to determine the exact type
          mimeType = 'application/zip';
        } else {
          // Fallback to extension-based detection
          const fileExtension = file.name.split('.').pop()?.toLowerCase();
          
          if (fileExtension) {
            // Look up the MIME type based on extension
            for (const [mime, extensions] of Object.entries(MIME_TYPES)) {
              if ((extensions as readonly string[]).includes(fileExtension)) {
                mimeType = mime;
                break;
              }
            }
          }
          
          // If still unknown, use a generic type
          if (!mimeType || mimeType === 'application/octet-stream') {
            mimeType = 'application/octet-stream';
          }
        }
      } catch (error) {
        // If MIME detection fails, fall back to the original type
        mimeType = file.type || 'application/octet-stream';
      }
    }
    
    return mimeType;
  }

  /**
   * Strip metadata from a file
   * Note: This is a simplified implementation that would need to be expanded for production use
   */
  private async stripMetadata(file: File): Promise<File> {
    // This is a placeholder for actual metadata stripping
    // In a real application, this would use libraries specific to each file type
    
    if (file.type.startsWith('image/')) {
      // For images, we could create a new image without metadata
      // This is a simplified example that creates a clean copy
      try {
        const img = await this.createImageElement(file);
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Failed to get canvas context');
        }
        
        ctx.drawImage(img, 0, 0);
        
        // Convert the canvas back to a file
        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((b) => resolve(b!), file.type);
        });
        
        return new File([blob], file.name, { type: file.type });
      } catch (error) {
        throw new Error(`Failed to strip image metadata: ${(error as Error).message}`);
      }
    } else {
      // For other file types, we'd need specific libraries
      // For this example, we'll just return the original file
      this.logger.log({
        level: LogLevel.INFO,
        type: EventType.DATA_ACCESS,
        description: 'Metadata stripping not implemented for this file type',
        metadata: { filetype: file.type }
      });
      
      return file;
    }
  }

  /**
   * Scan a file for viruses
   * Note: This is a placeholder that would integrate with an actual virus scanning service
   */
  private async scanForViruses(file: File): Promise<{ clean: boolean; threatName?: string; scanEngine?: string }> {
    // In a real application, this would call out to a virus scanning service
    
    // For demonstration, we'll just check for suspicious file extensions
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (fileExtension && SUSPICIOUS_EXTENSIONS.includes(fileExtension)) {
      return {
        clean: false,
        threatName: 'Suspicious file extension',
        scanEngine: 'ExtensionValidator'
      };
    }
    
    // For production, you would integrate with a real scanning service:
    // 1. Upload the file to a scanning service
    // 2. Wait for scan results
    // 3. Return the results
    
    // Simulated scan result
    return {
      clean: true,
      scanEngine: 'MockScanner'
    };
  }

  /**
   * Create an image element from a file
   */
  private createImageElement(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };
      
      img.src = url;
    });
  }

  /**
   * Read a file as array buffer
   */
  private readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to read file as array buffer'));
        }
      };
      
      reader.onerror = () => {
        reject(reader.error || new Error('Failed to read file'));
      };
      
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Read the first N bytes of a file
   */
  private readFileHeader(file: File, bytes: number): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to read file header'));
        }
      };
      
      reader.onerror = () => {
        reject(reader.error || new Error('Failed to read file header'));
      };
      
      // Read only the specified number of bytes
      const slice = file.slice(0, bytes);
      reader.readAsArrayBuffer(slice);
    });
  }

  /**
   * Convert an array buffer to a base64 string
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    
    return btoa(binary);
  }

  /**
   * Convert a base64 string to an array buffer
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

// Export singleton instance
export const secureFileManager = SecureFileManager.getInstance(); 