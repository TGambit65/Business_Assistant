/**
 * Device Fingerprinting Utility
 *
 * Utility for generating device fingerprints for device binding.
 */

import { DeviceFingerprint } from '../types/enhancedSecurity';

/**
 * Generate a device fingerprint
 * @returns Promise resolving to a device fingerprint
 */
export async function generateDeviceFingerprint(): Promise<DeviceFingerprint> {
  try {
    // Collect device information
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    const screenResolution = `${window.screen.width}x${window.screen.height}`;
    const colorDepth = window.screen.colorDepth;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const language = navigator.language;

    // Create a fingerprint string
    const fingerprintData = [
      userAgent,
      platform,
      screenResolution,
      colorDepth,
      timezone,
      language,
      // Add more entropy
      new Date().getTimezoneOffset(),
      navigator.hardwareConcurrency || 'unknown',
      // TypeScript doesn't recognize deviceMemory, so we use any type
      // Also add a fallback for browsers that don't support deviceMemory
      typeof (navigator as any).deviceMemory !== 'undefined' ? (navigator as any).deviceMemory : 'unknown',
    ].join('|');

    // Generate a hash of the fingerprint data
    const fingerprintHash = await hashString(fingerprintData);

    // Create a device fingerprint object
    const deviceFingerprint: DeviceFingerprint = {
      id: fingerprintHash,
      userAgent,
      platform,
      screenResolution,
      colorDepth,
      timezone,
      language,
      hardware: {
        cpuCores: navigator.hardwareConcurrency,
        memory: typeof (navigator as any).deviceMemory !== 'undefined' ? (navigator as any).deviceMemory as number : undefined,
      },
      createdAt: Date.now(),
      lastSeen: Date.now()
    };

    return deviceFingerprint;
  } catch (error) {
    console.error('Error generating device fingerprint:', error);

    // Return a fallback fingerprint based on timestamp and random value
    const fallbackId = `fallback-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

    return {
      id: fallbackId,
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      createdAt: Date.now(),
      lastSeen: Date.now()
    };
  }
}

/**
 * Hash a string using SHA-256
 * @param str String to hash
 * @returns Promise resolving to the hash
 */
export async function hashString(str: string): Promise<string> {
  try {
    // Convert string to ArrayBuffer
    const encoder = new TextEncoder();
    const data = encoder.encode(str);

    // Hash the data
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);

    // Convert ArrayBuffer to hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return hashHex;
  } catch (error) {
    console.error('Error hashing string:', error);
    throw new Error(`Failed to hash string: ${(error as Error).message}`);
  }
}

/**
 * Compare two device fingerprints
 * @param fp1 First device fingerprint
 * @param fp2 Second device fingerprint
 * @returns Similarity score between 0 and 1
 */
export function compareDeviceFingerprints(fp1: DeviceFingerprint, fp2: DeviceFingerprint): number {
  let matchCount = 0;
  let totalChecks = 0;

  // Compare basic properties
  if (fp1.userAgent === fp2.userAgent) matchCount++;
  totalChecks++;

  if (fp1.platform === fp2.platform) matchCount++;
  totalChecks++;

  if (fp1.screenResolution === fp2.screenResolution) matchCount++;
  totalChecks++;

  if (fp1.colorDepth === fp2.colorDepth) matchCount++;
  totalChecks++;

  if (fp1.timezone === fp2.timezone) matchCount++;
  totalChecks++;

  if (fp1.language === fp2.language) matchCount++;
  totalChecks++;

  // Compare hardware properties if available
  if (fp1.hardware && fp2.hardware) {
    if (fp1.hardware.cpuCores === fp2.hardware.cpuCores) matchCount++;
    totalChecks++;

    if (fp1.hardware.memory === fp2.hardware.memory) matchCount++;
    totalChecks++;
  }

  // Calculate similarity score
  return matchCount / totalChecks;
}

/**
 * Check if a device fingerprint is suspicious
 * @param fingerprint Device fingerprint to check
 * @returns true if suspicious, false otherwise
 */
export function isSuspiciousDevice(fingerprint: DeviceFingerprint): boolean {
  // Check for common bot/automation indicators
  const botIndicators = [
    'headless',
    'phantomjs',
    'selenium',
    'webdriver',
    'nightmare',
    'puppeteer',
    'cypress'
  ];

  const userAgentLower = fingerprint.userAgent.toLowerCase();

  for (const indicator of botIndicators) {
    if (userAgentLower.includes(indicator)) {
      return true;
    }
  }

  // Check for unusual hardware configurations
  if (fingerprint.hardware) {
    // Extremely high core count might be suspicious
    if (fingerprint.hardware.cpuCores && fingerprint.hardware.cpuCores > 32) {
      return true;
    }

    // Extremely high memory might be suspicious
    if (fingerprint.hardware.memory && fingerprint.hardware.memory > 32) {
      return true;
    }
  }

  return false;
}
