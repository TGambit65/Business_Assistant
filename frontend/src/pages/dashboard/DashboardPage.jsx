import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useToast } from '../../contexts/ToastContext';
import FileSummary from '../../components/icons/FileSummary';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { 
  BarChart3, 
  Clock, 
  Users, 
  Sparkles, 
  Mic, 
  Send, 
  Volume2, 
  Languages, 
  Maximize2, 
  Minimize2, 
  Loader2,
  Mail,
  FileText,
  AlertCircle,
  Tag,
  Settings,
  Calendar,
  PenTool,
  Archive,
  Search,
  Filter,
  UserPlus,
  Bell,
  Zap,
  ArrowRight,
  CheckCircle,
  Flag,
  Star,
  MessageSquare,
  SortAsc,
  Layers,
  Edit,
  Plus,
  X,
  Save,
  RotateCcw,
  Move,
  Trash2,
  Lightbulb,
  Reply,
  Forward,
  Printer,
  CheckSquare,
  Share2,
  Timer,
  FileQuestion,
  ExternalLink,
  ShoppingCart,
  ThumbsUp,
  ClipboardList,
  MoreHorizontal,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import EmailViewer from '../../components/email/EmailViewer';
import DeepseekChatService from '../../services/DeepseekChatService';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { success, info, error, warning } = useToast();
  
  // State for toggling between Urgent Actions and Email Summaries
  const [showSummaries, setShowSummaries] = useState(false);
  const [generatingSummaries, setGeneratingSummaries] = useState(false);
  const [emailSummaries, setEmailSummaries] = useState([]);
  
  // State for Quick Access customization
  const [isEditingQuickAccess, setIsEditingQuickAccess] = useState(false);
  const [showAddActionForm, setShowAddActionForm] = useState(false);
  const [newActionName, setNewActionName] = useState('');
  const [newActionIcon, setNewActionIcon] = useState('Mail');
  const [newActionColor, setNewActionColor] = useState('bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400');
  const [newActionPath, setNewActionPath] = useState('');

  // Memoize defaultQuickAccessItems to prevent unnecessary re-renders
  const defaultQuickAccessItems = useMemo(() => [
    { 
      icon: <Calendar size={20} />, 
      label: 'Schedule', 
      color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
      action: () => info('Calendar feature coming soon'),
      path: null,
      isDefault: true
    },
    { 
      icon: <Search size={20} />, 
      label: 'Search Inbox', 
      color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
      action: () => navigate('/email/inbox?search=true'),
      path: '/email/inbox?search=true',
      isDefault: true
    },
    { 
      icon: <Mail size={20} />, 
      label: 'Compose Email', 
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
      action: () => navigate('/email/compose'),
      path: '/email/compose',
      isDefault: true
    },
    { 
      icon: <FileText size={20} />, 
      label: 'Draft Generator', 
      color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
      action: () => navigate('/email/draft-generator'),
      path: '/email/draft-generator',
      isDefault: true
    },
    { 
      icon: <Tag size={20} />, 
      label: 'Manage Labels', 
      color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
      action: () => navigate('/email/rules'),
      path: '/email/rules',
      isDefault: true
    },
    { 
      icon: <PenTool size={20} />, 
      label: 'Templates', 
      color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400',
      action: () => navigate('/email/templates'),
      path: '/email/templates',
      isDefault: true
    },
    { 
      icon: <Settings size={20} />, 
      label: 'Signatures', 
      color: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
      action: () => navigate('/email/signatures'),
      path: '/email/signatures',
      isDefault: true
    },
    {
      icon: <BarChart3 size={20} />,
      label: 'Analytics',
      color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
      action: () => navigate('/dashboard/analytics'),
      path: '/dashboard/analytics',
      isDefault: true
    }
  ], []);
  
  // Custom user-defined quick access items stored in local storage
  const [customQuickAccessItems, setCustomQuickAccessItems] = useState(() => {
    const savedItems = localStorage.getItem('customQuickAccessItems');
    return savedItems ? JSON.parse(savedItems) : [];
  });
  
  // Combined default and custom items for display
  const [quickAccessItems, setQuickAccessItems] = useState([]);
  
  // Available icons for custom actions
  const availableIcons = {
    Mail: <Mail size={20} />,
    Calendar: <Calendar size={20} />,
    Search: <Search size={20} />,
    FileText: <FileText size={20} />,
    Tag: <Tag size={20} />,
    PenTool: <PenTool size={20} />,
    Settings: <Settings size={20} />,
    BarChart3: <BarChart3 size={20} />,
    Star: <Star size={20} />,
    Flag: <Flag size={20} />,
    CheckCircle: <CheckCircle size={20} />,
    AlertCircle: <AlertCircle size={20} />,
    SortAsc: <SortAsc size={20} />,
    Sparkles: <Sparkles size={20} />
  };
  
  // Available colors for custom actions
  const availableColors = [
    { name: 'Blue', value: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
    { name: 'Green', value: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
    { name: 'Red', value: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
    { name: 'Purple', value: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
    { name: 'Yellow', value: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' },
    { name: 'Orange', value: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' },
    { name: 'Teal', value: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400' },
    { name: 'Pink', value: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400' },
    { name: 'Indigo', value: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' },
    { name: 'Gray', value: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300' }
  ];
  
  // Initialize combined items on first render
  useEffect(() => {
    setQuickAccessItems(defaultQuickAccessItems);
  }, [defaultQuickAccessItems]);
  
  // Save custom items to local storage when they change
  useEffect(() => {
    localStorage.setItem('customQuickAccessItems', JSON.stringify(customQuickAccessItems));
  }, [customQuickAccessItems]);
  
  // Save order to local storage when items change
  useEffect(() => {
    if (quickAccessItems.length > 0) {
      const order = quickAccessItems.map(item => item.label);
      localStorage.setItem('quickAccessOrder', JSON.stringify(order));
    }
  }, [quickAccessItems]);

  // Handle drag and drop reordering
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(quickAccessItems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setQuickAccessItems(items);
  };
  
  // Handle adding a new custom action
  const handleAddCustomAction = () => {
    if (!newActionName.trim()) {
      warning('Please enter an action name');
      return;
    }
    
    const newAction = {
      icon: availableIcons[newActionIcon] || <Mail size={20} />,
      iconName: newActionIcon,
      label: newActionName,
      color: newActionColor,
      path: newActionPath,
      action: newActionPath ? () => navigate(newActionPath) : () => info(`${newActionName} clicked`),
      isDefault: false
    };
    
    setCustomQuickAccessItems(prev => [...prev, newAction]);
    setQuickAccessItems(prev => [...prev, newAction]);
    
    // Reset form
    setNewActionName('');
    setNewActionIcon('Mail');
    setNewActionColor('bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400');
    setNewActionPath('');
    setShowAddActionForm(false);
    
    success('Custom action added successfully');
  };
  
  // Handle deleting an action
  const handleDeleteAction = (index) => {
    const itemToDelete = quickAccessItems[index];
    
    if (itemToDelete.isDefault) {
      // Remove default item from display but don't delete from defaults
      const newItems = quickAccessItems.filter((_, i) => i !== index);
      setQuickAccessItems(newItems);
    } else {
      // Remove custom item completely
      const newItems = quickAccessItems.filter((_, i) => i !== index);
      setQuickAccessItems(newItems);
      
      setCustomQuickAccessItems(prev => 
        prev.filter(item => item.label !== itemToDelete.label)
      );
    }
    
    success(`Removed "${itemToDelete.label}" from Quick Access`);
  };
  
  // Restore all default actions
  const handleRestoreDefaults = () => {
    // Get current custom items
    const customItems = quickAccessItems.filter(item => !item.isDefault);
    
    // Combine defaults and current custom items
    const restoredItems = [...defaultQuickAccessItems, ...customItems];
    setQuickAccessItems(restoredItems);
    
    success('Default Quick Access items restored');
  };
  
  // Toggle editing mode
  const toggleEditMode = () => {
    setIsEditingQuickAccess(!isEditingQuickAccess);
    if (showAddActionForm) {
      setShowAddActionForm(false);
    }
  };

  // AI Chat state
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [showAIChat, setShowAIChat] = useState(false);
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const inputRef = useRef(null);
  const isDesktop = useRef(window.innerWidth >= 1024);
  
  // Set showAIChat to true on desktop by default
  useEffect(() => {
    const handleResize = () => {
      // Consider desktop/tablet as devices with width >= 768px
      const desktop = window.innerWidth >= 768;
      isDesktop.current = desktop;
      
      // Auto-show chat on desktop/tablet
      if (desktop) {
        setShowAIChat(true);
      }
    };
    
    // Set initial state
    handleResize();
    
    // Add resize listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Language options
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ar', name: 'Arabic' },
    { code: 'ru', name: 'Russian' },
    { code: 'hi', name: 'Hindi' },
    { code: 'pt', name: 'Portuguese' }
  ];
  
  // Urgent actions data (in a real app, these would come from an API)
  const urgentActions = [
    {
      id: 1,
      type: 'email',
      title: 'Response needed: Contract renewal from Acme Inc',
      from: 'john@acmeinc.com',
      time: '2 hours ago',
      priority: 'high',
      senderType: 'manager',
      icon: <Mail className="text-red-500" />,
      action: () => navigate('/email/inbox/message/123')
    },
    {
      id: 2,
      type: 'deadline',
      title: 'Quarterly report due in 24 hours',
      time: 'Tomorrow, 5:00 PM',
      priority: 'high',
      icon: <Clock className="text-orange-500" />,
      action: () => info('Opened quarterly report template')
    },
    {
      id: 3,
      type: 'meeting',
      title: 'Team status meeting',
      time: 'Today, 3:00 PM',
      priority: 'medium',
      icon: <Users className="text-blue-500" />,
      action: () => info('Meeting details opened')
    },
    {
      id: 4,
      type: 'task',
      title: 'Review and approve new marketing materials',
      from: 'marketing@company.com',
      time: 'Added yesterday',
      priority: 'medium',
      icon: <CheckCircle className="text-green-500" />,
      action: () => info('Task opened')
    },
    {
      id: 5,
      type: 'alert',
      title: 'Storage space is almost full (92%)',
      time: 'Just now',
      priority: 'low',
      icon: <AlertCircle className="text-yellow-500" />,
      action: () => info('Storage management opened')
    }
  ];
  
  // Stats for today's brief overview
  const todayStats = {
    newEmails: 23,
    responded: 15,
    flagged: 4,
    meetings: 2
  };
  
  // Sample email summaries for when the user clicks "Generate Summaries"
  const sampleEmailSummaries = [
    {
      id: 101,
      title: 'Project X Timeline Update',
      summary: 'The timeline for Project X has been extended by 2 weeks due to additional feature requests from the client.',
      from: 'project-manager@company.com',
      time: '3 hours ago',
      label: 'Work',
      labelColor: '#1890ff',
      icon: <Star className="text-yellow-500" />,
      action: () => navigate('/email/inbox/message/101')
    },
    {
      id: 102,
      title: 'Urgent: Server Maintenance This Weekend',
      summary: 'IT team will be performing critical server maintenance on Saturday night. All systems will be offline from 10pm to 2am.',
      from: 'it-admin@company.com',
      time: 'Yesterday',
      label: 'Important',
      labelColor: '#ff4d4f',
      icon: <Star className="text-yellow-500" />,
      action: () => navigate('/email/inbox/message/102')
    },
    {
      id: 103,
      title: 'Q3 Budget Approval Needed',
      summary: 'The finance team needs your approval on the Q3 budget allocation by Friday. Key changes include increased marketing spend and reduced operational costs.',
      from: 'finance@company.com',
      time: '2 days ago',
      label: 'Finance',
      labelColor: '#722ed1',
      icon: <Star className="text-yellow-500" />,
      action: () => navigate('/email/inbox/message/103')
    },
    {
      id: 104,
      title: 'New Client Onboarding Process Update',
      summary: 'Sales team has updated the client onboarding process. All client-facing teams should review the new documentation before next week.',
      from: 'sales-director@company.com',
      time: '3 days ago',
      label: 'Work',
      labelColor: '#1890ff',
      icon: <Star className="text-yellow-500" />,
      action: () => navigate('/email/inbox/message/104')
    }
  ];

  // Handle generating email summaries
  const handleGenerateSummaries = () => {
    setGeneratingSummaries(true);
    
    // Check cache first
    const cachedSummaries = localStorage.getItem('emailSummaries');
    const cacheTimestamp = localStorage.getItem('emailSummariesTimestamp');
    const cacheAge = cacheTimestamp ? Date.now() - parseInt(cacheTimestamp) : null;
    
    // Use cache if it exists and is less than 30 minutes old
    if (cachedSummaries && cacheAge && cacheAge < 30 * 60 * 1000) {
      try {
        const parsedSummaries = JSON.parse(cachedSummaries);
        setEmailSummaries(parsedSummaries);
        setGeneratingSummaries(false);
        setShowSummaries(true);
        info("Displaying cached summaries");
        return;
      } catch (err) {
        console.error("Error parsing cached summaries:", err);
      }
    }
    
    // Simulate API call with timeout
    setTimeout(() => {
      const generatedSummaries = [
        {
          id: 1,
          subject: "Project X Timeline Update",
          sender: "Project Manager",
          summary: "The timeline for Project X has been extended by 2 weeks due to additional feature requests from the client.",
          sentiment: "neutral",
          actionRequired: true,
          actionType: "review",
          priority: "high",
          date: "Today, 10:30 AM"
        },
        // ... rest of example summaries ...
      ];
      
      // Update state
      setEmailSummaries(generatedSummaries);
      setGeneratingSummaries(false);
      setShowSummaries(true);
      
      // Cache the results
      localStorage.setItem('emailSummaries', JSON.stringify(generatedSummaries));
      localStorage.setItem('emailSummariesTimestamp', Date.now().toString());
      
      success("Email summaries generated successfully");
    }, 2000);
  };
  
  // Scroll to bottom of chat when messages change
  useEffect(() => {
    inputRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Handle sending a message
  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    
    // Add user message to chat
    setMessages([
      ...messages,
      { role: 'user', content: inputMessage }
    ]);
    
    // Clear input
    setInputMessage('');
    
    // Start processing
    setIsProcessing(true);
    
    // Call the Deepseek API service
    DeepseekChatService.generateChatResponse(inputMessage, selectedLanguage)
      .then(aiResponse => {
        // Check if the response contains an error message
        if (aiResponse.includes("Error details:")) {
          console.error("API error detected:", aiResponse);
          
          // Extract the error message for troubleshooting
          const errorMessage = aiResponse.split("Error details:")[1]?.trim();
          
          // Show a more user-friendly error toast with details for troubleshooting
          error("AI Service Connection Error: Please check your API key and network connection.");
          
          // Add a more user-friendly error to the chat
          setMessages(prevMessages => [
            ...prevMessages,
            { 
              role: 'assistant', 
              content: "I'm having trouble connecting to my AI service. This may be due to an incorrect API key or network issue. Please check your configuration and try again."
            }
          ]);
          
          // Reset the service to clear history
          DeepseekChatService.clearHistory();
        } else {
          // Normal successful response
          setMessages(prevMessages => [
            ...prevMessages,
            { role: 'assistant', content: aiResponse }
          ]);
        }
      })
      .catch(error => {
        console.error('Error getting AI response:', error);
        // Add fallback message if there's an error
        setMessages(prevMessages => [
          ...prevMessages,
          { 
            role: 'assistant', 
            content: "I'm having trouble connecting to my AI service. Please check your API key in the .env file and ensure it's valid."
          }
        ]);
        
        // Show error toast
        error("AI Service Error: Connection to AI service failed. Please check your API configuration.");
      })
      .finally(() => {
        setIsProcessing(false);
        // Focus the input field after the message is sent
        setTimeout(() => {
          inputRef.current?.focus();
        }, 50);
      });
  };
  
  // Handle voice input
  const handleVoiceInput = () => {
    if (!isRecording) {
      // Start recording
      setIsRecording(true);
      
      // In a real implementation, this would use the Web Speech API
      // For this demo, we'll simulate recording and create a fake transcript
      setTimeout(() => {
        const fakeTranscript = "I need to craft a response to an upset customer about a delayed shipment.";
        setInputMessage(fakeTranscript);
        setIsRecording(false);
        
        success('Voice input captured');
      }, 3000);
    } else {
      // Stop recording
      setIsRecording(false);
      info('Voice recording stopped');
    }
  };
  
  // Text-to-speech for the last message
  const handleSpeakLastMessage = () => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role === 'assistant') {
      // In a real implementation, this would use the Web Speech API's SpeechSynthesis
      // For this demo, we'll just show a toast
      success('Playing message audio...');
    }
  };
  
  // AI response generator - now a fallback if the service is unavailable
  const generateAIResponse = (message, language) => {
    // Try to use the DeepseekChatService first
    try {
      return DeepseekChatService.generateChatResponse(message, language);
    } catch (error) {
      console.error('Error using AI service, falling back to canned responses:', error);
      
      // Fall back to canned responses
      const lowercaseMessage = message.toLowerCase();
      
      // Simulate language-specific responses
      const languageGreeting = language === 'en' ? 'Here\'s what I found for you:'
        : language === 'es' ? 'Esto es lo que encontré para ti:'
        : language === 'fr' ? 'Voici ce que j\'ai trouvé pour vous :'
        : language === 'de' ? 'Hier ist, was ich für Sie gefunden habe:'
        : 'Here\'s what I found for you:';
      
      if (lowercaseMessage.includes('hello') || lowercaseMessage.includes('hi')) {
        return `Hello! How can I assist you with your emails today?`;
      }
      
      if (lowercaseMessage.includes('upset customer') || lowercaseMessage.includes('delayed')) {
        return `${languageGreeting}

For responding to an upset customer about a delayed shipment, I'd recommend:

1. Start with a sincere apology acknowledging their frustration
2. Explain what caused the delay (be honest but brief)
3. Detail what you're doing to fix the situation
4. Offer some form of compensation or goodwill gesture
5. End with a commitment to prevent similar issues in the future

Would you like me to draft a response template for you?`;
      }
      
      // Default fallback response
      return `${languageGreeting}

I'm here to help with any email-related questions or tasks. For example, I can:

- Draft responses to different types of emails
- Provide tips for effective communication
- Help organize your inbox
- Translate messages to different languages
- Answer questions about email etiquette

What specific assistance do you need today?`;
    }
  };

  // Function to determine the priority badge styling
  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'medium':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'low':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };
  
  // Sort urgent actions by type (managers/admins first, then schedule warnings, then others)
  const sortedUrgentActions = [...urgentActions].sort((a, b) => {
    // First, prioritize by sender type (manager/admin)
    if (a.senderType === 'manager' && b.senderType !== 'manager') return -1;
    if (a.senderType !== 'manager' && b.senderType === 'manager') return 1;
    
    // Then, prioritize schedule/time-related items
    if (a.type === 'meeting' && b.type !== 'meeting') return -1;
    if (a.type !== 'meeting' && b.type === 'meeting') return 1;
    if (a.type === 'deadline' && b.type !== 'deadline') return -1;
    if (a.type !== 'deadline' && b.type === 'deadline') return 1;
    
    // Finally, sort by priority
    if (a.priority === 'high' && b.priority !== 'high') return -1;
    if (a.priority !== 'high' && b.priority === 'high') return 1;
    if (a.priority === 'medium' && b.priority === 'low') return -1;
    if (a.priority === 'low' && b.priority === 'medium') return 1;
    
    return 0;
  });
  
  // Add new state for expanded summary
  const [expandedSummaryId, setExpandedSummaryId] = useState(null);
  
  // Add handlers for email actions
  const handleDraftResponse = (email) => {
    // Make sure we have a valid email object before proceeding
    if (!email || !email.id) {
      warning('Error: Email data not available. Please try again.');
      return;
    }

    try {
      // Notify the user that we're generating a draft
      success('Generating Draft: AI is creating a response draft for "' + email.title + '"');
      
      // In a real app, this would navigate to compose with prefilled AI draft
      setTimeout(() => {
        navigate(`/email/compose?draft=ai&reply=${email.id}`);
      }, 1000);
    } catch (err) {
      error('Error: Failed to generate AI draft. Please try again.');
    }
  };
  
  const handleSaveToCRM = (email) => {
    success('Contact Saved to CRM: ' + email.from + ' has been added to your CRM system');
  };
  
  const handleScheduleFollowup = (email) => {
    info('Follow-up Scheduled: A reminder has been set to follow up on "' + email.title + '" in 3 days');
  };
  
  const handleCreateTask = (email) => {
    success('Task Created: A new task has been created for "' + email.title + '"');
  };

  // Add state to track which email summary action menu is open
  const [openSummaryMenu, setOpenSummaryMenu] = useState(null);
  const dropdownRefs = useRef({});

  // Update the click outside handler to check all dropdown refs
  useEffect(() => {
    function handleClickOutside(event) {
      let clickedInsideDropdown = false;
      
      // Check if click was inside any dropdown
      Object.keys(dropdownRefs.current).forEach(key => {
        if (
          dropdownRefs.current[key] && 
          dropdownRefs.current[key].contains(event.target)
        ) {
          clickedInsideDropdown = true;
        }
      });
      
      // If click was outside all dropdowns, close any open dropdown
      if (!clickedInsideDropdown) {
        setOpenSummaryMenu(null);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Toggle summary action menu
  const toggleSummaryMenu = (emailId) => {
    setOpenSummaryMenu(openSummaryMenu === emailId ? null : emailId);
  };

  // Add missing handler functions for email summary actions
  const handleForwardEmail = (email) => {
    info('Forward Email: Opening compose window to forward this email');
    navigate(`/email/compose?forward=${email.id}`);
  };

  const handleScheduleMeeting = (email) => {
    success('Meeting Scheduler: Opening calendar to schedule a meeting with the sender');
  };

  const handleShareWithTeam = (email) => {
    success('Email Shared: This email has been shared with your team');
  };

  const handleExtractAnalyze = (email) => {
    info('Content Analysis: Analyzing email content for key information');
    
    setTimeout(() => {
      success('Analysis Complete: Key information extracted and saved');
    }, 1500);
  };

  const handleArchiveEmail = (email) => {
    success('Email Archived: The email has been archived');
  };

  // Add state for selected email and email viewer modal
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [emailViewerOpen, setEmailViewerOpen] = useState(false);

  // Update the handleViewEmail function to format email summary for EmailViewer
  const handleViewEmail = (email) => {
    // Format the email object to match what EmailViewer expects
    const formattedEmail = {
      ...email,
      // If title exists but subject doesn't, use title as subject
      subject: email.subject || email.title || 'No Subject',
      // If summary exists but body doesn't, use summary as body
      body: email.body || `<p>${email.summary || 'No content'}</p>`,
      // Ensure attachments is at least an empty array
      attachments: email.attachments || [],
      // Ensure to is at least an empty array
      to: email.to || ['you@example.com'],
      // If email has a label, treat it as a label array
      labels: email.label ? [email.label] : (email.labels || [])
    };

    setSelectedEmail(formattedEmail);
    setEmailViewerOpen(true);
  };

  // Add EmailViewerModal component
  const EmailViewerModal = ({ isOpen, onClose, email }) => {
    if (!isOpen || !email) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-background rounded-lg shadow-xl">
          <div className="p-4">
            <EmailViewer 
              email={email}
              onBack={onClose}
            />
          </div>
        </div>
      </div>
    );
  };

  // Modify the language selection code
  const handleLanguageChange = (langCode) => {
    setSelectedLanguage(langCode);
    setShowLanguageMenu(false);
    
    // Find the language name from the code
    const langName = languages.find(lang => lang.code === langCode)?.name || langCode;
    success(`Language changed to ${langName}`);
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col mb-6 sm:mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Command Center</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Quick access to everything you need</p>
      </div>
      
      {/* Today's brief overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <Card className="border-0 shadow-sm bg-blue-50 dark:bg-blue-900/10 border-l-4 border-blue-500">
          <CardContent className="pt-4 pb-2 px-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-blue-700 dark:text-blue-300 mb-1">New Emails</p>
                <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">{todayStats.newEmails}</p>
              </div>
              <Mail className="h-8 w-8 text-blue-500 opacity-75" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-green-50 dark:bg-green-900/10 border-l-4 border-green-500">
          <CardContent className="pt-4 pb-2 px-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-green-700 dark:text-green-300 mb-1">Responded</p>
                <p className="text-2xl font-bold text-green-800 dark:text-green-200">{todayStats.responded}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500 opacity-75" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-red-50 dark:bg-red-900/10 border-l-4 border-red-500">
          <CardContent className="pt-4 pb-2 px-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-red-700 dark:text-red-300 mb-1">Flagged</p>
                <p className="text-2xl font-bold text-red-800 dark:text-red-200">{todayStats.flagged}</p>
              </div>
              <Flag className="h-8 w-8 text-red-500 opacity-75" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-purple-50 dark:bg-purple-900/10 border-l-4 border-purple-500">
          <CardContent className="pt-4 pb-2 px-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-purple-700 dark:text-purple-300 mb-1">Meetings</p>
                <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">{todayStats.meetings}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500 opacity-75" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left column - Quick Access Buttons */}
        <div className="w-full lg:w-1/4">
          <Card className="border-0 shadow-sm h-full mb-6 lg:mb-0">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center text-lg">
                  <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                  Quick Access
                </CardTitle>
                <div className="flex space-x-2">
                  {isEditingQuickAccess ? (
                    <>
                      <button 
                        onClick={handleRestoreDefaults}
                        className="p-1.5 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        title="Restore default actions"
                      >
                        <RotateCcw size={16} />
                      </button>
                      <button 
                        onClick={() => setShowAddActionForm(!showAddActionForm)}
                        className="p-1.5 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        title={showAddActionForm ? "Cancel" : "Add new action"}
                      >
                        {showAddActionForm ? <X size={16} /> : <Plus size={16} />}
                      </button>
                      <button 
                        onClick={toggleEditMode}
                        className="p-1.5 rounded bg-primary text-white hover:bg-primary-dark"
                        title="Save changes"
                      >
                        <Save size={16} />
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={toggleEditMode}
                      className="p-1.5 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                      title="Edit Quick Access"
                    >
                      <Edit size={16} />
                    </button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {showAddActionForm && isEditingQuickAccess && (
                <div className="mb-4 p-3 border border-gray-200 rounded-lg dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Add New Action</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Action Name</label>
                      <input 
                        type="text"
                        value={newActionName}
                        onChange={(e) => setNewActionName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        placeholder="My Custom Action"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Icon</label>
                      <select 
                        value={newActionIcon}
                        onChange={(e) => setNewActionIcon(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      >
                        {Object.keys(availableIcons).map(icon => (
                          <option key={icon} value={icon}>{icon}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Color</label>
                      <select 
                        value={newActionColor}
                        onChange={(e) => setNewActionColor(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      >
                        {availableColors.map(color => (
                          <option key={color.name} value={color.value}>{color.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Navigation Path (optional)</label>
                      <input 
                        type="text"
                        value={newActionPath}
                        onChange={(e) => setNewActionPath(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        placeholder="/email/inbox"
                      />
                    </div>
                    <button
                      onClick={handleAddCustomAction}
                      className="w-full py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
                    >
                      Add Action
                    </button>
                  </div>
                </div>
              )}
              
              {isEditingQuickAccess ? (
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="quickAccessItems">
                    {(provided) => (
                      <div 
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-2"
                      >
                        {quickAccessItems.map((item, index) => (
                          <Draggable key={item.label} draggableId={item.label} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="flex items-center space-x-3 w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                              >
                                <div className={`p-2 rounded-full ${item.color}`}>
                                  {item.icon}
                                </div>
                                <span className="font-medium">{item.label}</span>
                                <div className="ml-auto flex items-center">
                                  <Move size={16} className="text-gray-400 mr-2" />
                                  <button
                                    onClick={() => handleDeleteAction(index)}
                                    className="text-gray-400 hover:text-red-500"
                                    title="Remove from Quick Access"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              ) : (
                <div className="space-y-2">
                  {quickAccessItems.map((item, index) => (
                    <button 
                      key={index}
                      className="flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      onClick={item.action}
                    >
                      <div className={`p-2 rounded-full ${item.color}`}>
                        {item.icon}
                      </div>
                      <span className="font-medium">{item.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Middle column - Urgent Actions or Email Summaries */}
        <div className="w-full lg:w-2/5">
          <Card className="border-0 shadow-sm h-full mb-6 lg:mb-0">
            <CardHeader className="flex flex-row items-center justify-between">
              {showSummaries ? (
                <CardTitle className="flex items-center text-lg">
                  <Star className="w-5 h-5 mr-2 text-yellow-500" />
                  <div className="flex items-center group relative">
                    <span>Important Label Summaries</span>
                    <div className="ml-1 cursor-help">
                      <Lightbulb className="h-4 w-4 text-yellow-400" />
                      <div className="absolute bottom-full left-0 w-64 bg-gray-900 text-white text-xs rounded p-2 hidden group-hover:block z-10">
                        Showing summaries from emails with labels marked as "important" in Email Rules.
                      </div>
                    </div>
                  </div>
                </CardTitle>
              ) : (
                <CardTitle className="flex items-center text-lg">
                  <AlertCircle className="w-5 h-5 mr-2 text-red-500" />
                  Urgent Actions
                </CardTitle>
              )}
              
              {/* Toggle between Urgent Actions and Email Summaries */}
              <div className="flex space-x-2">
                <button 
                  className={`px-3 py-1 text-xs rounded-md ${!showSummaries ? 'bg-primary text-white' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'}`}
                  onClick={() => setShowSummaries(false)}
                >
                  Actions
                </button>
                <button 
                  className={`px-3 py-1 text-xs rounded-md ${showSummaries ? 'bg-primary text-white' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'}`}
                  onClick={handleGenerateSummaries}
                >
                  Summaries
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 overflow-auto max-h-[500px]">
              {/* Show email summaries or urgent actions based on state */}
              {showSummaries ? (
                <>
                  {generatingSummaries ? (
                    <div className="flex flex-col items-center justify-center p-6 text-center">
                      <Loader2 className="h-12 w-12 text-primary mb-2 animate-spin" />
                      <p className="text-gray-600 dark:text-gray-400">Generating email summaries...</p>
                      <p className="text-sm text-gray-500 dark:text-gray-500">This might take a moment</p>
                    </div>
                  ) : emailSummaries.length > 0 ? (
                    emailSummaries.map((email) => (
                      <div 
                        key={email.id} 
                        className="p-4 border rounded-md hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => handleViewEmail(email)}
                      >
                        <div className="flex items-start cursor-pointer">
                          <div className="mr-3 mt-1">{email.icon}</div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-medium text-gray-900 dark:text-white">{email.title}</h3>
                              <span 
                                className="text-xs px-2 py-1 rounded-full"
                                style={{ backgroundColor: `${email.labelColor}20`, color: email.labelColor }}
                              >
                                {email.label}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{email.summary}</p>
                            <div className="flex justify-between items-center">
                              <p className="text-sm text-gray-500">From: {email.from}</p>
                              <p className="text-xs text-gray-500">{email.time}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center p-6 text-center">
                      <MessageSquare className="h-12 w-12 text-gray-400 mb-2" />
                      <p className="text-gray-600 dark:text-gray-400">No important emails found</p>
                      <p className="text-sm text-gray-500 dark:text-gray-500">Go to Email Rules and mark labels as important to see summaries here</p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {sortedUrgentActions.map((action) => (
                    <div 
                      key={action.id} 
                      className="flex items-start p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                      onClick={action.action}
                    >
                      <div className="mr-3 mt-1">{action.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium text-gray-900 dark:text-white">{action.title}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${getPriorityBadge(action.priority)}`}>
                            {action.priority}
                          </span>
                        </div>
                        {action.from && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">From: {action.from}</p>
                        )}
                        <p className="text-sm text-gray-500 dark:text-gray-500">{action.time}</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400" />
                    </div>
                  ))}
                  
                  {urgentActions.length === 0 && (
                    <div className="flex flex-col items-center justify-center p-6 text-center">
                      <CheckCircle className="h-12 w-12 text-green-500 mb-2" />
                      <p className="text-gray-600 dark:text-gray-400">No urgent actions at the moment!</p>
                      <p className="text-sm text-gray-500 dark:text-gray-500">Everything is under control</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Right column - AI Chat Assistant */}
        <div className="w-full lg:w-1/3">
          <Card className="border-0 shadow-sm h-full">
            <CardHeader className="flex items-center justify-between pb-2">
              <CardTitle className="flex items-center text-lg">
                <Sparkles className="w-5 h-5 mr-2 text-purple-500" />
                AI Chat Assistant
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!showAIChat ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Sparkles size={40} className="mb-3 text-purple-500 opacity-80" />
                  <h3 className="text-lg font-medium mb-2">Need help with your tasks?</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Chat with our AI assistant for email drafting, organization tips, and more
                  </p>
                  <Button 
                    onClick={() => setShowAIChat(true)}
                    className="bg-primary hover:bg-primary-dark text-white"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Open Chat Assistant
                  </Button>
                </div>
              ) : (
                isDesktop.current ? (
                  // Embedded chat for desktop
                  <div className="flex flex-col h-[520px] overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg">
                    {/* Chat Header for embedded desktop view */}
                    <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 p-3">
                      <div className="flex space-x-2">
                        {/* Language selector */}
                        <div className="relative">
                          <button
                            onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                            className="p-1.5 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                            title="Change language"
                          >
                            <Languages size={16} />
                          </button>
                          
                          {showLanguageMenu && (
                            <div className="absolute left-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
                              {languages.map(lang => (
                                <button
                                  key={lang.code}
                                  className={`block w-full text-left px-4 py-2 text-sm ${
                                    selectedLanguage === lang.code 
                                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
                                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                  }`}
                                  onClick={() => handleLanguageChange(lang.code)}
                                >
                                  {lang.name}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Messages Area */}
                    <div className="flex-grow overflow-y-auto p-4">
                      {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
                          <Sparkles size={40} className="mb-2 text-purple-500 opacity-80" />
                          <p className="mb-1 font-medium">AI Chat Assistant</p>
                          <p className="text-sm max-w-xs">
                            Ask me anything about email management, drafting responses, or organizing your inbox
                          </p>
                          <div className="mt-4 grid grid-cols-1 gap-2">
                            <button 
                              onClick={() => setInputMessage("How can I write a professional email?")}
                              className="text-left text-sm px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
                            >
                              How can I write a professional email?
                            </button>
                            <button 
                              onClick={() => setInputMessage("Draft an email to reschedule a meeting")}
                              className="text-left text-sm px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
                            >
                              Draft an email to reschedule a meeting
                            </button>
                            <button 
                              onClick={() => setInputMessage("Tips for managing email overload")}
                              className="text-left text-sm px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
                            >
                              Tips for managing email overload
                            </button>
                          </div>
                        </div>
                      ) : (
                        messages.map((message, index) => (
                          <div 
                            key={index} 
                            className={`mb-3 ${message.role === 'user' ? 'text-right' : 'text-left'}`}
                          >
                            <div 
                              className={`inline-block px-4 py-2 rounded-lg max-w-[80%] ${
                                message.role === 'user' 
                                  ? 'bg-blue-500 text-white dark:bg-blue-600' 
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                              }`}
                            >
                              <div className="whitespace-pre-wrap">{message.content}</div>
                            </div>
                          </div>
                        ))
                      )}
                      <div ref={inputRef} />
                    </div>
                    
                    {/* Input Area */}
                    <div className="border-t border-gray-200 dark:border-gray-700 p-3 flex items-center">
                      <input
                        ref={inputRef}
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type a message..."
                        className="flex-grow bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                        disabled={isProcessing}
                      />
                      
                      <div className="flex space-x-2 ml-2">
                        <button
                          onClick={handleVoiceInput}
                          className={`p-2 rounded-full ${
                            isRecording 
                              ? 'bg-red-100 text-red-600 animate-pulse dark:bg-red-900/30 dark:text-red-400' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
                          }`}
                          title={isRecording ? "Stop recording" : "Voice input"}
                        >
                          <Mic size={20} />
                        </button>
                        
                        <button
                          onClick={handleSendMessage}
                          disabled={isProcessing || !inputMessage.trim()}
                          className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-600 dark:hover:bg-blue-700"
                          title="Send message"
                        >
                          {isProcessing ? (
                            <Loader2 size={20} className="animate-spin" />
                          ) : (
                            <Send size={20} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Floating chat for mobile/tablet
                  <div 
                    className={`fixed z-50 bottom-0 right-0 transition-all duration-300 ${
                      isChatExpanded 
                        ? 'inset-0 m-0' 
                        : 'w-80 sm:w-96 h-[520px] mb-4 mr-4 rounded-lg shadow-lg'
                    }`}
                  >
                    <div className={`bg-white dark:bg-gray-800 flex flex-col h-full overflow-hidden border border-gray-200 dark:border-gray-700 ${
                      isChatExpanded ? 'rounded-none' : 'rounded-lg'
                    }`}>
                      {/* Chat Header */}
                      <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 p-3">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                          <Sparkles size={18} className="text-purple-500 mr-2" />
                          AI Chat Assistant
                        </h3>
                        <div className="flex space-x-2">
                          {/* Language selector */}
                          <div className="relative">
                            <button
                              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                              className="p-1.5 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                              title="Change language"
                            >
                              <Languages size={16} />
                            </button>
                            
                            {showLanguageMenu && (
                              <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
                                {languages.map(lang => (
                                  <button
                                    key={lang.code}
                                    className={`block w-full text-left px-4 py-2 text-sm ${
                                      selectedLanguage === lang.code 
                                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                                    onClick={() => handleLanguageChange(lang.code)}
                                  >
                                    {lang.name}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          {/* Expand/collapse */}
                          <button
                            onClick={() => setIsChatExpanded(!isChatExpanded)}
                            className="p-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600"
                            title={isChatExpanded ? "Minimize" : "Maximize"}
                          >
                            {isChatExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                          </button>
                          
                          {/* Close button */}
                          <button
                            onClick={() => setShowAIChat(false)}
                            className="p-1.5 rounded-full bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                            title="Close chat"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                      
                      {/* Messages Area */}
                      <div className="flex-grow overflow-y-auto p-4">
                        {messages.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
                            <Sparkles size={40} className="mb-2 text-purple-500 opacity-80" />
                            <p className="mb-1 font-medium">AI Chat Assistant</p>
                            <p className="text-sm max-w-xs">
                              Ask me anything about email management, drafting responses, or organizing your inbox
                            </p>
                            <div className="mt-4 grid grid-cols-1 gap-2">
                              <button 
                                onClick={() => setInputMessage("How can I write a professional email?")}
                                className="text-left text-sm px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
                              >
                                How can I write a professional email?
                              </button>
                              <button 
                                onClick={() => setInputMessage("Draft an email to reschedule a meeting")}
                                className="text-left text-sm px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
                              >
                                Draft an email to reschedule a meeting
                              </button>
                              <button 
                                onClick={() => setInputMessage("Tips for managing email overload")}
                                className="text-left text-sm px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
                              >
                                Tips for managing email overload
                              </button>
                            </div>
                          </div>
                        ) : (
                          messages.map((message, index) => (
                            <div 
                              key={index} 
                              className={`mb-3 ${message.role === 'user' ? 'text-right' : 'text-left'}`}
                            >
                              <div 
                                className={`inline-block px-4 py-2 rounded-lg max-w-[80%] ${
                                  message.role === 'user' 
                                    ? 'bg-blue-500 text-white dark:bg-blue-600' 
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                }`}
                              >
                                <div className="whitespace-pre-wrap">{message.content}</div>
                              </div>
                            </div>
                          ))
                        )}
                        <div ref={inputRef} />
                      </div>
                      
                      {/* Input Area */}
                      <div className="border-t border-gray-200 dark:border-gray-700 p-3 flex items-center">
                        <input
                          ref={inputRef}
                          type="text"
                          value={inputMessage}
                          onChange={(e) => setInputMessage(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                          placeholder="Type a message..."
                          className="flex-grow bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                          disabled={isProcessing}
                        />
                        
                        <div className="flex space-x-2 ml-2">
                          <button
                            onClick={handleVoiceInput}
                            className={`p-2 rounded-full ${
                              isRecording 
                                ? 'bg-red-100 text-red-600 animate-pulse dark:bg-red-900/30 dark:text-red-400' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
                            }`}
                            title={isRecording ? "Stop recording" : "Voice input"}
                          >
                            <Mic size={20} />
                          </button>
                          
                          <button
                            onClick={handleSendMessage}
                            disabled={isProcessing || !inputMessage.trim()}
                            className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-600 dark:hover:bg-blue-700"
                            title="Send message"
                          >
                            {isProcessing ? (
                              <Loader2 size={20} className="animate-spin" />
                            ) : (
                              <Send size={20} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Email Viewer Modal */}
      <EmailViewerModal 
        isOpen={emailViewerOpen}
        onClose={() => setEmailViewerOpen(false)}
        email={selectedEmail}
      />
      
      {/* Mobile chat button - only show when not on desktop and chat is hidden */}
      {!isDesktop.current && !showAIChat && (
        <button
          onClick={() => setShowAIChat(true)}
          className="fixed z-30 bottom-4 right-4 p-4 rounded-full bg-primary text-white shadow-lg hover:bg-primary-dark transition-all"
          title="Chat with AI Assistant"
        >
          <Sparkles size={20} />
        </button>
      )}
    </div>
  );
} 