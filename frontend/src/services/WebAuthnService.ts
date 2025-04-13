/**
 * WebAuthn Service
 * 
 * Provides biometric and passwordless authentication capabilities using the Web Authentication API
 */

import {
  startRegistration,
  startAuthentication,
} from '@simplewebauthn/browser';
import { API_URL } from '../config/constants';

export class WebAuthnService {
  private static instance: WebAuthnService;
  private apiUrl: string;

  private constructor() {
    this.apiUrl = API_URL;
  }

  public static getInstance(): WebAuthnService {
    if (!WebAuthnService.instance) {
      WebAuthnService.instance = new WebAuthnService();
    }
    return WebAuthnService.instance;
  }

  /**
   * Check if WebAuthn is supported in the current browser
   */
  public isWebAuthnSupported(): boolean {
    return window.PublicKeyCredential !== undefined;
  }

  /**
   * Check if the device has biometric capabilities
   */
  public async isBiometricAvailable(): Promise<boolean> {
    if (!this.isWebAuthnSupported()) {
      return false;
    }

    // Check if platform authenticator is available
    try {
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      return available;
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      return false;
    }
  }

  /**
   * Register a new credential (device/biometric)
   */
  public async registerCredential(userId: string, username: string): Promise<boolean> {
    try {
      // 1. Get registration options from the server
      const optionsResponse = await fetch(`${this.apiUrl}/webauthn/registration-options`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, username }),
        credentials: 'include',
      });

      if (!optionsResponse.ok) {
        throw new Error('Failed to get registration options');
      }

      const options = await optionsResponse.json();

      // 2. Start the registration process in the browser
      const registrationResponse = await startRegistration(options);

      // 3. Send the response to the server for verification
      const verificationResponse = await fetch(`${this.apiUrl}/webauthn/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationResponse),
        credentials: 'include',
      });

      if (!verificationResponse.ok) {
        throw new Error('Failed to verify registration');
      }

      const verificationResult = await verificationResponse.json();
      return verificationResult.verified;
    } catch (error) {
      console.error('Error during credential registration:', error);
      return false;
    }
  }

  /**
   * Authenticate using WebAuthn
   */
  public async authenticate(username: string): Promise<{ success: boolean; token?: string }> {
    try {
      // 1. Get authentication options from the server
      const optionsResponse = await fetch(`${this.apiUrl}/webauthn/authentication-options`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
        credentials: 'include',
      });

      if (!optionsResponse.ok) {
        throw new Error('Failed to get authentication options');
      }

      const options = await optionsResponse.json();

      // 2. Start the authentication process in the browser
      const authenticationResponse = await startAuthentication(options);

      // 3. Send the response to the server for verification
      const verificationResponse = await fetch(`${this.apiUrl}/webauthn/authenticate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(authenticationResponse),
        credentials: 'include',
      });

      if (!verificationResponse.ok) {
        throw new Error('Failed to verify authentication');
      }

      const verificationResult = await verificationResponse.json();
      return {
        success: verificationResult.verified,
        token: verificationResult.token,
      };
    } catch (error) {
      console.error('Error during WebAuthn authentication:', error);
      return { success: false };
    }
  }

  /**
   * Remove a registered credential
   */
  public async removeCredential(credentialId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/webauthn/credentials/${credentialId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to remove credential');
      }

      return true;
    } catch (error) {
      console.error('Error removing credential:', error);
      return false;
    }
  }

  /**
   * Get all registered credentials for the current user
   */
  public async getCredentials(): Promise<any[]> {
    try {
      const response = await fetch(`${this.apiUrl}/webauthn/credentials`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to get credentials');
      }

      const data = await response.json();
      return data.credentials || [];
    } catch (error) {
      console.error('Error getting credentials:', error);
      return [];
    }
  }
}

export default WebAuthnService.getInstance();
