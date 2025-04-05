# DeepseekService

A robust service layer for AI communication using the Deepseek API, ensuring reliable, secure, and context-aware interactions.

## Features

- Robust error handling with automatic retries for transient failures
- Request deduplication to prevent duplicate API calls
- API key rotation for better rate limit management
- Context-aware interactions with conversation history
- Comprehensive validation and security features
- Performance optimizations including caching
- Simple, intuitive API for easy integration

## Installation

```bash
npm install
```

## Configuration

The service can be configured with environment variables or directly:

```env
DEEPSEEK_API_KEY=your_api_key_here
DEEPSEEK_API_URL=https://api.deepseek.com
DEEPSEEK_DEFAULT_MODEL=deepseek-chat
```

## Usage Examples

### Basic Usage

```typescript
import { DeepseekService } from './services/deepseek/DeepseekService';

// Initialize service with a single API key
const service = new DeepseekService({
  apiKeys: [process.env.DEEPSEEK_API_KEY],
  baseUrl: process.env.DEEPSEEK_API_URL,
  models: {
    default: process.env.DEEPSEEK_DEFAULT_MODEL,
    enhanced: 'deepseek-chat-pro',
    lightweight: 'deepseek-chat-light'
  }
});

// Generate a simple response
async function generateSimpleResponse() {
  const response = await service.generateResponse(
    "Generate a professional email",
    {
      useContext: false,
      temperature: 0.7,
      maxTokens: 500
    }
  );
  
  console.log(response.text);
}
```

### Using API Key Rotation

```typescript
import { DeepseekService } from './services/deepseek/DeepseekService';

// Initialize service with multiple API keys for automatic rotation
const service = new DeepseekService({
  apiKeys: [
    'your-api-key-1',
    'your-api-key-2',
    'your-api-key-3'
  ],
  baseUrl: 'https://api.deepseek.com'
});

// The service will automatically rotate through the API keys
// for each request, which helps manage rate limits
```

### Using Context

```typescript
import { DeepseekService } from './services/deepseek/DeepseekService';
import { AIContext, Message } from './types/deepseek';

// Initialize service
const service = new DeepseekService({
  apiKeys: [process.env.DEEPSEEK_API_KEY],
  baseUrl: process.env.DEEPSEEK_API_URL
});

// Create a context for the conversation
const context: AIContext = {
  systemPrompt: "You are an email assistant specialized in professional communication.",
  userHistory: [
    {
      role: 'user',
      content: 'I need to write an email to a potential client.',
      timestamp: Date.now()
    },
    {
      role: 'assistant',
      content: 'I can help you draft a professional email. What information would you like to include?',
      timestamp: Date.now()
    }
  ],
  preferences: {
    language: 'en',
    tone: 'professional',
    length: 'medium'
  }
};

// Generate a context-aware response
async function generateEmailWithContext() {
  const response = await service.generateResponse(
    "The client is a software company interested in our API integration services. Mention our experience with similar projects.",
    {
      useContext: true,
      temperature: 0.7,
      maxTokens: 800,
      context
    }
  );
  
  console.log(response.text);
  
  // Update context with the new exchange
  context.userHistory.push({
    role: 'user',
    content: "The client is a software company interested in our API integration services. Mention our experience with similar projects.",
    timestamp: Date.now()
  });
  
  context.userHistory.push({
    role: 'assistant',
    content: response.text,
    timestamp: response.timestamp
  });
}
```

### Error Handling

```typescript
import { DeepseekService } from './services/deepseek/DeepseekService';

const service = new DeepseekService({
  apiKeys: [process.env.DEEPSEEK_API_KEY],
  baseUrl: process.env.DEEPSEEK_API_URL
});

async function handleErrors() {
  try {
    const response = await service.generateResponse(
      "Generate a professional email",
      { useContext: false }
    );
    
    console.log(response.text);
  } catch (error) {
    console.error('Error generating response:');
    
    if (error.status === 429) {
      console.error('Rate limit exceeded. Please try again later.');
    } else if (error.status === 401) {
      console.error('Authentication error. Please check your API key.');
    } else {
      console.error(error.message);
    }
  }
}
```

### Validating API Key

```typescript
import { DeepseekService } from './services/deepseek/DeepseekService';

const service = new DeepseekService({
  apiKeys: [process.env.DEEPSEEK_API_KEY],
  baseUrl: process.env.DEEPSEEK_API_URL
});

async function validateApiKey() {
  const isValid = await service.validateApiKey();
  
  if (isValid) {
    console.log('API key is valid');
  } else {
    console.error('API key is invalid or could not be validated');
  }
}
```

## API Reference

### DeepseekService

```typescript
class DeepseekService {
  constructor(config: Partial<DeepseekConfig> & { apiKey?: string });
  
  async generateResponse(
    prompt: string,
    options: {
      useContext: boolean;
      temperature?: number;
      maxTokens?: number;
      context?: AIContext;
    }
  ): Promise<AIResponse>;
  
  async validateApiKey(): Promise<boolean>;
  
  cleanCache(): void;
  
  // Internal methods (not typically called directly)
  private getNextApiKey(): string;
  private executeWithRetry<T>(operation: () => Promise<T>): Promise<T>;
  private handleApiError(error: any): never;
  private checkCache(requestId: string): Promise<AIResponse> | null;
  private cacheRequest(requestId: string, promise: Promise<AIResponse>): void;
}
```

### DeepseekConfig

```typescript
interface DeepseekConfig {
  apiKeys: string[];  // Support for multiple API keys with automatic rotation
  baseUrl: string;
  models: {
    default: string;
    enhanced: string;
    lightweight: string;
  };
  maxRetries: number;
  timeout: number;
  rateLimits: {
    requestsPerMinute: number;
    tokensPerRequest: number;
  };
}
```

### AIContext

```typescript
interface AIContext {
  systemPrompt: string;
  userHistory?: Message[];
  preferences?: {
    language: string;
    tone: 'formal' | 'professional' | 'friendly';
    length: 'short' | 'medium' | 'long';
  };
  metadata?: Record<string, any>;
}
```

### AIResponse

```typescript
interface AIResponse {
  text: string;
  completionTokens: number;
  promptTokens: number;
  totalTokens: number;
  requestId: string;
  model: string;
  timestamp: number;
}
```

## Best Practices

1. **API Key Security**: Store your API key in environment variables, never hardcode it
2. **Error Handling**: Always implement proper error handling for API requests
3. **Rate Limiting**: Be mindful of rate limits and implement appropriate backoff strategies
4. **Context Management**: Use the context features for more coherent multi-turn conversations
5. **Resource Cleanup**: Call `cleanCache()` periodically to clean up expired cache entries

## Security Guidelines

1. **API Key Rotation**: Rotate your API keys regularly
2. **Input Validation**: Validate all user inputs before sending to the API
3. **Output Sanitization**: Always sanitize AI outputs before displaying to users
4. **Secure Storage**: Store conversation histories securely, especially if they contain sensitive data
5. **Monitoring**: Implement logging and monitoring for unusual API usage patterns 