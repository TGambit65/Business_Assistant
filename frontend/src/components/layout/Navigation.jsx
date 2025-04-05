import React from 'react';
import { NavLink } from 'react-router-dom'; // Use NavLink
import {
  Home, // For Dashboard
  Mail, // For Templates
  Palette, // For Theme Manager
  Settings, // For Settings
  Briefcase, // For Business Center
  // Removed unused icons: LayoutGrid, ChevronDown, MessageSquare, Folder, Send, Trash2, LogOut, User, Wrench, Bell, Calendar, HelpCircle
} from 'lucide-react';

// Updated Navigation Links based on plan
const navLinks = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: <Home size={22} />,
    end: true, // Match exact path
  },
  {
    name: 'Business Center',
    path: '/business-center',
    icon: <Briefcase size={22} />,
    end: false,
  },
  {
    name: 'Templates', // Added based on previous Sidebar component
    path: '/templates', // Assuming this path exists
    icon: <Mail size={22} />,
    end: false,
  },
  {
    name: 'Theme Manager', // Added based on previous Sidebar component
    path: '/theme-manager', // Assuming this path exists
    icon: <Palette size={22} />,
    end: false,
  },
  {
    name: 'Settings',
    path: '/settings',
    icon: <Settings size={22} />,
    end: false, // Or true if settings has no sub-routes
  },
];

/**
 * Main navigation component rendered in the sidebar.
 * Adapts to compact mode and handles mobile link clicks.
 * @param {Object} props - Component props
 * @param {boolean} props.compact - Whether to use compact mode (icons only)
 * @param {Function} [props.onLinkClick] - Callback function when a link is clicked (for mobile)
 */
const Navigation = ({ compact = false, onLinkClick }) => {

  const linkClasses = (isActive) =>
    `flex items-center px-3 py-2 rounded-md text-sm font-medium relative transition-colors ${
      compact ? 'justify-center h-12 w-12' : '' // Centered icon for compact
    } ${
      isActive
        ? 'bg-primary/10 text-primary font-semibold' // Active state
        : 'text-foreground/70 hover:bg-secondary hover:text-foreground' // Default and hover states
    }`;

  const mobileLinkClasses = (isActive) =>
    `flex items-center px-3 py-2 rounded-md text-base font-medium relative transition-colors ${ // Larger text for mobile
      isActive
        ? 'bg-primary/10 text-primary font-semibold'
        : 'text-foreground/70 hover:bg-secondary hover:text-foreground'
    }`;


  return (
    <nav className="h-full p-3"> {/* Added padding */}
      {/* Desktop navigation */}
      <div className="hidden md:block">
        <ul className="space-y-1">
          {navLinks.map((link) => (
            <li key={link.path}>
              <NavLink
                to={link.path}
                className={({ isActive }) => linkClasses(isActive)}
                title={compact ? link.name : undefined} // Tooltip for compact mode
                end={link.end}
              >
                <span className={compact ? '' : 'mr-3 text-primary'}>{link.icon}</span> {/* Adjusted margin */}
                {!compact && <span>{link.name}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
        {/* Removed Desktop Profile Section */}
      </div>

      {/* Mobile navigation */}
      <div className="md:hidden">
        <ul className="space-y-1">
          {navLinks.map((link) => (
            <li key={link.path}>
              <NavLink
                to={link.path}
                className={({ isActive }) => mobileLinkClasses(isActive)}
                end={link.end}
                onClick={onLinkClick} // Close mobile sidebar on click
              >
                <span className="mr-3 text-primary">{link.icon}</span> {/* Always show icon */}
                <span>{link.name}</span> {/* Always show name */}
              </NavLink>
            </li>
          ))}
        </ul>
         {/* Removed Mobile Profile Section */}
      </div>
    </nav>
  );
};

export { Navigation };
export default Navigation;