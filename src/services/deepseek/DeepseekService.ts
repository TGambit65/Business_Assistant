import axios, { AxiosInstance, AxiosRequestConfig, AxiosError, AxiosHeaders } from 'axios';
import { 
  DeepseekConfig,
  GenerationOptions,
  AIResponse,
  AIContext,
  Message,
  RequestCacheEntry
} from '../../types/deepseek';
import { 
  createDefaultConfig,
  DEFAULT_CACHE_EXPIRATION_MS,
  RETRYABLE_ERROR_CODES,
  RETRYABLE_STATUS_CODES 
} from './DeepseekConfig';
import {
  calculateRetryDelay,
  delay,
  ensureRequestId,
  normalizeError,
  validateResponse,
  isRetryableError,
  prepareMessages
} from './utils';

/**
 * Service for interacting with the Deepseek API
 * Provides a robust client with error handling, retries, and context management
 */
export class DeepseekService {
  // Map of request IDs to their cached promises for deduplication
  private readonly requestCache: Map<string, RequestCacheEntry> = new Map();
  
  // API client for making HTTP requests
  private readonly apiClient: AxiosInstance;
  
  // Service configuration
  private readonly config: DeepseekConfig;
  
  // Track current API key index for rotation
  private currentKeyIndex: number = 0;
  
  /**
   * Create a new DeepseekService instance
   */
  constructor(config: Partial<DeepseekConfig> & { apiKey?: string }) {
    // Validate and create configuration with defaults for missing values
    this.config = createDefaultConfig(config);
    
    // Create Axios client with base configuration
    this.apiClient = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    // Add request interceptor for API key rotation
    this.apiClient.interceptors.request.use((config) => {
      if (!config.headers) {
        config.headers = new AxiosHeaders();
      }
      
      // Set the API key using rotation
      const apiKey = this.getNextApiKey();
      config.headers['Authorization'] = `Bearer ${apiKey}`;
      
      return config;
    });
    
    // Add response interceptor for error handling
    this.apiClient.interceptors.response.use(
      response => response,
      error => Promise.reject(normalizeError(error))
    );
  }
  
  /**
   * Get the next API key from the rotation
   */
  private getNextApiKey(): string {
    if (!this.config.apiKeys || this.config.apiKeys.length === 0) {
      throw new Error('No API keys available');
    }
    
    // Get the API key at the current index
    const apiKey = this.config.apiKeys[this.currentKeyIndex];
    
    // Increment the index for the next call
    this.currentKeyIndex = (this.currentKeyIndex + 1) % this.config.apiKeys.length;
    
    return apiKey;
  }
  
  /**
   * Generate a response from the Deepseek API
   * @param prompt The user prompt to generate a response for
   * @param options Options for generation including context
   */
  public async generateResponse(
    prompt: string,
    options: {
      useContext: boolean;
      temperature?: number;
      maxTokens?: number;
      context?: AIContext;
    }
  ): Promise<AIResponse> {
    if (!prompt || typeof prompt !== 'string') {
      throw new Error('Prompt must be a non-empty string');
    }
    
    // Generate a unique request ID for this request
    const requestId = ensureRequestId();
    
    // Check if we have a cached response for a similar request
    const cachedResponse = this.checkCache(requestId);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    try {
      // Prepare messages array from prompt and context
      const messages = options.useContext && options.context 
        ? prepareMessages(prompt, options.context)
        : [{ role: 'user', content: prompt, timestamp: Date.now() }];
      
      // Prepare request data
      const requestData = {
        model: options.context?.metadata?.model || (this.config.models?.default || 'deepseek-default'),
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 1000,
        stream: false
      };
      
      // Execute the request with retry logic
      const responsePromise = this.executeWithRetry(() => 
        this.executeRequest(requestData, requestId)
      );
      
      // Cache the promise for deduplication
      this.cacheRequest(requestId, responsePromise);
      
      return responsePromise;
    } catch (error) {
      return this.handleApiError(error);
    }
  }
  
  /**
   * Validate the API key by making a test request
   */
  public async validateApiKey(): Promise<boolean> {
    try {
      // Make a minimal request to validate the API key
      const response = await this.apiClient.post('/v1/chat/completions', {
        model: this.config.models?.lightweight || 'deepseek-lightweight',
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 1
      });
      
      return response.status === 200;
    } catch (error) {
      // If we get an authentication error, the key is invalid
      const apiError = normalizeError(error);
      if (apiError.status === 401 || apiError.status === 403) {
        return false;
      }
      
      // For other errors, we can't determine if the key is valid
      return false;
    }
  }
  
  /**
   * Execute a request to the Deepseek API
   */
  private async executeRequest(
    requestData: any,
    requestId: string
  ): Promise<AIResponse> {
    try {
      // Execute the API request
      const response = await this.apiClient.post('/v1/chat/completions', requestData);
      
      // Extract and validate the response
      const rawResponse = response.data;
      if (!validateResponse(rawResponse)) {
        throw new Error('Invalid response received from API');
      }
      
      // Format and return the AI response
      const aiResponse: AIResponse = {
        text: rawResponse.choices[0].message.content,
        completionTokens: rawResponse.usage.completion_tokens,
        promptTokens: rawResponse.usage.prompt_tokens,
        totalTokens: rawResponse.usage.total_tokens,
        requestId,
        model: requestData.model,
        timestamp: Date.now()
      };
      
      return aiResponse;
    } catch (error) {
      return this.handleApiError(error);
    }
  }
  
  /**
   * Execute an operation with retry logic
   */
  private async executeWithRetry<T>(
    operation: () => Promise<T>
  ): Promise<T> {
    let lastError: Error | null = null;
    
    // Try the operation up to maxRetries times
    const maxRetries = this.config.maxRetries ?? 3;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Execute the operation
        return await operation();
      } catch (error: any) {
        lastError = error;
        
        // If we've exhausted our retry attempts or error is not retryable, throw
        const isRetryable = isRetryableError(error);
        const hasAttemptsLeft = attempt < maxRetries;
        
        if (!isRetryable || !hasAttemptsLeft) {
          throw error;
        }
        
        // Calculate delay for next retry using the maxRetries value
        const retryDelay = calculateRetryDelay(maxRetries, attempt);
        
        // Wait before retrying
        await delay(retryDelay);
      }
    }
    
    // This should never happen (we should have thrown in the loop)
    throw lastError || new Error('Retry failed for unknown reason');
  }
  
  /**
   * Handle API errors in a standardized way
   */
  private handleApiError(error: any): never {
    const apiError = normalizeError(error);
    
    // Add context to common errors
    if (apiError.status === 429) {
      apiError.message = `Rate limit exceeded: ${apiError.message}`;
    } else if (apiError.status === 401 || apiError.status === 403) {
      apiError.message = `Authentication error: ${apiError.message}`;
    } else if (apiError.status === 400) {
      apiError.message = `Bad request: ${apiError.message}`;
    }
    
    throw apiError;
  }
  
  /**
   * Check the cache for an existing request with the same ID
   */
  private checkCache(requestId: string): Promise<AIResponse> | null {
    const cached = this.requestCache.get(requestId);
    
    if (!cached) {
      return null;
    }
    
    // Check if the cached entry has expired
    if (cached.expiresAt < Date.now()) {
      this.requestCache.delete(requestId);
      return null;
    }
    
    return cached.promise;
  }
  
  /**
   * Cache a request promise for deduplication
   */
  private cacheRequest(requestId: string, promise: Promise<AIResponse>): void {
    this.requestCache.set(requestId, {
      promise,
      timestamp: Date.now(),
      expiresAt: Date.now() + DEFAULT_CACHE_EXPIRATION_MS
    });
  }
  
  /**
   * Clean expired entries from the request cache
   */
  public cleanCache(): void {
    const now = Date.now();
    
    for (const [requestId, entry] of this.requestCache.entries()) {
      if (entry.expiresAt < now) {
        this.requestCache.delete(requestId);
      }
    }
  }
} 