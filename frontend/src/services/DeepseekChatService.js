/**
 * Service for interacting with the Deepseek V3 API specifically for the chat assistant
 */
class DeepseekChatService {
  constructor() {
    // Initialize service with real API mode
    this.history = [];
    
    // Try different possible environment variable names to find the API key
    this.apiKey = process.env.REACT_APP_DEEPSEEK_V3_KEY || 
                 process.env.REACT_APP_DEEPSEEK_API_KEY ||
                 process.env.REACT_APP_DEEPSEEK_KEY;
    
    // Set API endpoint URL
    this.baseUrl = 'https://api.deepseek.ai/v1';
    
    // Available models to try
    this.models = [
      'deepseek-chat',
      'deepseek-llm',
      'deepseek-coder',
      'deepseek/deepseek-coder-33b-instruct'
    ];
    
    // Alternative API endpoints to try if the main one fails
    this.apiEndpoints = [
      'https://api.deepseek.ai/v1',
      'https://api.deepseek.com/v1',
      'https://api.deepinfra.com/v1/openai'
    ];
    
    // Track current endpoint and model indices
    this.currentEndpointIndex = 0;
    this.currentModelIndex = 0;
    
    this.chatHistory = [];
    
    // For development purposes, warn about potential CORS issues
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.warn('Running on localhost - API calls may be affected by CORS issues.');
    }
    
    // Log API key availability for debugging
    if (this.apiKey) {
      console.log('API key is available');
    } else {
      console.error('API Key not found - please provide a valid API key in your .env file');
    }
  }

  /**
   * Clears the chat history
   */
  clearHistory() {
    this.chatHistory = [];
    console.log('Chat history cleared');
  }

  /**
   * Generate a chat response using the Deepseek API
   * @param {string} message - The user's message
   * @param {string} language - The language code (e.g., 'en', 'es')
   * @returns {Promise<string>} - The AI response
   */
  generateChatResponse(message, language = 'en') {
    // Add user message to history
    this.chatHistory.push({
      role: 'user',
      content: message
    });
    
    // Validate API key
    if (!this.apiKey) {
      const errorMsg = "Error: No API key found. Please add your API key to the .env file.";
      console.error(errorMsg);
      return Promise.resolve(errorMsg);
    }
    
    // Get current endpoint and model to try
    const currentEndpoint = this.apiEndpoints[this.currentEndpointIndex];
    const currentModel = this.models[this.currentModelIndex];
    
    console.log(`Attempting connection with endpoint: ${currentEndpoint} and model: ${currentModel}`);
    
    // Construct the API request
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`
    };
    
    // Prepare messages for the API, including language instructions
    let messages = [...this.chatHistory];
    
    // Add language instruction if not English
    if (language && language !== 'en') {
      messages.unshift({
        role: 'system',
        content: `Please respond in ${language} language. All future interactions should be in ${language}.`
      });
    } else {
      messages.unshift({
        role: 'system',
        content: 'You are a helpful assistant specialized in email management and communication.'
      });
    }
    
    const requestBody = {
      model: currentModel,
      messages: messages,
      temperature: 0.7,
      max_tokens: 500
    };
    
    // Make the API request
    return fetch(`${currentEndpoint}/chat/completions`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(requestBody)
    })
    .then(response => {
      // Check if we're getting a CORS error or other connectivity issue
      if (!response.ok) {
        console.error(`API error: ${response.status} ${response.statusText}`);
        
        if (response.status === 0 || response.status === 403 || response.status === 404 || response.status === 401) {
          // If we get a CORS error, try using a different API endpoint and model
          console.error('Possible CORS or authentication issue. Trying alternative endpoint/model.');
          return this.tryNextEndpointOrModel(message, language);
        }
        
        return response.text().then(text => {
          throw new Error(`API error: ${response.status} ${response.statusText}\nDetails: ${text}`);
        });
      }
      
      return response.json();
    })
    .then(data => {
      // Extract the assistant's message
      const assistantMessage = data.choices[0].message;
      
      // Add to chat history
      this.chatHistory.push({
        role: assistantMessage.role,
        content: assistantMessage.content
      });
      
      // Reset endpoint and model indices since we found one that works
      this.currentEndpointIndex = 0;
      this.currentModelIndex = 0;
      
      return assistantMessage.content;
    })
    .catch(error => {
      console.error('Error calling Deepseek API:', error);
      
      // Try the next endpoint or model
      return this.tryNextEndpointOrModel(message, language);
    });
  }
  
  /**
   * Try the next endpoint or model if the current one fails
   * @param {string} message - The original user message
   * @param {string} language - The language code
   * @returns {Promise<string>} - The API response or error message
   */
  tryNextEndpointOrModel(message, language) {
    // Try the next model with the current endpoint
    this.currentModelIndex++;
    
    // If we've tried all models with the current endpoint, move to the next endpoint
    if (this.currentModelIndex >= this.models.length) {
      this.currentModelIndex = 0;
      this.currentEndpointIndex++;
    }
    
    // If we've tried all endpoints with all models, we've run out of options
    if (this.currentEndpointIndex >= this.apiEndpoints.length) {
      console.error('All API endpoints and models failed.');
      this.currentEndpointIndex = 0;
      this.currentModelIndex = 0;
      
      // Provide a more informative response about connection issues
      const errorMessage = 
        "I'm having trouble connecting to the AI service.\n\n" +
        "This could be due to:\n" +
        "1. Network connectivity issues\n" +
        "2. Invalid or expired API key\n" +
        "3. API service may be experiencing downtime\n\n" +
        "Please check your connection and API key configuration.";
      
      return Promise.resolve(errorMessage);
    }
    
    // Try again with the new endpoint/model
    console.log(`Trying next endpoint/model: ${this.apiEndpoints[this.currentEndpointIndex]} with ${this.models[this.currentModelIndex]}`);
    return this.generateChatResponse(message, language);
  }
}

export default new DeepseekChatService(); 