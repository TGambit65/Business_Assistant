/**
 * Authentication System Entry Point
 * 
 * Main entry point for the enhanced authentication system.
 */

// Export enhanced authentication types
export * from '../types/enhancedAuth';
export * from '../types/enhancedSecurity';

// Export enhanced authentication services
export { EnhancedAuthService } from '../services/EnhancedAuthService';
export { EnhancedSecurityManager } from '../security/EnhancedSecurityManager';

// Export authentication utilities
export { validatePassword, calculatePasswordStrength, getPasswordStrengthLabel } from '../utils/passwordValidator';
export { generateDeviceFingerprint, compareDeviceFingerprints } from '../utils/deviceFingerprint';
export { setSecureCookie, getCookie, deleteSecureCookie, storeAuthInSecureCookies, getAuthFromSecureCookies, clearAuthCookies } from '../utils/secureCookie';

// Export authentication components
export { default as MFAVerification } from '../components/auth/MFAVerification';
export { default as SecureRoute } from '../components/auth/SecureRoute';
export { default as PasswordChange } from '../components/auth/PasswordChange';
export { default as SecuritySettings } from '../components/auth/SecuritySettings';
export { default as AuthIntegration } from '../components/auth/AuthIntegration';

// Export authentication context
export { EnhancedAuthProvider, useEnhancedAuth } from '../contexts/EnhancedAuthContext';

// Export authentication configuration
export { getAuthConfig, getSecurityConfig, DEFAULT_ENHANCED_AUTH_CONFIG, DEFAULT_ENHANCED_SECURITY_CONFIG } from '../config/authConfig';
