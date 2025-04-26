import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Sun, Moon, Laptop, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from './dropdown-menu';

const ThemeToggleMenu = () => {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 px-2 py-1.5 rounded-md">
        {theme === 'dark' ? (
          <Moon className="h-4 w-4" />
        ) : theme === 'system' ? (
          <Laptop className="h-4 w-4" />
        ) : (
          <Sun className="h-4 w-4" />
        )}
        <span className="text-sm">
          {theme === 'dark' 
            ? 'Dark' 
            : theme === 'system' 
              ? 'System' 
              : 'Light'}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setTheme('light')} className="cursor-pointer">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-yellow-500" />
              <span>Light</span>
            </div>
            {theme === 'light' && <Check className="h-4 w-4" />}
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')} className="cursor-pointer">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Moon className="h-4 w-4 text-blue-500" />
              <span>Dark</span>
            </div>
            {theme === 'dark' && <Check className="h-4 w-4" />}
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')} className="cursor-pointer">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Laptop className="h-4 w-4" />
              <span>System</span>
            </div>
            {theme === 'system' && <Check className="h-4 w-4" />}
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeToggleMenu; 