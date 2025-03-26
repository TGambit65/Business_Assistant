import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Send, X, Paperclip, ChevronDown, Clock, Star, 
  Save, Type, Trash2, Maximize2, Minimize2,
  CheckCircle2, Info, Sparkles, CalendarDays, FileText, Loader2, Check, Zap, Settings
} from 'lucide-react';
import AIComposeAssistant from '../../components/email/AIComposeAssistant';
import EmailScheduler from '../../components/email/EmailScheduler';
import { useSignatures } from '../../hooks/useSignatures';
import RichTextEditor from '../../components/RichTextEditor';
import { useFeatureInfo } from '../../hooks/useFeatureInfo';
import FeatureInfoModal from '../../components/ui/FeatureInfoModal';
import DeepseekService from '../../services/DeepseekService';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';

export default function ComposePage() {
  const { success, error, info, warning } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const editorRef = useRef(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showDraftsMenu, setShowDraftsMenu] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);
  const [scheduledTime, setScheduledTime] = useState(null);
  const [spellCheckEnabled, setSpellCheckEnabled] = useState(true);
  const [showGenerateDraftOptions, setShowGenerateDraftOptions] = useState(false);
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  const [savedDrafts, setSavedDrafts] = useState([
    { id: 1, subject: 'Project proposal for client', to: 'client@example.com', lastSaved: '2 hours ago' },
    { id: 2, subject: 'Meeting agenda for tomorrow', to: 'team@example.com', lastSaved: '5 hours ago' },
  ]);
  
  // Form state
  const [emailData, setEmailData] = useState({
    to: '',
    cc: '',
    bcc: '',
    subject: '',
    body: '',
    attachments: []
  });
  
  // Sample templates - these would typically come from an API or context
  const [templates] = useState([
    {
      id: 1,
      name: 'Meeting Follow-up',
      category: 'Business',
      subject: 'Follow-up: {{meeting_name}} - Next Steps',
      body: `Hi {{recipient_name}},

Thank you for your time during our discussion about {{meeting_topic}}. I wanted to follow up with a quick summary of what we covered and the next steps.

Key points discussed:
- {{point_1}}
- {{point_2}}
- {{point_3}}

Next steps:
- {{next_step_1}}
- {{next_step_2}}

Please let me know if you have any questions or if I missed anything important.

Best regards,
{{sender_name}}`,
      favorite: true
    },
    {
      id: 2,
      name: 'Thank You Note',
      category: 'Personal',
      subject: 'Thank You for {{event_or_gift}}',
      body: `Dear {{recipient_name}},

I wanted to express my sincere thanks for {{event_or_gift}}. It was very thoughtful of you and I appreciate it.

{{personal_message}}

Thank you again.

Best wishes,
{{sender_name}}`,
      favorite: false
    }
  ]);
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEmailData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle editor content change
  const handleEditorChange = (content) => {
    setEmailData(prev => ({ ...prev, body: content }));
  };
  
  // Apply a template to the current email
  const applyTemplate = (template) => {
    setEmailData(prev => ({
      ...prev,
      subject: template.subject,
      body: template.body
    }));
    
    if (editorRef.current) {
      editorRef.current.setContent(template.body);
    }
    
    setShowTemplateSelector(false);
    success(`Template "${template.name}" applied`);
  };
  
  // Save draft
  const saveDraft = () => {
    if (!emailData.subject && !emailData.body) {
      warning('Cannot save an empty draft');
      return;
    }
    
    // In a real app, this would save to a database
    const newDraft = {
      id: Date.now(),
      subject: emailData.subject || '(No subject)',
      to: emailData.to || '(No recipient)',
      lastSaved: 'Just now'
    };
    
    setSavedDrafts(prev => [newDraft, ...prev]);
    success('Draft saved successfully');
  };
  
  // Load a draft
  const loadDraft = (draft) => {
    // In a real app, this would fetch the draft from a database
    setEmailData({
      to: draft.to === '(No recipient)' ? '' : draft.to,
      cc: '',
      bcc: '',
      subject: draft.subject === '(No subject)' ? '' : draft.subject,
      body: draft.body || '',
      attachments: []
    });
    
    if (editorRef.current && draft.body) {
      editorRef.current.setContent(draft.body);
    }
    
    setShowDraftsMenu(false);
    success(`Draft "${draft.subject}" loaded`);
  };
  
  // Delete a draft
  const deleteDraft = (id) => {
    setSavedDrafts(prev => prev.filter(draft => draft.id !== id));
    success('Draft deleted');
  };
  
  // Send email
  const sendEmail = () => {
    if (!emailData.to) {
      warning('Please specify at least one recipient');
      return;
    }
    
    if (!emailData.subject) {
      // Confirm sending without subject
      if (!window.confirm('Send this message without a subject?')) {
        return;
      }
    }
    
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      success('Email sent successfully');
      
      // Reset form
      setEmailData({
        to: '',
        cc: '',
        bcc: '',
        subject: '',
        body: '',
        attachments: []
      });
      
      if (editorRef.current) {
        editorRef.current.setContent('');
      }
    }, 1500);
  };
  
  // Discard draft
  const discardDraft = () => {
    if (emailData.to || emailData.subject || emailData.body) {
      if (window.confirm('Are you sure you want to discard this draft?')) {
        setEmailData({
          to: '',
          cc: '',
          bcc: '',
          subject: '',
          body: '',
          attachments: []
        });
        
        if (editorRef.current) {
          editorRef.current.setContent('');
        }
        
        info('Draft discarded');
      }
    }
  };
  
  // Handle file uploads
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // In a real app, these would be uploaded to a server
    const newAttachments = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type
    }));
    
    setEmailData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...newAttachments]
    }));
    
    // Reset input
    e.target.value = null;
  };
  
  // Remove attachment
  const removeAttachment = (id) => {
    setEmailData(prev => ({
      ...prev,
      attachments: prev.attachments.filter(attachment => attachment.id !== id)
    }));
  };
  
  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // Open AI Draft Generator
  const openAIDraftGenerator = () => {
    // Save current form data to localStorage to potentially use in AI Draft Generator
    const emailData = {
      to: emailData.to,
      cc: emailData.cc,
      bcc: emailData.bcc,
      subject: emailData.subject,
      body: emailData.body,
      from: { email: 'me@example.com', name: 'Me' }
    };
    
    localStorage.setItem('draftEmailData', JSON.stringify(emailData));
    
    // Navigate to AI Draft Generator
    navigate('/email/draft-generator');
  };

  // Check for generated draft on component mount
  useEffect(() => {
    const generatedDraft = localStorage.getItem('emailDraft');
    
    if (generatedDraft) {
      try {
        const parsedDraft = JSON.parse(generatedDraft);
        setEmailData(prev => ({
          ...prev,
          subject: parsedDraft.subject,
          body: parsedDraft.body
        }));
        
        // Remove the draft from localStorage to prevent loading it again
        localStorage.removeItem('emailDraft');
        
        success('AI-generated draft has been loaded');
      } catch (error) {
        console.error('Error parsing generated draft:', error);
      }
    }
  }, [success]);

  // Handle applying AI generated content
  const handleApplyAIContent = (content) => {
    if (editorRef.current) {
      editorRef.current.setContent(content);
      setEmailData(prev => ({ ...prev, body: content }));
    }
    setShowAIAssistant(false);
    success('AI-generated content applied to your email');
  };
  
  // Open AI Assistant
  const openAIAssistant = () => {
    setShowAIAssistant(true);
  };
  
  // Close AI Assistant
  const closeAIAssistant = () => {
    setShowAIAssistant(false);
  };

  // Handle scheduling an email
  const handleScheduleEmail = (scheduleData) => {
    setScheduledTime(scheduleData);
    setShowScheduler(false);
    
    // Format the date for display
    const options = { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    const formattedDate = scheduleData.dateTime.toLocaleString('en-US', options);
    
    success(`Email scheduled for ${formattedDate}`);
  };
  
  // Open scheduler
  const openScheduler = () => {
    setShowScheduler(true);
  };
  
  // Close scheduler
  const closeScheduler = () => {
    setShowScheduler(false);
  };

  // Add useSignatures hook import
  const { signatures, defaultSignature } = useSignatures();
  const [selectedSignature, setSelectedSignature] = useState(defaultSignature?.id || null);

  // Add function to insert signature into the editor
  const insertSignature = useCallback((signatureId) => {
    if (!signatureId || !signatures.length) return;
    
    const signature = signatures.find(sig => sig.id === signatureId);
    if (!signature) return;
    
    // Insert signature content at cursor position or replace current selection
    if (editorRef.current) {
      const editor = editorRef.current;
      editor.focus();
      editor.insertContent(`<div class="signature-content">${signature.content}</div>`);
      success(`Applied "${signature.name}" signature to your email.`);
    }
  }, [signatures, success]);

  // Add this to the useEffect that handles initializing the email content
  useEffect(() => {
    // If replying to an email or forwarding, set the initial content
    if (location.state?.initialContent) {
      setEmailData(prev => ({
        ...prev,
        body: location.state.initialContent
      }));
      
      if (editorRef.current) {
        editorRef.current.setContent(location.state.initialContent);
      }
    } else if (defaultSignature) {
      // Otherwise, just add the default signature if there is one
      const initialContent = `<p><br></p><div class="signature-content">${defaultSignature.content}</div>`;
      setEmailData(prev => ({
        ...prev,
        body: initialContent
      }));
      
      if (editorRef.current) {
        editorRef.current.setContent(initialContent);
      }
    }
  }, [location.state, defaultSignature]);

  const { isOpen, currentFeature, showFeatureInfo, closeFeatureInfo } = useFeatureInfo();

  // Add useEffect for handling click outside signature dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      const menu = document.getElementById('signature-menu');
      if (menu && !menu.contains(event.target) && !event.target.closest('button[data-signature-menu]')) {
        menu.classList.add('hidden');
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Add a function to generate AI suggestions for the email content
  const generateAISuggestion = async (type) => {
    // Get current content (if any)
    const currentContent = editorRef.current?.getContent() || '';
    const currentSubject = emailData.subject || '';
    
    let prompt = '';
    switch(type) {
      case 'improve':
        prompt = `Improve the following email draft by making it more professional and clear:
          
          Subject: ${currentSubject}
          
          ${currentContent ? currentContent.replace(/<[^>]*>/g, '') : 'No content yet'}
          
          Please provide an improved version with better wording and structure. Return only the enhanced email text, no explanations.`;
        break;
      case 'shorter':
        prompt = `Make the following email shorter and more concise while maintaining the key points:
          
          Subject: ${currentSubject}
          
          ${currentContent ? currentContent.replace(/<[^>]*>/g, '') : 'No content yet'}
          
          Return only the condensed email text, no explanations.`;
        break;
      case 'friendly':
        prompt = `Rewrite the following email to make it more friendly and conversational:
          
          Subject: ${currentSubject}
          
          ${currentContent ? currentContent.replace(/<[^>]*>/g, '') : 'No content yet'}
          
          Return only the rewritten email text, no explanations.`;
        break;
      case 'formal':
        prompt = `Rewrite the following email to make it more formal and professional:
          
          Subject: ${currentSubject}
          
          ${currentContent ? currentContent.replace(/<[^>]*>/g, '') : 'No content yet'}
          
          Return only the rewritten email text, no explanations.`;
        break;
      default:
        prompt = `Generate a professional email with subject "${currentSubject || 'No subject'}".
          
          If you need a starting point, here's the current draft:
          ${currentContent ? currentContent.replace(/<[^>]*>/g, '') : 'No content yet'}
          
          Return only the email text, no explanations.`;
    }
    
    try {
      setLoading(true);
      
      // Call the Deepseek API
      const response = await DeepseekService.generateResponse(prompt, {
        useContext: true,
        temperature: 0.7
      });
      
      // Extract the content from the response
      const suggestion = response.choices[0]?.message?.content;
      
      // Set the content in the editor
      if (editorRef.current && suggestion) {
        // Format the suggestion as HTML with proper paragraph breaks
        const formattedSuggestion = suggestion
          .split('\n\n')
          .map(para => `<p>${para.replace(/\n/g, '<br>')}</p>`)
          .join('');
        
        editorRef.current.setContent(formattedSuggestion);
        
        // Update the email data state
        setEmailData(prev => ({
          ...prev,
          body: formattedSuggestion
        }));
        
        success('AI suggestion applied to your email');
      }
    } catch (error) {
      console.error('Error generating AI suggestion:', error);
      error({
        title: 'AI Error',
        description: 'Could not generate AI suggestion. Please try again later.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Load reply data if available
  useEffect(() => {
    try {
      const emailActionData = localStorage.getItem('emailAction');
      if (emailActionData) {
        const actionData = JSON.parse(emailActionData);
        
        // If this is a reply or forward
        if (actionData.action === 'reply' || actionData.action === 'forward') {
          setEmailData({
            to: actionData.to || '',
            cc: actionData.cc || '',
            bcc: actionData.bcc || '',
            subject: actionData.subject || '',
            body: actionData.body || '',
            attachments: actionData.attachments || []
          });
          
          // Clear the storage after loading
          localStorage.removeItem('emailAction');
        }
      }
    } catch (error) {
      console.error('Error loading reply data:', error);
    }
  }, []);

  // Toggle spell checking
  const toggleSpellCheck = () => {
    setSpellCheckEnabled(!spellCheckEnabled);
    
    // Update the spell check setting in the editor
    if (editorRef.current) {
      editorRef.current.toggleSpellCheck?.();
    }
  };
  
  // Handle quick draft generation
  const handleGenerateQuickDraft = () => {
    setShowGenerateDraftOptions(false);
    setIsGeneratingDraft(true);
    
    // Get current context
    const recipient = emailData.to.split(',')[0].trim();
    const recipientName = recipient.split('@')[0] || 'recipient';
    const subject = emailData.subject || 'No subject';
    
    // Prepare prompt for the AI
    const prompt = `Generate a professional email draft with subject "${subject}" to ${recipientName}.
    The email should be well-structured, concise, and have a friendly yet professional tone.
    Recipient: ${recipient}
    Current message (if any): ${emailData.body ? emailData.body.replace(/<[^>]*>/g, '') : 'No content yet'}`;
    
    // Call the Deepseek API (simulated for now)
    setTimeout(() => {
      try {
        // Sample generated content
        const generatedContent = `<p>Dear ${recipientName.charAt(0).toUpperCase() + recipientName.slice(1)},</p>
<p>I hope this email finds you well. I'm reaching out regarding ${subject}.</p>
<p>[AI-generated content based on your subject and recipient]</p>
<p>Please let me know if you have any questions or need any additional information.</p>
<p>Best regards,<br>
${user?.displayName || 'Your Name'}</p>`;
        
        // Update the editor with the generated content
        if (editorRef.current) {
          editorRef.current.setContent(generatedContent);
        }
        
        // Update email data state
        setEmailData(prev => ({
          ...prev,
          body: generatedContent
        }));
        
        success('Quick draft generated successfully');
        setIsGeneratingDraft(false);
      } catch (error) {
        console.error('Error generating quick draft:', error);
        error('Failed to generate draft. Please try again.');
        setIsGeneratingDraft(false);
      }
    }, 1500);
  };
  
  // Navigate to advanced draft generator
  const handleAdvancedDraftGenerator = () => {
    setShowGenerateDraftOptions(false);
    
    // Save current email data for the draft generator
    const draftContext = {
      to: emailData.to,
      subject: emailData.subject,
      body: emailData.body,
      cc: emailData.cc,
      bcc: emailData.bcc
    };
    
    localStorage.setItem('draftContext', JSON.stringify(draftContext));
    
    // Navigate to the advanced draft generator
    navigate('/email/draft-generator');
  };

  return (
    <div className={`container mx-auto px-4 py-6 ${isFullScreen ? 'fixed inset-0 z-50 bg-background' : ''}`}>
      <Card className={`w-full ${isFullScreen ? 'h-full' : ''}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl">New Message</CardTitle>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="text-muted-foreground hover:text-foreground"
            >
              {isFullScreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={discardDraft}
              className="text-destructive hover:text-destructive"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Email Form */}
            <div className="space-y-4">
              {/* To Field */}
              <div className="flex flex-wrap items-center border-b pb-1.5">
                <span className="w-10 font-semibold">To:</span>
              <input
                type="text"
                name="to"
                  value={emailData.to}
                onChange={handleInputChange}
                  className="flex-1 min-w-0 py-1 px-1 bg-transparent focus:outline-none"
                  placeholder="recipient@example.com"
              />
            </div>
            
              {/* CC Field */}
              <div className="flex flex-wrap items-center border-b pb-1.5">
                <span className="w-10 font-semibold">Cc:</span>
                  <input
                    type="text"
                    name="cc"
                  value={emailData.cc}
                    onChange={handleInputChange}
                  className="flex-1 min-w-0 py-1 px-1 bg-transparent focus:outline-none"
                    placeholder="cc@example.com"
                  />
            </div>
            
              {/* Subject Field */}
              <div className="flex flex-wrap items-center border-b pb-1.5">
                <span className="w-10 font-semibold">Subject:</span>
              <input
                type="text"
                name="subject"
                  value={emailData.subject}
                onChange={handleInputChange}
                  className="flex-1 min-w-0 py-1 px-1 bg-transparent focus:outline-none"
                placeholder="Enter subject"
              />
            </div>
            
              {/* Editor Toolbar with Generate Draft dropdown */}
              <div className="flex flex-wrap justify-between items-center mb-2 pb-2 border-b toolbar-compact">
                <div className="flex items-center space-x-2 overflow-x-auto">
                  {/* Generate Draft dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled={isGeneratingDraft}
                        className="flex items-center gap-1"
                      >
                        {isGeneratingDraft ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="hidden sm:inline">Generating...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4" />
                            <span className="hidden sm:inline">Generate Draft</span>
                          </>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem onClick={handleGenerateQuickDraft}>
                        <Zap className="mr-2 h-4 w-4" />
                        <span>Quick Draft</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleAdvancedDraftGenerator}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Advanced Draft</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                
                  {/* Template button */}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowTemplateSelector(!showTemplateSelector)}
                    className="flex items-center gap-1"
                  >
                    <FileText className="h-4 w-4" />
                    <span className="hidden sm:inline">Templates</span>
                  </Button>
                  
                  {/* Spell check button */}
                  <Button
                    variant={spellCheckEnabled ? "default" : "outline"}
                    size="sm"
                    onClick={toggleSpellCheck}
                    className="flex items-center gap-1"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Spell Check</span>
                  </Button>
                  
                  {/* File upload */}
                  <label className="cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                      multiple
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex items-center gap-1"
                      asChild
                    >
                      <span>
                        <Paperclip className="h-4 w-4" />
                        <span className="hidden sm:inline">Attach</span>
                      </span>
                    </Button>
                </label>
                </div>
              </div>
              
              {/* Rich Text Editor */}
              <div className="min-h-[300px] border rounded-md overflow-hidden">
                <RichTextEditor
                  ref={editorRef}
                  initialContent={emailData.body}
                  onChange={handleEditorChange}
                  darkMode={false}
                  showButtons={false}
                  spellCheckEnabled={spellCheckEnabled}
                />
                        </div>
              
              {/* Attachments */}
              {emailData.attachments.length > 0 && (
                <div className="pt-3 border-t">
                  <h3 className="text-sm font-medium mb-2">Attachments ({emailData.attachments.length})</h3>
                  <div className="flex flex-wrap gap-2">
                    {emailData.attachments.map(file => (
                      <div 
                        key={file.id} 
                        className="flex items-center bg-secondary/50 px-3 py-1.5 rounded-md text-sm"
                      >
                        <span className="truncate max-w-[180px]">{file.name}</span>
                        <span className="text-xs ml-1.5 text-muted-foreground">({formatFileSize(file.size)})</span>
                        <button
                          onClick={() => removeAttachment(file.id)}
                          className="ml-2 text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Bottom toolbar */}
              <div className="flex flex-wrap justify-between items-center pt-4 mt-4 border-t toolbar-compact">
                <div className="flex items-center gap-2 mb-2 sm:mb-0 overflow-x-auto">
                  {/* Left side buttons */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowScheduler(!showScheduler)}
                    className="flex items-center gap-1"
                  >
                    <Clock className="h-4 w-4" />
                    <span className="hidden sm:inline">Schedule</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAIAssistant(!showAIAssistant)}
                    className="flex items-center gap-1"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span className="hidden sm:inline">AI Assistant</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={saveDraft}
                    className="flex items-center gap-1"
                  >
                    <Save className="h-4 w-4" />
                    <span className="hidden sm:inline">Save Draft</span>
                  </Button>
                </div>
                
                <div className="flex items-center">
                  <Button
                    onClick={sendEmail}
                    disabled={loading}
                    className="flex items-center gap-1"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Send</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* AI Assistant Sidebar */}
      {showAIAssistant && (
        <AIComposeAssistant 
          emailData={emailData}
          onClose={closeAIAssistant}
          onApplyContent={handleApplyAIContent}
        />
      )}
      
      {/* Email Scheduler */}
      {showScheduler && (
        <EmailScheduler 
          onClose={closeScheduler}
          onSchedule={handleScheduleEmail}
        />
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