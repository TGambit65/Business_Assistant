import React, { createContext, useContext, useState } from 'react';

// Create context
const DraftFormContext = createContext();

// Initial form state
const initialFormState = {
  // Basic info
  recipientType: 'colleague',
  purpose: 'update',
  tone: 'professional',
  subject: '',
  keyPoints: '',
  
  // Advanced options
  formality: 'neutral',
  industry: '',
  documentType: 'email',
  audience: 'internal',
  includeData: false,
  includeCTA: true,
  
  // Sender info
  senderName: '',
  senderRole: '',
  
  // For replies
  originalSubject: '',
  originalSender: '',
  originalContent: '',
};

/**
 * DraftFormProvider Component
 * 
 * Context provider for the draft generator form state.
 */
export const DraftFormProvider = ({ children }) => {
  const [formData, setFormData] = useState(initialFormState);
  
  // Update a single form field
  const updateField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Update multiple form fields at once
  const updateFields = (fields) => {
    setFormData(prev => ({
      ...prev,
      ...fields
    }));
  };
  
  // Reset form to initial state
  const resetForm = () => {
    setFormData(initialFormState);
  };
  
  // Set form data from an existing draft
  const setFromExistingDraft = (draft) => {
    // In a real app, this would parse the draft and extract relevant fields
    setFormData({
      ...initialFormState,
      subject: draft.subject || '',
      keyPoints: draft.content || '',
      // Other fields would be extracted from the draft
    });
  };
  
  return (
    <DraftFormContext.Provider value={{
      formData,
      updateField,
      updateFields,
      resetForm,
      setFromExistingDraft
    }}>
      {children}
    </DraftFormContext.Provider>
  );
};

/**
 * useDraftForm Hook
 * 
 * Custom hook to access the draft form context.
 */
export const useDraftForm = () => {
  const context = useContext(DraftFormContext);
  
  if (!context) {
    throw new Error('useDraftForm must be used within a DraftFormProvider');
  }
  
  return context;
};

export default DraftFormContext;
