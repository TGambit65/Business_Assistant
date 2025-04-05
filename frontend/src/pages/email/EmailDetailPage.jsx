import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import EmailViewer from '../../components/email/EmailViewer';
import RichTextEditor from '../../components/RichTextEditor';
import {
  // MoreHorizontal, // Removed unused import
  // Reply, // Keep Reply
  // Forward, // Keep Forward commented
  // Archive, Trash2, Star,
  // Tags, // Keep Tags commented
  Sparkles,
  ChevronDown,
  // AlertTriangle, // Restore AlertTriangle
  // Clock, // Restore Clock
  // Calendar, // Restore Calendar
  // Share2, // Restore Share2
  FileText, // Restore FileText
  // Loader2, // Restore Loader2
  // MoreVertical, // Keep MoreVertical commented
  // ReplyAll, // Keep ReplyAll commented
  // Trash // Keep Trash commented
} from 'lucide-react';
import { Button } from '../../components/ui/button';

const EmailDetailPage = () => {
  const { emailId } = useParams();
  const navigate = useNavigate();
  const { success, error } = useToast();
  const { user } = useAuth();
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(true);
// eslint-disable-next-line no-unused-vars
  const [errorMessage, setErrorMessage] = useState(null); // Removed unused state
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showForwardForm, setShowForwardForm] = useState(false);
  const [editorContent, setEditorContent] = useState('');
  const [forwardTo, setForwardTo] = useState('');
// eslint-disable-next-line no-unused-vars
  const [isDarkMode, setIsDarkMode] = useState(false); // Removed unused state
  const [showDraftOptions, setShowDraftOptions] = useState(false);
// eslint-disable-next-line no-unused-vars
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false); // Removed unused state

  // Fetch email details
  useEffect(() => {
    const fetchEmailDetails = () => {
      setLoading(true);
      setErrorMessage(null);
      
      // In a real app, this would fetch from an API
      setTimeout(() => {
        try {
          // This is where you'd make an API call in a real application
          // For demo purposes, we're using a static email object
          const emailData = {
            id: parseInt(emailId),
            from: { email: 'sender@example.com', name: 'John Doe' },
            to: [{ email: 'me@example.com', name: 'Me' }],
            cc: [],
            subject: 'Important Project Update',
            date: 'Sep 16, 2023 10:30 AM',
            isRead: true,
            isStarred: false,
            isImportant: true,
            hasAttachments: true,
            category: 'inbox',
            labels: ['work', 'project'],
            attachments: [
              { id: 1, filename: 'project-proposal.pdf', size: 2500000 },
              { id: 2, filename: 'timeline.xlsx', size: 1200000 }
            ],
            body: `
              <div>
                <p>Hi there,</p>
                <p>I wanted to share some important updates about our ongoing project:</p>
                <ol>
                  <li>We've completed the initial phase ahead of schedule.</li>
                  <li>The client feedback has been very positive about the designs.</li>
                  <li>We need to schedule a team meeting to discuss the next steps.</li>
                </ol>
                <p>Please review the attached documents and let me know your thoughts.</p>
                <p>
                  <strong>Next Steps:</strong><br>
                  - Review the proposal<br>
                  - Schedule a team meeting<br>
                  - Prepare for the client presentation
                </p>
                <p>Best regards,<br>John</p>
              </div>
            `
          };
          
          if (!emailData) {
            throw new Error('Email data not available');
          }
          
          setEmail(emailData);
          setLoading(false);
        } catch (err) {
          setLoading(false);
          setEmail(null);
          setErrorMessage('Failed to load email details. Please try again.');
          error({
            title: 'Error',
            description: 'Could not load email data. Please try again.',
            type: 'error'
          });
        }
      }, 500);
    };
    
    fetchEmailDetails();
  }, [emailId, error]);

  // Handle reply
  const handleReply = () => {
    setShowReplyForm(!showReplyForm);
    if (showForwardForm) setShowForwardForm(false);
    
    if (!showReplyForm && email) {
      // Prepare reply template with signature and quoted content
      const replyTemplate = `<p>Hi ${email.from.name.split(' ')[0]},</p>
<p>Thanks for your email.</p>
<p><br></p>
<p>Best regards,</p>
<p>Your Name</p>
<p><br></p>
<hr>
<p>On ${email.date}, ${email.from.name} &lt;${email.from.email}&gt; wrote:</p>
<blockquote style="border-left: 2px solid #ccc; padding-left: 10px; margin-left: 10px; color: #555;">
${email.body}
</blockquote>`;
      
      setEditorContent(replyTemplate);
    }
  };

  // Handle forward
  const handleForward = () => {
    setShowForwardForm(!showForwardForm);
    if (showReplyForm) setShowReplyForm(false);
    
    if (!showForwardForm && email) {
      // Prepare forward template
      const forwardTemplate = `<p>FYI, please see the email below.</p>
<p><br></p>
<p>Best regards,</p>
<p>Your Name</p>
<p><br></p>
<hr>
<p><strong>From:</strong> ${email.from.name} &lt;${email.from.email}&gt;</p>
<p><strong>Date:</strong> ${email.date}</p>
<p><strong>Subject:</strong> ${email.subject}</p>
<p><strong>To:</strong> ${email.to.map(recipient => `${recipient.name} <${recipient.email}>`).join(', ')}</p>
${email.cc.length > 0 ? `<p><strong>Cc:</strong> ${email.cc.map(recipient => `${recipient.name} <${recipient.email}>`).join(', ')}</p>` : ''}
<p><br></p>
${email.body}`;
      
      setEditorContent(forwardTemplate);
    }
  };

  // Handle delete
  const handleDelete = () => {
    success({
      title: 'Deleted',
      description: 'Email moved to trash',
      type: 'success'
    });
    navigate('/email/inbox');
  };

  // Handle archive
  const handleArchive = () => {
    success({
      title: 'Archived',
      description: 'Email archived',
      type: 'success'
    });
    navigate('/email/inbox');
  };

  // Toggle star
  const handleToggleStar = (isStarred) => {
    setEmail(prev => ({ ...prev, isStarred }));
  };

  // Handle editor content change
  const handleEditorChange = (content) => {
    setEditorContent(content);
  };

  // Handle send reply
  const handleSendReply = () => {
    success({
      title: 'Email Sent',
      description: 'Your reply has been sent successfully',
      type: 'success'
    });
    setShowReplyForm(false);
    setShowForwardForm(false);
  };

  // Handle send forward
  const handleSendForward = () => {
    if (!forwardTo.trim()) {
      error({
        title: 'Error',
        description: 'Please enter a recipient email address',
        type: 'error'
      });
      return;
    }
    
    success({
      title: 'Email Forwarded',
      description: 'Your email has been forwarded successfully',
      type: 'success'
    });
    setShowForwardForm(false);
    setForwardTo('');
  };

  // Add function to handle quick draft generation
  const handleGenerateQuickDraft = () => {
    setShowDraftOptions(false);
    setIsGeneratingDraft(true);
    
    // In a real implementation, this would call the AI API
    // For demo purposes, we'll use a timeout to simulate the API call
    setTimeout(() => {
      try {
        // Generate a simple draft based on the email
        const draftSubject = `Re: ${email.subject}`;
        const draftBody = `
Dear ${email.from.name},

Thank you for your email regarding "${email.subject}".

[Quick AI-generated response based on your email content]

Best regards,
${user?.displayName || '[Your Name]'}
${user?.position ? user.position : ''}
`;
        
        // Store the draft in localStorage
        const draft = {
          id: `draft-${Date.now()}`,
          subject: draftSubject,
          body: draftBody,
          to: email.from.email,
          from: {
            email: user?.email || 'user@example.com',
            name: user?.displayName || 'User'
          },
          created: new Date().toISOString()
        };
        
        // Save to drafts (in a real app, this would save to a database)
        let drafts = JSON.parse(localStorage.getItem('drafts') || '[]');
        drafts.push(draft);
        localStorage.setItem('drafts', JSON.stringify(drafts));
        
        // Show success message
        success('Draft created successfully!');
        
        // Ask if user wants to navigate to compose
        if (window.confirm('Draft created! Would you like to open it in the compose page?')) {
          navigate(`/email/compose?draftId=${draft.id}`);
        }
        
        setIsGeneratingDraft(false);
      } catch (error) {
        console.error('Error generating draft:', error);
        error('Failed to generate draft');
        setIsGeneratingDraft(false);
      }
    }, 1500);
  };
  
  // Add function to navigate to the advanced draft generator
  const handleNavigateToAdvancedDraft = () => {
    setShowDraftOptions(false);
    
    // Save the email context to localStorage for the draft generator to use
    const sourceEmail = {
      id: email.id,
      subject: email.subject,
      from: email.from,
      body: email.body,
      type: 'reply'
    };
    
    localStorage.setItem('sourceEmail', JSON.stringify(sourceEmail));
    
    // Navigate to the draft generator page
    navigate('/email/draft-generator');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <EmailViewer 
          email={{
            ...email,
            onToggleStar: handleToggleStar
          }}
          onReply={handleReply}
          onForward={handleForward}
          onDelete={handleDelete}
          onArchive={handleArchive}
          onBack={() => navigate('/email/inbox')}
        />
      </div>

      {/* Reply form */}
      {showReplyForm && (
        <div className="mt-4">
          <div className="bg-background dark:bg-gray-800 border rounded-lg shadow-sm p-4">
            <h3 className="font-medium text-lg mb-4">Reply to {email.from.name}</h3>
            <RichTextEditor
              initialContent={editorContent}
              onChange={handleEditorChange}
              onSave={handleSendReply}
              onCancel={() => setShowReplyForm(false)}
              showButtons={true}
              darkMode={isDarkMode}
            />
          </div>
        </div>
      )}

      {/* Forward form */}
      {showForwardForm && (
        <div className="mt-4">
          <div className="bg-background dark:bg-gray-800 border rounded-lg shadow-sm p-4">
            <h3 className="font-medium text-lg mb-4">Forward Email</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                To:
              </label>
              <input
                type="email"
                value={forwardTo}
                onChange={(e) => setForwardTo(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="Enter recipient email"
              />
            </div>
            <RichTextEditor
              initialContent={editorContent}
              onChange={handleEditorChange}
              onSave={handleSendForward}
              onCancel={() => setShowForwardForm(false)}
              showButtons={true}
              darkMode={isDarkMode}
            />
          </div>
        </div>
      )}

      {/* Draft options */}
      <div className="relative inline-block">
        <Button 
          variant="outline" 
          onClick={() => setShowDraftOptions(!showDraftOptions)}
          className="flex items-center gap-2"
        >
          <Sparkles className="h-4 w-4 text-primary" />
          Generate Draft
          <ChevronDown className="h-3 w-3" />
        </Button>
        
        {showDraftOptions && (
          <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-background dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
            <div className="py-1" role="menu">
              <button
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => {
                  setShowDraftOptions(false);
                  handleGenerateQuickDraft(email);
                }}
              >
                <Sparkles className="h-4 w-4 mr-2 text-primary" />
                Quick Draft
              </button>
              <button
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => {
                  setShowDraftOptions(false);
                  handleNavigateToAdvancedDraft(email);
                }}
              >
                <FileText className="h-4 w-4 mr-2 text-primary" />
                Advanced Draft
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailDetailPage; 