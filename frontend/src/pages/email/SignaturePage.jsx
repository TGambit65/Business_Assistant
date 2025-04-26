import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Plus, Edit2, Trash2, FileText, Check, X, Sparkles, Loader2, HelpCircle, ChevronDown } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { useSignatures } from '../../hooks/useSignatures';
import RichTextEditor from '../../components/RichTextEditor';
import { useFeatureInfo } from '../../hooks/useFeatureInfo';
import FeatureInfoModal from '../../components/ui/FeatureInfoModal';
import DeepseekService from '../../services/DeepseekService';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';

export default function SignaturePage() {
  const { success, error, /* warning, info */ } = useToast(); // Removed unused warning, info
  const { user } = useAuth();
  const { 
    signatures, 
    // defaultSignature,  // Removed unused variable
    addSignature, 
    updateSignature, 
    deleteSignature, 
    setDefaultSignature 
  } = useSignatures();
  
  const [showAddSignatureForm, setShowAddSignatureForm] = useState(false);
  // const [isEditing, setIsEditing] = useState(false); // Removed unused state
  const [editingId, setEditingId] = useState(null);
  const [isGeneratingSignature, setIsGeneratingSignature] = useState(false);
  const [newSignature, setNewSignature] = useState({
    name: '',
    content: '',
    default: false
  });
  
  // Add more AI options and better AI generation UX
  const [aiStyle, setAiStyle] = useState('professional');
  const [aiOptions, setAiOptions] = useState({
    includePosition: true,
    includeCompany: true,
    includeEmail: true,
    includePhone: true,
    includeWebsite: false,
    includeDisclaimer: false,
    includeSocialLinks: false
  });

  // Add state for user info
  const [userInfo, setUserInfo] = useState({
    name: user?.displayName || 'John Doe',
    position: user?.position || 'Business Professional',
    company: user?.company || 'Company Name',
    email: user?.email || 'email@example.com',
    phone: user?.phone || '(555) 123-4567',
    website: user?.website || 'www.example.com',
    linkedin: '',
    twitter: '',
    github: ''
  });
  
  const { isOpen, currentFeature, showFeatureInfo, closeFeatureInfo } = useFeatureInfo();
  
  // Handle clicking the AI Help button
  const handleAIHelpClick = () => {
    showFeatureInfo('signatureHelp');
  };
  
  // Handle selecting a signature from the dropdown
  const handleSelectSignature = (signature) => {
    setShowAddSignatureForm(true);
    setEditingId(signature.id);
    setNewSignature({
      name: signature.name,
      content: signature.content,
      default: signature.default
    });
  };
  
  const handleAddSignature = () => {
    if (!newSignature.name) {
      error('Please provide a signature name', {
        title: 'Error'
      });
      return;
    }
    
    if (!newSignature.content) {
      error('Please provide signature content', {
        title: 'Error'
      });
      return;
    }
    
    const success = addSignature(newSignature);
    
    if (success) {
      setShowAddSignatureForm(false);
      setNewSignature({
        name: '',
        content: '',
        default: false
      });
    }
  };
  
  const handleUpdateSignature = () => {
    if (!newSignature.name) {
      error('Please provide a signature name', {
        title: 'Error'
      });
      return;
    }
    
    if (!newSignature.content) {
      error('Please provide signature content', {
        title: 'Error'
      });
      return;
    }
    
    const success = updateSignature(editingId, newSignature);
    
    if (success) {
      setShowAddSignatureForm(false);
      setEditingId(null);
      setNewSignature({
        name: '',
        content: '',
        default: false
      });
    }
  };
  
  const handleEditSignature = (signature) => {
    setShowAddSignatureForm(true);
    setEditingId(signature.id);
    setNewSignature({
      name: signature.name,
      content: signature.content,
      default: signature.default
    });
  };
  
  const handleDeleteSignature = (id) => {
    deleteSignature(id);
  };
  
  const handleSetDefaultSignature = (id) => {
    setDefaultSignature(id);
  };
  
  // Modify the generateSignatureWithAI function to add more debugging
  const generateSignatureWithAI = async () => {
    if (!newSignature.name) {
      error('Please provide a signature name before generating', {
        title: 'Error'
      });
      return;
    }

    setIsGeneratingSignature(true);

    try {
      // Create a prompt for the AI
      const prompt = `
        Generate an HTML email signature with the following details:
        - Name: ${userInfo.name}
        ${aiOptions.includePosition ? `- Position: ${userInfo.position}` : ''}
        ${aiOptions.includeCompany ? `- Company: ${userInfo.company}` : ''}
        ${aiOptions.includeEmail ? `- Email: ${userInfo.email}` : ''}
        ${aiOptions.includePhone ? `- Phone: ${userInfo.phone}` : ''}
        ${aiOptions.includeWebsite ? `- Website: ${userInfo.website}` : ''}
        ${aiOptions.includeSocialLinks ? `- Include social links` : ''}
        ${aiOptions.includeDisclaimer ? `- Include a confidentiality disclaimer` : ''}
        - Style: ${aiStyle} (professional, minimal, modern, or colorful)
        
        The signature should be in HTML format suitable for embedding in emails.
        Return only the HTML markup, no explanations.
      `;
      
      // Call the Deepseek API with logging
      console.log('Calling Deepseek API with style:', aiStyle);
      console.log('Using prompt:', prompt);
      
      // Add timeout handling for API call
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('API request timed out')), 15000)
      );
      
      const apiPromise = DeepseekService.generateResponse(prompt, {
        useContext: false,
        temperature: 0.7
      });
      
      // Race between actual API call and timeout
      const response = await Promise.race([apiPromise, timeoutPromise]);
      
      console.log('Received API response:', response);
      
      // Extract the assistant's message
      if (!response || !response.choices || !response.choices[0] || !response.choices[0].message) {
        console.error('Invalid response format:', response);
        throw new Error('Invalid response format from API');
      }
      
      // Extract the HTML content from the response
      const assistantMessage = response.choices[0].message.content;
      console.log('Extracted assistant message:', assistantMessage);
      
      // Set the generated signature into the RichTextEditor
      setNewSignature({
        ...newSignature,
        content: assistantMessage
      });
      
      success('Signature generated successfully!', {
        title: 'Success'
      });
      
    } catch (err) {
      console.error('Error generating signature:', err);
      error(`Failed to generate signature: ${err.message}`, {
        title: 'AI Generation Error'
      });
    } finally {
      setIsGeneratingSignature(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Email Signatures</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Create and manage professional email signatures
        </p>
      </div>
      
      {/* Feature info modal */}
      {isOpen && currentFeature && (
        <FeatureInfoModal 
          isOpen={isOpen} 
          onClose={closeFeatureInfo}
          feature={currentFeature}
        />
      )}
      
      {/* Signature list */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Your Signatures</h2>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center"
              onClick={handleAIHelpClick}
            >
              <HelpCircle className="h-4 w-4 mr-1.5" />
              Guide
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              className="flex items-center"
              onClick={() => {
                setEditingId(null);
                setShowAddSignatureForm(true);
                setNewSignature({
                  name: '',
                  content: '',
                  default: false
                });
              }}
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Add Signature
            </Button>
          </div>
        </div>
      </div>
      
      {/* Rest of the component... */}
    </div>
  );
} 