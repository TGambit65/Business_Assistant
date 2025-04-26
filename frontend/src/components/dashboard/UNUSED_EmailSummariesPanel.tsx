import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { EmailSummary } from '../../types/dashboard';
import { Loader2, Mail, MessageSquare } from 'lucide-react';
import { getPriorityClass } from '../../utils/dashboardUtils';

interface EmailSummariesPanelProps {
  summaries: EmailSummary[];
  isGenerating: boolean;
  onViewEmail: (email: EmailSummary) => void;
  onGenerateSummaries: () => void;
  onShowActions: () => void;
}

export const EmailSummariesPanel: React.FC<EmailSummariesPanelProps> = ({
  summaries,
  isGenerating,
  onViewEmail,
  onGenerateSummaries,
  onShowActions,
}) => {
  return (
    <Card className="h-full border-0 shadow-sm">
      <CardHeader className="border-b p-4">
        <div className="flex justify-between items-center w-full">
          <CardTitle className="flex items-center text-lg">
            <Mail className="w-5 h-5 mr-2 text-blue-500" />
            Email Summaries
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={onShowActions}>
              Show Actions
            </Button>
            <Button variant="ghost" size="sm" onClick={onGenerateSummaries}>
              Show Summaries
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 overflow-auto h-[calc(100%-4rem)]">
        {isGenerating ? (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <Loader2 className="h-12 w-12 text-primary mb-2 animate-spin" />
            <p className="text-gray-600 dark:text-gray-400">
              Generating email summaries...
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              This might take a moment
            </p>
          </div>
        ) : summaries.length > 0 ? (
          <div className="space-y-3">
            {summaries.map((email) => (
              <div
                key={email.id}
                className={`p-4 border rounded-md hover:shadow-md transition-shadow cursor-pointer ${getPriorityClass(email.priority)}`}
                onClick={() => onViewEmail(email)}
              >
                <div className="flex items-start cursor-pointer">
                  <div className="mr-3 mt-1">{email.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-foreground dark:text-white">
                        {email.title}
                      </h3>
                      <span
                        className="text-xs px-2 py-1 rounded-full"
                        style={{
                          backgroundColor: `${email.labelColor}20`,
                          color: email.labelColor,
                        }}
                      >
                        {email.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {email.summary}
                    </p>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-500">From: {email.from}</p>
                      <p className="text-xs text-gray-500">{email.time}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <MessageSquare className="h-12 w-12 text-gray-400 mb-2" />
            <p className="text-gray-600 dark:text-gray-400">
              No important emails found
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Go to Email Rules and mark labels as important to see summaries here
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 