import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { UrgentAction } from '../../types/dashboard';
import { Calendar, CheckCircle, Clock, AlertCircle, Eye, FileText, Edit3, ChevronDown, ChevronUp } from 'lucide-react';
import { getPriorityBadge, getPriorityClass } from '../../utils/dashboardUtils';

interface UrgentActionsPanelProps {
  actions: UrgentAction[];
  onActionClick: (action: UrgentAction) => void;
  onSchedule?: (action: UrgentAction) => void;
  onAddTask?: (action: UrgentAction) => void;
  onAnalyze?: (action: UrgentAction) => void;
  onRead?: (action: UrgentAction) => void;
}

export const UrgentActionsPanel: React.FC<UrgentActionsPanelProps> = ({
  actions,
  onActionClick,
  onSchedule,
  onAddTask,
  onAnalyze,
  onRead,
}) => {
  const { t } = useTranslation(['dashboard', 'common']);
  const [activeTab, setActiveTab] = useState<'actions' | 'summaries'>('actions');
  const [actionSummaries, setActionSummaries] = useState<{[key: string]: string}>({});
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Generate mock summaries for actions
  const handleGenerateSummary = (action: UrgentAction) => {
    const summaries: {[key: string]: string} = {
      '1': 'Contract renewal with Acme Inc. requires review by Friday. Key changes include updated pricing tiers and extended support terms. Recommend discussing with legal team before approval.',
      '2': 'Weekly team status meeting to review project progress. Team members should prepare updates on their assigned tasks. Expected discussion topics: Q3 milestone progress, resource allocation challenges, and client feedback implementation.',
      '3': 'Quarterly financial report is due tomorrow. Current status: 80% complete. Missing sections include Q3 expense projections and new client acquisition costs. Finance team needs final approval by 5 PM.',
      '4': 'New marketing materials require your review. Campaign focuses on Q4 product launches. Materials include social media graphics, email templates, and landing page content.',
      '5': 'Storage capacity approaching limit. Consider cleaning up unused files or upgrading storage plan. Most space is used by media files and older project archives.',
    };
    
    setActionSummaries(prev => ({
      ...prev,
      [action.id]: summaries[action.id] || 'No detailed summary available for this action.'
    }));
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="border-b p-4 flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center w-full gap-3 sm:gap-0">
          <CardTitle className="flex items-center text-lg font-semibold">
            <AlertCircle className="w-5 h-5 mr-2 text-red-500" />
            {t('dashboard:urgent.title')}
          </CardTitle>
          <div className="flex space-x-1 w-full sm:w-auto">
            {/* Mobile collapse button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 xl:hidden mr-2"
              onClick={() => setIsCollapsed(!isCollapsed)}
              aria-label={isCollapsed ? "Expand Urgent Actions" : "Collapse Urgent Actions"}
            >
              {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
            <Button
              variant={activeTab === 'actions' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('actions')}
              className={`flex-1 sm:flex-initial ${activeTab === 'actions' ? 'bg-primary text-primary-foreground' : ''}`}
            >
              {t('dashboard:urgent.actions')}
            </Button>
            <Button
              variant={activeTab === 'summaries' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('summaries')}
              className={`flex-1 sm:flex-initial ${activeTab === 'summaries' ? 'bg-primary text-primary-foreground' : ''}`}
            >
              {t('dashboard:urgent.summaries')}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className={`p-4 flex-grow overflow-auto ${isCollapsed ? 'hidden xl:block' : ''}`}>
        {actions.length > 0 ? (
          <div className="space-y-3">
            {actions.map((action) => (
              <div
                key={action.id}
                className={`flex flex-col p-4 rounded-lg border ${getPriorityClass(action.priority)} transition-shadow hover:shadow-md`}
              >
                <div className="flex items-start cursor-pointer" onClick={() => onActionClick(action)}>
                  <div className="mr-3 mt-1">{action.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-foreground dark:text-white">
                        {action.title}
                      </h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${getPriorityBadge(action.priority)}`}>
                        {action.priority}
                      </span>
                    </div>
                    {action.from && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t('common.from')}: {action.from}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 dark:text-gray-500 mb-1">
                      {action.time}
                    </p>

                    {/* Render summary if in summaries tab and summary exists */}
                    {activeTab === 'summaries' && actionSummaries[action.id] && (
                      <p className="text-sm mt-2 p-2 bg-muted dark:bg-gray-800 rounded border border-gray-100 dark:border-gray-700">
                        {actionSummaries[action.id]}
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Buttons - Different colors for each action */}
                <div className="flex flex-wrap gap-2 mt-3 sm:gap-2">
                  {onSchedule && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSchedule(action);
                      }}
                      className="bg-blue-500 hover:bg-blue-600 text-white min-w-[80px] flex-1 sm:flex-initial"
                      title="Schedule"
                    >
                      <Calendar className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">{t('dashboard:urgent.schedule')}</span>
                      <span className="sm:hidden">Schedule</span>
                    </Button>
                  )}
                  
                  {onAddTask && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddTask(action);
                      }}
                      className="bg-green-500 hover:bg-green-600 text-white min-w-[80px] flex-1 sm:flex-initial"
                      title="Add Task"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">{t('dashboard:urgent.add_task')}</span>
                      <span className="sm:hidden">Task</span>
                    </Button>
                  )}
                  
                  {onRead && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRead(action);
                      }}
                      className="bg-purple-500 hover:bg-purple-600 text-white min-w-[80px] flex-1 sm:flex-initial"
                      title="Read"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">{t('dashboard:urgent.read')}</span>
                      <span className="sm:hidden">Read</span>
                    </Button>
                  )}
                  
                  {onAnalyze && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAnalyze(action);
                      }}
                      className="bg-amber-500 hover:bg-amber-600 text-white min-w-[80px] flex-1 sm:flex-initial"
                      title="Analyze"
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">{t('dashboard:urgent.analyze')}</span>
                      <span className="sm:hidden">Analyze</span>
                    </Button>
                  )}
                  
                  {activeTab === 'actions' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGenerateSummary(action);
                        setActiveTab('summaries');
                      }}
                      className="ml-auto min-w-[80px] flex-1 sm:flex-initial sm:ml-auto"
                      title="Generate Summary"
                    >
                      <Edit3 className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">{t('dashboard:urgent.summary')}</span>
                      <span className="sm:hidden">Summary</span>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <CheckCircle className="h-14 w-14 text-green-500 mb-3" />
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              {t('dashboard:urgent.no_actions')}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              {t('dashboard:urgent.all_clear')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 