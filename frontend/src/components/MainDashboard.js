import React, { useState } from "react";
import {
  Settings,
  Mail,
  Star,
  AlertCircle,
  Sun,
  Moon,
  Bell,
  Menu,
  X,
  Sparkles,
  BarChart2,
  ChevronDown,
  MessageSquare,
  Calendar,
  Search,
  Users,
  Zap,
  FileText,
  Edit3,
  Clock
} from "lucide-react";
import RichTextEditor from "./RichTextEditor";
import NotificationsDropdown from "./ui/NotificationsDropdown";
import { QuickAccessPanel } from "./dashboard/QuickAccessPanel";
import { UrgentActionsPanel } from "./dashboard/UrgentActionsPanel";

import SettingsPage from "./SettingsPage";
import InstallPWAButton from "./InstallPWAButton";
// Assuming these contexts exist and provide the necessary values/functions
// import { useAuth } from "../contexts/AuthContext"; // Not used
import { useTheme } from "../contexts/ThemeContext";
import { useNavigate } from "react-router-dom";

/* -------------------------------------------------------------------------- */
/*                                HELPER COMPONENTS                           */
/* -------------------------------------------------------------------------- */

/**
 * Placeholder Button component - Replace with actual UI library Button if available
 */
const Button = ({ variant, size, className, onClick, children, ...props }) => (
  <button
    className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
      variant === 'ghost' ? 'hover:bg-accent hover:text-accent-foreground' :
      variant === 'outline' ? 'border border-input bg-background hover:bg-accent hover:text-accent-foreground' :
      'bg-primary text-primary-foreground hover:bg-primary/90'
    } ${
      size === 'icon' ? 'h-10 w-10' : 'h-10 px-4 py-2'
    } ${className} min-h-[44px] min-w-[44px]`}
    onClick={onClick}
    {...props}
  >
    {children}
  </button>
);

/**
 * Placeholder ScrollArea component
 */
// ScrollArea component - not used
// const ScrollArea = ({ className, children }) => (
//   <div className={`overflow-auto ${className}`}>{children}</div>
// );

// Placeholder Dropdown components - not used
// const DropdownMenu = ({ children }) => <div className="relative inline-block text-left">{children}</div>;
// const DropdownMenuTrigger = ({ children, asChild }) => React.cloneElement(children, { /* Add necessary props */ }); // Basic trigger
// const DropdownMenuContent = ({ children, className }) => <div className={`absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-card dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 ${className}`}>{children}</div>;
// const DropdownMenuItem = ({ children, onSelect }) => <button onClick={onSelect} className="block w-full px-4 py-2 text-sm text-card-foreground dark:text-gray-200 hover:bg-accent dark:hover:bg-gray-700 text-left">{children}</button>;
// const DropdownMenuSeparator = () => <hr className="border-border dark:border-gray-700 my-1" />;


/* -------------------------------------------------------------------------- */
/*                               EMAIL EDIT MODAL                              */
/* -------------------------------------------------------------------------- */

function EmailEditModal({ isOpen, onClose, email }) {
  const initialContent = email?.draft || email?.fullSummary || "";
  const [content, setContent] = useState(initialContent);
  const { theme } = useTheme(); // Get theme for RichTextEditor

  React.useEffect(() => {
    setContent(email?.draft || email?.fullSummary || "");
  }, [email]);

  const handleEditorChange = (newContent) => {
    setContent(newContent);
  };

  const handleCancel = () => {
    onClose();
  };

  const handleSaveDraft = () => {
    console.log("Saving draft:", content);
    // Add actual save logic here
    onClose();
  };

  const handleSend = () => {
    console.log("Sending email:", content);
    // Add actual send logic here
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-card text-card-foreground p-4 rounded-lg shadow-lg">
        <button
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
          onClick={onClose}
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        <h2 className="text-lg font-semibold mb-4">
          {email?.draft ? "Edit Draft" : "Edit Email"}
        </h2>

        <div className="flex-grow overflow-y-auto mb-4 pr-2">
          <div className="flex flex-col space-y-2 mb-4">
            <div className="flex items-center">
              <span className="w-16 text-sm text-muted-foreground">To:</span>
              <input
                type="text"
                className="flex-grow p-2 border border-input rounded bg-background text-sm"
                defaultValue={email?.to || ""}
                aria-label="Recipient"
              />
            </div>
            <div className="flex items-center">
              <span className="w-16 text-sm text-muted-foreground">
                Subject:
              </span>
              <input
                type="text"
                className="flex-grow p-2 border border-input rounded bg-background text-sm"
                defaultValue={email?.subject || ""}
                aria-label="Subject"
              />
            </div>
          </div>

          <div className="border border-input rounded overflow-hidden">
            <RichTextEditor
              initialContent={content}
              onChange={handleEditorChange}
              darkMode={theme === 'dark'}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 flex-shrink-0 pt-4 border-t border-border">
          <Button variant="outline" onClick={handleCancel}>Cancel</Button>
          <Button variant="secondary" onClick={handleSaveDraft}>Save Draft</Button>
          <Button onClick={handleSend}>Send</Button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              MAIN DASHBOARD                                */
/* -------------------------------------------------------------------------- */

export default function MainDashboard() {
  const [showSettings, setShowSettings] = useState(false);
  const [selectedBox, setSelectedBox] = useState("all");
  const { theme, toggleTheme, setTheme } = useTheme(); // Use ThemeContext
  // const darkMode = theme === 'dark' || theme === 'earthDark'; // Not used
  const [editingEmail, setEditingEmail] = useState(null);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [isAIChatCollapsed, setIsAIChatCollapsed] = useState(false);
  const [mobileActiveTab, setMobileActiveTab] = useState('quick-access');
  const [showUrgentAlert, setShowUrgentAlert] = useState(false);
  const [hasSeenUrgentActions, setHasSeenUrgentActions] = useState(false);
  // const { user, logout } = useAuth(); // Get user info and logout function if needed
  // const [activeTab, setActiveTab] = useState('actions'); // Not used
  const navigate = useNavigate();

  // Default categories/boxes
  const [boxes, setBoxes] = useState([
    { id: "all", name: "All", unread: 4, color: "hsl(var(--foreground))", icon: Mail, important: false, instructions: "", keywords: "" },
    { id: "work", name: "Work", unread: 5, color: "hsl(var(--chart-1))", icon: Mail, important: true, instructions: "", keywords: "" },
    { id: "personal", name: "Personal", unread: 2, color: "hsl(var(--chart-3))", icon: Star, important: false, instructions: "", keywords: "" },
    { id: "urgent", name: "Urgent", unread: 1, color: "hsl(var(--destructive))", icon: AlertCircle, important: true, instructions: "", keywords: "" },
    { id: "social", name: "Social", unread: 3, color: "hsl(var(--chart-2))", icon: Bell, important: false, instructions: "", keywords: "" },
    { id: "promotions", name: "Promotions", unread: 8, color: "hsl(var(--chart-4))", icon: Mail, important: false, instructions: "", keywords: "" },
    { id: "updates", name: "Updates", unread: 0, color: "hsl(210 40% 50%)", icon: Bell, important: false, instructions: "", keywords: "" },
    { id: "forums", name: "Forums", unread: 4, color: "hsl(25 95% 53%)", icon: Mail, important: false, instructions: "", keywords: "" },
    { id: "newsletters", name: "Newsletters", unread: 12, color: "hsl(170 70% 40%)", icon: Mail, important: false, instructions: "", keywords: "" },
  ]);

  // Sample email data with priority
  const sampleEmails = [
    { priority: "medium", id: 1, subject: "Project Meeting Tomorrow", dateTimeReceived: "2025-03-10 09:30 AM", sender: "boss@work.com", to: "you@company.com", cc: "", bcc: "", quickSummary: "Discuss project timeline.", fullSummary: "We need to discuss the project timeline, upcoming deadlines, and resource allocation for the next quarter.", draft: "AI Draft (Sonnet 3.7) for Project Meeting: Lorem ipsum AI content...", category: "work", starred: true },
    { priority: "low", id: 2, subject: "Dinner Plans for Tonight", dateTimeReceived: "2025-03-09 06:15 PM", sender: "friend@gmail.com", to: "you@email.com", cc: "", bcc: "", quickSummary: "Pizza dinner?", fullSummary: "Are we still on for dinner tonight? I'm thinking of ordering pizza from our favorite place.", draft: "AI Draft (Sonnet 3.7) for Dinner Plans: Lorem ipsum AI content...", category: "personal", starred: false },
    { priority: "high", id: 3, subject: "Urgent: Server Downtime", dateTimeReceived: "2025-03-10 07:45 AM", sender: "it-support@work.com", to: "team@company.com", cc: "manager@work.com", bcc: "", quickSummary: "Immediate server issue.", fullSummary: "The main server is down, causing service disruptions. Immediate action is required to diagnose and resolve the issue.", draft: "AI Draft (Sonnet 3.7) for Urgent Server Downtime: Lorem ipsum AI content...", category: "urgent", starred: true },
    { priority: "low", id: 4, subject: "Weekend Social Gathering", dateTimeReceived: "2025-03-09 05:00 PM", sender: "club@social.com", to: "members@social.com", cc: "", bcc: "", quickSummary: "Get together this weekend.", fullSummary: "Join us for a weekend social gathering at the downtown club. Expect great food, music, and company.", draft: "AI Draft (Sonnet 3.7) for Social Gathering: Lorem ipsum AI content...", category: "social", starred: false },
  ];

  // Filter emails based on selected category - not used
  // const filteredEmails =
  //   selectedBox === "all"
  //     ? sampleEmails
  //     : sampleEmails.filter(
  //         (email) => email.category === boxes.find(b => b.id === selectedBox)?.id // Match category ID
  //       );

  // Toggle "important" star for a box
  const toggleImportant = (boxId) => {
    setBoxes((prev) =>
      prev.map((b) =>
        b.id === boxId ? { ...b, important: !b.important } : b
      )
    );
  };

  // Delete a box (from settings)
  const handleDeleteBox = (boxId) => {
    setBoxes((prev) => prev.filter((b) => b.id !== boxId));
    if (selectedBox === boxId) {
      setSelectedBox("all");
    }
  };

  // Rename a box (from settings)
  const handleRenameBox = (boxId, newName, newInstructions, newKeywords) => {
    setBoxes((prev) =>
      prev.map((b) =>
        b.id === boxId
          ? { ...b, name: newName, instructions: newInstructions, keywords: newKeywords }
          : b
      )
    );
  };

  // Add a new box (from settings)
  const handleAddBox = () => {
    const newId = Date.now().toString();
    const newBox = {
      id: newId, name: "New Box", unread: 0, color: "#888888", icon: Mail, important: false, instructions: "", keywords: ""
    };
    setBoxes([...boxes, newBox]);
    return newBox; // Return the new box if needed by SettingsPage
  };

  // Close mobile sidebar when a category is selected
  const handleSelectBox = (boxId) => {
    setSelectedBox(boxId);
    setShowMobileSidebar(false);
  };

  // Quick Access items
  const [quickAccessItems, setQuickAccessItems] = useState([
    {
      label: 'Schedule',
      icon: <Calendar className="h-5 w-5" />,
      action: () => navigate('/pages/calendar')
    },
    {
      label: 'Search Inbox',
      icon: <Search className="h-5 w-5" />,
      action: () => navigate('/pages/email/inbox')
    },
    {
      label: 'Compose Email',
      icon: <Edit3 className="h-5 w-5" />,
      action: () => navigate('/pages/email/compose')
    },
    {
      label: 'Templates',
      icon: <FileText className="h-5 w-5" />,
      action: () => navigate('/pages/email/templates')
    },
    {
      label: 'Analytics',
      icon: <BarChart2 className="h-5 w-5" />,
      action: () => navigate('/pages/analytics')
    }
  ]);

  // Urgent actions with enhanced handlers
  const urgentActions = [
    {
      id: '1',
      title: 'Response needed: Contract renewal from Acme Inc',
      icon: <AlertCircle className="h-5 w-5 text-red-500" />,
      priority: 'high',
      from: 'john@acmeinc.com',
      time: '2 hours ago',
      action: () => console.log('Opening contract renewal email')
    },
    {
      id: '2',
      title: 'Team status meeting',
      icon: <Users className="h-5 w-5 text-yellow-500" />,
      priority: 'medium',
      from: 'Project Manager',
      time: 'Today, 3:00 PM',
      action: () => console.log('Opening meeting details')
    },
    {
      id: '3',
      title: 'Quarterly report due in 24 hours',
      icon: <Clock className="h-5 w-5 text-yellow-500" />,
      priority: 'high',
      from: '',
      time: 'Tomorrow, 5:00 PM',
      action: () => console.log('Opening quarterly report')
    },
    {
      id: '4',
      title: 'Review and approve new marketing materials',
      icon: <FileText className="h-5 w-5 text-blue-500" />,
      priority: 'medium',
      from: 'marketing@company.com',
      time: 'Added yesterday',
      action: () => console.log('Reviewing marketing materials')
    },
    {
      id: '5',
      title: 'Storage space is almost full (92%)',
      icon: <AlertCircle className="h-5 w-5 text-blue-500" />,
      priority: 'low',
      from: '',
      time: 'Just now',
      action: () => console.log('Checking storage space')
    }
  ];

  // Action handlers for urgent actions
  const handleSchedule = (action) => {
    console.log(`Scheduling action: ${action.title}`);
    alert(`Scheduled: ${action.title}`);
  };

  const handleAddTask = (action) => {
    console.log(`Adding task: ${action.title}`);
    alert(`Task added: ${action.title}`);
  };

  const handleRead = (action) => {
    console.log(`Reading: ${action.title}`);
    alert(`Reading: ${action.title}`);
  };

  const handleAnalyze = (action) => {
    console.log(`Analyzing: ${action.title}`);
    alert(`Analysis started for: ${action.title}`);
  };

  // Handler for Quick Access items
  const handleEditQuickAccess = () => {
    console.log('Editing quick access menu');
    alert('Edit Quick Access feature coming soon!');
  };

  const handleAddQuickAccess = () => {
    console.log('Adding quick access item');
    alert('Add Quick Access Item feature coming soon!');
  };

  const handleRemoveQuickAccess = (index) => {
    setQuickAccessItems(prev => prev.filter((_, i) => i !== index));
    console.log(`Removed quick access item at index ${index}`);
  };

  // Handle toggling between light and earthDark themes
  const handleThemeToggle = () => {
    if (theme === 'light' || theme === 'system') {
      setTheme('earthDark');
    } else {
      setTheme('light');
    }
  };

  // Check for urgent actions on mount
  React.useEffect(() => {
    const highPriorityActions = urgentActions.filter(action => action.priority === 'high');
    if (highPriorityActions.length > 0 && !hasSeenUrgentActions) {
      setShowUrgentAlert(true);
    }
  }, []);

  // Handle viewing urgent actions
  const handleViewUrgentActions = () => {
    setHasSeenUrgentActions(true);
    setShowUrgentAlert(false);
    setMobileActiveTab('urgent-actions');
  };

  // Get count of high priority actions
  const urgentCount = urgentActions.filter(action => action.priority === 'high').length;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background">
      {/* Sidebar */}
      <div
        className={`
          ${showMobileSidebar ? 'fixed inset-0 z-40 block w-full bg-gradient-to-b from-blue-700 to-blue-900 dark:from-gray-800 dark:to-gray-900' : 'hidden'}
          md:relative md:block md:w-72 lg:w-80 flex-shrink-0 bg-gradient-to-b from-blue-700 to-blue-900 dark:from-gray-800 dark:to-gray-900 text-white shadow-lg
        `}
        aria-label="Email Categories Sidebar"
      >
        {/* Close button for mobile sidebar */}
        <button
          className={`md:hidden absolute top-4 right-4 text-white p-2`}
          onClick={() => setShowMobileSidebar(false)}
          aria-label="Close sidebar"
        >
          <X size={24} />
        </button>

        {/* Sidebar content */}
        <div className="p-4 overflow-y-auto max-h-screen">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-1">Command Center</h2>
            <p className="text-sm text-blue-200 dark:text-gray-300">
              Quick access to everything you need
            </p>
          </div>

          {/* Email Stats Row - 4 small boxes across */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            <div className="bg-background/10 p-3 rounded">
              <div className="text-xs text-blue-200">New Emails</div>
              <div className="flex items-center justify-between">
                <div className="text-xl font-bold">23</div>
                <Mail className="h-4 w-4 text-blue-200" />
              </div>
            </div>
            
            <div className="bg-background/10 p-3 rounded">
              <div className="text-xs text-blue-200">Responded</div>
              <div className="flex items-center justify-between">
                <div className="text-xl font-bold">15</div>
                <MessageSquare className="h-4 w-4 text-blue-200" />
              </div>
            </div>
            
            <div className="bg-background/10 p-3 rounded">
              <div className="text-xs text-blue-200">Flagged</div>
              <div className="flex items-center justify-between">
                <div className="text-xl font-bold">4</div>
                <AlertCircle className="h-4 w-4 text-blue-200" />
              </div>
            </div>
            
            <div className="bg-background/10 p-3 rounded">
              <div className="text-xs text-blue-200">Meetings</div>
              <div className="flex items-center justify-between">
                <div className="text-xl font-bold">2</div>
                <Users className="h-4 w-4 text-blue-200" />
              </div>
            </div>
          </div>
          
          {/* Three Sections Row - Left, Middle, Right */}
          <div className="mb-6">
            {/* Quick Access - Left */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4" />
                <h3 className="text-sm font-semibold">Quick Access</h3>
              </div>
              <div className="space-y-2">
                {quickAccessItems.slice(0, 3).map((item, idx) => (
                  <button 
                    key={idx}
                    className="w-full text-left bg-background/10 hover:bg-background/20 p-2 rounded text-sm flex items-center"
                    onClick={item.action}
                  >
                    {React.cloneElement(item.icon, { className: "h-4 w-4 mr-2" })}
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Urgent Actions - Middle */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4" />
                <h3 className="text-sm font-semibold">Urgent Actions</h3>
              </div>
              <div className="space-y-2 bg-background/10 p-3 rounded">
                {urgentActions.slice(0, 3).map((action, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-xs truncate">{action.title.length > 24 ? action.title.substring(0, 24) + '...' : action.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      action.priority === 'high' ? 'bg-red-500' : 
                      action.priority === 'medium' ? 'bg-yellow-500' : 
                      'bg-blue-500'
                    } text-white`}>
                      {action.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Chatbot - Right */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4" />
                <h3 className="text-sm font-semibold">AI Assistant</h3>
              </div>
              <div className="bg-background/10 p-3 rounded">
                <p className="text-xs text-blue-200 mb-2">
                  Ask me anything about your email analytics and management.
                </p>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded text-sm flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Start Chat
                </button>
              </div>
            </div>
          </div>
          
          {/* Categories heading */}
          <h3 className="text-sm font-semibold mb-2">Categories</h3>

          {/* Category boxes */}
          <div className="space-y-1 overflow-y-auto">
            {boxes.map((box) => (
              <CategoryBox
                key={box.id}
                box={box}
                onClick={() => handleSelectBox(box.id)}
                isSelected={selectedBox === box.id}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 md:h-screen overflow-y-auto">
        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-background dark:bg-gray-800 shadow">
          <button 
            className="p-2" 
            onClick={() => setShowMobileSidebar(true)}
            aria-label="Open sidebar"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-lg font-bold">Email Assistant</h1>
          <div className="flex items-center">
            <NotificationsDropdown />
            <button 
              className="p-2" 
              onClick={() => setShowSettings(!showSettings)}
              aria-label="Settings"
            >
              <Settings size={24} />
            </button>
          </div>
        </div>
      
        {/* Main content area */}
        <div className="p-4 md:p-6">
          {/* Mobile Header */}
          <div className="flex items-center justify-between mb-6 md:hidden">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowMobileSidebar(true)}
                className="p-2 rounded-lg hover:bg-accent"
                aria-label="Open menu"
              >
                <Menu size={20} />
              </button>
              <div>
                <h1 className="text-lg font-bold tracking-tight dark:text-white">
                  Command Center
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <NotificationsDropdown />
              <button
                className="p-2 rounded-full hover:bg-accent dark:hover:bg-gray-700"
                onClick={() => setShowSettings(!showSettings)}
                aria-label="Settings"
              >
                <Settings size={20} />
              </button>
            </div>
          </div>
          
          {/* Desktop Header */}
          <div className="hidden md:flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight dark:text-white">
                {boxes.find((b) => b.id === selectedBox)?.name || "All Emails"}
              </h1>
              <p className="text-sm text-muted-foreground dark:text-gray-400">
                {selectedBox === "all" ? "View and manage all your emails" : `View emails categorized as ${boxes.find((b) => b.id === selectedBox)?.name}`}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <InstallPWAButton />
              <NotificationsDropdown />
              
              {/* Theme toggle button */}
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleThemeToggle} 
                className="h-8 w-8"
                title={theme === 'light' ? "Switch to Dark Mode" : "Switch to Light Mode"}
              >
                {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </Button>

              <button
                className="p-2 rounded-full hover:bg-accent dark:hover:bg-gray-700"
                onClick={() => setShowSettings(!showSettings)}
                aria-label="Settings"
              >
                <Settings size={20} />
              </button>
            </div>
          </div>

          {/* Settings panel */}
          {showSettings ? (
            <SettingsPage
              boxes={boxes}
              onToggleImportant={toggleImportant}
              onDeleteBox={handleDeleteBox}
              onRenameBox={handleRenameBox}
              onAddBox={handleAddBox}
              onClose={() => setShowSettings(false)}
            />
          ) : (
            <>
              {/* Mobile Tab Navigation - Only visible on mobile */}
              <div className="xl:hidden sticky top-0 z-10 bg-background border-b border-gray-200 dark:border-gray-700 -mx-4 mb-4">
                <div className="flex justify-around">
                  <button
                    onClick={() => setMobileActiveTab('quick-access')}
                    className={`flex-1 py-3 px-4 text-sm font-medium transition-colors relative ${
                      mobileActiveTab === 'quick-access' 
                        ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' 
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    <Calendar className="w-5 h-5 mx-auto mb-1" />
                    Quick Access
                  </button>
                  
                  <button
                    onClick={() => setMobileActiveTab('urgent-actions')}
                    className={`flex-1 py-3 px-4 text-sm font-medium transition-colors relative ${
                      mobileActiveTab === 'urgent-actions' 
                        ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' 
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    <AlertCircle className="w-5 h-5 mx-auto mb-1" />
                    Urgent Actions
                    {urgentCount > 0 && (
                      <span className="absolute top-2 right-1/2 translate-x-6 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {urgentCount}
                      </span>
                    )}
                  </button>
                  
                  <button
                    onClick={() => setMobileActiveTab('ai-chat')}
                    className={`flex-1 py-3 px-4 text-sm font-medium transition-colors relative ${
                      mobileActiveTab === 'ai-chat' 
                        ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' 
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    <Sparkles className="w-5 h-5 mx-auto mb-1" />
                    AI Chat
                  </button>
                </div>
              </div>

              {/* Mobile Single Panel View */}
              <div className="xl:hidden">
                {mobileActiveTab === 'quick-access' && (
                  <QuickAccessPanel 
                    items={quickAccessItems}
                    onEditItems={handleEditQuickAccess}
                    onAddItem={handleAddQuickAccess}
                    onRemoveItem={handleRemoveQuickAccess}
                  />
                )}

                {mobileActiveTab === 'urgent-actions' && (
                  <UrgentActionsPanel
                    actions={urgentActions}
                    onActionClick={(action) => console.log('Action clicked:', action.title)}
                    onSchedule={handleSchedule}
                    onAddTask={handleAddTask}
                    onRead={handleRead}
                    onAnalyze={handleAnalyze}
                  />
                )}

                {mobileActiveTab === 'ai-chat' && (
                  <div className="bg-background dark:bg-gray-800 rounded-lg shadow-sm h-[calc(100vh-20rem)] overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                      <div className="flex items-center">
                        <Sparkles className="w-5 h-5 mr-2 text-purple-500" />
                        <h2 className="text-lg font-semibold">AI Chat Assistant</h2>
                      </div>
                    </div>
                    <div className="p-4 overflow-auto flex-grow">
                      <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                        <Sparkles size={40} className="mb-2 text-purple-500 opacity-80" />
                        <p className="mb-1 font-medium">AI Chat Assistant</p>
                        <p className="text-sm max-w-xs">
                          Ask me anything about email management, drafting responses, or organizing your inbox
                        </p>
                        <div className="mt-4 grid grid-cols-1 gap-2 w-full max-w-sm">
                          <button className="text-left text-sm px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                            How can I write a professional email?
                          </button>
                          <button className="text-left text-sm px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                            Draft an email to reschedule a meeting
                          </button>
                          <button className="text-left text-sm px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                            Tips for managing email overload
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex">
                        <input 
                          type="text" 
                          placeholder="Type a message..." 
                          className="flex-grow p-2 border rounded-l-md focus:outline-none focus:ring-1 focus:ring-purple-400 dark:bg-gray-700 dark:border-gray-600 text-sm"
                        />
                        <button className="bg-purple-500 hover:bg-purple-600 text-white p-2 rounded-r-md">
                          <Edit3 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Desktop Grid View */}
              <div className="hidden xl:grid xl:grid-cols-3 xl:gap-6">
                {/* Quick Access Panel */}
                <div className="w-full">
                  <QuickAccessPanel 
                    items={quickAccessItems}
                    onEditItems={handleEditQuickAccess}
                    onAddItem={handleAddQuickAccess}
                    onRemoveItem={handleRemoveQuickAccess}
                  />
                </div>

                {/* Urgent Actions Panel */}
                <div className="w-full">
                  <UrgentActionsPanel
                    actions={urgentActions}
                    onActionClick={(action) => console.log('Action clicked:', action.title)}
                    onSchedule={handleSchedule}
                    onAddTask={handleAddTask}
                    onRead={handleRead}
                    onAnalyze={handleAnalyze}
                  />
                </div>

                {/* AI Chat Panel */}
                <div className="w-full">
                  <div className="bg-background dark:bg-gray-800 rounded-lg shadow-sm h-[calc(100vh-13rem)] overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                      <div className="flex items-center">
                        <Sparkles className="w-5 h-5 mr-2 text-purple-500" />
                        <h2 className="text-lg font-semibold">AI Chat Assistant</h2>
                      </div>
                    </div>
                    <div className="p-4 overflow-auto flex-grow">
                      <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                        <Sparkles size={40} className="mb-2 text-purple-500 opacity-80" />
                        <p className="mb-1 font-medium">AI Chat Assistant</p>
                        <p className="text-sm max-w-xs">
                          Ask me anything about email management, drafting responses, or organizing your inbox
                        </p>
                        <div className="mt-4 grid grid-cols-1 gap-2 w-full max-w-sm">
                          <button className="text-left text-sm px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                            How can I write a professional email?
                          </button>
                          <button className="text-left text-sm px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                            Draft an email to reschedule a meeting
                          </button>
                          <button className="text-left text-sm px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                            Tips for managing email overload
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex">
                        <input 
                          type="text" 
                          placeholder="Type a message..." 
                          className="flex-grow p-2 border rounded-l-md focus:outline-none focus:ring-1 focus:ring-purple-400 dark:bg-gray-700 dark:border-gray-600 text-sm"
                        />
                        <button className="bg-purple-500 hover:bg-purple-600 text-white p-2 rounded-r-md">
                          <Edit3 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )
          )}
        </div>
      </div>

      {/* Urgent Actions Alert Modal */}
      {showUrgentAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full mr-4">
                <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Urgent Actions Required
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  You have {urgentCount} high priority {urgentCount === 1 ? 'action' : 'actions'} waiting
                </p>
              </div>
            </div>
            
            <div className="space-y-3 mb-6">
              {urgentActions.filter(action => action.priority === 'high').slice(0, 3).map((action) => (
                <div key={action.id} className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <h3 className="font-medium text-sm">{action.title}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{action.time}</p>
                </div>
              ))}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleViewUrgentActions}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                View Actions
              </button>
              <button
                onClick={() => {
                  setShowUrgentAlert(false);
                  setHasSeenUrgentActions(true);
                }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email editing modal */}
      {editingEmail && (
        <EmailEditModal
          isOpen={!!editingEmail}
          onClose={() => setEditingEmail(null)}
          email={editingEmail}
        />
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                          EMAIL CARD COMPONENT                              */
/* -------------------------------------------------------------------------- */

/* EmailCard component - not used
function EmailCard({ email, setEditingEmail }) {
  // Determine priority styling
  const priorityStyles = {
    high: "border-l-4 border-red-500 bg-red-500/10 dark:bg-red-500/20",
    medium: "border-l-4 border-yellow-500 bg-yellow-500/10 dark:bg-yellow-500/20",
    low: "border-l-4 border-gray-300 dark:border-gray-600",
  };
  const priorityClass = priorityStyles[email.priority] || priorityStyles.low;

  const [showFullSummary, setShowFullSummary] = useState(false);

  return (
    <div
      className={`bg-card text-card-foreground mb-3 rounded-lg shadow-sm overflow-hidden w-full transition-shadow hover:shadow-md ${priorityClass}`}
      role="article"
      aria-labelledby={`email-subject-${email.id}`}
    >
      <div className="flex flex-col sm:flex-row justify-between p-3 sm:p-4">
        {/* Email Info Section */}
        <div className="sm:flex-1 mb-2 sm:mb-0 min-w-0 mr-4 cursor-pointer" onClick={() => setShowFullSummary(!showFullSummary)}>
          <div className="flex items-start justify-between sm:justify-start mb-1">
            <div className="font-semibold truncate flex-1 text-sm" id={`email-sender-${email.id}`}>{email.sender}</div>
            <div className="text-xs text-muted-foreground ml-2 whitespace-nowrap flex-shrink-0">
              {email.dateTimeReceived}
            </div>
          </div>
          <div className="text-xs text-muted-foreground truncate mb-1">
            To: {email.to || "you"} {email.cc && `| CC: ${email.cc}`}
          </div>
          <div className="text-sm font-medium text-foreground truncate mb-1" id={`email-subject-${email.id}`}>{email.subject}</div>
          <p className={`text-sm ${showFullSummary ? 'text-muted-foreground' : 'text-muted-foreground truncate'}`}>
            {showFullSummary ? email.fullSummary : email.quickSummary}
          </p>
        </div>

        {/* Action Buttons Section */}
        <div className="flex items-center space-x-1 flex-shrink-0 mt-2 sm:mt-0 self-start sm:self-center">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground h-8 w-8"
            onClick={(e) => { e.stopPropagation(); setEditingEmail(email); }}
            aria-label="Edit or Draft Email"
            title="Edit/Draft"
          >
            <Sparkles size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground h-8 w-8"
            onClick={(e) => { e.stopPropagation(); setShowFullSummary(!showFullSummary); }}
            aria-label={showFullSummary ? "Show less" : "Show more"}
            title={showFullSummary ? "Show less" : "Show more"}
          >
            <ChevronDown size={18} className={`transition-transform duration-200 ${showFullSummary ? 'rotate-180' : ''}`} />
          </Button>
          {/* Add other actions like Reply, Forward, Delete etc. */}
        </div>
      </div>
    </div>
  );
} */

/* -------------------------------------------------------------------------- */
/*                         CATEGORY BOX COMPONENT                             */
/* -------------------------------------------------------------------------- */

function CategoryBox({ box, onClick, isSelected }) {
  const Icon = box.icon || Mail;

  return (
    <button
      onClick={onClick}
      className={`
        flex items-center w-full p-3 rounded-md cursor-pointer group text-left
        transition-colors duration-150 ease-in-out
        border border-transparent
        ${
          isSelected
            ? "bg-background/20 dark:bg-background/10 font-semibold text-white" // Enhanced selected state
            : "text-white/80 hover:bg-background/10 dark:hover:bg-background/5 hover:text-white" // Enhanced hover state
        }
      `}
      aria-current={isSelected ? "page" : undefined}
      role="menuitemradio"
      aria-checked={isSelected}
    >
      <div
        className="flex items-center justify-center w-6 h-6 rounded-md mr-3 flex-shrink-0"
        // Use inline style for dynamic color with opacity
        style={{ backgroundColor: box.color ? `${box.color}33` : 'rgba(255,255,255,0.2)' }}
      >
        {Icon && <Icon className="h-4 w-4 text-white opacity-90" />}
      </div>
      <span className="text-sm truncate flex-grow">
        {box.name}
      </span>
      {box.unread > 0 && (
        <div className={`ml-auto text-xs font-medium rounded-full px-2 py-0.5 ${isSelected ? 'bg-background text-blue-700 dark:text-foreground' : 'bg-background/30 text-white'}`}>
          {box.unread}
        </div>
      )}
      {/* Optional: Important Star - uncomment if needed
      <span className="ml-2 flex-shrink-0" title={box.important ? "Important" : "Mark as important"}>
        {box.important ? <Star className="h-4 w-4 text-yellow-400 fill-current" /> : <Star className="h-4 w-4 text-white/40 group-hover:text-white/70" />}
      </span>
      */}
    </button>
  );
}
