import React, { useState } from 'react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "../ui/dropdown-menu";
import { Button } from "./Button";
import { Bell, AlertCircle, Mail, Calendar, CheckCircle, User, FileText, BarChart2 } from 'lucide-react';

// More comprehensive mock notifications
const mockNotifications = [
  {
    id: 1,
    title: 'New email from John Smith',
    description: 'RE: Project timeline update',
    time: '5 minutes ago',
    icon: <Mail className="h-4 w-4 text-blue-500" />,
    type: 'email'
  },
  {
    id: 2,
    title: 'Meeting reminder',
    description: 'Team standup in 15 minutes',
    time: '10 minutes ago',
    icon: <Calendar className="h-4 w-4 text-purple-500" />,
    type: 'reminder'
  },
  {
    id: 3,
    title: 'Action required',
    description: 'Please approve the latest expense report',
    time: '1 hour ago',
    icon: <AlertCircle className="h-4 w-4 text-red-500" />,
    type: 'alert'
  },
  {
    id: 4,
    title: 'Task completed',
    description: 'Weekly report has been generated',
    time: '2 hours ago',
    icon: <CheckCircle className="h-4 w-4 text-green-500" />,
    type: 'success'
  },
  {
    id: 5,
    title: 'System notification',
    description: 'Your storage is almost full (85%)',
    time: '1 day ago',
    icon: <AlertCircle className="h-4 w-4 text-yellow-500" />,
    type: 'warning'
  },
  {
    id: 6,
    title: 'New connection request',
    description: 'Sarah Johnson wants to connect',
    time: '2 days ago',
    icon: <User className="h-4 w-4 text-indigo-500" />,
    type: 'social'
  },
  {
    id: 7,
    title: 'Document shared with you',
    description: 'Q3 Financial Report.pdf',
    time: '3 days ago',
    icon: <FileText className="h-4 w-4 text-gray-500" />,
    type: 'document'
  },
  {
    id: 8,
    title: 'Analytics report ready',
    description: 'Your monthly performance report is available',
    time: '5 days ago',
    icon: <BarChart2 className="h-4 w-4 text-blue-600" />,
    type: 'analytics'
  }
];

const NotificationsDropdown = () => {
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const [displayedNotifications, setDisplayedNotifications] = useState(mockNotifications.slice(0, 5));

  // Handler for "View all notifications"
  const handleViewAll = (e) => {
    e.preventDefault();
    setShowAllNotifications(true);
    setDisplayedNotifications(mockNotifications);
  };

  // Reset to preview mode when dropdown closes
  const handleDropdownClose = () => {
    if (showAllNotifications) {
      setTimeout(() => {
        setShowAllNotifications(false);
        setDisplayedNotifications(mockNotifications.slice(0, 5));
      }, 200); // Delay to prevent visual glitch
    }
  };

  return (
    <DropdownMenu onOpenChange={(open) => !open && handleDropdownClose()}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-10 w-10 text-foreground/70 hover:text-foreground flex items-center justify-center relative"
        >
          <span className="sr-only">Notifications</span>
          <Bell size={24} className="text-foreground/70" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className={`${showAllNotifications ? 'w-96 max-h-[80vh]' : 'w-80'} overflow-hidden`} align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Notifications</h3>
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
              {mockNotifications.length} new
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className={`${showAllNotifications ? 'max-h-[60vh] overflow-y-auto' : ''}`}>
          {displayedNotifications.map((notification) => (
            <DropdownMenuItem key={notification.id} className="cursor-pointer py-3 px-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{notification.icon}</div>
                <div className="flex-1 space-y-1">
                  <div className="font-medium text-sm">{notification.title}</div>
                  <div className="text-xs text-muted-foreground">{notification.description}</div>
                  <div className="text-xs text-muted-foreground">{notification.time}</div>
                </div>
              </div>
            </DropdownMenuItem>
          ))}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="cursor-pointer py-2 justify-center text-sm font-medium text-primary"
          onClick={handleViewAll}
        >
          {showAllNotifications ? "Showing all notifications" : "View all notifications"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationsDropdown; 