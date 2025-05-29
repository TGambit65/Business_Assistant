/**
 * Browser-compatible UUID generation utility
 * Provides multiple fallbacks for environments where crypto.randomUUID is not available
 */

export const generateId = (): string => {
  // Check if crypto.randomUUID is available (modern browsers)
  if (typeof crypto !== 'undefined' && 
      typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch (error) {
      console.warn('crypto.randomUUID failed, falling back to alternative method:', error);
      // Continue to fallback
    }
  }
  
  // Check if crypto.getRandomValues is available for more secure random generation
  if (typeof crypto !== 'undefined' && 
      typeof crypto.getRandomValues === 'function') {
    try {
      const buffer = new Uint8Array(16);
      crypto.getRandomValues(buffer);
      
      // Set version (4) and variant bits
      buffer[6] = (buffer[6]! & 0x0f) | 0x40;
      buffer[8] = (buffer[8]! & 0x3f) | 0x80;
      
      const hex = Array.from(buffer, byte => byte.toString(16).padStart(2, '0')).join('');
      return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
    } catch (error) {
      console.warn('crypto.getRandomValues failed, falling back to Math.random:', error);
      // Continue to fallback
    }
  }
  
  // Fallback to Math.random-based UUID generation for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : ((r & 0x3) | 0x8);
    return v.toString(16);
  });
};

// Alias for consistency with crypto.randomUUID naming
export const randomUUID = generateId;

export default generateId;
