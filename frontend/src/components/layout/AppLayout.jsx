import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navigation } from './Navigation';
import { useTheme } from '../../contexts/ThemeContext';
import { Mail } from 'lucide-react';

export default function AppLayout() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <a href="/" className="flex items-center space-x-2">
              <div className="flex items-center gap-2">
                <Mail className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold text-primary">Business Assistant</span>
              </div>
            </a>
          </div>
          <Navigation />
          <div className="flex flex-1 items-center justify-end space-x-4">
            <button
              onClick={toggleTheme}
              className="h-9 w-9 rounded-lg border bg-background p-2 hover:bg-accent hover:text-accent-foreground"
            >
              {isDarkMode ? '🌞' : '🌙'}
            </button>
          </div>
        </div>
      </header>
      <main className="container py-6">
        <Outlet />
      </main>
    </div>
  );
} 