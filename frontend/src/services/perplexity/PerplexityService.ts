// eslint-disable-next-line @typescript-eslint/no-unused-vars
import axios, { AxiosInstance, AxiosError } from 'axios';
import { PerplexityConfig, createDefaultConfig } from './PerplexityConfig';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { PerplexityRequest, PerplexityResponse, APIError } from '../../types/perplexity'; // Assuming types will be created
import { normalizeError } from './utils'; // Assuming utils will be created or adapted

/**
 * Service class for interacting with the Perplexity AI API.
 * Handles API key management, request formatting, and error handling.
 */
export class PerplexityService {
  private config: PerplexityConfig;
  private apiClient: AxiosInstance;
  private currentKeyIndex: number = 0;

  /**
   * Creates an instance of PerplexityService.
   * @param config - Partial configuration for the service. API keys can be provided here or via environment variables.
   */
  constructor(config: Partial<PerplexityConfig> & { apiKey?: string }) {
    this.config = createDefaultConfig(config); // Use a helper to set defaults

    this.apiClient = axios.create({
      baseURL: this.config.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: this.config.timeout || 30000, // Default 30 second timeout
    });

    // Request interceptor for API key rotation and authorization
    this.apiClient.interceptors.request.use((reqConfig) => {
      // Ensure headers object exists and add Authorization
      reqConfig.headers = reqConfig.headers || {}; // Initialize if undefined
      const apiKey = this.getNextApiKey();
      reqConfig.headers['Authorization'] = `Bearer ${apiKey}`;
      return reqConfig;
    });

    // Response interceptor for error handling
    this.apiClient.interceptors.response.use(
      response => response,
      error => Promise.reject(normalizeError(error)) // Use a helper to normalize errors
    );
  }

  /**
   * Rotates to the next available API key.
   * @returns The next API key to use.
   */
  private getNextApiKey(): string {
    if (!this.config.apiKeys || this.config.apiKeys.length === 0) {
      throw new Error('No Perplexity API keys available. Please configure REACT_APP_PERPLEXITY_API_KEY.');
    }
    const apiKey = this.config.apiKeys[this.currentKeyIndex];
    this.currentKeyIndex = (this.currentKeyIndex + 1) % this.config.apiKeys.length;
    return apiKey;
  }

  /**
   * Sends a request to the Perplexity Chat Completions API.
   * @param requestData - The request payload conforming to PerplexityRequest.
   * @returns A promise that resolves with the PerplexityResponse.
   */
  public async getChatCompletion(requestData: PerplexityRequest): Promise<PerplexityResponse> {
    try {
      console.log('Sending request to Perplexity API:', requestData);
      const response = await this.apiClient.post<PerplexityResponse>('/chat/completions', requestData);
      console.log('Received response from Perplexity API:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error calling Perplexity API:', error);
      this.handleApiError(error); // Throws a normalized APIError
    }
  }

  /**
   * Validates the configured API key(s) by making a simple request.
   * @returns A promise that resolves to true if at least one key is valid, false otherwise.
   */
  public async validateApiKey(): Promise<boolean> {
     // Try validating each key until one works
     for (let i = 0; i < this.config.apiKeys.length; i++) {
        const keyToTest = this.config.apiKeys[i];
        try {
            const testRequest: PerplexityRequest = {
                model: this.config.defaultModel || 'pplx-7b-online', // Use a lightweight model if available
                messages: [{ role: 'user', content: 'Test prompt' }],
                max_tokens: 5,
            };
            // Temporarily override the interceptor to test a specific key
            const tempClient = axios.create({ ...this.apiClient.defaults, headers: { ...this.apiClient.defaults.headers, 'Authorization': `Bearer ${keyToTest}` } });
            await tempClient.post('/chat/completions', testRequest);
            console.log(`Perplexity API Key ending with ...${keyToTest.slice(-4)} is valid.`);
            return true; // Found a valid key
        } catch (error) {
            const apiError = normalizeError(error);
             console.warn(`Perplexity API Key ending with ...${keyToTest.slice(-4)} failed validation: ${apiError.message}`);
            if (apiError.status === 401 || apiError.status === 403) {
                // Authentication error, key is definitely invalid
                continue; // Try the next key
            } else {
                 // Other error (network, rate limit, etc.), might not indicate an invalid key
                 // but we can't confirm validity. Assume invalid for this check.
                 continue;
            }
        }
     }
     console.error('No valid Perplexity API keys found.');
     return false; // No valid key found
  }


  /**
   * Handles API errors, normalizing them and throwing an APIError.
   * @param error - The error caught from the API client.
   */
  private handleApiError(error: any): never {
    const apiError = normalizeError(error);

    // Add specific context if needed
    if (apiError.status === 401 || apiError.status === 403) {
      apiError.message = `Perplexity Authentication Error: ${apiError.message}. Please check your API key.`;
    } else if (apiError.status === 429) {
        apiError.message = `Perplexity Rate Limit Exceeded: ${apiError.message}. Consider adding more keys or implementing backoff.`;
    }

    throw apiError;
  }
}

// Optional: Export a singleton instance
// export const perplexityService = new PerplexityService({});