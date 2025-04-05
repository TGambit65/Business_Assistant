/**
 * ContextDocumentService.js - Service for managing context documents that enhance AI responses
 */
class ContextDocumentService {
  constructor() {
    // Initialize with empty documents
    this.contextDocuments = {
      system: [], // Built-in system documents (application documentation)
      user: []    // User-uploaded documents
    };
    
    // Load system documents on initialization
    this.loadSystemDocuments();
    
    // Load user documents from localStorage if available
    this.loadUserDocuments();
  }
  
  /**
   * Load built-in system documents (like application documentation)
   */
  async loadSystemDocuments() {
    try {
      // Load the application documentation
      const appDocResponse = await fetch('/assets/docs/app-documentation.md');
      if (appDocResponse.ok) {
        const appDocContent = await appDocResponse.text();
        this.addSystemDocument('app-documentation', 'Application Documentation', appDocContent);
        console.log('Successfully loaded application documentation');
      } else {
        console.warn('Failed to load application documentation:', appDocResponse.status);
      }
      
      // Additional system documents can be loaded here
    } catch (error) {
      console.error('Error loading system documents:', error);
    }
  }
  
  /**
   * Load user documents from localStorage
   */
  loadUserDocuments() {
    try {
      const savedDocuments = localStorage.getItem('userContextDocuments');
      if (savedDocuments) {
        this.contextDocuments.user = JSON.parse(savedDocuments);
        console.log(`Loaded ${this.contextDocuments.user.length} user documents from localStorage`);
      }
    } catch (error) {
      console.error('Error loading user documents from localStorage:', error);
      // Initialize with empty array in case of error
      this.contextDocuments.user = [];
    }
  }
  
  /**
   * Save user documents to localStorage
   */
  saveUserDocuments() {
    try {
      localStorage.setItem('userContextDocuments', JSON.stringify(this.contextDocuments.user));
    } catch (error) {
      console.error('Error saving user documents to localStorage:', error);
    }
  }
  
  /**
   * Add a system document (internal application documentation)
   * @param {string} id - Unique identifier for the document
   * @param {string} name - Display name of the document
   * @param {string} content - The document content
   * @returns {boolean} Success status
   */
  addSystemDocument(id, name, content) {
    // Prevent duplicates
    const existingIndex = this.contextDocuments.system.findIndex(doc => doc.id === id);
    if (existingIndex >= 0) {
      this.contextDocuments.system[existingIndex] = { id, name, content };
    } else {
      this.contextDocuments.system.push({ id, name, content });
    }
    
    return true;
  }
  
  /**
   * Add a user document
   * @param {string} name - Display name of the document
   * @param {string} content - The document content
   * @param {boolean} active - Whether the document is active (used in context)
   * @returns {string} The ID of the newly added document
   */
  addUserDocument(name, content, active = true) {
    const id = `user-doc-${Date.now()}`;
    this.contextDocuments.user.push({
      id,
      name,
      content,
      active,
      dateAdded: new Date().toISOString()
    });
    
    // Save to localStorage
    this.saveUserDocuments();
    
    return id;
  }
  
  /**
   * Update a user document
   * @param {string} id - The document ID
   * @param {object} updates - The fields to update
   * @returns {boolean} Success status
   */
  updateUserDocument(id, updates) {
    const index = this.contextDocuments.user.findIndex(doc => doc.id === id);
    if (index === -1) return false;
    
    this.contextDocuments.user[index] = {
      ...this.contextDocuments.user[index],
      ...updates
    };
    
    // Save to localStorage
    this.saveUserDocuments();
    
    return true;
  }
  
  /**
   * Delete a user document
   * @param {string} id - The document ID
   * @returns {boolean} Success status
   */
  deleteUserDocument(id) {
    const initialLength = this.contextDocuments.user.length;
    this.contextDocuments.user = this.contextDocuments.user.filter(doc => doc.id !== id);
    
    // Save to localStorage if something was removed
    if (initialLength !== this.contextDocuments.user.length) {
      this.saveUserDocuments();
      return true;
    }
    
    return false;
  }
  
  /**
   * Toggle active status of a user document
   * @param {string} id - The document ID
   * @returns {boolean} New active status
   */
  toggleUserDocumentActive(id) {
    const index = this.contextDocuments.user.findIndex(doc => doc.id === id);
    if (index === -1) return false;
    
    const newActive = !this.contextDocuments.user[index].active;
    this.contextDocuments.user[index].active = newActive;
    
    // Save to localStorage
    this.saveUserDocuments();
    
    return newActive;
  }
  
  /**
   * Get all active context documents (system and user)
   * @returns {Array} Array of active context documents
   */
  getAllActiveDocuments() {
    // Always include system documents
    const systemDocs = this.contextDocuments.system || [];
    
    // Only include active user documents
    const userDocs = (this.contextDocuments.user || [])
      .filter(doc => doc.active);
    
    return [...systemDocs, ...userDocs];
  }
  
  /**
   * Get all user documents
   * @returns {Array} Array of user documents
   */
  getUserDocuments() {
    return [...this.contextDocuments.user];
  }
  
  /**
   * Get all system documents
   * @returns {Array} Array of system documents
   */
  getSystemDocuments() {
    return [...this.contextDocuments.system];
  }
  
  /**
   * Create context message for Deepseek Chat API
   * @param {Array} documentIds - Optional array of specific document IDs to include
   * @returns {Object} System message with context for Deepseek API
   */
  createContextSystemMessage(documentIds = null) {
    let documents = [];
    
    if (documentIds && Array.isArray(documentIds)) {
      // If specific document IDs are provided, only include those
      const allDocs = [...this.contextDocuments.system, ...this.contextDocuments.user];
      documents = allDocs.filter(doc => documentIds.includes(doc.id));
    } else {
      // Otherwise include all active documents
      documents = this.getAllActiveDocuments();
    }
    
    // Don't include empty documents
    if (documents.length === 0) {
      return null;
    }
    
    // Construct the context message with document content
    let contextContent = "You have access to the following documents to help answer user questions. " +
      "Use this information when relevant to provide accurate and helpful responses:\n\n";
    
    // Set maximum size limits to prevent token overflows
    const MAX_TOTAL_CHARS = 30000; // Max total context length
    const MAX_DOC_CHARS = 5000;    // Max chars per document
    
    let totalChars = contextContent.length;
    let includedDocs = 0;
    
    for (const doc of documents) {
      // Skip empty documents
      if (!doc.content || doc.content.trim() === '') continue;
      
      // Truncate document content if too large
      let docContent = doc.content;
      if (docContent.length > MAX_DOC_CHARS) {
        // Take first half of max size and last half of max size to keep important parts
        const halfMaxSize = Math.floor(MAX_DOC_CHARS / 2);
        docContent = docContent.substring(0, halfMaxSize) + 
          "\n[...document truncated for size...]\n" + 
          docContent.substring(docContent.length - halfMaxSize);
      }
      
      // Calculate size of this document section
      const docSection = `### DOCUMENT ${includedDocs + 1}: ${doc.name} ###\n\n${docContent}\n\n`;
      const docSectionLength = docSection.length;
      
      // Check if adding this document would exceed total limit
      if (totalChars + docSectionLength > MAX_TOTAL_CHARS) {
        contextContent += "\n[Additional documents omitted due to size limits]\n";
        break;
      }
      
      // Add document to context
      contextContent += docSection;
      totalChars += docSectionLength;
      includedDocs++;
    }
    
    // Only add footer if we included at least one document
    if (includedDocs > 0) {
      const footer = "Remember to use this information when it's relevant to the user's query, but don't " +
        "mention these documents explicitly unless asked about documentation. " +
        "Answer concisely and accurately based on the provided information.";
      
      contextContent += footer;
    }
    
    return {
      role: "system",
      content: contextContent
    };
  }
  
  /**
   * Parse document from uploaded file
   * @param {File} file - The uploaded file
   * @returns {Promise<Object>} Parsed document object
   */
  async parseUploadedDocument(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const content = event.target.result;
          const name = file.name;
          
          resolve({
            name,
            content,
            type: file.type,
            size: file.size
          });
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = (error) => {
        reject(error);
      };
      
      reader.readAsText(file);
    });
  }
}

// Create a singleton instance
const contextDocumentService = new ContextDocumentService();

export default contextDocumentService; 