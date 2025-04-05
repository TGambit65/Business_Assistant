import React, { useState, useEffect } from 'react';
import { useToast } from '../../contexts/ToastContext';
import {
  Search,
  Inbox,
  Star,
  Archive,
  Trash2,
  RefreshCw,
  Filter,
  ChevronDown,
  Mail,
  MailOpen,
  MoreVertical,
  Check,
  AlertCircle,
  MessageSquare,
  Clock,
  // Tags, // Removed unused import
  Tag,
  // ChevronRight, // Removed unused import
  Menu,
  Paperclip
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const InboxPage = () => {
  const { success, info, error, warning } = useToast();
  const navigate = useNavigate();
  const { sortEmailsAutomatically } = useAuth();
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Close sidebar when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Sample categories data
  const categoryData = [
    { id: 'inbox', name: 'Inbox', icon: Inbox, count: 12, isCategory: true, order: 1 },
    { id: 'sent', name: 'Sent', icon: MessageSquare, count: 8, isCategory: true, order: 2 },
    { id: 'drafts', name: 'Drafts', icon: Clock, count: 2, isCategory: true, order: 3 },
    { id: 'archive', name: 'Archive', icon: Archive, count: 4, isCategory: true, order: 4 },
    { id: 'trash', name: 'Trash', icon: Trash2, count: 1, isCategory: true, order: 5 }
  ];
  
  // Sample label data
  const labelData = [
    {
      id: 'label-work',
      name: 'Work',
      displayName: 'Work',
      icon: Tag,
      color: '#1890ff',
      backgroundColor: 'bg-blue-100',
      textColor: 'text-blue-800',
      darkBackgroundColor: 'dark:bg-blue-900',
      darkTextColor: 'dark:text-blue-200',
      removeFromInbox: true,
      isLabel: true,
      order: 6
    },
    {
      id: 'label-personal',
      name: 'Personal',
      displayName: 'Personal',
      icon: Tag,
      color: '#52c41a',
      backgroundColor: 'bg-green-100',
      textColor: 'text-green-800',
      darkBackgroundColor: 'dark:bg-green-900',
      darkTextColor: 'dark:text-green-200',
      removeFromInbox: false,
      isLabel: true,
      order: 7
    },
    {
      id: 'label-urgent',
      name: 'Urgent',
      displayName: 'Urgent',
      icon: Tag,
      color: '#ff4d4f',
      backgroundColor: 'bg-red-100',
      textColor: 'text-red-800',
      darkBackgroundColor: 'dark:bg-red-900',
      darkTextColor: 'dark:text-red-200',
      removeFromInbox: true,
      isLabel: true,
      order: 8
    },
    {
      id: 'label-team',
      name: 'Team',
      displayName: 'Team',
      icon: Tag,
      color: '#722ed1',
      backgroundColor: 'bg-purple-100',
      textColor: 'text-purple-800',
      darkBackgroundColor: 'dark:bg-purple-900',
      darkTextColor: 'dark:text-purple-200',
      removeFromInbox: false,
      isLabel: true,
      order: 9
    },
    {
      id: 'label-support',
      name: 'Support',
      displayName: 'Support',
      icon: Tag,
      color: '#faad14',
      backgroundColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      darkBackgroundColor: 'dark:bg-yellow-900',
      darkTextColor: 'dark:text-yellow-200',
      removeFromInbox: true,
      isLabel: true,
      order: 10
    },
    {
      id: 'label-newsletter',
      name: 'Newsletter',
      displayName: 'Newsletter',
      icon: Tag,
      color: '#13c2c2',
      backgroundColor: 'bg-teal-100',
      textColor: 'text-teal-800',
      darkBackgroundColor: 'dark:bg-teal-900',
      darkTextColor: 'dark:text-teal-200',
      removeFromInbox: true,
      isLabel: true,
      order: 11
    }
  ];
  
  // Combine categories and labels into a single array
  // eslint-disable-next-line no-unused-vars
  const [navigationItems, setNavigationItems] = useState([...categoryData, ...labelData].sort((a, b) => a.order - b.order));
  
  // Sample emails data with different statuses
  const [emails, setEmails] = useState([
    {
      id: 1,
      from: { email: 'client@example.com', name: 'Important Client' },
      subject: 'Project proposal feedback',
      excerpt: "I've reviewed the project proposal you sent last week and have some feedback...",
      date: '10:30 AM',
      isRead: false,
      isStarred: true,
      isImportant: true,
      hasAttachments: true,
      category: 'inbox',
      labels: ['work', 'urgent']
    },
    {
      id: 2,
      from: { email: 'newsletter@company.com', name: 'Company Newsletter' },
      subject: 'Weekly Company Updates - New Product Launch',
      excerpt: "This week we're excited to announce our new product launch...",
      date: 'Yesterday',
      isRead: true,
      isStarred: false,
      isImportant: false,
      hasAttachments: false,
      category: 'inbox',
      labels: ['newsletter']
    },
    {
      id: 3,
      from: { email: 'team@project.org', name: 'Project Team' },
      subject: 'Team meeting agenda for tomorrow',
      excerpt: "Here's the agenda for our team meeting tomorrow at 10 AM...",
      date: 'Yesterday',
      isRead: false,
      isStarred: true,
      isImportant: true,
      hasAttachments: true,
      category: 'inbox',
      labels: ['work', 'team']
    },
    {
      id: 4,
      from: { email: 'support@service.com', name: 'Customer Support' },
      subject: 'Your support ticket #12345 has been resolved',
      excerpt: "We're happy to inform you that your support ticket regarding...",
      date: 'Sep 15',
      isRead: true,
      isStarred: false,
      isImportant: false,
      hasAttachments: false,
      category: 'inbox',
      labels: ['support']
    },
    {
      id: 5,
      from: { email: 'friend@personal.com', name: 'Personal Friend' },
      subject: 'Weekend plans',
      excerpt: "Hey! I was wondering if you'd like to join us for dinner this weekend...",
      date: 'Sep 14',
      isRead: true,
      isStarred: true,
      isImportant: false,
      hasAttachments: false,
      category: 'inbox',
      labels: ['personal']
    }
  ]);
  
  // Filter emails based on active category and search query
  const filteredEmails = emails.filter(email => {
    // If in label category, show only emails with that label
    if (activeCategory.startsWith('label-')) {
      const labelName = activeCategory.replace('label-', '');
      if (!email.labels.includes(labelName)) {
        return false;
      }
      // For labels that remove from inbox, include emails regardless of their category
      const labelItem = navigationItems.find(item => item.id === activeCategory);
      if (labelItem && labelItem.removeFromInbox) {
        return true;
      }
      // For labels that don't remove from inbox, only show inbox emails
      return email.category === 'inbox';
    }
    
    // For standard categories (inbox, sent, etc.)
    if (email.category !== activeCategory) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        email.subject.toLowerCase().includes(query) ||
        email.from.name.toLowerCase().includes(query) ||
        email.from.email.toLowerCase().includes(query) ||
        email.excerpt.toLowerCase().includes(query)
      );
    }
    
    return true;
  });
  
  // Get count of emails for a specific label
  const getLabelEmailCount = (labelName) => {
    const labelItem = navigationItems.find(item => item.isLabel && item.name.toLowerCase() === labelName.toLowerCase());
    
    // Count emails differently based on whether label removes from inbox
    if (labelItem && labelItem.removeFromInbox) {
      // For removeFromInbox labels, count emails from any category with this label
      return emails.filter(email => email.labels.includes(labelName)).length;
    } else {
      // For normal labels, only count inbox emails with this label
      return emails.filter(email => 
        email.category === 'inbox' && email.labels.includes(labelName)
      ).length;
    }
  };
  
  // Toggle email selection
  const toggleSelectEmail = (emailId) => {
    setSelectedEmails(prev => 
      prev.includes(emailId) 
        ? prev.filter(id => id !== emailId) 
        : [...prev, emailId]
    );
  };
  
  // Select all displayed emails
  const selectAllEmails = () => {
    if (selectedEmails.length === filteredEmails.length) {
      setSelectedEmails([]);
    } else {
      setSelectedEmails(filteredEmails.map(email => email.id));
    }
  };
  
  // Mark as read/unread
  const markAsRead = (ids, isRead = true) => {
    setEmails(emails.map(email => 
      ids.includes(email.id) ? { ...email, isRead } : email
    ));
    
    // Fix: Call toast function without rendering the return value
    setTimeout(() => {
      success({
        title: 'Success',
        description: `${ids.length} email${ids.length === 1 ? '' : 's'} marked as ${isRead ? 'read' : 'unread'}`,
      });
    }, 0);
    
    setSelectedEmails([]);
  };
  
  // Toggle star status
  const toggleStar = (id) => {
    setEmails(emails.map(email => 
      email.id === id ? { ...email, isStarred: !email.isStarred } : email
    ));
  };
  
  // Delete emails
  const deleteEmails = (ids) => {
    // In a real app, this would be an API call
    setEmails(emails.map(email => 
      ids.includes(email.id) ? { ...email, category: 'trash' } : email
    ));
    
    // Fix: Call toast function without rendering the return value
    setTimeout(() => {
      success({
        title: 'Success',
        description: `${ids.length} email${ids.length === 1 ? '' : 's'} moved to trash`,
      });
    }, 0);
    
    setSelectedEmails([]);
  };
  
  // Archive emails
  const archiveEmails = (ids) => {
    setEmails(emails.map(email => 
      ids.includes(email.id) ? { ...email, category: 'archive' } : email
    ));
    
    // Fix: Call toast function without rendering the return value
    setTimeout(() => {
      success({
        title: 'Success',
        description: `${ids.length} email${ids.length === 1 ? '' : 's'} archived`,
      });
    }, 0);
    
    setSelectedEmails([]);
  };
  
  // Refresh emails
  const refreshEmails = () => {
    info('Refreshing your inbox...');
    
    // Show loading state
    // In a real application, this would fetch the latest emails from the server
    
    // Automatically sort emails using multiple AI models to optimize cost
    sortEmailsAutomatically()
      .then(result => {
        if (result) {
          success('Inbox refreshed and emails automatically sorted');
          success('Multiple AI models were used to optimize sorting costs');
          
          // In a real app, this would update the UI with the refreshed and sorted emails
          // For now, we'll just simulate the refresh with a delay
          setTimeout(() => {
            // Reset selected emails
            setSelectedEmails([]);
            
            // This would be where we update the emails state with fresh data
            // For the demo, we'll just keep the current data
          }, 500);
        } else {
          warning('Inbox refreshed, but some emails could not be sorted');
        }
      })
      .catch(() => {
        error('Error sorting emails, please try again');
      });
  };
  
  // Handle click on email to view details
  const handleEmailClick = (emailId) => {
    navigate(`/email/detail/${emailId}`);
  };
  
  // Get active category title
  const getActiveCategoryTitle = () => {
    const activeItem = navigationItems.find(item => item.id === activeCategory);
    return activeItem ? activeItem.displayName || activeItem.name : 'Mail';
  };
  
  // Get email count for display
  const getEmailCount = (itemId) => {
    if (itemId.startsWith('label-')) {
      const labelName = itemId.replace('label-', '');
      return getLabelEmailCount(labelName);
    }
    
    const item = navigationItems.find(i => i.id === itemId);
    return item ? item.count : 0;
  };
  
  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-background">
      {/* Mobile sidebar toggle */}
      <div className="md:hidden sticky top-0 z-10 bg-background dark:bg-gray-800 p-3 border-b border-border dark:border-gray-700 flex justify-between items-center">
        <h1 className="text-lg font-semibold">{getActiveCategoryTitle()}</h1>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>
      
      {/* Email categories sidebar - Fixed width, no dragging */}
      <aside className="w-64 bg-background border-r border-border overflow-y-auto">
        <div className="py-4">
          <h2 className="px-4 text-xl font-medium text-gray-800 mb-4">Mail</h2>
          
          {/* Simple navigation list without drag and drop */}
          <ul className="space-y-1">
            {/* Regular categories (Inbox, Sent, etc.) */}
            {categoryData.map((item) => (
              <li key={item.id}>
                <button 
                  onClick={() => setActiveCategory(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-2 ${
                    activeCategory === item.id 
                      ? 'bg-blue-500 text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center">
                    <item.icon className="h-5 w-5 mr-3" />
                    <span>{item.name}</span>
                  </div>
                  <span 
                    className={`text-xs px-2 py-1 rounded-full ${
                      activeCategory === item.id 
                        ? 'bg-background text-blue-500' 
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {item.count}
                  </span>
                </button>
              </li>
            ))}
            
            {/* Divider */}
            <li className="px-4 py-2">
              <div className="border-t border-border"></div>
            </li>
            
            {/* Labels (Work, Personal, etc.) */}
            {labelData.map((item) => (
              <li key={item.id}>
                <button 
                  onClick={() => setActiveCategory(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-2 ${
                    activeCategory === item.id 
                      ? 'bg-blue-500 text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`h-3 w-3 rounded-full ${item.backgroundColor} mr-3`}></div>
                    <span>{item.displayName || item.name}</span>
                  </div>
                  <span 
                    className={`text-xs px-2 py-1 rounded-full ${
                      activeCategory === item.id 
                        ? 'bg-background text-blue-500' 
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {getEmailCount(item.id)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </aside>
      
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-background pt-16" onClick={e => e.stopPropagation()}>
            <ul className="space-y-1">
              {navigationItems.map((item) => (
                <li key={item.id}>
                  <button 
                    onClick={() => {
                      setActiveCategory(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-2 ${
                      activeCategory === item.id 
                        ? 'bg-blue-500 text-white' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center">
                      {item.isLabel ? (
                        <div className={`h-3 w-3 rounded-full ${item.backgroundColor} mr-3`}></div>
                      ) : (
                        <item.icon className="h-5 w-5 mr-3" />
                      )}
                      <span>{item.displayName || item.name}</span>
                    </div>
                    <span 
                      className={`text-xs px-2 py-1 rounded-full ${
                        activeCategory === item.id 
                          ? 'bg-background text-blue-500' 
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {getEmailCount(item.id)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="bg-background dark:bg-gray-800 p-2 sm:p-4 border-b border-border dark:border-gray-700 flex flex-wrap gap-2">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <div className="flex items-center">
              <button 
                onClick={selectAllEmails}
                className="p-1.5 sm:p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Select All"
              >
                <Check className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
              <button 
                className="p-1.5 sm:p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            
            <div className="flex items-center">
              <button 
                onClick={refreshEmails}
                className="p-1.5 sm:p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Refresh"
              >
                <RefreshCw className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
              <button 
                onClick={() => setFilterOpen(!filterOpen)}
                className="p-1.5 sm:p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Filter"
              >
                <Filter className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>
          
          {selectedEmails.length > 0 && (
            <div className="flex items-center space-x-1 sm:space-x-2">
              <button 
                onClick={() => markAsRead(selectedEmails, true)}
                className="p-1.5 sm:p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Mark as read"
              >
                <MailOpen className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
              <button 
                onClick={() => markAsRead(selectedEmails, false)}
                className="p-1.5 sm:p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Mark as unread"
              >
                <Mail className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
              <button 
                onClick={() => archiveEmails(selectedEmails)}
                className="p-1.5 sm:p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Archive"
              >
                <Archive className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
              <button 
                onClick={() => deleteEmails(selectedEmails)}
                className="p-1.5 sm:p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Delete"
              >
                <Trash2 className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          )}
          
          <div className="relative flex-1 max-w-md ml-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search emails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full rounded-md border border-gray-300 dark:border-gray-600 py-1.5 sm:py-2 bg-background dark:bg-gray-700 text-foreground dark:text-white focus:ring-primary focus:border-primary"
            />
          </div>
        </div>
        
        {/* Filter dropdown */}
        {filterOpen && (
          <div className="p-3 sm:p-4 bg-background dark:bg-gray-800 border-b border-border dark:border-gray-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date Range
                </label>
                <select className="w-full rounded-md border border-gray-300 dark:border-gray-600 py-1.5 sm:py-2 bg-background dark:bg-gray-700 text-foreground dark:text-white">
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Last 3 months</option>
                  <option>Custom range</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Read Status
                </label>
                <select className="w-full rounded-md border border-gray-300 dark:border-gray-600 py-1.5 sm:py-2 bg-background dark:bg-gray-700 text-foreground dark:text-white">
                  <option>All emails</option>
                  <option>Read emails</option>
                  <option>Unread emails</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Has Attachments
                </label>
                <select className="w-full rounded-md border border-gray-300 dark:border-gray-600 py-1.5 sm:py-2 bg-background dark:bg-gray-700 text-foreground dark:text-white">
                  <option>All emails</option>
                  <option>With attachments</option>
                  <option>Without attachments</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-gray-700 bg-background border border-gray-300 rounded-md hover:bg-muted dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600">
                Reset
              </button>
              <button className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark">
                Apply Filters
              </button>
            </div>
          </div>
        )}
        
        {/* Section Title */}
        <div className="bg-background dark:bg-gray-800 px-4 py-2 border-b border-border dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-800 dark:text-white">
            {getActiveCategoryTitle()}
            {activeCategory.startsWith('label-') && (
              <span className="text-xs ml-2 text-gray-500 dark:text-gray-400">
                ({getEmailCount(activeCategory)} emails)
              </span>
            )}
          </h2>
        </div>
        
        {/* Email list */}
        <div className="flex-1 overflow-auto">
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredEmails.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">No emails found</p>
              </div>
            ) : (
              filteredEmails.map(email => (
                <div 
                  key={email.id}
                  onClick={() => handleEmailClick(email.id)}
                  className={`hover:bg-muted dark:hover:bg-gray-800 ${
                    !email.isRead ? 'bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20' : ''
                  } cursor-pointer`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center px-4 py-3">
                    <div className="flex items-center mb-2 sm:mb-0 sm:min-w-[40px]" onClick={e => e.stopPropagation()}>
                      <input 
                        type="checkbox"
                        checked={selectedEmails.includes(email.id)}
                        onChange={() => toggleSelectEmail(email.id)}
                        className="h-4 w-4 text-primary border-gray-300 rounded"
                      />
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStar(email.id);
                        }}
                        className="ml-2"
                      >
                        <Star className={`h-5 w-5 ${
                          email.isStarred ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'
                        }`} />
                      </button>
                      {email.isImportant && (
                        <AlertCircle className="h-5 w-5 text-red-500 ml-1" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 sm:ml-3">
                      <div className="sm:flex sm:items-center sm:justify-between">
                        <p className="font-medium text-sm sm:text-base truncate text-foreground dark:text-white">
                          {email.from.name || email.from.email}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 sm:ml-2">
                          {email.date}
                        </p>
                      </div>
                      <p className="text-sm font-medium truncate text-gray-800 dark:text-gray-200 mt-1">
                        {email.subject}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate mt-1">
                        {email.excerpt}
                      </p>
                      {/* Email labels */}
                      {email.labels && email.labels.length > 0 && (
                        <div className="flex flex-wrap mt-2 gap-1">
                          {email.labels.map(labelName => {
                            const label = labelData.find(l => l.name.toLowerCase() === labelName.toLowerCase());
                            return label ? (
                              <span 
                                key={label.id}
                                className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full ${label.backgroundColor} ${label.textColor} ${label.darkBackgroundColor} ${label.darkTextColor}`}
                              >
                                {label.displayName}
                              </span>
                            ) : null;
                          })}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center mt-2 sm:mt-0 sm:ml-2">
                      {email.hasAttachments && (
                        <div className="text-gray-400 mr-2">
                          <Paperclip className="h-4 w-4" />
                        </div>
                      )}
                      <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InboxPage; 