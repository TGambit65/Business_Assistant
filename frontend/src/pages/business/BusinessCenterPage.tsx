import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Button } from '../../components/ui/Button';
import {
  BookOpen, // Knowledge Management
  FileText, // Template Studio
  Building, // Company Profile
  Settings, // Assistant Configuration
  Search, // For search functionality
  HelpCircle // For help/info
} from 'lucide-react';

// Import the main section components
import KnowledgeManagementHub from '../../components/business/knowledge/KnowledgeManagementHub';
import TemplateStudio from '../../components/business/templates/TemplateStudio';
import CompanyProfile from '../../components/business/company/CompanyProfile';
import AssistantConfiguration from '../../components/business/assistant/AssistantConfiguration';

// Import the dashboard components for backward compatibility
import BusinessDashboard from '../../components/business/BusinessDashboard';

/**
 * BusinessCenterPage Component
 *
 * A modern, intuitive Business Center interface for managing company knowledge and templates.
 * Provides a tabbed interface with sections for knowledge management, template studio,
 * company profile, and assistant configuration.
 */
const BusinessCenterPage = () => {
  // State for active tab
  const [activeTab, setActiveTab] = useState('knowledge');

  // State for global search (to be implemented)
  const [searchQuery, setSearchQuery] = useState('');

  // Handle search functionality
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement global search across all sections
    console.log('Searching for:', searchQuery);
    // TODO: Implement actual search functionality
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header with title and search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Business Center</h1>
          <p className="text-muted-foreground">
            Manage your company knowledge, templates, and assistant configuration
          </p>
        </div>

        {/* Global search */}
        <div className="w-full md:w-auto">
          <form onSubmit={handleSearch} className="flex w-full md:w-auto">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search across all sections..."
                className="pl-9 h-10 w-full md:w-[300px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button type="submit" variant="outline" className="ml-2">
              Search
            </Button>
          </form>
        </div>
      </div>

      {/* Main tabbed interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="knowledge" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Knowledge Management</span>
            <span className="sm:hidden">Knowledge</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Template Studio</span>
            <span className="sm:hidden">Templates</span>
          </TabsTrigger>
          <TabsTrigger value="company" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            <span className="hidden sm:inline">Company Profile</span>
            <span className="sm:hidden">Company</span>
          </TabsTrigger>
          <TabsTrigger value="assistant" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Assistant Config</span>
            <span className="sm:hidden">Assistant</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab content */}
        <TabsContent value="knowledge" className="space-y-4">
          <KnowledgeManagementHub />
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <TemplateStudio />
        </TabsContent>

        <TabsContent value="company" className="space-y-4">
          <CompanyProfile />
        </TabsContent>

        <TabsContent value="assistant" className="space-y-4">
          <AssistantConfiguration />
        </TabsContent>

        {/* Legacy dashboard tab - can be removed later */}
        <TabsContent value="dashboard" className="space-y-4">
          <BusinessDashboard />
        </TabsContent>
      </Tabs>

      {/* Help button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 right-4 rounded-full h-12 w-12 shadow-md"
        title="Help"
      >
        <HelpCircle className="h-6 w-6" />
      </Button>
    </div>
  );


};

export default BusinessCenterPage;