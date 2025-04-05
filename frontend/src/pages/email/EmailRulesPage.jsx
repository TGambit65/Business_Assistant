import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { 
  Plus, 
  Tag as TagIcon, 
  Trash2, 
  Check, 
  X, 
  Edit2, 
  Move,
  Sparkles,
  Lightbulb,
  Star
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

export default function EmailRulesPage() {
  const { success, error, /* warning, info */ } = useToast();
  const [showAddRuleForm, setShowAddRuleForm] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState(null);
  const [showAddLabelForm, setShowAddLabelForm] = useState(false);
  const [editingLabelId, setEditingLabelId] = useState(null);
  const [activeTab, setActiveTab] = useState('rules'); // 'rules' or 'labels'
  
  // Sample initial rules
  const [rules, setRules] = useState([
    {
      id: 1,
      name: 'Important clients',
      condition: 'FROM',
      value: 'client1@example.com, client2@example.com',
      action: 'PRIORITY',
      enabled: true
    },
    {
      id: 2,
      name: 'Newsletter filter',
      condition: 'SUBJECT_CONTAINS',
      value: 'newsletter, update, digest',
      action: 'MOVE_TO_FOLDER',
      actionValue: 'Newsletters',
      enabled: true
    },
    {
      id: 3,
      name: 'Vacation auto-reply',
      condition: 'ALL_MESSAGES',
      action: 'AUTO_REPLY',
      actionValue: 'I am currently on vacation and will reply upon my return.',
      enabled: false
    }
  ]);
  
  // Sample initial labels
  const [labels, setLabels] = useState([
    {
      id: 1,
      name: 'Important',
      color: '#ff4d4f',
      description: 'High priority emails that need attention',
      aiRules: 'Emails from my boss, with urgent in the subject, or mentioning deadlines',
      isImportant: true,
      order: 1
    },
    {
      id: 2,
      name: 'Work',
      color: '#1890ff',
      description: 'Work-related emails',
      aiRules: 'Professional emails related to projects, tasks, and work communications',
      isImportant: false,
      order: 2
    },
    {
      id: 3,
      name: 'Personal',
      color: '#52c41a',
      description: 'Personal emails',
      aiRules: 'Emails from friends, family, and non-work related messages',
      isImportant: false,
      order: 3
    },
    {
      id: 4,
      name: 'Finance',
      color: '#722ed1',
      description: 'Financial emails',
      aiRules: 'Bank statements, invoices, receipts, and payment confirmations',
      isImportant: true,
      order: 4
    }
  ]);
  
  // New rule form state
  const [newRule, setNewRule] = useState({
    name: '',
    condition: 'FROM',
    value: '',
    action: 'PRIORITY',
    actionValue: '',
    enabled: true
  });
  
  // New label form state
  const [newLabel, setNewLabel] = useState({
    name: '',
    color: '#1890ff',
    description: '',
    aiRules: '',
    keywords: '',
    isImportant: false,
    removeFromInbox: false,
    order: 0
  });
  
  // Handle drag and drop for labels reordering
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(labels);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Update order property
    const updatedLabels = items.map((item, index) => ({
      ...item,
      order: index + 1
    }));
    
    setLabels(updatedLabels);
    setTimeout(() => {
      success({
        title: 'Success',
        description: 'Labels reordered successfully'
      });
    }, 0);
  };
  
  const handleAddRule = () => {
    if (!newRule.name) {
      error('Rule name is required');
      return;
    }
    
    if (editingRuleId !== null) {
      // Update existing rule
      setRules(rules.map(rule => 
        rule.id === editingRuleId ? { ...newRule, id: editingRuleId } : rule
      ));
      success('Rule updated successfully');
    } else {
      // Add new rule
      const newId = Math.max(0, ...rules.map(r => r.id)) + 1;
      setRules([...rules, { ...newRule, id: newId }]);
      success('Rule added successfully');
    }
    
    // Reset form
    setNewRule({
      name: '',
      condition: 'FROM',
      value: '',
      action: 'PRIORITY',
      actionValue: '',
      enabled: true
    });
    setShowAddRuleForm(false);
    setEditingRuleId(null);
  };
  
  const handleAddLabel = () => {
    if (!newLabel.name) {
      error('Label name is required');
      return;
    }
    
    if (editingLabelId !== null) {
      // Update existing label
      setLabels(labels.map(label => 
        label.id === editingLabelId ? { ...newLabel, id: editingLabelId } : label
      ));
      success('Label updated successfully');
    } else {
      // Add new label
      const newId = Math.max(0, ...labels.map(l => l.id)) + 1;
      const newOrder = Math.max(0, ...labels.map(l => l.order)) + 1;
      setLabels([...labels, { ...newLabel, id: newId, order: newOrder }]);
      success('Label added successfully');
    }
    
    // Reset form
    setNewLabel({
      name: '',
      color: '#1890ff',
      description: '',
      aiRules: '',
      keywords: '',
      isImportant: false,
      removeFromInbox: false,
      order: 0
    });
    setShowAddLabelForm(false);
    setEditingLabelId(null);
  };
  
  const handleEditRule = (rule) => {
    setNewRule({ ...rule });
    setEditingRuleId(rule.id);
    setShowAddRuleForm(true);
  };
  
  const handleEditLabel = (label) => {
    setNewLabel({ ...label });
    setEditingLabelId(label.id);
    setShowAddLabelForm(true);
  };
  
  const handleDeleteRule = (id) => {
    setRules(rules.filter(rule => rule.id !== id));
    success('Rule deleted successfully');
  };
  
  const handleDeleteLabel = (id) => {
    setLabels(labels.filter(label => label.id !== id));
    success('Label deleted successfully');
  };
  
  const handleToggleRule = (id) => {
    setRules(rules.map(rule => 
      rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
    ));
  };
  
  // // const handleMoveLabel = (id, direction) => {
    // const labelIndex = labels.findIndex(label => label.id === id);
    // if (
    //   (direction === 'up' && labelIndex === 0) || 
    //   (direction === 'down' && labelIndex === labels.length - 1)
    // ) {
    //   return;
    // }
    // 
    // const newLabels = [...labels];
    // const targetIndex = direction === 'up' ? labelIndex - 1 : labelIndex + 1;
    // 
    // // Swap the items
    // [newLabels[labelIndex], newLabels[targetIndex]] = [newLabels[targetIndex], newLabels[labelIndex]];
    // 
    // // Update order property
    // const updatedLabels = newLabels.map((label, index) => ({
    //   ...label,
    //   order: index + 1
    // }));
    // 
    // setLabels(updatedLabels);
  // };
  
  const handleToggleImportant = (id) => {
    setLabels(labels.map(label => 
      label.id === id ? { ...label, isImportant: !label.isImportant } : label
    ));
    const label = labels.find(l => l.id === id);
    if (label) {
      success(`Label "${label.name}" ${!label.isImportant ? 'marked as important' : 'unmarked as important'}`);
    }
  };
  
  const conditionOptions = [
    { value: 'FROM', label: 'From' },
    { value: 'TO', label: 'To' },
    { value: 'SUBJECT_CONTAINS', label: 'Subject contains' },
    { value: 'BODY_CONTAINS', label: 'Body contains' },
    { value: 'HAS_ATTACHMENT', label: 'Has attachment' },
    { value: 'ALL_MESSAGES', label: 'All messages' }
  ];
  
  const actionOptions = [
    { value: 'PRIORITY', label: 'Mark as priority' },
    { value: 'MOVE_TO_FOLDER', label: 'Move to folder' },
    { value: 'LABEL', label: 'Apply label' },
    { value: 'AUTO_REPLY', label: 'Auto reply' },
    { value: 'FORWARD', label: 'Forward to' }
  ];
  
  // Label colors
  const labelColors = [
    '#1890ff', // Blue
    '#52c41a', // Green
    '#fa8c16', // Orange
    '#f5222d', // Red
    '#722ed1', // Purple
    '#13c2c2', // Cyan
    '#fadb14', // Yellow
    '#eb2f96', // Pink
    '#a0d911', // Lime
    '#fa541c', // Volcano
    '#2f54eb', // Geekblue
    '#fa541c', // Sunset
    '#cf1322', // Crimson
    '#237804', // Forest
    '#006d75', // Ocean
    '#4c1d95', // Indigo
    '#5b21b6', // Violet
    '#6b21a8', // Fuchsia
    '#a21caf', // Magenta
    '#be123c', // Ruby
    '#0c4a6e', // Navy
    '#374151', // Gray
  ];
  
  // Helper to get the available labels for rules
  const getLabelOptions = () => {
    return labels.map(label => ({
      value: label.name,
      label: label.name
    }));
  };
  
  // Generate AI rules for a label
  const generateAIRules = (labelName, description) => {
    // In a real app, this would call an AI API
    // For now, generate some generic rules based on label name
    
    let rules = '';
    
    switch(labelName.toLowerCase()) {
      case 'important':
        rules = 'Emails from important contacts, containing words like "urgent", "important", "ASAP", or related to critical projects';
        break;
      case 'work':
      case 'business':
        rules = 'Professional emails from colleagues, work domains, about projects, tasks, deadlines, or containing work-related terminology';
        break;
      case 'personal':
        rules = 'Emails from friends, family members, personal contacts, or about hobbies, events, and non-work activities';
        break;
      case 'finance':
      case 'financial':
        rules = 'Emails about payments, invoices, receipts, banking, taxes, or financial statements';
        break;
      case 'travel':
        rules = 'Emails about flight bookings, hotel reservations, travel itineraries, or from travel agencies';
        break;
      case 'shopping':
        rules = 'Emails about orders, shipping, delivery status, or from online retailers';
        break;
      default:
        rules = `Emails related to ${labelName.toLowerCase()}, or containing keywords and context relevant to ${description || labelName.toLowerCase()}`;
    }
    
    return rules;
  };
  
  // Auto-generate AI rules for a label
  const handleGenerateAIRules = () => {
    const aiRules = generateAIRules(newLabel.name, newLabel.description);
    setNewLabel({
      ...newLabel,
      aiRules
    });
    
    success('AI rules generated! You can edit them as needed.');
  };
  
  return (
    <div className="container p-6 mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground dark:text-white">Email Rules & Labels</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage labels and rules to organize your inbox with AI assistance.
        </p>
      </div>
      
      {/* Using the proper Tabs hierarchy from Radix UI */}
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="labels" className="flex items-center">
            <TagIcon className="mr-2 h-4 w-4" />
            Labels
          </TabsTrigger>
          <TabsTrigger value="rules" className="flex items-center">
            <TagIcon className="mr-2 h-4 w-4" />
            Rules
          </TabsTrigger>
        </TabsList>
        
        {/* Labels Tab */}
        <TabsContent value="labels">
          <div className="flex justify-between mb-6 items-center">
            <div className="flex items-center">
              <TagIcon className="mr-2 h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold text-foreground dark:text-white">Labels</h2>
            </div>
            <Button 
              onClick={() => {
                setShowAddLabelForm(!showAddLabelForm);
                setEditingLabelId(null);
                if (!showAddLabelForm) {
                  setNewLabel({
                    name: '',
                    color: '#1890ff',
                    description: '',
                    aiRules: '',
                    keywords: '',
                    isImportant: false,
                    removeFromInbox: false,
                    order: 0
                  });
                }
              }}
              className="flex items-center gap-2"
            >
              <Plus size={16} />
              <span>Add Label</span>
            </Button>
          </div>
          
          {/* Add/Edit Label Form */}
          {showAddLabelForm && (
            <Card className="mb-6 border-0 shadow-sm">
              <CardHeader>
                <CardTitle>{editingLabelId !== null ? 'Edit Label' : 'Add New Label'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">Label Name</label>
                    <input
                      type="text"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-gray-800"
                      placeholder="Enter label name"
                      value={newLabel.name}
                      onChange={(e) => setNewLabel({ ...newLabel, name: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Color</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {labelColors.map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setNewLabel({ ...newLabel, color })}
                          className={`w-6 h-6 rounded-full ${
                            newLabel.color === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                          }`}
                          style={{ backgroundColor: color }}
                          aria-label={`Color ${color}`}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div className="col-span-1 sm:col-span-2">
                    <label className="block text-sm font-medium mb-1">Description (Optional)</label>
                    <input
                      type="text"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-gray-800"
                      placeholder="Enter a description for this label"
                      value={newLabel.description}
                      onChange={(e) => setNewLabel({ ...newLabel, description: e.target.value })}
                    />
                  </div>
                  
                  <div className="col-span-1 sm:col-span-2">
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-medium">AI Sorting Rules</label>
                      <button
                        type="button"
                        onClick={handleGenerateAIRules}
                        className="inline-flex items-center text-xs text-primary hover:text-primary-dark"
                        disabled={!newLabel.name}
                      >
                        <Sparkles className="mr-1 h-3 w-3" />
                        Generate
                      </button>
                    </div>
                    <textarea
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-gray-800"
                      placeholder="Describe how the AI should sort emails with this label"
                      rows={3}
                      value={newLabel.aiRules}
                      onChange={(e) => setNewLabel({ ...newLabel, aiRules: e.target.value })}
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Describe the types of emails that should receive this label. Our AI will use this to automatically categorize your emails.
                    </p>
                  </div>
                  
                  <div className="col-span-1 sm:col-span-2">
                    <label className="block text-sm font-medium mb-1">Keywords (Optional)</label>
                    <input
                      type="text"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-gray-800"
                      placeholder="Enter keywords separated by commas (e.g., invoice, payment, receipt)"
                      value={newLabel.keywords}
                      onChange={(e) => setNewLabel({ ...newLabel, keywords: e.target.value })}
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Keywords help the system quickly match emails to this label. Separate multiple keywords with commas.
                    </p>
                  </div>
                  
                  <div className="col-span-1 sm:col-span-2 mt-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500"
                        checked={newLabel.isImportant}
                        onChange={(e) => setNewLabel({ ...newLabel, isImportant: e.target.checked })}
                      />
                      <div className="flex items-center">
                        <span className="text-sm">Mark as important</span>
                        <div className="ml-1 group relative">
                          <Lightbulb className="h-3.5 w-3.5 text-yellow-500 cursor-help" />
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-1 w-48 bg-gray-900 text-white text-xs rounded p-2 hidden group-hover:block">
                            Important labels are used to generate email summaries in the Command Center.
                          </div>
                        </div>
                      </div>
                    </label>
                  </div>
                  
                  <div className="col-span-1 sm:col-span-2 mt-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                        checked={newLabel.removeFromInbox}
                        onChange={(e) => setNewLabel({ ...newLabel, removeFromInbox: e.target.checked })}
                      />
                      <div className="flex items-center">
                        <span className="text-sm">Remove from inbox when sorted</span>
                        <div className="ml-1 group relative">
                          <Lightbulb className="h-3.5 w-3.5 text-blue-500 cursor-help" />
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-1 w-48 bg-gray-900 text-white text-xs rounded p-2 hidden group-hover:block">
                            When enabled, emails sorted into this label will be removed from the main inbox.
                          </div>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAddLabelForm(false);
                      setEditingLabelId(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddLabel}>
                    {editingLabelId !== null ? 'Update' : 'Add'} Label
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Labels List */}
          <div className="bg-background dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="labels">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="divide-y divide-gray-200 dark:divide-gray-700"
                  >
                    {labels.length === 0 ? (
                      <div className="p-6 text-center">
                        <p className="text-gray-500 dark:text-gray-400">No labels yet. Create your first label to get started.</p>
                      </div>
                    ) : (
                      labels
                        .sort((a, b) => a.order - b.order)
                        .map((label, index) => (
                          <Draggable key={label.id} draggableId={label.id.toString()} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className="p-4 hover:bg-muted dark:hover:bg-gray-750 flex items-center"
                              >
                                <div
                                  {...provided.dragHandleProps}
                                  className="flex-shrink-0 mr-3 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 cursor-move"
                                >
                                  <Move className="h-5 w-5" />
                                </div>
                                
                                <div className="flex-shrink-0 mr-3">
                                  <div
                                    className="w-4 h-4 rounded-full"
                                    style={{ backgroundColor: label.color }}
                                  />
                                </div>
                                
                                <div className="flex-grow min-w-0 mr-4">
                                  <div className="flex items-center">
                                    <h3 className="text-sm font-medium text-foreground dark:text-white truncate">
                                      {label.name}
                                    </h3>
                                    {label.isImportant && (
                                      <div className="ml-2 group relative">
                                        <Star className="h-3.5 w-3.5 text-yellow-500" />
                                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-1 w-48 bg-gray-900 text-white text-xs rounded p-2 hidden group-hover:block z-10">
                                          Marked as important. Emails with this label will appear in summaries.
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  {label.description && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                      {label.description}
                                    </p>
                                  )}
                                  {label.aiRules && (
                                    <div className="flex items-center mt-1">
                                      <Lightbulb className="h-3 w-3 text-yellow-500 mr-1" />
                                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                        {label.aiRules}
                                      </p>
                                    </div>
                                  )}
                                  {label.keywords && (
                                    <div className="flex items-center mt-1">
                                      <TagIcon className="h-3 w-3 text-blue-500 mr-1" />
                                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                        {label.keywords}
                                      </p>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex-shrink-0 flex space-x-2">
                                  <button
                                    onClick={() => handleToggleImportant(label.id)}
                                    className={`p-1.5 rounded-md ${label.isImportant ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-gray-100 text-gray-500 hover:text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700'}`}
                                    title={label.isImportant ? "Unmark as important" : "Mark as important for email summaries"}
                                  >
                                    <Star size={16} className={label.isImportant ? "fill-current" : ""} />
                                  </button>
                                  
                                  <button
                                    onClick={() => handleEditLabel(label)}
                                    className="p-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </button>
                                  
                                  <button
                                    onClick={() => handleDeleteLabel(label.id)}
                                    className="p-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
          
          {/* Info about AI labeling */}
          <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <Sparkles className="h-5 w-5 text-blue-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">AI-Powered Email Organization</h3>
                <div className="mt-2 text-sm text-blue-700 dark:text-blue-200">
                  <p>Our AI system uses the rules you define to automatically categorize your emails:</p>
                  <ul className="list-disc space-y-1 pl-5 mt-1">
                    <li>Create descriptive labels for different types of emails</li>
                    <li>Set the order of importance by dragging labels or using the arrows</li>
                    <li>Mark labels as important to include them in email summaries on the dashboard</li>
                    <li>Add AI rules to teach our system how to identify emails for each label</li>
                    <li>The AI learns from your interactions to improve over time</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        {/* Rules Tab */}
        <TabsContent value="rules">
          <div className="flex justify-end mb-6">
            <Button 
              onClick={() => {
                setShowAddRuleForm(!showAddRuleForm);
                setEditingRuleId(null);
                if (!showAddRuleForm) {
                  setNewRule({
                    name: '',
                    condition: 'FROM',
                    value: '',
                    action: 'PRIORITY',
                    actionValue: '',
                    enabled: true
                  });
                }
              }}
              className="flex items-center gap-2"
            >
              <Plus size={16} />
              <span>Add Rule</span>
            </Button>
          </div>
          
          {/* Add/Edit Rule Form */}
          {showAddRuleForm && (
            <Card className="mb-6 border-0 shadow-sm">
              <CardHeader>
                <CardTitle>{editingRuleId !== null ? 'Edit Rule' : 'Add New Rule'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="col-span-1 sm:col-span-2">
                    <label className="block text-sm font-medium mb-1">Rule Name</label>
                    <input
                      type="text"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-gray-800"
                      placeholder="Enter rule name"
                      value={newRule.name}
                      onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Condition</label>
                    <select
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-gray-800"
                      value={newRule.condition}
                      onChange={(e) => setNewRule({ ...newRule, condition: e.target.value })}
                    >
                      {conditionOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  {newRule.condition !== 'ALL_MESSAGES' && newRule.condition !== 'HAS_ATTACHMENT' && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Value</label>
                      <input
                        type="text"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-gray-800"
                        placeholder="Enter value"
                        value={newRule.value}
                        onChange={(e) => setNewRule({ ...newRule, value: e.target.value })}
                      />
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Action</label>
                    <select
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-gray-800"
                      value={newRule.action}
                      onChange={(e) => setNewRule({ ...newRule, action: e.target.value })}
                    >
                      {actionOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  {(newRule.action === 'MOVE_TO_FOLDER' || 
                    newRule.action === 'LABEL' || 
                    newRule.action === 'AUTO_REPLY' || 
                    newRule.action === 'FORWARD') && (
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        {newRule.action === 'MOVE_TO_FOLDER' ? 'Folder' : 
                         newRule.action === 'LABEL' ? 'Label' : 
                         newRule.action === 'AUTO_REPLY' ? 'Reply message' : 
                         'Email address'}
                      </label>
                      {newRule.action === 'LABEL' ? (
                        <select
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-gray-800"
                          value={newRule.actionValue || ''}
                          onChange={(e) => setNewRule({ ...newRule, actionValue: e.target.value })}
                        >
                          <option value="">Select a label</option>
                          {getLabelOptions().map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-gray-800"
                          placeholder={`Enter ${
                            newRule.action === 'MOVE_TO_FOLDER' ? 'folder name' : 
                            newRule.action === 'LABEL' ? 'label name' : 
                            newRule.action === 'AUTO_REPLY' ? 'reply message' : 
                            'email address'
                          }`}
                          value={newRule.actionValue || ''}
                          onChange={(e) => setNewRule({ ...newRule, actionValue: e.target.value })}
                        />
                      )}
                    </div>
                  )}
                  
                  <div className="col-span-1 sm:col-span-2 mt-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="mr-2 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        checked={newRule.enabled}
                        onChange={(e) => setNewRule({ ...newRule, enabled: e.target.checked })}
                      />
                      <span className="text-sm">Enable this rule</span>
                    </label>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAddRuleForm(false);
                      setEditingRuleId(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddRule}>
                    {editingRuleId !== null ? 'Update' : 'Add'} Rule
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Rules List */}
          <div className="bg-background dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {rules.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-gray-500 dark:text-gray-400">No rules yet. Create your first rule to get started.</p>
                </div>
              ) : (
                rules.map(rule => (
                  <div key={rule.id} className="p-4 hover:bg-muted dark:hover:bg-gray-750 flex items-center">
                    <div className="flex-shrink-0 mr-3">
                      <button
                        onClick={() => handleToggleRule(rule.id)}
                        className={`p-1 rounded-full ${
                          rule.enabled
                            ? 'text-green-500 bg-green-100 dark:bg-green-900/30'
                            : 'text-gray-400 bg-gray-100 dark:bg-gray-700'
                        }`}
                      >
                        {rule.enabled ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                      </button>
                    </div>
                    
                    <div className="flex-grow min-w-0 mr-4">
                      <h3 className="text-sm font-medium text-foreground dark:text-white">{rule.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {conditionOptions.find(option => option.value === rule.condition)?.label || rule.condition}
                        {rule.condition !== 'ALL_MESSAGES' && rule.condition !== 'HAS_ATTACHMENT' && rule.value
                          ? `: ${rule.value}`
                          : ''}
                        {' → '}
                        {actionOptions.find(option => option.value === rule.action)?.label || rule.action}
                        {rule.actionValue ? `: ${rule.actionValue}` : ''}
                      </p>
                    </div>
                    
                    <div className="flex-shrink-0 flex space-x-2">
                      <button
                        onClick={() => handleEditRule(rule)}
                        className="p-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDeleteRule(rule.id)}
                        className="p-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 