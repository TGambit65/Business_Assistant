import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import NetworkStatus from './ui/NetworkStatus';
import ThemeSelector from './ui/ThemeSelector';
import { useTheme } from '../contexts/NewThemeContext';

// Placeholder icons
const SearchIcon = () => <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const BellIcon = () => <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341A6.002 6.002 0 006 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;
const SettingsIcon = () => <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const UserIcon = () => <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const ChevronDownIcon = () => <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>;
const SunIcon = () => <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const MoonIcon = () => <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>;

// Search Input Component
const SearchInput = () => (
  <div className="relative w-full">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <SearchIcon />
    </div>
    <input
      type="search"
      placeholder="Search..."
      className="block w-full pl-10 pr-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring sm:text-sm"
    />
  </div>
);

// Profile Dropdown Component
const ProfileDropdown = ({ onShowMoreThemes }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { theme, setTheme } = useTheme();
  
  const dropdownRef = React.useRef(null);
  
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        className="flex items-center space-x-1 p-1 rounded-full hover:bg-secondary"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
          <UserIcon />
        </div>
        <ChevronDownIcon />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-popover border border-border rounded-md shadow-lg py-1 z-50">
          <a href="#" className="block px-4 py-2 text-sm text-popover-foreground hover:bg-accent">Profile</a>
          <a href="#" className="block px-4 py-2 text-sm text-popover-foreground hover:bg-accent">Settings</a>
          
          <div className="border-t border-border my-1 pt-1">
            <div className="px-4 py-1 text-xs font-medium text-muted-foreground">Theme</div>
            <button 
              onClick={() => setTheme('light')}
              className={`flex items-center w-full px-4 py-2 text-sm ${theme === 'light' ? 'bg-accent text-accent-foreground' : 'text-popover-foreground hover:bg-accent'}`}
            ><SunIcon /><span className="ml-2">Light</span></button>
            <button 
              onClick={() => setTheme('dark')}
              className={`flex items-center w-full px-4 py-2 text-sm ${theme === 'dark' ? 'bg-accent text-accent-foreground' : 'text-popover-foreground hover:bg-accent'}`}
            ><MoonIcon /><span className="ml-2">Dark</span></button>
            <button 
              onClick={() => {
                setIsOpen(false);
                onShowMoreThemes();
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-popover-foreground hover:bg-accent"
            ><span className="ml-2">More Themes...</span></button>
          </div>
          
          <a href="#" className="block px-4 py-2 text-sm text-popover-foreground hover:bg-accent border-t border-border">Logout</a>
        </div>
      )}
    </div>
  );
};

const Layout = () => {
  const [showThemeSelector, setShowThemeSelector] = React.useState(false);
  const { theme, setTheme } = useTheme();
  
  React.useEffect(() => {
    setTheme('light');
  }, [setTheme]);
  
  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-card border-b border-border h-16 flex items-center justify-between px-6 shrink-0 space-x-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 shrink-0">
              <img src="/logo192.png" alt="Logo" className="h-8 w-8" />
              <span className="text-lg font-semibold hidden sm:inline">Business Assistant</span>
            </div>
            <Header />
          </div>

          <div className="flex-1 min-w-0 px-4">
             <div className="max-w-md mx-auto">
               <SearchInput />
             </div>
          </div>

          <div className="flex items-center space-x-4 shrink-0">
            <button className="p-2 rounded-full text-foreground/70 hover:text-foreground hover:bg-secondary transition-colors">
              <span className="sr-only">Notifications</span>
              <BellIcon />
            </button>
            <button className="p-2 rounded-full text-foreground/70 hover:text-foreground hover:bg-secondary transition-colors">
              <span className="sr-only">Settings</span>
              <SettingsIcon />
            </button>
            <div className="flex items-center space-x-2">
              {showThemeSelector && <ThemeSelector className="mr-2" onClose={() => setShowThemeSelector(false)} />}
              <ProfileDropdown onShowMoreThemes={() => setShowThemeSelector(true)} />
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
      <NetworkStatus />
    </div>
  );
};

export default Layout;
