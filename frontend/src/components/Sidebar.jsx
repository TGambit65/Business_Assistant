import React from 'react';
import { NavLink } from 'react-router-dom'; // Use NavLink for active styling
import { Home, Settings, Palette, Mail } from 'lucide-react'; // Use icons - Added Mail

// Define sidebar items (can be kept as is or modified if needed)
const sidebarItems = [
  {
    icon: <Home size={20} />,
    label: 'Dashboard',
    path: '/dashboard' // Assuming '/dashboard' is the correct path
  },
  {
    icon: <Mail size={20} />, // Added Templates link based on analysis
    label: 'Templates',
    path: '/templates'
  },
  // Add Signatures if needed
  {
    icon: <Palette size={20} />,
    label: 'Theme Manager',
    path: '/theme-manager' // Assuming this path exists or will be created
  },
  {
    icon: <Settings size={20} />,
    label: 'Settings',
    path: '/settings'
  },
];

const Sidebar = () => {
  return (
    // Sidebar container: Set width, solid background, border, flex column layout
    <aside className="w-64 bg-card border-r border-border flex flex-col shrink-0">
      {/* Optional Header/Logo Area - Match main header height */}
      <div className="p-4 h-16 flex items-center border-b border-border">
        {/* You could place a logo or title here if desired */}
        <h2 className="text-lg font-semibold">Navigation</h2>
      </div>

      {/* Navigation Links Area */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto"> {/* Padding, spacing, scroll */}
        {sidebarItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            // Dynamically set classes based on active state
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary font-semibold' // Active state style
                  : 'text-foreground/70 hover:bg-secondary hover:text-foreground' // Default and hover states
              }`
            }
            end={item.path === '/dashboard'} // Use 'end' prop for exact path matching for dashboard
          >
            {/* Render icon and label */}
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Optional Footer Area */}
      <div className="p-4 border-t border-border mt-auto"> {/* Pushes to bottom */}
        {/* Example: Logout Button */}
        {/* <button className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium w-full text-foreground/70 hover:bg-secondary hover:text-foreground">
          <LogOut size={20} />
          <span>Logout</span>
        </button> */}
      </div>
    </aside>
  );
};

export default Sidebar;