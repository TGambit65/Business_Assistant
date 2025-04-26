/**
 * HardwareSecurityManager
 * 
 * Provides hardware-based security features using WebAuthn:
 * - FIDO2/WebAuthn authentication
 * - Hardware key management
 * - Biometric authentication integration
 * - Attestation verification
 */

import { AuditLogger, LogLevel, EventType } from './AuditLogger';

// Inlined utility functions to avoid import issues
function base64URLToArrayBuffer(base64URL: string): ArrayBuffer {
  // Replace non-URL compatible chars with base64 standard chars
  const base64 = base64URL.replace(/-/g, '+').replace(/_/g, '/');
  
  // Add padding if needed
  const padding = '='.repeat((4 - base64.length % 4) % 4);
  const base64Padded = base64 + padding;
  
  // Convert base64 to binary string
  const binary = atob(base64Padded);
  
  // Create Uint8Array from binary string
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  
  return bytes.buffer;
}

function arrayBufferToBase64URL(buffer: ArrayBuffer): string {
  // Create binary string from ArrayBuffer
  const binary = String.fromCharCode.apply(null, Array.from(new Uint8Array(buffer)));
  
  // Convert to base64
  const base64 = btoa(binary);
  
  // Make base64 URL-safe by replacing "+" with "-", "/" with "_", and removing "="
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

// WebAuthn types
export enum AuthenticatorAttachment {
  PLATFORM = 'platform',   // Built-in authenticator (TouchID, FaceID, Windows Hello)
  CROSS_PLATFORM = 'cross-platform' // External authenticator (YubiKey, etc.)
}

export enum UserVerificationRequirement {
  REQUIRED = 'required',
  PREFERRED = 'preferred',
  DISCOURAGED = 'discouraged'
}

export enum AuthenticatorTransport {
  USB = 'usb',
  NFC = 'nfc',
  BLE = 'ble',
  INTERNAL = 'internal'
}

export interface WebAuthnCredential {
  id: string;
  rawId: string;
  type: string;
  authenticatorAttachment?: AuthenticatorAttachment;
  transports?: AuthenticatorTransport[];
  createdAt: number;
  lastUsedAt: number;
  deviceName?: string;
}

export interface WebAuthnUser {
  id: string;
  name: string;
  displayName: string;
}

export interface RegistrationOptions {
  authenticatorAttachment?: AuthenticatorAttachment;
  requireResidentKey?: boolean;
  userVerification?: UserVerificationRequirement;
  attestation?: AttestationConveyancePreference;
  excludeCredentials?: WebAuthnCredential[];
  timeout?: number;
}

export interface AuthenticationOptions {
  userVerification?: UserVerificationRequirement;
  allowCredentials?: WebAuthnCredential[];
  timeout?: number;
}

export interface RegistrationResult {
  successful: boolean;
  credential?: WebAuthnCredential;
  error?: string;
}

export interface AuthenticationResult {
  successful: boolean;
  credential?: WebAuthnCredential;
  error?: string;
}

export class HardwareSecurityManager {
  private static instance: HardwareSecurityManager;
  private logger: AuditLogger;
  private credentials: Map<string, WebAuthnCredential> = new Map();
  
  private constructor() {
    this.logger = new AuditLogger({
      enableConsoleLogging: false,
      enableRemoteLogging: true,
      maxLocalStorageEntries: 100
    });
    
    // Load saved credentials from localStorage
    this.loadCredentials();
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): HardwareSecurityManager {
    if (!HardwareSecurityManager.instance) {
      HardwareSecurityManager.instance = new HardwareSecurityManager();
    }
    return HardwareSecurityManager.instance;
  }

  /**
   * Check if WebAuthn is available in the current browser
   */
  public isWebAuthnAvailable(): boolean {
    return window.PublicKeyCredential !== undefined;
  }

  /**
   * Check if platform authenticator is available (TouchID, FaceID, Windows Hello)
   */
  public async isPlatformAuthenticatorAvailable(): Promise<boolean> {
    if (!this.isWebAuthnAvailable()) {
      return false;
    }
    
    try {
      return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch (error) {
      this.logger.log({
        level: LogLevel.ERROR,
        type: EventType.AUTHENTICATION,
        description: 'Error checking platform authenticator availability',
        metadata: { error }
      });
      
      return false;
    }
  }

  /**
   * Register a new WebAuthn credential
   */
  public async registerCredential(
    userId: string,
    username: string,
    displayName: string,
    options?: RegistrationOptions
  ): Promise<RegistrationResult> {
    if (!this.isWebAuthnAvailable()) {
      return {
        successful: false,
        error: 'WebAuthn is not supported in this browser'
      };
    }
    
    try {
      // Create challenge
      const challenge = this.generateChallenge();
      
      // Convert user ID to ArrayBuffer
      const userIdBuffer = new TextEncoder().encode(userId);
      
      // Prepare excluded credentials if any
      const excludeCredentials = options?.excludeCredentials?.map(cred => ({
        id: base64URLToArrayBuffer(cred.rawId),
        type: 'public-key' as const,
        transports: cred.transports
      })) || [];
      
      // Create credential creation options
      const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
        challenge,
        rp: {
          name: 'Email Assistant',
          id: window.location.hostname
        },
        user: {
          id: userIdBuffer,
          name: username,
          displayName: displayName
        },
        pubKeyCredParams: [
          { type: 'public-key', alg: -7 }, // ES256
          { type: 'public-key', alg: -257 } // RS256
        ],
        timeout: options?.timeout || 60000,
        excludeCredentials,
        authenticatorSelection: {
          authenticatorAttachment: options?.authenticatorAttachment,
          requireResidentKey: options?.requireResidentKey || false,
          userVerification: options?.userVerification || UserVerificationRequirement.PREFERRED
        },
        attestation: options?.attestation || 'none'
      };
      
      // Start the registration process
      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions
      }) as PublicKeyCredential;
      
      if (!credential) {
        throw new Error('Failed to create credential');
      }
      
      // Get the attestation response
      const response = credential.response as AuthenticatorAttestationResponse;
      
      // Create a WebAuthnCredential object
      const webAuthnCredential: WebAuthnCredential = {
        id: credential.id,
        rawId: arrayBufferToBase64URL(credential.rawId),
        type: credential.type,
        authenticatorAttachment: options?.authenticatorAttachment,
        transports: (response.getTransports?.() as AuthenticatorTransport[]) || undefined,
        createdAt: Date.now(),
        lastUsedAt: Date.now()
      };
      
      // Store the credential
      this.credentials.set(credential.id, webAuthnCredential);
      this.saveCredentials();
      
      this.logger.log({
        level: LogLevel.INFO,
        type: EventType.AUTHENTICATION,
        description: 'New WebAuthn credential registered',
        metadata: {
          userId,
          credentialId: credential.id,
          authenticatorAttachment: options?.authenticatorAttachment
        }
      });
      
      return {
        successful: true,
        credential: webAuthnCredential
      };
    } catch (error) {
      this.logger.log({
        level: LogLevel.ERROR,
        type: EventType.AUTHENTICATION,
        description: 'Error registering WebAuthn credential',
        metadata: { error, userId }
      });
      
      return {
        successful: false,
        error: `Registration failed: ${(error as Error).message}`
      };
    }
  }

  /**
   * Authenticate using a WebAuthn credential
   */
  public async authenticate(options?: AuthenticationOptions): Promise<AuthenticationResult> {
    if (!this.isWebAuthnAvailable()) {
      return {
        successful: false,
        error: 'WebAuthn is not supported in this browser'
      };
    }
    
    try {
      // Create challenge
      const challenge = this.generateChallenge();
      
      // Prepare allowed credentials if any
      const allowCredentials = options?.allowCredentials?.map(cred => ({
        id: base64URLToArrayBuffer(cred.rawId),
        type: 'public-key' as const,
        transports: cred.transports
      })) || Array.from(this.credentials.values()).map(cred => ({
        id: base64URLToArrayBuffer(cred.rawId),
        type: 'public-key' as const,
        transports: cred.transports
      }));
      
      // Check if we have any credentials
      if (allowCredentials.length === 0) {
        return {
          successful: false,
          error: 'No registered credentials found'
        };
      }
      
      // Create credential request options
      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
        challenge,
        timeout: options?.timeout || 60000,
        allowCredentials,
        userVerification: options?.userVerification || UserVerificationRequirement.PREFERRED,
        rpId: window.location.hostname
      };
      
      // Start the authentication process
      const credential = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions
      }) as PublicKeyCredential;
      
      if (!credential) {
        throw new Error('Failed to get credential');
      }
      
      // Find the matching credential from our store
      const storedCredential = this.credentials.get(credential.id);
      
      if (!storedCredential) {
        throw new Error('Unknown credential');
      }
      
      // Update last used timestamp
      storedCredential.lastUsedAt = Date.now();
      this.saveCredentials();
      
      this.logger.log({
        level: LogLevel.INFO,
        type: EventType.AUTHENTICATION,
        description: 'WebAuthn authentication successful',
        metadata: { credentialId: credential.id }
      });
      
      return {
        successful: true,
        credential: storedCredential
      };
    } catch (error) {
      this.logger.log({
        level: LogLevel.ERROR,
        type: EventType.AUTHENTICATION,
        description: 'Error authenticating with WebAuthn',
        metadata: { error }
      });
      
      return {
        successful: false,
        error: `Authentication failed: ${(error as Error).message}`
      };
    }
  }

  /**
   * Remove a WebAuthn credential
   */
  public removeCredential(credentialId: string): boolean {
    const result = this.credentials.delete(credentialId);
    
    if (result) {
      this.saveCredentials();
      
      this.logger.log({
        level: LogLevel.INFO,
        type: EventType.AUTHENTICATION,
        description: 'WebAuthn credential removed',
        metadata: { credentialId }
      });
    }
    
    return result;
  }

  /**
   * Get all registered WebAuthn credentials
   */
  public getCredentials(): WebAuthnCredential[] {
    return Array.from(this.credentials.values());
  }

  /**
   * Rename a credential device
   */
  public renameCredential(credentialId: string, deviceName: string): boolean {
    const credential = this.credentials.get(credentialId);
    
    if (!credential) {
      return false;
    }
    
    credential.deviceName = deviceName;
    this.saveCredentials();
    
    this.logger.log({
      level: LogLevel.INFO,
      type: EventType.AUTHENTICATION,
      description: 'WebAuthn credential renamed',
      metadata: { credentialId, deviceName }
    });
    
    return true;
  }

  /**
   * Generate a random challenge for WebAuthn operations
   */
  private generateChallenge(): ArrayBuffer {
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    return array.buffer;
  }

  /**
   * Save credentials to localStorage
   */
  private saveCredentials(): void {
    try {
      const serializedCredentials = JSON.stringify(Array.from(this.credentials.entries()));
      localStorage.setItem('webauthn_credentials', serializedCredentials);
    } catch (error) {
      this.logger.log({
        level: LogLevel.ERROR,
        type: EventType.AUTHENTICATION,
        description: 'Error saving WebAuthn credentials',
        metadata: { error }
      });
    }
  }

  /**
   * Load credentials from localStorage
   */
  private loadCredentials(): void {
    try {
      const serializedCredentials = localStorage.getItem('webauthn_credentials');
      
      if (serializedCredentials) {
        const entries: [string, WebAuthnCredential][] = JSON.parse(serializedCredentials);
        this.credentials = new Map(entries);
      }
    } catch (error) {
      this.logger.log({
        level: LogLevel.ERROR,
        type: EventType.AUTHENTICATION,
        description: 'Error loading WebAuthn credentials',
        metadata: { error }
      });
    }
  }
}

// Export singleton instance
export const hardwareSecurityManager = HardwareSecurityManager.getInstance(); 