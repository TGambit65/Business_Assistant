import { AxiosInstance, AxiosError } from 'axios';

/**
 * Configuration for the Deepseek API client
 */
export interface DeepseekConfig {
  /** API keys for authentication with rotation support */
  apiKeys: string[];
  /** Base URL for the Deepseek API */
  baseUrl: string;
  /** Available models configuration */
  models?: {
    default: string;
    enhanced: string;
    lightweight: string;
  };
  /** Maximum number of retry attempts */
  maxRetries?: number;
  /** Default timeout in milliseconds */
  timeout: number;
  /** Rate limiting configuration */
  rateLimits?: {
    requestsPerMinute: number;
    tokensPerRequest: number;
  };
  /** HTTP headers for requests */
  headers?: Record<string, string>;
  /** Retry configuration */
  retry?: RetryConfig;
}

/**
 * Configuration for retry behavior
 */
export interface RetryConfig {
  /** Maximum number of retry attempts */
  maxRetries: number;
  /** Initial delay before first retry (in ms) */
  initialDelayMs: number;
  /** Factor by which to increase delay on each retry */
  backoffFactor: number;
  /** Maximum delay between retries (in ms) */
  maxDelayMs: number;
  /** Random jitter factor to add to delay (0-1) */
  jitterFactor: number;
}

/**
 * Options for generating responses
 */
export interface GenerationOptions {
  /** The model to use for generation */
  model: string;
  /** Maximum tokens to generate */
  maxTokens?: number;
  /** Sampling temperature (0-1) */
  temperature?: number;
  /** Top-p sampling parameter */
  topP?: number;
  /** Whether to stream the response */
  stream?: boolean;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Custom request ID for deduplication */
  requestId?: string;
  /** Additional model parameters */
  parameters?: Record<string, any>;
}

/**
 * Response from the AI generation request
 */
export interface AIResponse {
  /** The generated text */
  text: string;
  /** Completion tokens used */
  completionTokens: number;
  /** Prompt tokens used */
  promptTokens: number;
  /** Total tokens used */
  totalTokens: number;
  /** Request ID (for tracking/deduplication) */
  requestId: string;
  /** Model used for generation */
  model: string;
  /** Timestamp of when the response was generated */
  timestamp: number;
}

/**
 * Internal representation of API errors
 */
export interface APIError extends Error {
  status?: number;
  code?: string;
  isRetryable: boolean;
  originalError?: any;
}

/**
 * Request context for deduplication and tracking
 */
export interface RequestContext {
  requestId: string;
  timestamp: number;
  retryCount: number;
}

/**
 * Cache entry type for request deduplication
 */
export interface RequestCacheEntry {
  promise: Promise<AIResponse>;
  timestamp: number;
  expiresAt: number;
}

/**
 * Context information for AI generation
 */
export interface AIContext {
  /** System prompt providing instructions to the AI */
  systemPrompt: string;
  /** History of previous messages */
  userHistory?: Message[];
  /** User preferences for response generation */
  preferences?: {
    language: string;
    tone: 'formal' | 'professional' | 'friendly';
    length: 'short' | 'medium' | 'long';
  };
  /** Additional metadata for tracking or customization */
  metadata?: Record<string, any>;
}

/**
 * Message structure for conversation history
 */
export interface Message {
  /** Role of the message sender */
  role: 'system' | 'user' | 'assistant';
  /** Content of the message */
  content: string;
  /** Timestamp when the message was created */
  timestamp?: number;
} 