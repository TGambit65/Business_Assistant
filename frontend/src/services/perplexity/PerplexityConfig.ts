/**
 * Configuration interface for the PerplexityService.
 */
export interface PerplexityConfig {
  apiKeys: string[]; // Supports multiple API keys for rotation
  baseUrl: string; // Base URL for the Perplexity API
  defaultModel?: string; // Default model to use if not specified in request
  timeout?: number; // Request timeout in milliseconds
}

/**
 * Creates a default configuration object, merging provided config with defaults.
 * Reads API keys from environment variables if not provided directly.
 * @param config - Partial configuration provided by the user.
 * @returns A complete PerplexityConfig object.
 */
export function createDefaultConfig(config: Partial<PerplexityConfig> & { apiKey?: string }): PerplexityConfig {
  // Handle API keys: prioritize config.apiKeys, then config.apiKey (backward compatibility), then environment variable
  let apiKeys: string[] = [];
  if (config.apiKeys && config.apiKeys.length > 0) {
    apiKeys = config.apiKeys;
  } else if (config.apiKey) {
    // Support single apiKey for backward compatibility or simplicity
    apiKeys = [config.apiKey];
  } else {
    // Fallback to environment variable
    const envApiKey = process.env.REACT_APP_PERPLEXITY_API_KEY;
    if (envApiKey) {
      // Support comma-separated keys in env var
      apiKeys = envApiKey.split(',').map(key => key.trim()).filter(key => key.length > 0);
    }
  }

  if (apiKeys.length === 0) {
    console.warn('Perplexity API key not found in config or environment variable (REACT_APP_PERPLEXITY_API_KEY). Service calls may fail.');
    // Optionally throw an error here if keys are strictly required at initialization
    // throw new Error('Perplexity API key is required.');
  }

  // Set defaults for other configuration options
  const defaults: Omit<PerplexityConfig, 'apiKeys'> = {
    baseUrl: process.env.REACT_APP_PERPLEXITY_BASE_URL || 'https://api.perplexity.ai',
    defaultModel: process.env.REACT_APP_PERPLEXITY_DEFAULT_MODEL || 'pplx-7b-online',
    timeout: config.timeout || 30000, // 30 seconds default timeout
  };

  return {
    ...defaults,
    ...config, // User-provided config overrides defaults
    apiKeys, // Use the resolved API keys
  };
}