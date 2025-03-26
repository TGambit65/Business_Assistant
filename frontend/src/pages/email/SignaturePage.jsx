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
  const { success, error, warning, info } = useToast();
  const { user } = useAuth();
  const { 
    signatures, 
    defaultSignature, 
    addSignature, 
    updateSignature, 
    deleteSignature, 
    setDefaultSignature 
  } = useSignatures();
  
  const [showAddSignatureForm, setShowAddSignatureForm] = useState(false);
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
      
      // Try to extract HTML from the response
      let htmlContent = assistantMessage;
      
      // Look for HTML tags to extract just the HTML portion
      const htmlMatch = assistantMessage.match(/<div[\s\S]*<\/div>/);
      if (htmlMatch) {
        htmlContent = htmlMatch[0];
        console.log('Found HTML div content:', htmlContent);
      } else {
        console.log('No div HTML content found, using raw message');
      }
      
      // Update the signature content
      setNewSignature({
        ...newSignature,
        content: htmlContent
      });
      
      success('Signature generated successfully with AI', {
        title: 'Success'
      });
    } catch (err) {
      console.error('Error generating signature with AI:', err);
      console.error('Error details:', err.message);
      
      warning('Could not generate signature with AI. Using local fallback.', {
        title: 'AI Generation Failed'
      });
      
      // Fallback to local generation if AI fails
      setNewSignature({
        ...newSignature,
        content: generateSignatureBasedOnStyle(aiStyle, aiOptions)
      });
    } finally {
      setIsGeneratingSignature(false);
    }
  };

  // Enhanced signature generator with more styles and options
  const generateSignatureBasedOnStyle = (style, options) => {
    let signatureContent = '';
    
    switch(style) {
      case 'professional':
      signatureContent = `<div style="font-family: Arial, sans-serif; font-size: 14px; color: #333333; line-height: 1.5;">
          <p style="margin-bottom: 10px;"><strong>${userInfo.name}</strong>${options.includePosition ? `<br>${userInfo.position}` : ''}${options.includeCompany ? `<br>${userInfo.company}` : ''}</p>
        
        <p style="margin-bottom: 10px;">
          ${options.includeEmail ? `<span style="color: #666666;">Email:</span> ${userInfo.email}<br>` : ''}
          ${options.includePhone ? `<span style="color: #666666;">Phone:</span> ${userInfo.phone}<br>` : ''}
          ${options.includeWebsite ? `<span style="color: #666666;">Website:</span> <a href="https://${userInfo.website}" style="color: #1a73e8; text-decoration: none;">${userInfo.website}</a>` : ''}
          </p>
          
          ${options.includeSocialLinks ? 
            `<p style="margin-bottom: 10px;">
              ${userInfo.linkedin ? `<a href="${userInfo.linkedin}" style="display: inline-block; margin-right: 8px;"><img src="https://cdn.jsdelivr.net/npm/simple-icons@v7/icons/linkedin.svg" alt="LinkedIn" width="16" height="16"></a>` : ''}
              ${userInfo.twitter ? `<a href="${userInfo.twitter}" style="display: inline-block; margin-right: 8px;"><img src="https://cdn.jsdelivr.net/npm/simple-icons@v7/icons/twitter.svg" alt="Twitter" width="16" height="16"></a>` : ''}
              ${userInfo.github ? `<a href="${userInfo.github}" style="display: inline-block;"><img src="https://cdn.jsdelivr.net/npm/simple-icons@v7/icons/github.svg" alt="GitHub" width="16" height="16"></a>` : ''}
            </p>` : ''}
          
          ${options.includeDisclaimer ? 
            `<p style="font-size: 12px; color: #777777; border-top: 1px solid #dddddd; padding-top: 10px; margin-top: 10px;">
        This email and any files transmitted with it are confidential and intended solely for the use of the individual or entity to whom they are addressed.
            </p>` : ''}
      </div>`;
        break;
        
      case 'minimal':
      signatureContent = `<div style="font-family: Arial, sans-serif; font-size: 14px; color: #333333; line-height: 1.5;">
        <p>
          ${userInfo.name}<br>
          ${options.includeEmail ? userInfo.email : ''}
        </p>
      </div>`;
        break;
        
      case 'modern':
      signatureContent = `<div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; color: #333333; line-height: 1.5;">
        <table cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td width="20" style="background-color: #1a73e8;"></td>
            <td width="20"></td>
            <td>
                <p style="margin-bottom: 10px; font-size: 16px;"><strong>${userInfo.name}</strong></p>
                ${options.includePosition && options.includeCompany ? 
                  `<p style="margin-bottom: 15px; color: #666666;">${userInfo.position} | ${userInfo.company}</p>` : 
                  options.includePosition ? 
                    `<p style="margin-bottom: 15px; color: #666666;">${userInfo.position}</p>` : 
                    options.includeCompany ? 
                      `<p style="margin-bottom: 15px; color: #666666;">${userInfo.company}</p>` : ''}
              
              <p style="margin-bottom: 10px;">
                  ${options.includeEmail ? `<a href="mailto:${userInfo.email}" style="color: #1a73e8; text-decoration: none;">${userInfo.email}</a><br>` : ''}
                  ${options.includePhone ? `<span style="color: #666666;">${userInfo.phone}</span>` : ''}
              </p>
            </td>
          </tr>
        </table>
          
          ${options.includeDisclaimer ? 
            `<p style="font-size: 12px; color: #777777; border-top: 1px solid #dddddd; padding-top: 10px; margin-top: 10px;">
              This email and any files transmitted with it are confidential and intended solely for the use of the individual or entity to whom they are addressed.
            </p>` : ''}
      </div>`;
        break;
        
      case 'colorful':
        signatureContent = `<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; color: #333333; line-height: 1.5;">
        <table cellpadding="0" cellspacing="0" border="0">
          <tr>
              <td style="padding: 10px; background: linear-gradient(135deg, #6e8efb, #a777e3); border-radius: 5px;">
                <p style="margin-bottom: 5px; font-size: 18px; color: white;"><strong>${userInfo.name}</strong></p>
                ${options.includePosition ? `<p style="margin-bottom: 5px; color: rgba(255,255,255,0.8); font-size: 14px;">${userInfo.position}</p>` : ''}
                ${options.includeCompany ? `<p style="margin-bottom: 10px; color: rgba(255,255,255,0.9); font-size: 16px;">${userInfo.company}</p>` : ''}
                
                <p style="margin-bottom: 5px;">
                  ${options.includeEmail ? `<a href="mailto:${userInfo.email}" style="color: white; text-decoration: none;">${userInfo.email}</a><br>` : ''}
                  ${options.includePhone ? `<span style="color: rgba(255,255,255,0.9);">${userInfo.phone}</span><br>` : ''}
                  ${options.includeWebsite ? `<a href="https://${userInfo.website}" style="color: white; text-decoration: none;">${userInfo.website}</a>` : ''}
                </p>
              </td>
                </tr>
              </table>
              
          ${options.includeDisclaimer ? 
            `<p style="font-size: 12px; color: #777777; padding-top: 10px; margin-top: 10px;">
              This email and any files transmitted with it are confidential and intended solely for the use of the individual or entity to whom they are addressed.
            </p>` : ''}
      </div>`;
        break;
        
      default:
        signatureContent = `<div><p>${userInfo.name}</p></div>`;
    }
    
    return signatureContent;
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Email Signatures</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Create and manage professional email signatures
        </p>
      </div>
      
      <div className="flex flex-wrap justify-between items-center mb-6">
        <div className="flex space-x-2 mb-2 sm:mb-0">
          <Button 
            variant="outline"
            onClick={handleAIHelpClick}
            className="flex items-center gap-2"
          >
            <HelpCircle size={16} />
            <span>AI Help</span>
          </Button>
          
          {signatures.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <FileText size={16} />
                  <span>Select Signature</span>
                  <ChevronDown size={14} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {signatures.map(signature => (
                  <DropdownMenuItem 
                    key={signature.id}
                    onClick={() => handleSelectSignature(signature)}
                    className="flex items-center justify-between"
                  >
                    <span>{signature.name}</span>
                    {signature.default && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full dark:bg-green-800/30 dark:text-green-400">
                        Default
                      </span>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        
        <Button 
          onClick={() => {
            setShowAddSignatureForm(!showAddSignatureForm);
            setEditingId(null);
            if (!showAddSignatureForm) {
              setNewSignature({
                name: '',
                content: '',
                default: false
              });
            }
          }}
          className="flex items-center gap-2"
        >
          <Plus size={16} />
          <span>Add Signature</span>
        </Button>
      </div>
      
      {/* Add/Edit Signature Form */}
      {showAddSignatureForm && (
        <Card className="mb-6 border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {editingId !== null ? 'Edit Signature' : 'Add New Signature'}
              <Button
                variant="outline"
                size="sm"
                onClick={generateSignatureWithAI}
                disabled={isGeneratingSignature || !newSignature.name}
                className="flex items-center gap-2"
              >
                {isGeneratingSignature ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    <span>Generate with AI</span>
                  </>
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Signature Name</label>
                <input
                  type="text"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-gray-800"
                  placeholder="Enter signature name (e.g., Professional, Personal)"
                  value={newSignature.name}
                  onChange={(e) => setNewSignature({ ...newSignature, name: e.target.value })}
                />
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">Generate with AI</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Style</label>
                    <select 
                      className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                      value={aiStyle}
                      onChange={(e) => setAiStyle(e.target.value)}
                    >
                      <option value="professional">Professional</option>
                      <option value="minimal">Minimal</option>
                      <option value="modern">Modern</option>
                      <option value="colorful">Colorful</option>
                    </select>
              </div>
              
              <div>
                    <label className="block text-sm font-medium mb-2">Your Information</label>
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Your Name"
                        className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                        value={userInfo.name}
                        onChange={(e) => setUserInfo({...userInfo, name: e.target.value})}
                      />
                      <input
                        type="text"
                        placeholder="Job Title"
                        className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                        value={userInfo.position}
                        onChange={(e) => setUserInfo({...userInfo, position: e.target.value})}
                      />
                      <input
                        type="text"
                        placeholder="Company"
                        className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                        value={userInfo.company}
                        onChange={(e) => setUserInfo({...userInfo, company: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Components to Include</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <label className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        checked={aiOptions.includePosition} 
                        onChange={() => setAiOptions({...aiOptions, includePosition: !aiOptions.includePosition})}
                        className="rounded text-primary"
                      />
                      <span>Position</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        checked={aiOptions.includeCompany} 
                        onChange={() => setAiOptions({...aiOptions, includeCompany: !aiOptions.includeCompany})}
                        className="rounded text-primary"
                      />
                      <span>Company</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        checked={aiOptions.includeEmail} 
                        onChange={() => setAiOptions({...aiOptions, includeEmail: !aiOptions.includeEmail})}
                        className="rounded text-primary"
                      />
                      <span>Email</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        checked={aiOptions.includePhone} 
                        onChange={() => setAiOptions({...aiOptions, includePhone: !aiOptions.includePhone})}
                        className="rounded text-primary"
                      />
                      <span>Phone</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        checked={aiOptions.includeWebsite} 
                        onChange={() => setAiOptions({...aiOptions, includeWebsite: !aiOptions.includeWebsite})}
                        className="rounded text-primary"
                      />
                      <span>Website</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        checked={aiOptions.includeDisclaimer} 
                        onChange={() => setAiOptions({...aiOptions, includeDisclaimer: !aiOptions.includeDisclaimer})}
                        className="rounded text-primary"
                      />
                      <span>Disclaimer</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        checked={aiOptions.includeSocialLinks} 
                        onChange={() => setAiOptions({...aiOptions, includeSocialLinks: !aiOptions.includeSocialLinks})}
                        className="rounded text-primary"
                      />
                      <span>Social Links</span>
                    </label>
                  </div>
                </div>
                
                <button
                  type="button"
                  className="w-full py-2 px-4 mb-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center justify-center"
                  onClick={generateSignatureWithAI}
                  disabled={isGeneratingSignature}
                >
                  {isGeneratingSignature ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate with AI
                    </>
                  )}
                </button>
              </div>
              
              <div className="mb-6">
                <label htmlFor="signatureContent" className="block text-sm font-medium mb-2">Signature Content</label>
                <RichTextEditor
                  initialContent={newSignature.content}
                  onChange={(content) => setNewSignature({...newSignature, content})}
                  showButtons={false}
                  darkMode={false}
                />
              </div>
              
              <div className="mt-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    checked={newSignature.default}
                    onChange={(e) => setNewSignature({ ...newSignature, default: e.target.checked })}
                  />
                  <span className="text-sm">Set as default signature</span>
                </label>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddSignatureForm(false);
                  setEditingId(null);
                }}
                className="flex items-center gap-2"
              >
                <X size={16} />
                <span>Cancel</span>
              </Button>
              <Button
                onClick={editingId !== null ? handleUpdateSignature : handleAddSignature}
                className="flex items-center gap-2"
              >
                <Check size={16} />
                <span>{editingId !== null ? 'Update Signature' : 'Add Signature'}</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Signatures Grid */}
      {signatures.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {signatures.map(signature => (
            <Card key={signature.id} className="border-0 shadow-sm hover:shadow transition-shadow duration-200">
              <CardHeader className="pb-2 flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="flex items-center text-base">
                    {signature.name}
                    {signature.default && (
                      <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full dark:bg-green-900 dark:text-green-200">
                        Default
                      </span>
                    )}
                  </CardTitle>
                </div>
                <div className="flex">
                  {!signature.default && (
                    <button
                      className="p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400"
                      onClick={() => handleSetDefaultSignature(signature.id)}
                      title="Set as default"
                    >
                      <Check size={16} />
                    </button>
                  )}
                  <button
                    className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                    onClick={() => handleEditSignature(signature)}
                    title="Edit signature"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                    onClick={() => handleDeleteSignature(signature.id)}
                    title="Delete signature"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preview:</p>
                  <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-sm">
                    <div dangerouslySetInnerHTML={{ __html: signature.content }} />
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-4 text-sm"
                  onClick={() => {
                    setTimeout(() => {
                      success(`Signature "${signature.name}" selected`, {
                        title: 'Success'
                      });
                    }, 0);
                  }}
                >
                  Use Signature
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <FileText size={24} className="text-gray-600 dark:text-gray-400" />
            </div>
            <h3 className="mt-4 text-base font-medium text-gray-900 dark:text-white">No signatures yet</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Create your first email signature to make your communications more professional.
            </p>
            <div className="mt-6">
              <Button
                onClick={() => setShowAddSignatureForm(true)}
                className="flex items-center gap-2 mx-auto"
              >
                <Plus size={16} />
                <span>Create Signature</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feature Info Modal */}
      {isOpen && currentFeature && (
        <FeatureInfoModal
          isOpen={isOpen}
          onClose={closeFeatureInfo}
          title={currentFeature.title}
          description={currentFeature.description}
          benefits={currentFeature.benefits}
          releaseDate={currentFeature.releaseDate}
        />
      )}
    </div>
  );
} 