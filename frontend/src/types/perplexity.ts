/**
 * Represents a message in the Perplexity chat conversation.
 */
export interface PerplexityMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Represents the request payload for the Perplexity Chat Completions API.
 * Based on documentation at: https://docs.perplexity.ai/reference/post_chat_completions
 */
export interface PerplexityRequest {
  model: string; // e.g., 'pplx-7b-online', 'pplx-70b-online', 'pplx-7b-chat', etc.
  messages: PerplexityMessage[];
  max_tokens?: number;
  temperature?: number; // 0.0 to 2.0
  top_p?: number; // 0.0 to 1.0
  top_k?: number; // 0 to 2048
  stream?: boolean; // Default: false
  presence_penalty?: number; // 0.0 to 1.0
  frequency_penalty?: number; // 0.0 to 2.0
}

/**
 * Represents a choice in the Perplexity API response.
 */
export interface PerplexityChoice {
  index: number;
  finish_reason: string | null; // e.g., 'stop', 'length'
  message: PerplexityMessage;
  delta?: Partial<PerplexityMessage>; // For streaming responses
}

/**
 * Represents the usage statistics returned by the Perplexity API.
 */
export interface PerplexityUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

/**
 * Represents the response payload from the Perplexity Chat Completions API.
 */
export interface PerplexityResponse {
  id: string;
  model: string;
  created: number; // Unix timestamp
  usage: PerplexityUsage;
  object: string; // e.g., 'chat.completion'
  choices: PerplexityChoice[];
}

/**
 * Represents a structured API error.
 */
export interface APIError extends Error {
  name: string; // e.g., 'PerplexityAPIError'
  status?: number; // HTTP status code
  code?: string; // Error code from API or client
  originalError?: any; // The original error object
  isRetryable?: boolean; // Whether the error suggests a retry might succeed
}