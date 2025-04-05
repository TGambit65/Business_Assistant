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
    setEmailData({ to: draft.to === '(No recipient)' ? '' : draft.to, cc: '', bcc: '', subject: draft.subject === '(No subject)' ? '' : draft.subject, body: draft.body || '', attachments: [] });
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
    if (!emailData.to) { warning('Please specify at least one recipient'); return; }
    if (!emailData.subject) { if (!window.confirm('Send without subject?')) return; }
    setLoading(true);
    setTimeout(() => { // Simulate API call
      setLoading(false); success('Email sent successfully');
      setEmailData({ to: '', cc: '', bcc: '', subject: '', body: '', attachments: [] });
      navigate('/email/inbox'); // Navigate after sending
    }, 1500);
  };

  // Send scheduled email
  const sendScheduledEmail = (time) => {
    if (!emailData.to) { warning('Please specify at least one recipient'); return; }
    if (!emailData.subject) { warning('Please add a subject for scheduled emails'); return; }
    setScheduledDate(time); setShowScheduler(false);
    success(`Email scheduled for ${time.toLocaleString()}`);
    // Add actual scheduling logic here
  };

  // Handle discard draft
  const discardDraft = () => {
    if (emailData.to || emailData.subject || emailData.body) { if (!window.confirm('Discard this draft?')) return; }
    setEmailData({ to: '', cc: '', bcc: '', subject: '', body: '', attachments: [] });
    info('Draft discarded');
  };

  // Navigation handlers (Keep existing)
  const handleNavigateToQuickDraft = () => { navigateTo('/email/draft-generator', { mode: 'quick' }); };
  const handleNavigateToAdvancedDraft = () => { navigateTo('/email/draft-generator', { mode: 'advanced' }); };

  // Toggle fullscreen mode
  const toggleFullScreen = () => { setIsFullScreen(!isFullScreen); };

  // Trigger file input click
  const triggerFileUpload = () => { if (fileInputRef.current) { fileInputRef.current.click(); } };

  return (
    <div className={`compose-page transition-all duration-200 ${isFullScreen ? 'fixed inset-0 z-50 bg-background p-4' : ''}`}>
      <Card className={`${isFullScreen ? 'h-full flex flex-col' : ''}`}>
        <CardHeader className="pb-3 shrink-0">
          <div className="flex justify-between items-center">
            <CardTitle>Compose Email</CardTitle>
            <div className="flex space-x-2">
              <Button variant="ghost" size="icon" onClick={toggleFullScreen} aria-label={isFullScreen ? 'Exit fullscreen' : 'Enter fullscreen'}>
                {isFullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className={`flex-1 overflow-y-auto ${isFullScreen ? 'p-4' : 'pt-4'}`}> {/* Adjust padding */}
          <form className="space-y-4">
            <div>
              <Label htmlFor="compose-to">To</Label>
              <Input id="compose-to" type="text" name="to" value={emailData.to} onChange={handleInputChange} className="mt-1" placeholder="recipient@example.com" />
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <Label htmlFor="compose-cc">Cc</Label>
                <Input id="compose-cc" type="text" name="cc" value={emailData.cc} onChange={handleInputChange} className="mt-1" placeholder="cc@example.com" />
              </div>
              <div className="flex-1 min-w-[200px]">
                <Label htmlFor="compose-bcc">Bcc</Label>
                <Input id="compose-bcc" type="text" name="bcc" value={emailData.bcc} onChange={handleInputChange} className="mt-1" placeholder="bcc@example.com" />
              </div>
            </div>

            <div>
              <Label htmlFor="compose-subject">Subject</Label>
              <Input id="compose-subject" type="text" name="subject" value={emailData.subject} onChange={handleInputChange} className="mt-1" placeholder="Email subject" />
            </div>

            <div>
              <Label className="block mb-1">Message</Label>
              <EmailEditor
                initialContent={emailData.body} // Use state for initial content
                onChange={handleEditorChange}
                placeholder="Compose your email..."
              />
            </div>

            {/* Attachments */}
            {emailData.attachments.length > 0 && (
              <div className="border border-border rounded-md p-3 bg-secondary/50"> {/* Use theme colors */}
                <h3 className="text-sm font-medium mb-2 flex items-center text-foreground">
                  <Paperclip size={16} className="mr-2" />
                  Attachments ({emailData.attachments.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {emailData.attachments.map(attachment => (
                    <div key={attachment.id} className="flex items-center bg-background px-3 py-1.5 rounded text-sm border border-border">
                      <div className="flex-1 mr-2">
                        <div className="font-medium truncate max-w-[200px]">{attachment.name}</div>
                        <div className="text-xs text-muted-foreground">{formatFileSize(attachment.size)}</div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => removeAttachment(attachment.id)}>
                        <X size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom toolbar */}
            <div className="flex flex-wrap gap-2 justify-between items-center pt-3 border-t border-border">
              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={sendEmail} disabled={loading}>
                  {loading ? <><Loader2 size={16} className="mr-2 animate-spin" /> Sending...</> : <><Send size={16} className="mr-2" /> Send</>}
                </Button>

                {/* Schedule Button */}
                 <Button type="button" variant="outline" onClick={() => setShowScheduler(true)}>
                   <Clock size={16} className="mr-2" /> Schedule
                 </Button>

                {/* Attach File Button */}
                <Button type="button" variant="outline" onClick={triggerFileUpload}>
                  <Paperclip size={16} className="mr-2" /> Attach
                </Button>
                <input type="file" ref={fileInputRef} onChange={handleFileSelect} multiple className="hidden" />

                {/* Templates Dropdown */}
                <Dropdown isOpen={showTemplateSelector} setIsOpen={setShowTemplateSelector} trigger={
                  <Button type="button" variant="outline">
                    Templates <ChevronDown size={16} className="ml-2" />
                  </Button>
                }>
                  <div className="p-2 max-h-60 overflow-y-auto">
                    {templates.length > 0 ? templates.map(template => (
                      <button key={template.id} onClick={() => applyTemplate(template)} className="block w-full text-left px-3 py-1.5 text-sm rounded hover:bg-accent">
                        {template.name} {template.favorite && <Star size={12} className="inline ml-1 text-yellow-400 fill-yellow-400"/>}
                      </button>
                    )) : <div className="px-3 py-1.5 text-sm text-muted-foreground">No templates found.</div>}
                  </div>
                </Dropdown>

                 {/* Drafts Dropdown */}
                 <Dropdown isOpen={showDraftsMenu} setIsOpen={setShowDraftsMenu} trigger={
                   <Button type="button" variant="outline">
                     Drafts <ChevronDown size={16} className="ml-2" />
                   </Button>
                 }>
                   <div className="p-2 max-h-60 overflow-y-auto">
                     {savedDrafts.length > 0 ? savedDrafts.map(draft => (
                       <div key={draft.id} className="flex items-center justify-between hover:bg-accent rounded px-3 py-1.5">
                         <button onClick={() => loadDraft(draft)} className="flex-1 text-left text-sm mr-2 truncate" title={draft.subject}>
                           {draft.subject} <span className="text-xs text-muted-foreground">({draft.lastSaved})</span>
                         </button>
                         <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => deleteDraft(draft.id)}>
                           <Trash2 size={14} />
                         </Button>
                       </div>
                     )) : <div className="px-3 py-1.5 text-sm text-muted-foreground">No saved drafts.</div>}
                     <div className="border-t border-border mt-1 pt-1">
                        <Button variant="ghost" size="sm" className="w-full justify-start" onClick={saveDraft}>
                            <Save size={14} className="mr-2"/> Save Current Draft
                        </Button>
                     </div>
                   </div>
                 </Dropdown>

                 {/* AI Assistant Options */}
                 <Dropdown isOpen={false} setIsOpen={() => {}} trigger={ // Placeholder state for now
                    <Button type="button" variant="outline">
                        <Sparkles size={16} className="mr-2" /> AI Assist <ChevronDown size={16} className="ml-2" />
                    </Button>
                 }>
                    <div className="p-1">
                        <button onClick={handleNavigateToQuickDraft} className="block w-full text-left px-3 py-1.5 text-sm rounded hover:bg-accent flex items-center">
                            <Wand size={14} className="mr-2"/> Quick Draft
                        </button>
                         <button onClick={handleNavigateToAdvancedDraft} className="block w-full text-left px-3 py-1.5 text-sm rounded hover:bg-accent flex items-center">
                            <BrainCircuit size={14} className="mr-2"/> Advanced Draft
                        </button>
                    </div>
                 </Dropdown>

              </div>

              {/* Discard Button */}
              <div>
                <Button type="button" variant="ghost" size="icon" onClick={discardDraft} title="Discard Draft">
                  <Trash2 size={18} />
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Scheduler Modal */}
      {showScheduler && (
        <EmailScheduler
          isOpen={showScheduler}
          onClose={() => setShowScheduler(false)}
          onSchedule={sendScheduledEmail}
          currentScheduledDate={scheduledDate}
        />
      )}
    </div>
  );
}