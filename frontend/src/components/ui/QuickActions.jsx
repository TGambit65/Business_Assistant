import React, { useState } from 'react';
import { 
  /* Zap, */ Plus, Mail, FileText, Calendar, Bell,  // Removed unused Zap
  MessageSquare, Settings, X, /* Check, */ MoreVertical // Removed unused Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

/**
 * QuickActions component for accessing common actions quickly
 * Provides a floating action button with a menu of quick actions
 */
const QuickActions = ({ className, ...props }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // Toggle the menu open/closed
  const toggleMenu = () => {
    setIsOpen(prev => !prev);
  };

  // Available quick actions
  const actions = [
    { icon: <Mail size={18} />, label: 'Compose Email', action: () => navigate('/email/compose') },
    { icon: <MessageSquare size={18} />, label: 'Draft Generator', action: () => navigate('/email/draft-generator') },
    { icon: <FileText size={18} />, label: 'Templates', action: () => navigate('/email/templates') },
    { icon: <Calendar size={18} />, label: 'Schedule', action: () => navigate('/calendar') },
    { icon: <Bell size={18} />, label: 'Notifications', action: () => navigate('/notifications') },
    { icon: <Settings size={18} />, label: 'Settings', action: () => navigate('/settings') },
  ];

  // Execute an action and close the menu
  const runAction = (actionFn) => {
    actionFn();
    setIsOpen(false);
  };

  return (
    <div 
      className={`fixed right-6 bottom-6 z-50 ${className}`}
      {...props}
    >
      {/* Main button */}
      <button
        onClick={toggleMenu}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 transform
          ${isOpen 
            ? 'bg-red-500 hover:bg-red-600 rotate-45' 
            : 'bg-primary hover:bg-primary/90'}`}
        aria-label={isOpen ? 'Close quick actions' : 'Open quick actions'}
      >
        {isOpen ? <X size={24} className="text-white" /> : <Plus size={24} className="text-white" />}
      </button>

      {/* Actions menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full mb-4 right-0 bg-background rounded-lg shadow-lg border border-border p-2 w-48"
          >
            <div className="space-y-1">
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => runAction(action.action)}
                  className="w-full flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors"
                >
                  <span className="mr-3 text-primary">{action.icon}</span>
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile quick access button (always visible on mobile) */}
      <div className="md:hidden fixed left-1/2 transform -translate-x-1/2 bottom-6 z-50">
        <div className="flex items-center bg-background shadow-lg rounded-full border border-border">
          <button
            onClick={() => navigate('/email/compose')}
            className="p-3 rounded-full hover:bg-muted transition-colors"
            aria-label="Compose email"
          >
            <Mail size={20} className="text-primary" />
          </button>
          <button
            onClick={() => navigate('/email/draft-generator')}
            className="p-3 rounded-full hover:bg-muted transition-colors"
            aria-label="Draft generator"
          >
            <MessageSquare size={20} className="text-primary" />
          </button>
          <button
            onClick={toggleMenu}
            className="p-3 rounded-full hover:bg-muted transition-colors"
            aria-label="More actions"
          >
            <MoreVertical size={20} className="text-primary" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickActions; 