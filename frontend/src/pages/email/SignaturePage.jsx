import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Plus, Edit2, Trash2, FileText, Check, X, Sparkles, Loader2 } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { useSignatures } from '../../hooks/useSignatures';
import RichTextEditor from '../../components/RichTextEditor';

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
  const [isEditing, setIsEditing] = useState(false);
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
  
  const handleAddSignature = () => {
    if (!newSignature.name) {
      error({
        title: 'Error',
        description: 'Please provide a signature name'
      });
      return;
    }
    
    if (!newSignature.content) {
      error({
        title: 'Error',
        description: 'Please provide signature content'
      });
      return;
    }
    
    const success = addSignature(newSignature);
    
    if (success) {
      setNewSignature({
        name: '',
        content: '',
        default: false
      });
    }
  };
  
  const handleUpdateSignature = () => {
    if (!editingId) return;
    
    if (!newSignature.name) {
      error({
        title: 'Error',
        description: 'Please provide a signature name'
      });
      return;
    }
    
    if (!newSignature.content) {
      error({
        title: 'Error',
        description: 'Please provide signature content'
      });
      return;
    }
    
    const success = updateSignature(editingId, newSignature);
    
    if (success) {
      setIsEditing(false);
      setEditingId(null);
      setNewSignature({
        name: '',
        content: '',
        default: false
      });
    }
  };
  
  const handleEditSignature = (signature) => {
    setIsEditing(true);
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
  
  // Add more robust AI signature generation function
  const generateSignatureWithAI = () => {
    if (!newSignature.name) {
      error("Error", {
        description: 'Please provide a signature name before generating'
      });
      return;
    }
    
    setIsGeneratingSignature(true);
    
    // Simulate AI generation with a timeout
    setTimeout(() => {
      setIsGeneratingSignature(false);
      setNewSignature({
        ...newSignature,
        content: generateSignatureBasedOnStyle(aiStyle, aiOptions)
      });
      
      success("Signature generated successfully");
    }, 2000);
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
                ${options.includePosition || options.includeCompany ? 
                  `<p style="margin-bottom: 15px; color: #666666;">${options.includePosition ? userInfo.position : ''}${options.includePosition && options.includeCompany ? ' | ' : ''}${options.includeCompany ? userInfo.company : ''}</p>` : ''}
                
                ${options.includeEmail || options.includePhone || options.includeWebsite ? 
                  `<p style="margin-bottom: 10px;">
                    ${options.includeEmail ? `<a href="mailto:${userInfo.email}" style="color: #1a73e8; text-decoration: none;">${userInfo.email}</a><br>` : ''}
                    ${options.includePhone ? `<span style="color: #666666;">${userInfo.phone}</span><br>` : ''}
                    ${options.includeWebsite ? `<a href="https://${userInfo.website}" style="color: #1a73e8; text-decoration: none;">${userInfo.website}</a>` : ''}
                  </p>` : ''}
                
                ${options.includeSocialLinks ? 
                  `<p style="margin-bottom: 10px;">
                    ${userInfo.linkedin ? `<a href="${userInfo.linkedin}" style="display: inline-block; margin-right: 8px;"><img src="https://cdn.jsdelivr.net/npm/simple-icons@v7/icons/linkedin.svg" alt="LinkedIn" width="16" height="16"></a>` : ''}
                    ${userInfo.twitter ? `<a href="${userInfo.twitter}" style="display: inline-block; margin-right: 8px;"><img src="https://cdn.jsdelivr.net/npm/simple-icons@v7/icons/twitter.svg" alt="Twitter" width="16" height="16"></a>` : ''}
                    ${userInfo.github ? `<a href="${userInfo.github}" style="display: inline-block;"><img src="https://cdn.jsdelivr.net/npm/simple-icons@v7/icons/github.svg" alt="GitHub" width="16" height="16"></a>` : ''}
                  </p>` : ''}
                
                ${options.includeDisclaimer ? 
                  `<p style="font-size: 11px; color: #999999;">
                    This email and any files transmitted with it are confidential and intended solely for the use of the individual or entity to whom they are addressed.
                  </p>` : ''}
              </td>
            </tr>
          </table>
        </div>`;
        break;
        
      case 'colorful':
        signatureContent = `<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; color: #333333; line-height: 1.5;">
          <table cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="padding: 10px 15px; background: linear-gradient(135deg, #6e8efb, #a777e3); border-radius: 4px; color: white;">
                <p style="margin-bottom: 5px; font-size: 18px;"><strong>${userInfo.name}</strong></p>
                ${options.includePosition ? `<p style="margin-bottom: 5px; font-size: 14px; opacity: 0.9;">${userInfo.position}</p>` : ''}
                ${options.includeCompany ? `<p style="margin-bottom: 10px; font-size: 14px; opacity: 0.9;">${userInfo.company}</p>` : ''}
                
                ${options.includeEmail || options.includePhone || options.includeWebsite ? 
                  `<p style="margin-bottom: 0; font-size: 13px;">
                    ${options.includeEmail ? `<a href="mailto:${userInfo.email}" style="color: white; text-decoration: none;">${userInfo.email}</a><br>` : ''}
                    ${options.includePhone ? `<span>${userInfo.phone}</span><br>` : ''}
                    ${options.includeWebsite ? `<a href="https://${userInfo.website}" style="color: white; text-decoration: none;">${userInfo.website}</a>` : ''}
                  </p>` : ''}
              </td>
            </tr>
            ${options.includeDisclaimer ? 
              `<tr>
                <td style="padding-top: 10px; font-size: 11px; color: #888888;">
                  This email and any files transmitted with it are confidential.
                </td>
              </tr>` : ''}
          </table>
        </div>`;
        break;
        
      default:
        signatureContent = `<div><p>${userInfo.name}</p></div>`;
    }
    
    return signatureContent;
  };
  
  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col mb-6 sm:mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Email Signatures</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Create and manage your email signatures for professional communications.
        </p>
      </div>
      
      <div className="flex justify-end mb-6">
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
                onClick={handleUpdateSignature}
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
                    // Functionality to use signature would go here
                    setTimeout(() => {
                      success({
                        title: 'Success',
                        description: `Signature "${signature.name}" selected`
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
    </div>
  );
} 