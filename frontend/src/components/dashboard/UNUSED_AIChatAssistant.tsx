import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { ChatMessage } from '../../types/dashboard';
import { Send, Sparkles } from 'lucide-react';

interface AIChatAssistantProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
}

const QUICK_PROMPTS = [
  'How can I write a professional email?',
  'Draft an email to reschedule a meeting',
  'Tips for managing email overload',
];

export const AIChatAssistant: React.FC<AIChatAssistantProps> = ({
  messages,
  onSendMessage,
}) => {
  const [inputMessage, setInputMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      onSendMessage(inputMessage);
      setInputMessage('');
    }
  };

  return (
    <Card className="flex flex-col h-full border border-border dark:border-gray-700 shadow-sm bg-background">
      <CardHeader className="border-b p-4 flex-shrink-0">
        <div className="flex justify-between items-center w-full">
          <CardTitle className="flex items-center text-lg font-semibold">
            <Sparkles className="w-5 h-5 mr-2 text-purple-500" />
            AI Chat Assistant
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-4 flex flex-col flex-grow">
        <div className="flex-grow overflow-auto mb-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
              <Sparkles size={44} className="mb-3 text-purple-500 opacity-80" />
              <p className="mb-2 font-medium text-lg">AI Chat Assistant</p>
              <p className="text-sm max-w-xs">
                Ask me anything about email management, drafting responses, or
                organizing your inbox
              </p>
              <div className="mt-4 grid grid-cols-1 gap-2">
                {QUICK_PROMPTS.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => setInputMessage(prompt)}
                    className="text-left text-sm px-4 py-3 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors border border-border dark:border-gray-700"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`inline-block px-4 py-3 rounded-lg max-w-[80%] ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white dark:bg-blue-600'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit} className="flex space-x-2 flex-shrink-0">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 min-w-0 rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
          />
          <Button type="submit" variant="default" size="sm">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}; 