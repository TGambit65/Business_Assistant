/**
 * Secure Cookie Utility
 * 
 * Utility for handling secure cookies with enhanced security features.
 */

import { SecureCookieOptions } from '../types/enhancedSecurity';

/**
 * Set a secure cookie
 * @param name Cookie name
 * @param value Cookie value
 * @param options Secure cookie options
 */
export function setSecureCookie(name: string, value: string, options: SecureCookieOptions): void {
  // Build cookie string
  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
  
  // Add secure flag
  if (options.secure) {
    cookieString += '; Secure';
  }
  
  // Add HttpOnly flag
  if (options.httpOnly) {
    cookieString += '; HttpOnly';
  }
  
  // Add SameSite flag
  cookieString += `; SameSite=${options.sameSite}`;
  
  // Add domain if specified
  if (options.domain) {
    cookieString += `; Domain=${options.domain}`;
  }
  
  // Add path
  cookieString += `; Path=${options.path}`;
  
  // Add max age
  if (options.maxAge) {
    cookieString += `; Max-Age=${options.maxAge}`;
  }
  
  // Set the cookie
  document.cookie = cookieString;
}

/**
 * Get a cookie by name
 * @param name Cookie name
 * @returns Cookie value or null if not found
 */
export function getCookie(name: string): string | null {
  const cookies = document.cookie.split(';');
  
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    
    // Check if this cookie starts with the name we're looking for
    if (cookie.startsWith(`${name}=`)) {
      // Return the cookie value
      return decodeURIComponent(cookie.substring(name.length + 1));
    }
  }
  
  // Cookie not found
  return null;
}

/**
 * Delete a cookie
 * @param name Cookie name
 * @param options Secure cookie options
 */
export function deleteSecureCookie(name: string, options: Partial<SecureCookieOptions> = {}): void {
  // Set cookie with expiration in the past
  const deletionOptions: SecureCookieOptions = {
    sameSite: options.sameSite || 'strict',
    secure: options.secure !== undefined ? options.secure : true,
    httpOnly: options.httpOnly !== undefined ? options.httpOnly : true,
    domain: options.domain,
    path: options.path || '/',
    maxAge: -1 // Expire immediately
  };
  
  setSecureCookie(name, '', deletionOptions);
}

/**
 * Store authentication data in secure cookies
 * @param data Data to store
 * @param options Secure cookie options
 */
export function storeAuthInSecureCookies(data: Record<string, any>, options: SecureCookieOptions): void {
  // Store each property in a separate cookie
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      setSecureCookie(`auth_${key}`, value, options);
    } else {
      // Stringify non-string values
      setSecureCookie(`auth_${key}`, JSON.stringify(value), options);
    }
  }
  
  // Set a cookie with the keys to make retrieval easier
  setSecureCookie('auth_keys', Object.keys(data).join(','), options);
}

/**
 * Retrieve authentication data from secure cookies
 * @returns Authentication data or null if not found
 */
export function getAuthFromSecureCookies(): Record<string, any> | null {
  // Get the keys
  const keysString = getCookie('auth_keys');
  
  if (!keysString) {
    return null;
  }
  
  const keys = keysString.split(',');
  const data: Record<string, any> = {};
  
  // Retrieve each property
  for (const key of keys) {
    const value = getCookie(`auth_${key}`);
    
    if (value) {
      try {
        // Try to parse as JSON
        data[key] = JSON.parse(value);
      } catch {
        // If parsing fails, use the string value
        data[key] = value;
      }
    }
  }
  
  return data;
}

/**
 * Clear all authentication cookies
 * @param options Secure cookie options
 */
export function clearAuthCookies(options: Partial<SecureCookieOptions> = {}): void {
  // Get the keys
  const keysString = getCookie('auth_keys');
  
  if (keysString) {
    const keys = keysString.split(',');
    
    // Delete each cookie
    for (const key of keys) {
      deleteSecureCookie(`auth_${key}`, options);
    }
  }
  
  // Delete the keys cookie
  deleteSecureCookie('auth_keys', options);
}
