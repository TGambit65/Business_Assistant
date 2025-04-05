import React, { useState } from 'react';
// import { DashboardStats } from '../../components/dashboard/DashboardStats';
// import { QuickAccessPanel } from '../../components/dashboard/QuickAccessPanel';
// import { UrgentActionsPanel } from '../../components/dashboard/UrgentActionsPanel';
// import { EmailSummariesPanel } from '../../components/dashboard/EmailSummariesPanel';
// import { AIChatAssistant } from '../../components/dashboard/AIChatAssistant';
import { QuickAccessItem, UrgentAction, EmailSummary, ChatMessage, DashboardStat } from '../../types/dashboard';
// import { sortByPriority } from '../../utils/dashboardUtils';
import { Button } from '../../components/ui/Button';
import {
  Mail,
  MessageSquare,
  Calendar,
  Search,
  Flag,
  Clock,
  Edit3,
  FileText,
  Tag,
  User,
  PenTool,
  // BarChart,
  Bookmark,
  AlertCircle,
  Sparkles,
  CheckCircle
} from 'lucide-react';

const DashboardPage: React.FC = () => {
  // Stats
  const [stats] = useState<DashboardStat[]>([
    {
      label: "New Emails",
      value: 23,
      icon: <Mail className="w-5 h-5 text-blue-500" />,
    },
    {
      label: 'Responded',
      value: 15,
      icon: <MessageSquare className="w-5 h-5 text-green-500" />,
    },
    {
      label: 'Flagged',
      value: 4,
      icon: <Flag className="w-5 h-5 text-red-500" />,
    },
    {
      label: 'Meetings',
      value: 2,
      icon: <Calendar className="w-5 h-5 text-purple-500" />,
    },
  ]);

  // Quick Access
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [quickAccessItems, setQuickAccessItems] = useState<QuickAccessItem[]>([
    {
      label: 'Schedule',
      icon: <Calendar className="w-5 h-5" />,
      action: () => console.log('Opening schedule'),
    },
    {
      label: 'Search Inbox',
      icon: <Search className="w-5 h-5" />,
      action: () => window.location.href = '/email/inbox',
    },
    {
      label: 'Compose Email',
      icon: <Edit3 className="w-5 h-5" />,
      action: () => window.location.href = '/email/compose',
    },
    {
      label: 'Draft Generator',
      icon: <PenTool className="w-5 h-5" />,
      action: () => window.location.href = '/email/draft-generator',
    },
    {
      label: 'Manage Labels',
      icon: <Tag className="w-5 h-5" />,
      action: () => console.log('Managing labels'),
    },
    {
      label: 'Templates',
      icon: <FileText className="w-5 h-5" />,
      action: () => window.location.href = '/email/templates',
    },
    {
      label: 'Signatures',
      icon: <Bookmark className="w-5 h-5" />,
      action: () => window.location.href = '/email/signature',
    },
  ]);

  // Urgent Actions
  const [urgentActions] = useState<UrgentAction[]>([
    {
      id: '1',
      title: 'Response needed: Contract renewal from Acme Inc',
      icon: <AlertCircle className="w-5 h-5 text-red-500" />,
      priority: 'high',
      from: 'john@acmeinc.com',
      time: '2 hours ago',
      action: () => console.log('Following up on client meeting'),
    },
    {
      id: '2',
      title: 'Team status meeting',
      icon: <User className="w-5 h-5 text-yellow-500" />,
      priority: 'medium',
      from: 'Project Manager',
      time: 'Today, 3:00 PM',
      action: () => console.log('Checking project deadline'),
    },
    {
      id: '3',
      title: 'Quarterly report due in 24 hours',
      icon: <Clock className="w-5 h-5 text-yellow-500" />,
      priority: 'high',
      from: '',
      time: 'Tomorrow, 5:00 PM',
      action: () => console.log('Working on quarterly report'),
    },
    {
      id: '4',
      title: 'Review and approve new marketing materials',
      icon: <CheckCircle className="w-5 h-5 text-yellow-500" />,
      priority: 'medium',
      from: 'marketing@company.com',
      time: 'Added yesterday',
      action: () => console.log('Reviewing marketing materials'),
    },
    {
      id: '5',
      title: 'Storage space is almost full (92%)',
      icon: <AlertCircle className="w-5 h-5 text-blue-500" />,
      priority: 'low',
      from: '',
      time: 'Just now',
      action: () => console.log('Checking storage space'),
    },
  ]);

  // Email Summaries
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showSummaries, setShowSummaries] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [generatingSummaries, setGeneratingSummaries] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [emailSummaries, setEmailSummaries] = useState<EmailSummary[]>([]);

  // Chat
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Handlers
  // handleReorderQuickAccess = (items: QuickAccessItem[]) => {
  //   setQuickAccessItems(items);
  // };

  // handleDeleteQuickAccess = (index: number) => {
  //   setQuickAccessItems((prev) => prev.filter((_, i) => i !== index));
  // };

  // handleAddQuickAccess = (item: QuickAccessItem) => {
  //   setQuickAccessItems((prev) => [...prev, item]);
  // };

  // handleGenerateSummaries = async () => {
  //   setGeneratingSummaries(true);
  //   // Simulate API call
  //   setTimeout(() => {
  //     setEmailSummaries([
  //       {
  //         id: '1',
  //         title: 'Important Client Update',
  //         summary: 'Client requested changes to the project timeline...',
  //         from: 'client@example.com',
  //         time: '1 hour ago',
  //         icon: <Mail className="w-5 h-5" />,
  //         label: 'Client',
  //         labelColor: '#3B82F6',
  //         priority: 'high',
  //       },
  //       // Add more summaries as needed
  //     ]);
  //     setGeneratingSummaries(false);
  //     setShowSummaries(true);
  //   }, 2000);
  // };

  const handleSendMessage = (message: string) => {
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: message },
      { role: 'assistant', content: 'This is a mock response. Implement actual AI response here.' },
    ]);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Command Center</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Quick access to everything you need
        </p>
      </div>

      {/* Stats Cards - 4 in a row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className={`p-4 rounded-lg shadow-sm flex flex-col ${index === 0 ? 'bg-blue-50 border-l-4 border-blue-500' : 
              index === 1 ? 'bg-green-50 border-l-4 border-green-500' : 
              index === 2 ? 'bg-red-50 border-l-4 border-red-500' : 
              'bg-purple-50 border-l-4 border-purple-500'}`}
          >
            <div className="text-sm text-gray-600">{stat.label}</div>
            <div className="flex items-center mt-1">
              <span className="text-2xl font-bold">{stat.value}</span>
              <div className="ml-auto">
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-3 gap-6">
        {/* Quick Access Panel */}
        <div className="col-span-1">
          <div className="bg-background rounded-lg shadow-sm h-[calc(100vh-13rem)] overflow-hidden flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="w-5 h-5 mr-2 text-yellow-500" />
                <h2 className="text-lg font-semibold">Quick Access</h2>
              </div>
              <div>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Edit3 className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <div className="p-4 overflow-auto flex-grow">
              <div className="space-y-2">
                {quickAccessItems.slice(0, 7).map((item, idx) => (
                  <button
                    key={idx}
                    className="flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-gray-100 transition-colors"
                    onClick={item.action}
                  >
                    <div className={`p-2 rounded-full ${idx % 2 === 0 ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                      {item.icon}
                    </div>
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Urgent Actions Panel */}
        <div className="col-span-1">
          <div className="bg-background rounded-lg shadow-sm h-[calc(100vh-13rem)] overflow-hidden flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-red-500" />
                <h2 className="text-lg font-semibold">Urgent Actions</h2>
              </div>
              <div>
                <div className="flex space-x-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Actions
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                  >
                    Summaries
                  </Button>
                </div>
              </div>
            </div>
            <div className="p-4 overflow-auto flex-grow">
              <div className="space-y-3">
                {urgentActions.map((action) => (
                  <div
                    key={action.id}
                    className={`flex items-start p-3 rounded-lg border ${
                      action.priority === 'high' ? 'border-red-200' : 
                      action.priority === 'medium' ? 'border-yellow-200' : 
                      'border-blue-200'
                    } hover:shadow-md cursor-pointer transition-all`}
                    onClick={action.action}
                  >
                    <div className="mr-3 mt-1">{action.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-foreground">{action.title}</h3>
                        <span 
                          className={`text-xs px-2 py-1 rounded-full ${
                            action.priority === 'high' ? 'bg-red-100 text-red-800' : 
                            action.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {action.priority}
                        </span>
                      </div>
                      {action.from && <p className="text-sm text-gray-600">From: {action.from}</p>}
                      <p className="text-sm text-gray-500">{action.time}</p>
                    </div>
                    <div className="flex-shrink-0 ml-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Calendar className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* AI Chat Panel */}
        <div className="col-span-1">
          <div className="bg-background rounded-lg shadow-sm h-[calc(100vh-13rem)] overflow-hidden flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-purple-500" />
                <h2 className="text-lg font-semibold">AI Chat Assistant</h2>
              </div>
              <div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="opacity-0 h-9 w-9 pointer-events-none"
                >
                  <Edit3 className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <div className="p-4 overflow-auto flex-grow">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                  <Sparkles size={40} className="mb-2 text-purple-500 opacity-80" />
                  <p className="mb-1 font-medium">AI Chat Assistant</p>
                  <p className="text-sm max-w-xs">
                    Ask me anything about email management, drafting responses, or organizing your inbox
                  </p>
                  <div className="mt-4 grid grid-cols-1 gap-2">
                    <button 
                      className="text-left text-sm px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                      onClick={() => handleSendMessage("How can I write a professional email?")}
                    >
                      How can I write a professional email?
                    </button>
                    <button 
                      className="text-left text-sm px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                      onClick={() => handleSendMessage("Draft an email to reschedule a meeting")}
                    >
                      Draft an email to reschedule a meeting
                    </button>
                    <button 
                      className="text-left text-sm px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                      onClick={() => handleSendMessage("Tips for managing email overload")}
                    >
                      Tips for managing email overload
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  {/* Chat messages would go here */}
                </div>
              )}
            </div>
            <div className="p-4 border-t">
              <div className="flex">
                <input 
                  type="text" 
                  placeholder="Type a message..." 
                  className="flex-grow p-2 border rounded-l-md focus:outline-none focus:ring-1 focus:ring-purple-400"
                />
                <button className="bg-purple-500 hover:bg-purple-600 text-white p-2 rounded-r-md">
                  <Edit3 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
