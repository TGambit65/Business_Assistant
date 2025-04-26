import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/Button';
import {
  Settings,
  LogOut,
  User,
  Mail,
  Briefcase,
  Shield,
  ChevronDown
} from 'lucide-react';

const Header = () => {
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);
  const dropdownRef = React.useRef(null);
  const profileRef = React.useRef(null);

  const isAdmin = true; // TODO: Get from auth context

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-background border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src="/logo.svg" alt="Logo" className="h-8 w-8" />
            <span className="ml-2 text-xl font-semibold">Email Assistant</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            <div className="relative" ref={dropdownRef}>
              <Button
                variant="ghost"
                className="flex items-center"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <Mail className="h-4 w-4 mr-2" />
                Email
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
              {showDropdown && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-popover rounded-md shadow-lg py-1 z-50">
                  <Link
                    to="/email/compose"
                    className="block px-4 py-2 text-sm hover:bg-accent"
                  >
                    Compose
                  </Link>
                  <Link
                    to="/email/templates"
                    className="block px-4 py-2 text-sm hover:bg-accent"
                  >
                    Templates
                  </Link>
                  <Link
                    to="/email/analytics"
                    className="block px-4 py-2 text-sm hover:bg-accent"
                  >
                    Analytics
                  </Link>
                </div>
              )}
            </div>

            <div className="relative">
              <Link to="/business">
                <Button variant="ghost" className="flex items-center">
                  <Briefcase className="h-4 w-4 mr-2" />
                  Business Center
                </Button>
              </Link>
            </div>
          </nav>

          {/* Profile Menu */}
          <div className="relative" ref={profileRef}>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <User className="h-5 w-5" />
            </Button>

            {showProfileMenu && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-popover rounded-md shadow-lg py-1 z-50">
                <div className="px-4 py-2 border-b">
                  <p className="text-sm font-medium">John Doe</p>
                  <p className="text-xs text-muted-foreground">john@example.com</p>
                </div>

                <Link
                  to="/settings/profile"
                  className="block px-4 py-2 text-sm hover:bg-accent"
                >
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Profile Settings
                  </div>
                </Link>

                <Link
                  to="/settings"
                  className="block px-4 py-2 text-sm hover:bg-accent"
                >
                  <div className="flex items-center">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </div>
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin"
                    className="block px-4 py-2 text-sm hover:bg-accent"
                  >
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 mr-2" />
                      Admin Panel
                    </div>
                  </Link>
                )}

                <div className="border-t">
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-accent"
                    onClick={() => {/* Handle logout */}}
                  >
                    <div className="flex items-center">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;