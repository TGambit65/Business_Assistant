/**
 * Security utility functions
 */

/**
 * Convert Base64URL string to ArrayBuffer
 */
export function base64URLToArrayBuffer(base64URL: string): ArrayBuffer {
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
  
  return bytes.buffer as ArrayBuffer;
}

/**
 * Convert ArrayBuffer to Base64URL string
 */
export function arrayBufferToBase64URL(buffer: ArrayBuffer): string {
  // Create binary string from ArrayBuffer
  const binary = String.fromCharCode.apply(null, Array.from(new Uint8Array(buffer)));
  
  // Convert to base64
  const base64 = btoa(binary);
  
  // Make base64 URL-safe by replacing "+" with "-", "/" with "_", and removing "="
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Generate a random challenge suitable for cryptographic operations
 */
export function generateRandomChallenge(length = 32): Uint8Array {
  const array = new Uint8Array(length);
  window.crypto.getRandomValues(array);
  return array;
}

/**
 * Generate a random string of specified length
 */
export function generateRandomString(length = 32): string {
  const array = generateRandomChallenge(length);
  return arrayBufferToBase64URL(array.buffer as ArrayBuffer);
}

/**
 * Convert a hex string to an ArrayBuffer
 */
export function hexToArrayBuffer(hex: string): ArrayBuffer {
  if (hex.length % 2 !== 0) {
    throw new Error('Hex string must have an even length');
  }
  
  const bytes = new Uint8Array(hex.length / 2);
  
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  
  return bytes.buffer as ArrayBuffer;
}

/**
 * Convert an ArrayBuffer to a hex string
 */
export function arrayBufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Create a SHA-256 hash of a string
 */
export async function sha256(message: string): Promise<ArrayBuffer> {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  return hashBuffer;
}

/**
 * Convert a string to an ArrayBuffer
 */
export function stringToArrayBuffer(str: string): ArrayBuffer {
  return new TextEncoder().encode(str).buffer as ArrayBuffer;
}

/**
 * Convert an ArrayBuffer to a string
 */
export function arrayBufferToString(buffer: ArrayBuffer): string {
  return new TextDecoder().decode(buffer);
}

/**
 * Compare two ArrayBuffers for equality
 */
export function compareArrayBuffers(buf1: ArrayBuffer, buf2: ArrayBuffer): boolean {
  if (buf1.byteLength !== buf2.byteLength) {
    return false;
  }
  
  const dv1 = new DataView(buf1);
  const dv2 = new DataView(buf2);
  
  for (let i = 0; i < buf1.byteLength; i++) {
    if (dv1.getUint8(i) !== dv2.getUint8(i)) {
      return false;
    }
  }
  
  return true;
} 