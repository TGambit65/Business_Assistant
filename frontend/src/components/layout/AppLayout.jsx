import React, { useState, useEffect, useRef } from 'react'; // Added useEffect and useRef
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'; // Added useLocation
import { Navigation } from './Navigation';

// Icons
import { Menu, X, Settings, User, LogOut, LayoutGrid, BarChart2, ChevronDown, Briefcase, Mail, Edit3, FileText, Filter, PenTool, Shield, Check, Inbox } from 'lucide-react';

// UI Components
import { Button } from '../ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import QuickActions from '../ui/QuickActions';
import NetworkStatus from '../ui/NetworkStatus';
// Import the NotificationsDropdown (removed UNUSED_ prefix)
import NotificationsDropdown from '../ui/NotificationsDropdown';
// import ThemeToggleMenu from '../ui/ThemeToggleMenu';

// Import SearchService
import searchService from '../../services/SearchService';

// Hooks & Contexts
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useEnhancedAuth } from '../../auth';
import { useTheme } from '../../contexts/NewThemeContext';

// Search Input Component - Modified to accept props
const SearchIcon = () => (
  <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const SearchInput = ({ value, onChange, onKeyPress }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef(null);

  // Fetch suggestions when value changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (value.trim().length > 1) {
        try {
          const results = await searchService.getSuggestions(value);
          setSuggestions(results);
          setShowSuggestions(results.length > 0);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    fetchSuggestions();
  }, [value]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
  <div className="relative w-full" ref={suggestionsRef}>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <SearchIcon />
      </div>
      <input
        type="search"
        placeholder="Search..."
        className="block w-full pl-10 pr-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring sm:text-sm h-10"
        value={value}
        onChange={onChange}
        onKeyPress={onKeyPress}
        onFocus={() => setShowSuggestions(suggestions.length > 0)}
      />
    </div>

    {/* Suggestions dropdown */}
    {showSuggestions && (
      <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-auto">
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className="px-4 py-2 hover:bg-accent cursor-pointer text-sm"
            onClick={() => {
              onChange({ target: { value: suggestion } });
              setShowSuggestions(false);
            }}
          >
            {suggestion}
          </div>
        ))}
      </div>
    )}
  </div>
  );
};

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(''); // Added search state
  const location = useLocation();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const navigate = useNavigate();
  const { user, signOut } = useEnhancedAuth();
  const { themeName, setTheme, getThemes } = useTheme();
  const themes = getThemes();

  // Load saved theme on component mount
  useEffect(() => {
    // Get stored theme or use system default
    const savedTheme = localStorage.getItem('theme') || 'system';
    setTheme(savedTheme);
  }, [setTheme]);

  // Clear search term when navigating away from search page
  useEffect(() => {
    if (!location.pathname.includes('/search')) {
      setSearchTerm('');
    } else if (location.search) {
      // Extract search term from URL if on search page
      const params = new URLSearchParams(location.search);
      const q = params.get('q');
      if (q) setSearchTerm(q);
    }
  }, [location]);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const handleLogout = async () => {
    console.log("Attempting logout...");
    try {
      if (signOut) {
        await signOut();
      } else {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('user');
        console.log("Fallback logout: Cleared localStorage.");
      }
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  // Handle search submission (e.g., on Enter key)
  const handleSearchSubmit = (event) => {
    if (event.key === 'Enter' && searchTerm.trim()) {
      console.log(`Navigating to search results for: ${searchTerm}`);
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`); // Example: Navigate to a search results page
      // Or trigger a search action within the current context/page
    }
  };

  const userDisplayName = user?.displayName || user?.email || 'Account';

  return (
    <div className="min-h-screen bg-background flex flex-col app-layout">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 safe-top">
        <div className="px-4 sm:px-6 lg:px-8">
          {/* Single row with logo, navigation, and controls */}
          <div className="flex items-center justify-between h-16">
            {/* Left side - Logo with Navigation */}
            <div className="flex items-center space-x-6">
              {/* Logo/Menu button */}
              {isMobile ? (
                <Button variant="ghost" size="icon" className="mr-2" onClick={toggleSidebar} aria-label={sidebarOpen ? "Close menu" : "Open menu"}>
                  {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                </Button>
              ) : (
                <div className="flex items-center space-x-2 shrink-0">
                  <img src="/logo192.png" alt="Logo" className="h-8 w-8" />
                  <span className="text-lg font-semibold inline">Business Assistant</span>
                </div>
              )}

              {/* Navigation - moved to right of logo */}
              {!isMobile && (
                <nav className="flex items-center space-x-6">
                  {/* Dashboard Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">
                        <span>Main</span>
                        <ChevronDown className="ml-1 h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                      <DropdownMenuGroup>
                        <DropdownMenuItem asChild>
                          <Link to="/dashboard" className="flex items-center cursor-pointer">
                            <LayoutGrid className="mr-2 h-5 w-5" />
                            <span>Dashboard</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/analytics" className="flex items-center cursor-pointer">
                            <BarChart2 className="mr-2 h-5 w-5" />
                            <span>Analytics</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/business-center" className="flex items-center cursor-pointer">
                            <Briefcase className="mr-2 h-5 w-5" />
                            <span>Business Center</span>
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Email Dropdown - replacing Templates */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">
                        <span>Email</span>
                        <ChevronDown className="ml-1 h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                      <DropdownMenuGroup>
                        <DropdownMenuItem asChild>
                          <Link to="/email/compose" className="flex items-center cursor-pointer">
                            <Mail className="mr-2 h-5 w-5" />
                            <span>Compose</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/email/draft-generator" className="flex items-center cursor-pointer">
                            <Edit3 className="mr-2 h-5 w-5" />
                            <span>Draft Generator</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/email/templates" className="flex items-center cursor-pointer">
                            <FileText className="mr-2 h-5 w-5" />
                            <span>Templates</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/email/rules" className="flex items-center cursor-pointer">
                            <Filter className="mr-2 h-5 w-5" />
                            <span>Email Rules</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/email/signature" className="flex items-center cursor-pointer">
                            <PenTool className="mr-2 h-5 w-5" />
                            <span>Signature</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/email/inbox" className="flex items-center cursor-pointer">
                            <Inbox className="mr-2 h-5 w-5" />
                            <span>Inbox</span>
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </nav>
              )}
            </div>

            {/* Right side - Search, Notifications, Settings, Profile */}
            <div className="flex items-center space-x-4">
              {/* Search Bar - Smaller width */}
              <div className="w-64">
                <SearchInput
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleSearchSubmit}
                />
              </div>

              {/* Notifications Icon Button with Dropdown */}
              <NotificationsDropdown />

              {/* Settings Icon Button - Same size and color as notification bell */}
              <Link to="/settings">
                <Button variant="ghost" size="icon" className="h-10 w-10 flex items-center justify-center"
                      style={{ color: 'rgba(0, 0, 0, 0.7)' }}>
                  <span className="sr-only">Settings</span>
                  <Settings size={24} />
                </Button>
              </Link>

              {/* Profile Dropdown with Theme Toggle */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-10 w-10 rounded-full p-0">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <User size={24} />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{userDisplayName}</p>
                      {user?.email && <p className="text-xs leading-none text-muted-foreground">{user.email}</p>}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center cursor-pointer">
                      <User className="mr-2 h-5 w-5 text-primary" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/admin" className="flex items-center cursor-pointer">
                      <Shield className="mr-2 h-5 w-5 text-primary" />
                      <span>Administration</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Theme</DropdownMenuLabel>
                  <div className="max-h-72 overflow-y-auto">
                    {Object.entries(themes).map(([name, themeObj]) => (
                      <button
                        key={name}
                        onClick={() => setTheme(name)}
                        className="flex items-center justify-between w-full px-3 py-2 hover:bg-accent rounded"
                      >
                        <div className="flex items-center space-x-2">
                          <span
                            className="w-4 h-4 rounded border"
                            style={{
                              backgroundColor: themeObj.variables['--background'],
                              borderColor: themeObj.variables['--primary']
                            }}
                          />
                          <span>{themeObj.name || name}</span>
                        </div>
                        {themeName === name && <Check className="h-4 w-4" />}
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 px-3">
                    <Link to="/theme-manager">
                      <Button variant="outline" className="w-full">Manage Themes</Button>
                    </Link>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-500 cursor-pointer">
                    <LogOut className="mr-2 h-5 w-5 text-red-500" />
                    <span>Log Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50" onClick={toggleSidebar}>
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-background border-r pt-16" onClick={e => e.stopPropagation()}>
            <Navigation compact={false} onLinkClick={toggleSidebar} />
          </div>
        </div>
      )}

      {/* Main content - Full width, no sidebar, no margin */}
      <main className="flex-1 overflow-auto bg-background">
        <Outlet />
      </main>

      {/* Quick Actions Component */}
      <QuickActions />

      {/* Network Status Indicator */}
      <NetworkStatus />

      {/* Modal container */}
      <div id="modal-root"></div>
    </div>
  );
}
