import { AIResponse, AIRequestContext, AIAnalysis, Message, RetryConfig, CacheOptions } from '../../types/deepseek';
import { Email } from '../../types/email';
import { ContentTone } from '../../types/ai';
import axios from 'axios';

// Create a simplified mock type for our test errors
interface MockApiError {
  isAxiosError: boolean;
  response?: {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    config: any;
    data: any;
  };
  code?: string;
  message: string;
  name: string;
  toJSON: () => object;
}

/**
 * Mock configuration for testing
 */
export const mockConfig = {
  apiKey: 'test-key-1',
  baseUrl: 'https://api.deepseek.com',
  cacheOptions: {
    enabled: true,
    ttl: 3600 // 1 hour
  },
  retryConfig: {
    maxRetries: 2,
    initialDelay: 100,
    backoffFactor: 2,
    maxDelay: 1000
  },
  timeout: 5000,
  headers: {
    'X-Custom-Header': 'test-value'
  }
};

/**
 * Mock successful response - Frontend format
 */
export const mockSuccessResponse: AIResponse = {
  content: 'This is a test response from the mock API',
  metadata: {
    tone: 'professional',
    length: 42,
    suggestions: [
      'Consider adding more details',
      'Add a polite closing'
    ],
    confidence: 0.89
  }
};

/**
 * Mock raw API response - src format
 */
export const mockRawApiResponse = {
  id: 'response-id',
  object: 'chat.completion',
  created: Date.now(),
  model: 'deepseek-chat',
  choices: [{ 
    index: 0, 
    message: { 
      role: 'assistant', 
      content: 'This is a test response' 
    }, 
    finish_reason: 'stop' 
  }],
  usage: { 
    prompt_tokens: 10, 
    completion_tokens: 15, 
    total_tokens: 25 
  }
};

/**
 * Mock API response in src format
 */
export const mockSrcFormatResponse = {
  text: 'This is a test response',
  completionTokens: 15, 
  promptTokens: 10, 
  totalTokens: 25,
  requestId: 'mock-request-id', 
  model: 'deepseek-chat', 
  timestamp: Date.now()
};

/**
 * Mock successful email analysis
 */
export const mockAnalysisResponse: AIAnalysis = {
  tone: 'formal',
  sentiment: 'positive',
  formality: 85,
  clarity: 90,
  actionItems: [
    'Review attached document',
    'Respond by Friday'
  ],
  suggestions: [
    'Consider a more direct opening',
    'Add specific deadline times'
  ]
};

/**
 * Mock email for testing
 */
export const mockEmail: Email = {
  id: 'test-email-id',
  subject: 'Test Email Subject',
  from: {
    email: 'sender@example.com',
    name: 'Sender Name'
  },
  to: [
    {
      email: 'recipient@example.com',
      name: 'Recipient Name'
    }
  ],
  body: 'This is a test email body for testing purposes.',
  timestamp: new Date(),
  isRead: false,
  isStarred: false,
  isArchived: false,
  labels: ['work', 'important'],
  attachments: []
};

/**
 * Mock request context
 */
export const mockRequestContext: AIRequestContext = {
  systemPrompt: 'You are an email assistant helping to draft professional emails.',
  userHistory: [
    {
      role: 'user',
      content: 'Please help me draft an email to schedule a meeting.'
    },
    {
      role: 'assistant',
      content: 'I can help you draft that email. What date and time would you prefer?'
    },
    {
      role: 'user',
      content: 'Next Tuesday at 2 PM.'
    }
  ],
  emailContext: mockEmail,
  userPreferences: {
    defaultEmailSignature: '-- \nJohn Doe\nProduct Manager',
    defaultReplySignature: 'Best,\nJohn',
    defaultLanguage: 'en',
    defaultTone: 'professional',
    showNotifications: true,
    emailRefreshInterval: 300,
    sendReceiptConfirmation: true,
    defaultFontSize: '14px',
    defaultFontFamily: 'Arial, sans-serif',
    useRichTextEditor: true,
    useSpellCheck: true,
    alwaysShowBcc: false,
    useThreadView: true
  }
};

/**
 * Mock for API validation error
 */
export const mockValidationError: MockApiError = {
  name: 'AxiosError',
  message: 'Invalid parameters provided',
  isAxiosError: true,
  toJSON: () => ({ message: 'Invalid parameters provided' }),
  response: {
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
  }
};

/**
 * Mock for API rate limit error
 */
export const mockRateLimitError: MockApiError = {
  name: 'AxiosError',
  message: 'Rate limit exceeded',
  isAxiosError: true,
  toJSON: () => ({ message: 'Rate limit exceeded' }),
  response: {
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
  }
};

/**
 * Mock for API authentication error
 */
export const mockAuthError: MockApiError = {
  name: 'AxiosError',
  message: 'Invalid API key',
  isAxiosError: true,
  toJSON: () => ({ message: 'Invalid API key' }),
  response: {
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
  }
};

/**
 * Mock for API server error
 */
export const mockServerError: MockApiError = {
  name: 'AxiosError',
  message: 'Internal server error',
  isAxiosError: true,
  toJSON: () => ({ message: 'Internal server error' }),
  response: {
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
  }
};

/**
 * Mock for network timeout
 */
export const mockTimeoutError: MockApiError = {
  name: 'AxiosError',
  message: 'timeout of 3000ms exceeded',
  isAxiosError: true,
  toJSON: () => ({ message: 'timeout of 3000ms exceeded' }),
  code: 'ECONNABORTED'
};

/**
 * Mock for network connection error
 */
export const mockConnectionError: MockApiError = {
  name: 'AxiosError',
  message: 'connect ECONNREFUSED 127.0.0.1:443',
  isAxiosError: true,
  toJSON: () => ({ message: 'connect ECONNREFUSED 127.0.0.1:443' }),
  code: 'ECONNREFUSED'
};

/**
 * Mock suggestions for email responses
 */
export const mockSuggestions: string[] = [
  "Yes, that works for me. I'll attend the meeting as scheduled.",
  "I need to reschedule. Could we meet later this week instead?",
  "Thanks for the information. I'll review and get back to you soon.",
  "Could you please provide more details about this request?",
  "I've completed the requested task. Let me know if you need anything else."
];

/**
 * Mock improved writing response
 */
export const mockImprovedWriting = "Thank you for your inquiry regarding our services. I'm pleased to provide you with the information you requested about our premium offerings. Our team would be delighted to schedule a consultation at your convenience to discuss how we can tailor our solutions to meet your specific needs."; 