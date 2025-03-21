/**
 * AI Context Document
 * 
 * This file contains information that will be used as context for the Deepseek V3 AI model.
 * Update this file with domain-specific knowledge, brand guidelines, or other relevant information
 * that you want the AI to consider when generating responses.
 */

const aiContext = {
  // Company information
  company: {
    name: "Your Company",
    description: "Brief description of your company",
    industry: "Your industry",
    values: [
      "Value 1",
      "Value 2",
      "Value 3"
    ],
    tone: "Describe your company's communication tone here"
  },
  
  // Product information
  products: [
    {
      name: "Product 1",
      description: "Description of product 1",
      keyFeatures: ["Feature 1", "Feature 2", "Feature 3"],
      pricing: "Pricing information"
    }
  ],
  
  // Communication guidelines
  communicationGuidelines: {
    emailStyle: "Guidelines for email style",
    brandVoice: "Description of brand voice",
    doNotUse: ["List of phrases or terms to avoid"],
    preferredTerminology: {
      "instead of this": "use this"
    }
  },
  
  // FAQ information
  frequentlyAskedQuestions: [
    {
      question: "Common question 1?",
      answer: "Answer to question 1"
    },
    {
      question: "Common question 2?",
      answer: "Answer to question 2"
    }
  ]
};

export default aiContext; 