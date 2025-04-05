import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, 
  Star, 
  Reply, 
  // Forward,  // Removed unused import
  Trash2, 
  Archive, 
  Printer, 
  AlertCircle, 
  Paperclip, 
  CornerUpRight,
  Sparkles,
  // PenTool, // Removed unused import
  // Save, // Removed unused import
  // Send, // Removed unused import
  // FileText, // Removed unused import
  UserPlus,
  Calendar,
  Clock,
  FileQuestion,
  CheckSquare,
  Share2,
  Timer,
  // FileQuestion, // Removed unused import
  // MessageSquare, // Removed unused import
  BarChart,
  // ExternalLink, // Removed unused import
  ShoppingCart,
  // ThumbsUp, // Removed unused import
  ClipboardList,
  Layers,
  // ChevronDown, // Removed unused import
  CheckCircle,
  Zap,
  // X, // Removed unused import
  // MoreHorizontal, // Removed unused import
  Loader2
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';

const EmailViewer = ({ 
  email, 
  onBack,
  onReply,
  onForward,
  onDelete,
  onArchive,
  onPrint,
  onGenerateSummary,
  onGenerateDraft
}) => {
  const navigate = useNavigate();
  const { success, info, /*error*/ } = useToast(); // Removed unused error
  const [emailSummary, setEmailSummary] = useState(email?.summary || null);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [featureInfoModalOpen, setFeatureInfoModalOpen] = useState(false);
  const [featureInfoContent, setFeatureInfoContent] = useState({ title: '', description: '', benefits: [], icon: null });
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRefs = useRef({});
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);

  useEffect(() => {
    function handleClickOutside(event) {
      let clickedInsideDropdown = false;
      
      Object.keys(dropdownRefs.current).forEach(key => {
        if (
          dropdownRefs.current[key] && 
          dropdownRefs.current[key].contains(event.target)
        ) {
          clickedInsideDropdown = true;
        }
      });
      
      if (!clickedInsideDropdown) {
        setOpenDropdown(null);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const showFeatureInfo = (title, description, benefits, icon) => {
    setFeatureInfoContent({
      title,
      description,
      benefits,
      icon
    });
    setFeatureInfoModalOpen(true);
  };

  const handleSalesCRMFeature = (feature) => {
    switch(feature) {
      case 'save-to-crm':
        showFeatureInfo(
          'Save to CRM',
          'This feature allows you to automatically add the email sender to your CRM system with all relevant contact details and interaction history.',
          [
            'Eliminate manual data entry, saving 2-3 minutes per contact',
            'Ensures no potential lead is ever lost due to follow-up failure',
            'Creates complete customer journeys by capturing all email interactions',
            'Increases sales conversion rates by up to 27% through better relationship management',
            'Integrates seamlessly with popular CRM platforms including Salesforce, HubSpot, and Zoho'
          ],
          <UserPlus className="h-8 w-8 text-blue-600" />
        );
        break;
      case 'schedule-followup':
        showFeatureInfo(
          'Schedule Follow-up',
          'Set automated reminders to follow up on important emails at the optimal time, ensuring no sales opportunity slips through the cracks.',
          [
            'Boost response rates by 42% through timely follow-ups',
            'Intelligently suggests optimal follow-up timing based on recipient behavior',
            'Creates a structured follow-up sequence for consistent communication',
            'Syncs with your calendar to schedule follow-ups during your available times',
            'Reduces sales cycle length by maintaining momentum in conversations'
          ],
          <Calendar className="h-8 w-8 text-cyan-600" />
        );
        break;
      case 'meeting-scheduler':
        showFeatureInfo(
          'Meeting Scheduler',
          'Insert your availability and scheduling link directly into emails, making it effortless for prospects to book time with you.',
          [
            'Reduces meeting scheduling time from 7+ emails to just 1',
            'Increases meeting booking rate by 35% through simplified scheduling',
            'Eliminates double-bookings with real-time calendar synchronization',
            'Sends automatic meeting confirmations and reminders to all participants',
            'Includes preparation materials and agenda templates for productive meetings'
          ],
          <Clock className="h-8 w-8 text-teal-600" />
        );
        break;
      case 'view-history':
        showFeatureInfo(
          'View Customer History',
          'Get instant access to a comprehensive view of all past interactions, purchases, and support inquiries from the email sender.',
          [
            'Provides critical context to personalize communication effectively',
            'Shows complete purchase history to identify upsell/cross-sell opportunities',
            'Displays all previous support issues to address ongoing concerns',
            'Reveals engagement patterns to tailor your approach to their preferences',
            'Increases deal size by 18% through informed, contextual selling'
          ],
          <BarChart className="h-8 w-8 text-indigo-600" />
        );
        break;
      case 'share-with-team':
        showFeatureInfo(
          'Share with Team',
          'Instantly share important customer communications with relevant team members, add collaborative notes, and assign action items.',
          [
            'Improves cross-departmental collaboration for complex sales situations',
            'Ensures consistent messaging across all customer touchpoints',
            'Enables team input on high-value opportunities',
            'Increases win rates by 23% for deals involving multiple stakeholders',
            'Maintains knowledge continuity even with staff changes'
          ],
          <Share2 className="h-8 w-8 text-pink-600" />
        );
        break;
      case 'sales-actions':
        showFeatureInfo(
          'Sales Actions',
          'Access a suite of sales acceleration tools from quotes to proposals directly from your email interface.',
          [
            'Generate professional quotes in seconds based on email content',
            'Create and track proposals with engagement analytics',
            'Add opportunities to your sales pipeline with a single click',
            'Send personalized product recommendations with embedded content',
            'Reduces sales cycle by 31% through streamlined processes'
          ],
          <ShoppingCart className="h-8 w-8 text-green-600" />
        );
        break;
      default:
        break;
    }
  };

  const handleProductivityFeature = (feature) => {
    switch(feature) {
      case 'create-task':
        showFeatureInfo(
          'Create Task',
          'Convert email content into actionable tasks with deadlines, assignees, and priority levels.',
          [
            'Transforms email commitments into tracked deliverables',
            'Reduces task creation time by 78% compared to manual entry',
            'Ensures nothing falls through the cracks with deadline tracking',
            'Integrates with project management tools like Asana, Trello, and Monday',
            'Increases team accountability and follow-through on commitments'
          ],
          <CheckSquare className="h-8 w-8 text-amber-600" />
        );
        break;
      case 'templates':
        showFeatureInfo(
          'Templates',
          'Access a library of customizable email templates for common business scenarios, personalized with recipient data.',
          [
            'Reduces response time from 15+ minutes to under 2 minutes',
            'Ensures consistent, professional messaging across all communications',
            'Includes industry-specific templates with proven high response rates',
            'A/B tested formats that increase engagement by up to 47%',
            'Templates evolve based on performance data to continuously improve results'
          ],
          <ClipboardList className="h-8 w-8 text-fuchsia-600" />
        );
        break;
      case 'schedule-send':
        showFeatureInfo(
          'Schedule Send',
          'Schedule emails to be sent at the optimal time for recipient engagement based on their time zone and past behavior.',
          [
            'Increases email open rates by 23% through optimal timing',
            'AI determines the best sending time based on recipient\'s past engagement',
            'Accounts for time zones to ensure business-hours delivery',
            'Avoids email fatigue by spacing communications appropriately',
            'Provides analytics on optimal sending patterns for different segments'
          ],
          <Timer className="h-8 w-8 text-red-600" />
        );
        break;
      case 'extract-analyze':
        showFeatureInfo(
          'Extract & Analyze',
          'Automatically extract key information from emails and analyze content to identify sales opportunities and content needs.',
          [
            'Identifies unarticulated needs based on contextual analysis',
            'Extracts actionable data points without manual review',
            'Suggests relevant content from your CMS that addresses email queries',
            'Recognizes buying signals with 92% accuracy to prioritize opportunities',
            'Feeds your content strategy by identifying frequently asked questions'
          ],
          <Layers className="h-8 w-8 text-emerald-600" />
        );
        break;
      case 'knowledge-base':
        showFeatureInfo(
          'Knowledge Base',
          'Access your company\'s knowledge base directly from the email interface to quickly find answers and resources.',
          [
            'Reduces response time by 68% by providing instant access to information',
            'Ensures accurate information sharing with customers',
            'Suggests relevant knowledge articles based on email content',
            'Allows quick insertion of documentation links into responses',
            'Tracks which knowledge resources are most frequently used to guide content development'
          ],
          <FileQuestion className="h-8 w-8 text-rose-600" />
        );
        break;
      default:
        break;
    }
  };

  const handleGenerateDraft = () => {
    if (typeof onGenerateDraft === 'function') {
      onGenerateDraft(email);
      return;
    }
    
    setIsGeneratingDraft(true);
    
    setTimeout(() => {
      setIsGeneratingDraft(false);
      success("AI Draft Created", { 
        description: "Your response draft has been generated successfully." 
      });
      info("Draft Ready", { 
        description: "The AI-generated draft is now available in your reply box." 
      });
    }, 2000);
  };

  const FeatureInfoModal = ({ isOpen, onClose, content }) => {
    if (!isOpen) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-background dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center mb-4">
              {content.icon}
              <h2 className="text-xl font-bold ml-3 text-foreground dark:text-white">{content.title}</h2>
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 mb-4">{content.description}</p>
            
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-foreground dark:text-white mb-2">Key Benefits</h3>
              <ul className="space-y-2">
                {content.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                <strong>Coming Soon:</strong> This feature is under development and will be available in our next release.
              </p>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!email) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-foreground dark:text-gray-100 mb-2">Email not found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">The email you're looking for doesn't exist or has been deleted.</p>
            <Button onClick={() => navigate('/email/inbox')}>
              Return to Inbox
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // Format the initials safely based on different possible from structures
  const getSenderInitials = () => {
    if (!email || !email.from) return '?';
    
    // Case 1: from is an object with name property
    if (typeof email.from === 'object' && email.from.name) {
      return email.from.name.split(' ').map(n => n[0]).join('');
    }
    
    // Case 2: from is a string that could be an email or name
    if (typeof email.from === 'string') {
      // Check if it looks like an email
      if (email.from.includes('@')) {
        // Extract the part before @ and use first letter
        return email.from.split('@')[0][0].toUpperCase();
      } else {
        // Treat as a name
        return email.from.split(' ').map(n => n[0]).join('');
      }
    }
    
    return '?';
  };

  // Get sender display name safely
  const getSenderName = () => {
    if (!email || !email.from) return 'Unknown Sender';
    
    if (typeof email.from === 'object' && email.from.name) {
      return email.from.name;
    }
    
    if (typeof email.from === 'string') {
      // If it has @, it's likely an email address
      if (email.from.includes('@')) {
        return email.from.split('@')[0].replace(/\./g, ' ');
      }
      return email.from;
    }
    
    return 'Unknown Sender';
  };

  // Get sender email safely
  const getSenderEmail = () => {
    if (!email || !email.from) return '';
    
    if (typeof email.from === 'object' && email.from.email) {
      return email.from.email;
    }
    
    if (typeof email.from === 'string' && email.from.includes('@')) {
      return email.from;
    }
    
    return '';
  };

  // Toggle star
  const toggleStar = () => {
    if (email.onToggleStar) {
      email.onToggleStar(!email.isStarred);
    }
    success({
      title: email.isStarred ? 'Unstarred' : 'Starred',
      description: `Email ${email.isStarred ? 'removed from' : 'added to'} starred`,
      type: 'success'
    });
  };

  // Handle generate summary
  const handleGenerateSummary = () => {
    if (onGenerateSummary) {
      onGenerateSummary();
      return;
    }

    setGeneratingSummary(true);
    info('Generating email summary...');
    
    // Simulate API call for demo
    setTimeout(() => {
      setGeneratingSummary(false);
      setEmailSummary(`This email is regarding ${email.subject || email.title || 'unknown subject'}. ${typeof email.from === 'object' ? `The sender ${email.from.name || 'unknown'}` : `From ${email.from || 'unknown sender'}`} ${email.summary || ''}`);
      success('Email summary generated successfully');
    }, 2000);
  };

  return (
    <Card className="w-full">
      <CardHeader className="border-b p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              className="mr-2" 
              onClick={onBack || (() => navigate(-1))}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <CardTitle className="text-xl">{email.subject}</CardTitle>
          </div>
          <div className="flex items-center space-x-1">
            {/* Action buttons */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => toggleStar()} 
              className={email.isStarred ? "text-yellow-500 hover:text-yellow-600" : "text-gray-500 hover:text-gray-600"}
            >
              <Star className="h-5 w-5" fill={email.isStarred ? "currentColor" : "none"} />
            </Button>
            
            {/* Add the Sales & CRM dropdown button */}
            <div className="relative" ref={el => dropdownRefs.current['salesCRM'] = el}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleDropdown('salesCRM')}
                className={openDropdown === 'salesCRM' 
                  ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300" 
                  : "text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"}
              >
                <ShoppingCart className="h-5 w-5" />
              </Button>
              
              {openDropdown === 'salesCRM' && (
                <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg z-20 bg-background dark:bg-gray-800 border border-border dark:border-gray-700">
                  <div className="py-1">
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 border-b border-border dark:border-gray-700">
                      Sales & CRM Actions
                    </div>
                    <button 
                      onClick={() => {
                        handleSalesCRMFeature('save-to-crm');
                        setOpenDropdown(null);
                      }}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <UserPlus className="h-4 w-4 mr-2 text-blue-600" />
                      <span>Save to CRM</span>
                    </button>
                    <button 
                      onClick={() => {
                        handleSalesCRMFeature('schedule-followup');
                        setOpenDropdown(null);
                      }}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Calendar className="h-4 w-4 mr-2 text-cyan-600" />
                      <span>Schedule Follow-up</span>
                    </button>
                    <button 
                      onClick={() => {
                        handleSalesCRMFeature('meeting-scheduler');
                        setOpenDropdown(null);
                      }}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Clock className="h-4 w-4 mr-2 text-teal-600" />
                      <span>Meeting Scheduler</span>
                    </button>
                    <button 
                      onClick={() => {
                        handleSalesCRMFeature('view-history');
                        setOpenDropdown(null);
                      }}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <BarChart className="h-4 w-4 mr-2 text-indigo-600" />
                      <span>View History</span>
                    </button>
                    <button 
                      onClick={() => {
                        handleSalesCRMFeature('share-with-team');
                        setOpenDropdown(null);
                      }}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Share2 className="h-4 w-4 mr-2 text-pink-600" />
                      <span>Share with Team</span>
                    </button>
                    <button 
                      onClick={() => {
                        handleSalesCRMFeature('sales-actions');
                        setOpenDropdown(null);
                      }}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2 text-green-600" />
                      <span>Sales Actions</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Add the Productivity dropdown button */}
            <div className="relative" ref={el => dropdownRefs.current['productivity'] = el}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleDropdown('productivity')}
                className={openDropdown === 'productivity' 
                  ? "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300" 
                  : "text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"}
              >
                <Zap className="h-5 w-5" />
              </Button>
              
              {openDropdown === 'productivity' && (
                <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg z-20 bg-background dark:bg-gray-800 border border-border dark:border-gray-700">
                  <div className="py-1">
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 border-b border-border dark:border-gray-700">
                      Productivity Actions
                    </div>
                    <button 
                      onClick={() => {
                        handleProductivityFeature('create-task');
                        setOpenDropdown(null);
                      }}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <CheckSquare className="h-4 w-4 mr-2 text-amber-600" />
                      <span>Create Task</span>
                    </button>
                    <button 
                      onClick={() => {
                        handleProductivityFeature('templates');
                        setOpenDropdown(null);
                      }}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <ClipboardList className="h-4 w-4 mr-2 text-fuchsia-600" />
                      <span>Templates</span>
                    </button>
                    <button 
                      onClick={() => {
                        handleProductivityFeature('schedule-send');
                        setOpenDropdown(null);
                      }}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Timer className="h-4 w-4 mr-2 text-red-600" />
                      <span>Schedule Send</span>
                    </button>
                    <button 
                      onClick={() => {
                        handleProductivityFeature('extract-analyze');
                        setOpenDropdown(null);
                      }}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Layers className="h-4 w-4 mr-2 text-emerald-600" />
                      <span>Extract & Analyze</span>
                    </button>
                    <button 
                      onClick={() => {
                        handleProductivityFeature('knowledge-base');
                        setOpenDropdown(null);
                      }}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <FileQuestion className="h-4 w-4 mr-2 text-rose-600" />
                      <span>Knowledge Base</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <Button
              onClick={handleGenerateDraft}
              disabled={isGeneratingDraft}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isGeneratingDraft ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Draft...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate AI Draft
                </>
              )}
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onDelete || (() => {})}
            >
              <Trash2 className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onArchive || (() => {})}
            >
              <Archive className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onPrint || (() => window.print())}
            >
              <Printer className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Sender Info */}
        <div className="p-4 border-b">
          <div className="flex items-start">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium text-lg mr-3">
              {getSenderInitials()}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-base">{getSenderName()}</h3>
                  {getSenderEmail() && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">{getSenderEmail()}</p>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  {email.date}
                </div>
              </div>
              <div className="mt-1 text-sm">
                <span className="text-gray-600 dark:text-gray-400">To: </span>
                {email.to ? (
                  Array.isArray(email.to) 
                    ? email.to.map(recipient => typeof recipient === 'object' ? (recipient.name || recipient.email) : recipient).join(', ')
                    : email.to
                ) : 'No recipients'}
              </div>
              {email.labels && email.labels.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {email.labels.map((label, index) => (
                    <span 
                      key={index}
                      className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Generate Summary Button */}
        <div className="flex justify-end p-2 border-b">
          {!emailSummary && !generatingSummary && (
            <Button
              size="sm"
              variant="outline"
              className="text-blue-600 border-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-blue-900/20"
              onClick={handleGenerateSummary}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Summary
            </Button>
          )}
          {generatingSummary && (
            <Button
              size="sm"
              variant="outline"
              className="text-blue-600 border-blue-600 cursor-not-allowed opacity-70"
              disabled
            >
              <Sparkles className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </Button>
          )}
        </div>

        {/* Email Summary (if available) */}
        {emailSummary && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-b">
            <h3 className="font-medium text-sm text-blue-700 dark:text-blue-300 mb-1">Email Summary</h3>
            <p className="text-sm text-blue-600 dark:text-blue-200">{emailSummary}</p>
          </div>
        )}

        {/* Email Body */}
        <div className="p-4">
          <div 
            className="prose prose-sm max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: email.body || email.summary || 'No content available' }}
          />
        </div>

        {/* Attachments */}
        {email.attachments && email.attachments.length > 0 && (
          <div className="p-4 border-t">
            <h3 className="font-medium text-sm mb-2">
              Attachments ({email.attachments.length})
            </h3>
            <div className="space-y-2">
              {email.attachments.map((attachment) => (
                <div 
                  key={attachment.id}
                  className="flex items-center p-2 border rounded-md"
                >
                  <Paperclip className="h-4 w-4 text-gray-500 mr-2" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{attachment.filename}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(attachment.size)}</p>
                  </div>
                  <Button 
                    size="sm"
                    variant="outline"
                    className="text-blue-600 border-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-blue-900/20"
                  >
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Primary Actions */}
        <div className="p-4 border-t">
          <h3 className="font-medium text-sm mb-3">Primary Actions</h3>
          <div className="flex space-x-2">
            <Button 
              className="flex items-center"
              onClick={onReply || (() => {})}
            >
              <Reply className="h-4 w-4 mr-2" />
              Reply
            </Button>
            <Button 
              variant="outline"
              className="flex items-center"
              onClick={onForward || (() => {})}
            >
              <CornerUpRight className="h-4 w-4 mr-2" />
              Forward
            </Button>
            <Button 
              variant="outline"
              className="flex items-center"
              onClick={onPrint || (() => window.print())}
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div>
        </div>
      </CardContent>
      {/* Feature Info Modal */}
      <FeatureInfoModal 
        isOpen={featureInfoModalOpen} 
        onClose={() => setFeatureInfoModalOpen(false)} 
        content={featureInfoContent} 
      />
    </Card>
  );
};

export default EmailViewer; 