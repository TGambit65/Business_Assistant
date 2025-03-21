import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
} from '../ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';

export function Navigation() {
  const location = useLocation();
  
  return (
    <nav className="flex items-center space-x-6">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className={`flex items-center space-x-1 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 ${
            location.pathname.startsWith('/dashboard') ? 'bg-gray-100 dark:bg-gray-800' : ''
          }`}>
            <span>Dashboard</span>
            <ChevronDown className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link to="/dashboard">Overview</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/dashboard/analytics">Analytics</Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className={`flex items-center space-x-1 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 ${
            location.pathname.startsWith('/email') ? 'bg-gray-100 dark:bg-gray-800' : ''
          }`}>
            <span>Email</span>
            <ChevronDown className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link to="/email/compose">Compose</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/email/draft-generator">Draft Generator</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/email/templates">Templates</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/email/rules">Email Rules</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/email/signature">Signature</Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <Link
        to="/settings"
        className={`px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 ${
          location.pathname === '/settings' ? 'bg-gray-100 dark:bg-gray-800' : ''
        }`}
      >
        Settings
      </Link>
    </nav>
  );
} 