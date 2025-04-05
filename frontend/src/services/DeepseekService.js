import aiContext from '../lib/aiContext';

/**
 * Service for interacting with the Deepseek V3 API
 */
class DeepseekService {
  constructor() {
    this.apiKey = process.env.REACT_APP_DEEPSEEK_V3_KEY;
    this.baseUrl = 'https://api.deepseek.com/v1';
    this.model = 'deepseek-chat-v3';
  }

  /**
   * Generate a response from the Deepseek V3 model
   * @param {string} prompt - The user's input prompt
   * @param {Object} options - Additional options
   * @param {boolean} options.useContext - Whether to include the context document
   * @param {number} options.temperature - Controls randomness (0-1)
   * @param {number} options.maxTokens - Maximum tokens to generate
   * @returns {Promise<Object>} - The AI response
   */
  async generateResponse(prompt, options = {}) {
    const { 
      useContext = true, 
      temperature = 0.7, 
      maxTokens = 2000 
    } = options;

    try {
      // Validate API key
      if (!this.apiKey || this.apiKey === 'your-api-key-here') {
        throw new Error('Deepseek API key is not configured');
      }

      // Prepare messages
      const messages = [];
      
      // Add context as system message if enabled
      if (useContext) {
        messages.push({
          role: 'system',
          content: `You are an AI assistant that helps with email communication. 
          Use the following context information when generating responses:
          ${JSON.stringify(aiContext, null, 2)}`
        });
      }
      
      // Add user prompt
      messages.push({
        role: 'user',
        content: prompt
      });

      // Make API request
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature,
          max_tokens: maxTokens
        })
      });

      // Handle API errors
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to get response from Deepseek API');
      }

      // Return response data
      return await response.json();
    } catch (error) {
      console.error('Deepseek API error:', error);
      throw error;
    }
  }

  /**
   * Generate an email draft using Deepseek V3
   * @param {Object} emailParams - Email parameters
   * @returns {Promise<Object>} - The generated email draft
   */
  async generateEmailDraft(emailParams) {
    const {
      recipientType,
      purpose,
      tone,
      subject,
      keyPoints,
      recipientName,
      senderName,
      senderPosition
    } = emailParams;

    const prompt = `
    Generate a professional email with the following parameters:
    - Recipient type: ${recipientType}
    - Purpose: ${purpose}
    - Tone: ${tone}
    - Subject: ${subject || 'Generate an appropriate subject'}
    - Key points to include: ${keyPoints}
    - Recipient name: ${recipientName || 'Not provided'}
    - Sender name: ${senderName || 'Not provided'}
    - Sender position: ${senderPosition || 'Not provided'}
    
    Response should be formatted as a JSON object with "subject" and "body" properties.
    `;

    try {
      const response = await this.generateResponse(prompt, { 
        useContext: true,
        temperature: 0.7
      });

      // Parse the response content to extract the email
      const assistantMessage = response.choices[0]?.message?.content;
      
      // Try to parse JSON from the response
      try {
        // Look for JSON in the response
        const jsonMatch = assistantMessage.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        } else {
          // If no JSON found, return structured response
          return {
            subject: subject || 'Generated Email',
            body: assistantMessage
          };
        }
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        return {
          subject: subject || 'Generated Email',
          body: assistantMessage
        };
      }
    } catch (error) {
      console.error('Failed to generate email draft:', error);
      throw error;
    }
  }
}

const deepseekServiceInstance = new DeepseekService();
export default deepseekServiceInstance; 