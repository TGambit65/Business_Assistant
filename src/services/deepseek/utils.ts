import axios, { AxiosError } from 'axios'; // Ensure axios is imported if using isAxiosError
import { v4 as uuidv4 } from 'uuid';
import { APIError, AIContext, Message } from '../../types/deepseek';
import { RETRYABLE_ERROR_CODES, RETRYABLE_STATUS_CODES } from './DeepseekConfig';

/**
 * Calculate delay for retry attempts with exponential backoff and jitter
 */
export function calculateRetryDelay(maxRetries: number, attempt: number): number {
  const initialDelayMs = 1000;
  const backoffFactor = 2;
  const maxDelayMs = 15000;
  const jitterFactor = 0.1;

  // Calculate base delay with exponential backoff
  let delay = initialDelayMs * Math.pow(backoffFactor, attempt);

  // Apply maximum delay cap
  delay = Math.min(delay, maxDelayMs);

  // Add random jitter
  const jitter = delay * jitterFactor * (Math.random() * 2 - 1);
  delay = Math.max(0, delay + jitter);

  return Math.floor(delay);
}

/**
 * Wait for a specified number of milliseconds
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate a unique request ID if one doesn't exist
 */
export function ensureRequestId(requestId?: string): string {
  return requestId || uuidv4();
}

/**
 * Prepare messages array from prompt and context
 */
export function prepareMessages(prompt: string, context?: AIContext): Message[] {
  const messages: Message[] = [];
  const timestamp = Date.now();

  // Add system message if context includes a system prompt
  if (context?.systemPrompt) {
    messages.push({
      role: 'system',
      content: context.systemPrompt,
      timestamp
    });
  }

  // Add user history if available
  if (context?.userHistory && Array.isArray(context.userHistory)) {
    messages.push(...context.userHistory);
  }

  // Add the current prompt as a user message
  messages.push({
    role: 'user',
    content: prompt,
    timestamp
  });

  return messages;
}

/**
 * Transform an error into a standardized APIError
 */
export function normalizeError(error: any): APIError {
   // If it already looks like our APIError, return it
  if (error?.isApiError || error?.name === 'DeepseekAPIError') {
    // Ensure essential properties exist even if it's already an APIError
    const err = error as Partial<APIError>;
    err.status = err.status ?? 500;
    err.code = err.code ?? 'UNKNOWN_ERROR';
    err.message = err.message || 'Unknown error occurred';
    err.isRetryable = err.isRetryable ?? isRetryableError(error.originalError || error);
    return err as APIError;
  }

  // Create a base error object
  const apiError: Partial<APIError> = new Error(
    error?.message || 'Unknown error occurred'
  ) as Partial<APIError>;

  apiError.name = 'DeepseekAPIError';
  apiError.originalError = error;

  // Handle Axios errors specifically
  // Use duck-typing for Axios error check for better test compatibility
  const isLikelyAxiosError = error && typeof error === 'object' && error.isAxiosError === true;

  if (isLikelyAxiosError) {
    const axiosError = error as AxiosError;
    apiError.status = axiosError.response?.status;
    apiError.code = axiosError.code; // Axios code like 'ECONNABORTED'
    const responseData: any = axiosError.response?.data;

    // Try to get a more specific message from response data
    if (responseData && typeof responseData === 'object') {
        // Adjust based on actual Deepseek error structure if known
        apiError.message = responseData.error?.message || responseData.message || apiError.message;
    }

    // Add specific messaging and codes for certain status codes
    if (apiError.status === 429) {
      apiError.message = `Rate limit exceeded: ${apiError.message}`;
      apiError.code = 'RATE_LIMIT_ERROR';
    } else if (apiError.status === 401 || apiError.status === 403) {
      apiError.message = `Authentication error: ${apiError.message}`;
      apiError.code = 'AUTH_ERROR';
    } else if (apiError.status === 400) {
        apiError.message = `Bad request: ${apiError.message}`;
        apiError.code = 'BAD_REQUEST_ERROR';
    } else if (apiError.status && apiError.status >= 500) {
        // Keep original Axios code if present (e.g., ECONNREFUSED), otherwise SERVER_ERROR
        apiError.code = axiosError.code || 'SERVER_ERROR';
    } else if (apiError.status && apiError.status >= 400) {
        // Keep original Axios code if present, otherwise API_ERROR
        apiError.code = axiosError.code || 'API_ERROR';
    } else if (axiosError.code) {
        // Network errors often don't have a status but have a code
        apiError.code = axiosError.code;
    }
  }

  // Ensure default values and calculate isRetryable at the end
  apiError.status = apiError.status ?? 500;
  apiError.code = apiError.code ?? 'UNKNOWN_ERROR';
  // Calculate retryability based on the *original* error or the derived status/code
  apiError.isRetryable = isRetryableError(error);

  // Ensure message is a string before returning
  apiError.message = String(apiError.message ?? 'Unknown error occurred');

  return apiError as APIError; // Cast back to full type
}


/**
 * Determine if an error is retryable
 */
export function isRetryableError(error: any): boolean {
  // Check normalized code first if available
  if (error?.code) {
      if (RETRYABLE_ERROR_CODES.has(error.code)) return true;
      // Explicitly non-retryable codes
      if (error.code === 'AUTH_ERROR' || error.code === 'BAD_REQUEST_ERROR') return false;
  }
  // Check normalized status
  if (error?.status) {
      if (RETRYABLE_STATUS_CODES.has(error.status)) return true;
      // Explicitly non-retryable statuses
      if (error.status === 401 || error.status === 403 || error.status === 400) return false;
  }

  // Fallback: Check original Axios error properties
  // Use duck-typing check here as well
  const isLikelyAxiosError = error && typeof error === 'object' && error.isAxiosError === true;
  if (isLikelyAxiosError) {
    const axiosError = error as AxiosError;
    // If we have a response with a status code
    if (axiosError.response?.status) {
      return RETRYABLE_STATUS_CODES.has(axiosError.response.status);
    }
    // If we have a code but no response (network error)
    if (axiosError.code) {
      return RETRYABLE_ERROR_CODES.has(axiosError.code);
    }
  }

  // Check for error message strings that indicate retryable errors (less reliable)
  if (error?.message && typeof error.message === 'string') {
    const lowerMessage = error.message.toLowerCase();
    if (lowerMessage.includes('timeout') || lowerMessage.includes('network error') || lowerMessage.includes('connection refused')) {
        return true;
    }
    // Check specific retryable codes within the message
    for (const errCode of RETRYABLE_ERROR_CODES) {
      if (lowerMessage.includes(errCode.toLowerCase())) {
        return true;
      }
    }
  }

  // Default to non-retryable for unknown errors
  return false;
}


/**
 * Validate an AI response has the required fields
 */
export function validateResponse(response: any): boolean {
  if (!response || typeof response !== 'object') {
    return false;
  }

  // Check for essential fields
  const hasChoices = Array.isArray(response.choices) && response.choices.length > 0;
  const hasContent = hasChoices && typeof response.choices[0].message?.content === 'string';
  const hasUsage = response.usage && typeof response.usage === 'object';

  return hasChoices && hasContent && hasUsage;
}