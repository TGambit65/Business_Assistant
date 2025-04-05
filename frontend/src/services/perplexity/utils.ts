import axios, { AxiosError } from 'axios';
// Removed duplicate AxiosError import
import { APIError } from '../../types/perplexity'; // Import the specific APIError type

/**
 * Checks if an error is likely retryable based on status code or type.
 * @param error - The error object.
 * @returns True if the error is potentially retryable, false otherwise.
 */
function isRetryableError(error: any): boolean {
  if (error && error.response) {
    const status = error.response.status;
    // Common retryable status codes (server errors, rate limits)
    return status === 429 || status >= 500;
  }
  // Network errors are often retryable
  return error && (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT' || error.code === 'ENETDOWN' || error.code === 'ENOTFOUND');
}

/**
 * Normalizes various error types into a consistent APIError format.
 * @param error - The error object caught from Axios or other sources.
 * @returns An APIError object.
 */
export function normalizeError(error: unknown): APIError {
  const apiError: APIError = new Error(
    (error instanceof Error ? error.message : null) || 'An unknown error occurred during the API request.'
  ) as APIError; // Cast to APIError to add custom properties

  apiError.name = 'PerplexityAPIError'; // Specific error name
  apiError.originalError = error;
  apiError.isRetryable = isRetryableError(error);

  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    apiError.status = axiosError.response?.status;
    apiError.code = axiosError.code; // e.g., 'ECONNABORTED'

    // Add specific messaging for common Perplexity status codes if available in response data
    if (axiosError.response?.data) {
        const responseData = axiosError.response.data as any; // Type assertion
        if (responseData.detail) {
             // Perplexity often includes error details in responseData.detail
             if (typeof responseData.detail === 'string') {
                 apiError.message = responseData.detail;
             } else if (Array.isArray(responseData.detail) && responseData.detail.length > 0 && responseData.detail[0].msg) {
                 // Handle validation errors like {'detail': [{'loc': [...], 'msg': '...', 'type': '...'}]}
                 apiError.message = responseData.detail[0].msg;
             } else if (typeof responseData.detail === 'object' && responseData.detail.message) {
                 apiError.message = responseData.detail.message; // Another possible format
             }
        }
    }

    // Override message for common status codes if not already set from response data
    if (apiError.status === 401 || apiError.status === 403) {
      apiError.message = apiError.message || 'Authentication failed. Check your Perplexity API key.';
      apiError.isRetryable = false; // Auth errors are not retryable
    } else if (apiError.status === 429) {
      apiError.message = apiError.message || 'Rate limit exceeded. Please try again later or consider API key rotation.';
    } else if (apiError.status === 400) {
        apiError.message = apiError.message || 'Bad Request. Please check the request payload.';
    } else if (apiError.status && apiError.status >= 500) {
        apiError.message = apiError.message || 'Perplexity server error. Please try again later.';
    }

  } else if (error instanceof Error) {
    // Non-Axios errors
    apiError.code = 'CLIENT_ERROR';
  } else {
    // Unknown error type
    apiError.code = 'UNKNOWN_CLIENT_ERROR';
  }

  return apiError;
}