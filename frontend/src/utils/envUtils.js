/**
 * Utility for accessing environment variables
 * 
 * This handles retrieving environment variables from different sources
 * to support both the frontend React app and the root configuration.
 */

const ENV_MAPPING = {
  // React app variables (REACT_APP_ prefix)
  'REACT_APP_DEEPSEEK_R1_KEY': 'DEEPSEEK_R1_KEY',
  'REACT_APP_DEEPSEEK_V3_KEY': 'DEEPSEEK_V3_KEY',
  'REACT_APP_DEEPSEEK_KEY': 'DEEPSEEK_V3_KEY', // Fallback to V3
  'REACT_APP_DEEPSEEK_API_KEY': 'DEEPSEEK_R1_KEY', // Fallback to R1
  'REACT_APP_USE_DEMO_MODE': 'USE_DEMO_MODE',
  
  // Additional mappings as needed
  'REACT_APP_GOOGLE_CLIENT_ID': 'GOOGLE_CLIENT_ID',
};

// Cache for environment variables
let envCache = {};
let envCacheTimestamp = 0;
const CACHE_TTL = 10000; // 10 seconds TTL for env cache

/**
 * Force reload environment variables from all sources
 * This can be used when environment variables may have changed
 */
export const reloadEnvironmentVariables = () => {
  // Clear the cache
  envCache = {};
  envCacheTimestamp = Date.now();
  
  // Log the reload
  console.log('Environment variables cache cleared, will reload from sources');
  
  // Return a list of available keys for debugging
  return Object.keys(process.env)
    .filter(key => key.startsWith('REACT_APP_'))
    .map(key => ({ key, value: key.includes('KEY') ? '***' : process.env[key] }));
};

/**
 * Get an environment variable, checking multiple sources
 * 
 * @param {string} reactAppKey - The React app environment variable name (with REACT_APP_ prefix)
 * @param {string|null} defaultValue - Default value if not found
 * @param {boolean} bypassCache - Whether to bypass the cache and reload from source
 * @returns {string|null} The environment variable value or default
 */
export const getEnvVariable = (reactAppKey, defaultValue = null, bypassCache = false) => {
  // If we have a cached value and the cache isn't expired, use it
  if (!bypassCache && 
      envCache[reactAppKey] !== undefined && 
      Date.now() - envCacheTimestamp < CACHE_TTL) {
    return envCache[reactAppKey];
  }
  
  let value = null;
  
  // First try the React app environment variable
  if (process.env[reactAppKey]) {
    value = process.env[reactAppKey];
  }
  // If not found and we have a mapping, try the root .env equivalent
  else if (ENV_MAPPING[reactAppKey] && window._ROOT_ENV && window._ROOT_ENV[ENV_MAPPING[reactAppKey]]) {
    value = window._ROOT_ENV[ENV_MAPPING[reactAppKey]];
  }
  // Try to read from localStorage where some env vars may be cached
  else if (localStorage.getItem(`env_${reactAppKey}`)) {
    value = localStorage.getItem(`env_${reactAppKey}`);
  }
  // Finally check if we have a hardcoded demo value when in development
  else if (process.env.NODE_ENV === 'development') {
    // You can add development-only fallbacks here
    if (reactAppKey === 'REACT_APP_USE_DEMO_MODE') {
      value = 'true';
    }
    
    // Always provide a dummy key for development purposes
    if ((reactAppKey === 'REACT_APP_DEEPSEEK_R1_KEY' || 
         reactAppKey === 'REACT_APP_DEEPSEEK_V3_KEY' ||
         reactAppKey === 'REACT_APP_DEEPSEEK_KEY' ||
         reactAppKey === 'REACT_APP_DEEPSEEK_API_KEY')) {
      value = 'demo-api-key';
      // Also set demo mode for consistent behavior
      localStorage.setItem('env_REACT_APP_USE_DEMO_MODE', 'true');
      console.log('Enabled demo mode due to missing API key');
    }
    
    // Set a dummy Google client ID for development
    if (reactAppKey === 'REACT_APP_GOOGLE_CLIENT_ID') {
      value = 'demo-google-client-id';
      // Also set demo mode for Google auth
      localStorage.setItem('env_REACT_APP_USE_DEMO_MODE', 'true');
      console.log('Enabled demo mode for Google authentication');
    }
  }
  
  // If no value found, use default
  if (value === null) {
    value = defaultValue;
  }
  
  // Cache the result
  envCache[reactAppKey] = value;
  
  // For API keys, also store in localStorage for persistence through reloads
  if (value && (reactAppKey.includes('KEY') || reactAppKey.includes('_ID'))) {
    // Store a masked version in local storage for persistence
    localStorage.setItem(`env_${reactAppKey}`, value);
  }
  
  return value;
};

/**
 * Check if demo mode is enabled
 * @param {boolean} bypassCache - Whether to bypass the cache
 * @returns {boolean} True if demo mode is enabled
 */
export const isDemoMode = (bypassCache = false) => {
  // First check if demo mode is explicitly enabled in localStorage
  if (localStorage.getItem('env_REACT_APP_USE_DEMO_MODE') === 'true') {
    return true;
  }
  
  // In development, always use demo mode
  if (process.env.NODE_ENV === 'development') {
    localStorage.setItem('env_REACT_APP_USE_DEMO_MODE', 'true');
    return true;
  }
  
  // Otherwise check the environment variable
  return getEnvVariable('REACT_APP_USE_DEMO_MODE', 'false', bypassCache) === 'true';
};

/**
 * Get all available API keys
 * @param {boolean} bypassCache - Whether to bypass the cache
 * @returns {Object} Object containing all available API keys
 */
export const getAllApiKeys = (bypassCache = false) => {
  return {
    deepseekR1: getEnvVariable('REACT_APP_DEEPSEEK_R1_KEY', null, bypassCache),
    deepseekV3: getEnvVariable('REACT_APP_DEEPSEEK_V3_KEY', null, bypassCache),
    deepseekFallback: getEnvVariable('REACT_APP_DEEPSEEK_KEY', null, bypassCache),
    googleClientId: getEnvVariable('REACT_APP_GOOGLE_CLIENT_ID', null, bypassCache),
  };
}; 