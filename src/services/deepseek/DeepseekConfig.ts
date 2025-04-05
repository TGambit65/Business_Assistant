import { DeepseekConfig } from '../../types/deepseek';

/**
 * Required environment variables for DeepseekService
 */
export const REQUIRED_ENV = [
  'DEEPSEEK_API_KEY',
  'DEEPSEEK_API_URL',
  'DEEPSEEK_DEFAULT_MODEL'
];

/**
 * Default API timeout in milliseconds
 */
export const DEFAULT_TIMEOUT_MS = 30000;

/**
 * Default cache expiration time in milliseconds
 */
export const DEFAULT_CACHE_EXPIRATION_MS = 60000; // 1 minute

/**
 * Default model identifiers
 */
export const DEFAULT_MODELS = {
  default: 'deepseek-chat',
  enhanced: 'deepseek-chat-pro',
  lightweight: 'deepseek-chat-light'
};

/**
 * Default rate limits
 */
export const DEFAULT_RATE_LIMITS = {
  requestsPerMinute: 60,
  tokensPerRequest: 4000
};

/**
 * Default retry configuration
 */
export const DEFAULT_MAX_RETRIES = 3;

/**
 * Create a DeepseekConfig with default values provided
 */
export function createDefaultConfig(config: Partial<DeepseekConfig> & { apiKey?: string }): DeepseekConfig {
  if (!config.apiKeys || config.apiKeys.length === 0) {
    if (config.apiKey) {
      // For backward compatibility
      config.apiKeys = [config.apiKey];
    } else {
      throw new Error('DeepseekConfig requires at least one API key');
    }
  }
  
  if (!config.baseUrl) {
    throw new Error('DeepseekConfig requires a baseUrl');
  }
  
  return {
    apiKeys: config.apiKeys,
    baseUrl: config.baseUrl,
    models: config.models || DEFAULT_MODELS,
    maxRetries: config.maxRetries || DEFAULT_MAX_RETRIES,
    timeout: config.timeout || DEFAULT_TIMEOUT_MS,
    rateLimits: config.rateLimits || DEFAULT_RATE_LIMITS
  };
}

/**
 * Common retryable error codes and messages
 */
export const RETRYABLE_ERROR_CODES = new Set([
  'ECONNRESET',
  'ETIMEDOUT',
  'ECONNABORTED',
  'ENETUNREACH',
  'ENETRESET',
  'ENOTFOUND',
  'EPIPE',
  'socket hang up',
  'network error',
  'Network Error',
  'timeout',
  'Timeout',
  'Request timeout',
]);

/**
 * HTTP status codes that are generally safe to retry
 */
export const RETRYABLE_STATUS_CODES = new Set([
  408, // Request Timeout
  429, // Too Many Requests
  500, // Internal Server Error
  502, // Bad Gateway
  503, // Service Unavailable
  504, // Gateway Timeout
]); 