import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Button } from '../../../components/ui/Button';
import { 
  Settings, 
  MessageSquare, 
  Database, 
  FileText,
  Save,
  Edit,
  X
} from 'lucide-react';

// Import sub-components to keep file size manageable
import QueryHandlingConfig from './QueryHandlingConfig';
import InformationSourcesConfig from './InformationSourcesConfig';
import ToneStyleConfig from './ToneStyleConfig';
import RoutingConfig from './RoutingConfig';

// Mock data for assistant configuration
const assistantConfigData = {
  name: 'Business Assistant',
  description: 'AI assistant for business operations and customer support',
  queryHandling: {
    defaultResponseMode: 'concise',
    maxResponseLength: 500,
    followUpQuestions: true,
    clarificationThreshold: 0.7,
    defaultLanguage: 'en',
    fallbackMessage: "I'm sorry, I don't have enough information to answer that question. Would you like me to connect you with a human agent?",
  },
  informationSources: {
    priorityOrder: [
      { id: 'knowledge-base', name: 'Company Knowledge Base', priority: 1, enabled: true },
      { id: 'product-docs', name: 'Product Documentation', priority: 2, enabled: true },
      { id: 'faqs', name: 'FAQs', priority: 3, enabled: true },
      { id: 'support-tickets', name: 'Past Support Tickets', priority: 4, enabled: true },
      { id: 'web-search', name: 'Web Search', priority: 5, enabled: false },
    ],
    confidenceThreshold: 0.8,
    citeSources: true,
    includeSourceLinks: true,
    maxSourcesPerResponse: 3,
  },
  toneAndStyle: {
    tone: 'professional',
    formality: 'semi-formal',
    personality: 'helpful',
    humor: 'minimal',
    empathy: 'high',
    customVoiceGuidelines: 'Maintain a professional but friendly tone. Use clear, concise language and avoid jargon when possible.',
  },
  routing: {
    rules: [
      { 
        id: 'rule1', 
        category: 'Technical Support', 
        keywords: ['error', 'bug', 'crash', 'not working'], 
        destination: 'technical-knowledge-base',
        priority: 'high'
      },
      { 
        id: 'rule2', 
        category: 'Billing Questions', 
        keywords: ['invoice', 'payment', 'charge', 'subscription'], 
        destination: 'billing-knowledge-base',
        priority: 'medium'
      },
      { 
        id: 'rule3', 
        category: 'Product Information', 
        keywords: ['features', 'pricing', 'plan', 'comparison'], 
        destination: 'product-knowledge-base',
        priority: 'medium'
      },
    ],
    defaultDestination: 'general-knowledge-base',
    humanEscalationThreshold: 0.4,
  }
};

/**
 * AssistantConfiguration Component
 * 
 * Interface to customize how the AI assistant handles different types of queries,
 * prioritizes information sources, maintains company tone, and routes inquiries.
 */
const AssistantConfiguration: React.FC = () => {
  // State for active tab
  const [activeTab, setActiveTab] = useState('query-handling');
  
  // State for edit mode
  const [editMode, setEditMode] = useState(false);
  
  // State for form data (initialized with mock data)
  const [formData, setFormData] = useState(assistantConfigData);
  
  // Handle save changes
  const handleSaveChanges = () => {
    // In a real app, this would save to backend
    console.log('Saving assistant configuration:', formData);
    setEditMode(false);
  };
  
  // Handle cancel changes
  const handleCancelChanges = () => {
    // Reset form data to original data
    setFormData(assistantConfigData);
    setEditMode(false);
  };
  
  // Handle form data updates from child components
  const handleFormUpdate = (section: string, data: any) => {
    setFormData({
      ...formData,
      [section]: data
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Assistant Configuration</h2>
          <p className="text-muted-foreground">
            Customize how your AI assistant handles queries and information
          </p>
        </div>
        
        {editMode ? (
          <div className="flex items-center gap-2">
            <Button onClick={handleSaveChanges} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
            <Button variant="outline" onClick={handleCancelChanges} className="flex items-center gap-2">
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </div>
        ) : (
          <Button onClick={() => setEditMode(true)} className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Edit Configuration
          </Button>
        )}
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="query-handling" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Query Handling
          </TabsTrigger>
          <TabsTrigger value="information-sources" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Information Sources
          </TabsTrigger>
          <TabsTrigger value="tone-style" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Tone & Style
          </TabsTrigger>
          <TabsTrigger value="routing" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Query Routing
          </TabsTrigger>
        </TabsList>
        
        {/* Query Handling Tab */}
        <TabsContent value="query-handling" className="space-y-4">
          <QueryHandlingConfig 
            data={formData.queryHandling} 
            editMode={editMode}
            onUpdate={(data) => handleFormUpdate('queryHandling', data)}
          />
        </TabsContent>
        
        {/* Information Sources Tab */}
        <TabsContent value="information-sources" className="space-y-4">
          <InformationSourcesConfig 
            data={formData.informationSources} 
            editMode={editMode}
            onUpdate={(data) => handleFormUpdate('informationSources', data)}
          />
        </TabsContent>
        
        {/* Tone & Style Tab */}
        <TabsContent value="tone-style" className="space-y-4">
          <ToneStyleConfig 
            data={formData.toneAndStyle} 
            editMode={editMode}
            onUpdate={(data) => handleFormUpdate('toneAndStyle', data)}
          />
        </TabsContent>
        
        {/* Query Routing Tab */}
        <TabsContent value="routing" className="space-y-4">
          <RoutingConfig 
            data={formData.routing} 
            editMode={editMode}
            onUpdate={(data) => handleFormUpdate('routing', data)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AssistantConfiguration;
