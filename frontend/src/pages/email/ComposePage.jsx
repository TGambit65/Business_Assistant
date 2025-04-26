import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // Import useLocation
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input'; // Assuming Input from ui
// import { Textarea } from '../../components/ui/textarea'; // Not used - EmailEditor is used for body
import { Label } from '../../components/ui/label'; // Assuming Label from ui
import { useToast } from '../../contexts/ToastContext';
import {
  Send, X, Paperclip, ChevronDown, Clock, Star,
  Save, Trash2, Maximize2, Minimize2,
  Sparkles, BrainCircuit, Wand, Loader2 // Added Loader2
} from 'lucide-react';
import EmailScheduler from '../../components/email/EmailScheduler';
import EmailEditor from '../../components/email/EmailEditor';
import useNavigateTo from '../../hooks/useNavigateTo';

// Reusable Dropdown Component (Keep as is)
const Dropdown = ({ trigger, children, isOpen, setIsOpen }) => {
  const dropdownRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      {isOpen && (
        <div className="absolute left-0 mt-2 w-60 rounded-md shadow-lg bg-popover text-popover-foreground z-50 border border-border"> {/* Use theme colors */}
          {children}
        </div>
      )}
    </div>
  );
};

export default function ComposePage() {
  const { success, info, warning } = useToast();
  const navigate = useNavigate();
  const navigateTo = useNavigateTo();
  const location = useLocation(); // Get location object
  const fileInputRef = useRef(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showDraftsMenu, setShowDraftsMenu] = useState(false);
  // const [showAIAssistant, setShowAIAssistant] = useState(false); // Assuming AI Assistant is separate component/logic
  const [showScheduler, setShowScheduler] = useState(false);
  const [scheduledDate, setScheduledDate] = useState(null);
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

  // --- Effect to pre-fill from location state (template data) ---
  useEffect(() => {
    if (location.state?.subject || location.state?.body) {
      console.log("Received template data via navigation state:", location.state);
      setEmailData(prev => ({
        ...prev,
        subject: location.state.subject || prev.subject, // Use passed subject or keep existing
        body: location.state.body || prev.body // Use passed body or keep existing
      }));
      // Clear the state from history after applying it
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);
  // --- End Effect ---


  // Sample templates (Keep for Template dropdown functionality)
  const [templates] = useState([
    { id: 1, name: 'Meeting Follow-up', category: 'Business', subject: 'Follow-up: {{meeting_name}} - Next Steps', body: `Hi {{recipient_name}},\n\nThank you for your time...`, favorite: true },
    { id: 2, name: 'Thank You Note', category: 'Personal', subject: 'Thank You for {{event_or_gift}}', body: `Dear {{recipient_name}},\n\nI wanted to express my sincere thanks...`, favorite: false }
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

  // Handle file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    const oversizedFiles = files.filter(file => file.size > MAX_FILE_SIZE);
    if (oversizedFiles.length > 0) { warning(`${oversizedFiles.length} file(s) exceed the 10MB limit and will be skipped.`); }
    const validFiles = files.filter(file => file.size <= MAX_FILE_SIZE);
    const newAttachments = validFiles.map(file => ({ id: Math.random().toString(36).substr(2, 9), file: file, name: file.name, size: file.size, type: file.type, }));
    setEmailData(prev => ({ ...prev, attachments: [...prev.attachments, ...newAttachments] }));
    if (fileInputRef.current) { fileInputRef.current.value = ''; }
  };

  // Remove attachment
  const removeAttachment = (id) => {
    setEmailData(prev => ({ ...prev, attachments: prev.attachments.filter(attachment => attachment.id !== id) }));
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // Apply a template to the current email
  const applyTemplate = (template) => {
    setEmailData(prev => ({ ...prev, subject: template.subject, body: template.body }));
    setShowTemplateSelector(false);
    success(`Template "${template.name}" applied`);
  };

  // Save draft
  const saveDraft = () => {
    if (!emailData.subject && !emailData.body) { warning('Cannot save an empty draft'); return; }
    const newDraft = { id: Date.now(), subject: emailData.subject || '(No subject)', to: emailData.to || '(No recipient)', lastSaved: 'Just now', body: emailData.body /* Save body too */ };
    setSavedDrafts(prev => [newDraft, ...prev]);
    success('Draft saved successfully');
  };

  // Load a draft
  const loadDraft = (draft) => {
    setEmailData(prev => ({
      ...prev,
      to: draft.to || '',
      subject: draft.subject || '',
      body: draft.body || ''
    }));
    setShowDraftsMenu(false);
    info(`Draft "${draft.subject}" loaded`);
  };

  // Send email
  const sendEmail = () => {
    if (!emailData.to) { warning('Please specify at least one recipient'); return; }
    
    setLoading(true);
    // Simulating API call
    setTimeout(() => {
      success('Email sent successfully');
      setLoading(false);
      // Redirect to inbox or confirmation page
      navigate('/inbox');
    }, 1500);
  };

  // Schedule email
  const scheduleEmail = (date) => {
    if (!emailData.to) { warning('Please specify at least one recipient'); return; }
    if (!emailData.subject) { warning('Please add a subject for scheduled emails'); return; }
    
    setScheduledDate(date);
    setShowScheduler(false);
    success(`Email scheduled for ${date.toLocaleString()}`);
  };

  // Handle discarding the draft
  const handleDiscard = () => {
    if (!emailData.subject && !emailData.body && !emailData.to && !emailData.cc && !emailData.bcc && emailData.attachments.length === 0) {
      navigate('/inbox');
      return;
    }
    
    if (window.confirm('Are you sure you want to discard this draft?')) {
      navigate('/inbox');
    }
  };

  // AI Draft Generator Navigation
  const handleNavigateToQuickDraft = () => { navigateTo('/email/draft-generator', { mode: 'quick' }); };
  const handleNavigateToAdvancedDraft = () => { navigateTo('/email/draft-generator', { mode: 'advanced' }); };

  // Toggle fullscreen mode
  const toggleFullScreen = () => { setIsFullScreen(!isFullScreen); };

  // Trigger file input click
  const triggerFileUpload = () => { if (fileInputRef.current) { fileInputRef.current.click(); } };

  return (
    <div className={`email-compose ${isFullScreen ? 'fixed inset-0 z-50 bg-background' : ''}`}>
      <Card className={`border shadow-sm ${isFullScreen ? 'rounded-none h-full' : 'mt-4'}`}>
        <CardHeader className="border-b p-3 bg-muted/30">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl">Compose Email</CardTitle>
            <div className="flex space-x-1">
              <Button variant="ghost" size="sm" onClick={toggleFullScreen} title={isFullScreen ? 'Exit fullscreen' : 'Enter fullscreen'}>
                {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleDiscard} title="Discard draft">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="p-4 space-y-4">
            {/* Recipients */}
            <div className="space-y-4">
              <div className="grid grid-cols-[auto,1fr] gap-4 items-center">
                <Label htmlFor="to" className="font-medium text-right w-14">To:</Label>
                <Input
                  id="to"
                  name="to"
                  value={emailData.to}
                  onChange={handleInputChange}
                  placeholder="recipient@example.com"
                  className="flex-1"
                />
              </div>

              <div className="grid grid-cols-[auto,1fr] gap-4 items-center">
                <Label htmlFor="cc" className="font-medium text-right w-14">Cc:</Label>
                <Input
                  id="cc"
                  name="cc"
                  value={emailData.cc}
                  onChange={handleInputChange}
                  placeholder="cc@example.com"
                  className="flex-1"
                />
              </div>

              <div className="grid grid-cols-[auto,1fr] gap-4 items-center">
                <Label htmlFor="bcc" className="font-medium text-right w-14">Bcc:</Label>
                <Input
                  id="bcc"
                  name="bcc"
                  value={emailData.bcc}
                  onChange={handleInputChange}
                  placeholder="bcc@example.com"
                  className="flex-1"
                />
              </div>

              <div className="grid grid-cols-[auto,1fr] gap-4 items-center">
                <Label htmlFor="subject" className="font-medium text-right w-14">Subject:</Label>
                <Input
                  id="subject"
                  name="subject"
                  value={emailData.subject}
                  onChange={handleInputChange}
                  placeholder="Type subject here..."
                  className="flex-1"
                />
              </div>
            </div>

            {/* Email Body */}
            <div>
              <EmailEditor
                initialValue={emailData.body}
                onChange={handleEditorChange}
                className="min-h-[300px] border rounded-md p-2 bg-background"
              />
            </div>

            {/* Attachments */}
            {emailData.attachments.length > 0 && (
              <div className="border rounded-md p-3 bg-muted/20">
                <h3 className="text-sm font-medium mb-2">Attachments ({emailData.attachments.length})</h3>
                <div className="space-y-2">
                  {emailData.attachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center justify-between bg-background p-2 rounded-md">
                      <div className="flex items-center space-x-2">
                        <div className="bg-primary/10 p-1 rounded">
                          <Paperclip className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium truncate max-w-[200px]">{attachment.name}</p>
                          <p className="text-xs text-muted-foreground">{formatFileSize(attachment.size)}</p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeAttachment(attachment.id)}
                        className="h-7 w-7 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              <Button onClick={sendEmail} disabled={loading} className="flex items-center">
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                Send
              </Button>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                multiple
              />
              
              <Button variant="outline" onClick={triggerFileUpload} className="flex items-center">
                <Paperclip className="h-4 w-4 mr-2" />
                Attach
              </Button>

              {/* Drafts dropdown */}
              <Dropdown
                isOpen={showDraftsMenu}
                setIsOpen={setShowDraftsMenu}
                trigger={
                  <Button variant="outline" className="flex items-center">
                    <Save className="h-4 w-4 mr-2" />
                    Drafts
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                }
              >
                <div className="p-2">
                  <Button variant="secondary" className="w-full mb-2" onClick={saveDraft}>
                    Save current draft
                  </Button>
                  
                  <div className="text-sm font-medium mb-1 mt-3 text-muted-foreground">Saved Drafts</div>
                  
                  {savedDrafts.length > 0 ? (
                    <div className="max-h-[200px] overflow-y-auto">
                      {savedDrafts.map((draft) => (
                        <div 
                          key={draft.id}
                          className="p-2 hover:bg-muted rounded-sm cursor-pointer"
                          onClick={() => loadDraft(draft)}
                        >
                          <div className="font-medium text-sm truncate">{draft.subject}</div>
                          <div className="text-xs text-muted-foreground flex justify-between">
                            <span>{draft.to}</span>
                            <span>{draft.lastSaved}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground p-2">No saved drafts</div>
                  )}
                </div>
              </Dropdown>

              {/* Template dropdown */}
              <Dropdown
                isOpen={showTemplateSelector}
                setIsOpen={setShowTemplateSelector}
                trigger={
                  <Button variant="outline" className="flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Templates
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                }
              >
                <div className="p-2">
                  <div className="text-sm font-medium mb-1 text-muted-foreground">Templates</div>
                  {templates.map(template => (
                    <div 
                      key={template.id}
                      className="p-2 hover:bg-muted rounded-sm cursor-pointer flex items-center justify-between"
                      onClick={() => applyTemplate(template)}
                    >
                      <div>
                        <div className="font-medium text-sm">{template.name}</div>
                        <div className="text-xs text-muted-foreground">{template.category}</div>
                      </div>
                      {template.favorite && <Star className="h-4 w-4 text-amber-500" />}
                    </div>
                  ))}
                  <div className="mt-2 pt-2 border-t">
                    <Button variant="ghost" size="sm" className="w-full text-primary justify-start">
                      Manage templates...
                    </Button>
                  </div>
                </div>
              </Dropdown>

              {/* Schedule dropdown */}
              <Button 
                variant="outline" 
                onClick={() => setShowScheduler(!showScheduler)} 
                className="flex items-center relative"
              >
                <Clock className="h-4 w-4 mr-2" />
                Schedule
                {scheduledDate && (
                  <span className="ml-2 bg-primary/20 text-primary text-xs px-1.5 py-0.5 rounded-full">
                    {scheduledDate.toLocaleDateString()}
                  </span>
                )}
              </Button>
              {showScheduler && (
                <div className="absolute z-10 bg-white dark:bg-gray-800 shadow-lg border rounded-md mt-2">
                  <EmailScheduler onSchedule={scheduleEmail} onCancel={() => setShowScheduler(false)} />
                </div>
              )}

              {/* AI Assistant */}
              <Dropdown
                isOpen={false} // Using direct navigation now
                setIsOpen={() => {}}
                trigger={
                  <Button variant="outline" className="flex items-center group">
                    <BrainCircuit className="h-4 w-4 mr-2 text-primary group-hover:animate-pulse" />
                    AI Draft
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                }
              >
                <div className="p-2">
                  <div className="text-sm font-medium mb-2 text-muted-foreground">AI Email Generation</div>
                  <Button 
                    variant="secondary" 
                    className="w-full mb-2 justify-start" 
                    onClick={handleNavigateToQuickDraft}
                  >
                    <Wand className="h-4 w-4 mr-2" />
                    Quick Draft
                  </Button>
                  <Button 
                    variant="secondary" 
                    className="w-full mb-2 justify-start" 
                    onClick={handleNavigateToAdvancedDraft}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Advanced Draft
                  </Button>
                </div>
              </Dropdown>

              <Button variant="outline" onClick={handleDiscard} className="ml-auto">
                <Trash2 className="h-4 w-4 mr-2" />
                Discard
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}