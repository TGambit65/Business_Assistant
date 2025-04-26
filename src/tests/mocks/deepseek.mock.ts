import { AIResponse, DeepseekConfig } from '../../types/deepseek';
import { AxiosError } from 'axios';

/**
 * Mock configuration for testing
 */
export const mockConfig: DeepseekConfig = {
  baseUrl: 'https://api.deepseek.com',
  apiKeys: ['test-key-1', 'test-key-2', 'test-key-3'],
  timeout: 5000,
  headers: {
    'X-Custom-Header': 'test-value'
  },
  retry: {
    maxRetries: 2,
    initialDelayMs: 100,
    backoffFactor: 2,
    maxDelayMs: 1000,
    jitterFactor: 0.1
  }
};

/**
 * Mock successful response
 */
export const mockSuccessResponse: AIResponse = {
  text: 'This is a test response from the mock API',
  completionTokens: 15,
  promptTokens: 10,
  totalTokens: 25,
  requestId: 'test-request-id',
  model: 'deepseek-test-model',
  timestamp: Date.now()
};

/**
 * Mocked raw API response
 */
export const mockRawApiResponse = {
  text: mockSuccessResponse.text,
  model: mockSuccessResponse.model,
  usage: {
    completion_tokens: mockSuccessResponse.completionTokens,
    prompt_tokens: mockSuccessResponse.promptTokens,
    total_tokens: mockSuccessResponse.totalTokens
  },
  request_id: mockSuccessResponse.requestId
};

/**
 * Mock for API validation error
 */
export const mockValidationError = new Error('Invalid parameters provided') as AxiosError;
mockValidationError.isAxiosError = true;
mockValidationError.response = {
  status: 400,
  statusText: 'Bad Request',
  headers: {},
  config: {},
  data: {
    error: {
      message: 'Invalid parameters provided',
      type: 'validation_error'
    }
  }
} as any;

/**
 * Mock for API rate limit error
 */
export const mockRateLimitError = new Error('Rate limit exceeded') as AxiosError;
mockRateLimitError.isAxiosError = true;
mockRateLimitError.response = {
  status: 429,
  statusText: 'Too Many Requests',
  headers: {
    'Retry-After': '30'
  },
  config: {},
  data: {
    error: {
      message: 'Rate limit exceeded, retry after 30 seconds',
      type: 'rate_limit_error'
    }
  }
} as any;

/**
 * Mock for API authentication error
 */
export const mockAuthError = new Error('Invalid API key') as AxiosError;
mockAuthError.isAxiosError = true;
mockAuthError.response = {
  status: 401,
  statusText: 'Unauthorized',
  headers: {},
  config: {},
  data: {
    error: {
      message: 'Invalid API key provided',
      type: 'authentication_error'
    }
  }
} as any;

/**
 * Mock for API server error
 */
export const mockServerError = new Error('Internal server error') as AxiosError;
mockServerError.isAxiosError = true;
mockServerError.response = {
  status: 500,
  statusText: 'Internal Server Error',
  headers: {},
  config: {},
  data: {
    error: {
      message: 'An unexpected error occurred',
      type: 'server_error'
    }
  }
} as any;

/**
 * Mock for network timeout
 */
export const mockTimeoutError = new Error('Request timed out') as AxiosError;
mockTimeoutError.isAxiosError = true;
mockTimeoutError.code = 'ECONNABORTED';
mockTimeoutError.message = 'timeout of 3000ms exceeded';

/**
 * Mock for network connection error
 */
export const mockConnectionError = new Error('Connection failed') as AxiosError;
mockConnectionError.isAxiosError = true;
mockConnectionError.code = 'ECONNREFUSED';
mockConnectionError.message = 'connect ECONNREFUSED 127.0.0.1:443'; 