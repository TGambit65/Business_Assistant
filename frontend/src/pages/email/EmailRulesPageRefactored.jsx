import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { useToast } from '../../contexts/ToastContext';
import { Lightbulb } from 'lucide-react';

// Import components
import RulesList from '../../components/email/rules/RulesList';
import RuleForm from '../../components/email/rules/RuleForm';
import LabelsList from '../../components/email/rules/LabelsList';
import LabelForm from '../../components/email/rules/LabelForm';

/**
 * EmailRulesPageRefactored Component
 * 
 * A refactored version of the email rules page that uses separate components
 * for rules and labels management.
 */
export default function EmailRulesPageRefactored() {
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState('rules'); // 'rules' or 'labels'
  
  // Rules state
  const [showAddRuleForm, setShowAddRuleForm] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState(null);
  
  // Labels state
  const [showAddLabelForm, setShowAddLabelForm] = useState(false);
  const [editingLabelId, setEditingLabelId] = useState(null);
  
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
  
  // Sample folders for rule form
  const folders = [
    { id: 1, name: 'Inbox' },
    { id: 2, name: 'Archive' },
    { id: 3, name: 'Sent' },
    { id: 4, name: 'Drafts' },
    { id: 5, name: 'Spam' },
    { id: 6, name: 'Trash' },
    { id: 7, name: 'Newsletters' }
  ];
  
  // ===== Rules Management =====
  
  // Handle add rule button click
  const handleAddRuleClick = () => {
    setNewRule({
      name: '',
      condition: 'FROM',
      value: '',
      action: 'PRIORITY',
      actionValue: '',
      enabled: true
    });
    setShowAddRuleForm(true);
    setEditingRuleId(null);
  };
  
  // Handle edit rule button click
  const handleEditRule = (ruleId) => {
    const ruleToEdit = rules.find(rule => rule.id === ruleId);
    if (ruleToEdit) {
      setNewRule({ ...ruleToEdit });
      setEditingRuleId(ruleId);
      setShowAddRuleForm(true);
    }
  };
  
  // Handle delete rule
  const handleDeleteRule = (ruleId) => {
    setRules(rules.filter(rule => rule.id !== ruleId));
    success({
      title: 'Success',
      description: 'Rule deleted successfully'
    });
  };
  
  // Handle toggle rule
  const handleToggleRule = (ruleId) => {
    setRules(rules.map(rule => 
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    ));
    success({
      title: 'Success',
      description: 'Rule updated successfully'
    });
  };
  
  // Handle save rule
  const handleSaveRule = () => {
    if (!newRule.name) {
      error('Rule name is required');
      return;
    }
    
    if (editingRuleId !== null) {
      // Update existing rule
      setRules(rules.map(rule => 
        rule.id === editingRuleId ? { ...newRule, id: editingRuleId } : rule
      ));
      success({
        title: 'Success',
        description: 'Rule updated successfully'
      });
    } else {
      // Add new rule
      const newId = Math.max(0, ...rules.map(r => r.id)) + 1;
      setRules([...rules, { ...newRule, id: newId }]);
      success({
        title: 'Success',
        description: 'Rule created successfully'
      });
    }
    
    setShowAddRuleForm(false);
    setEditingRuleId(null);
  };
  
  // Handle cancel rule form
  const handleCancelRuleForm = () => {
    setShowAddRuleForm(false);
    setEditingRuleId(null);
  };
  
  // ===== Labels Management =====
  
  // Handle add label button click
  const handleAddLabelClick = () => {
    setNewLabel({
      name: '',
      color: '#1890ff',
      description: '',
      aiRules: '',
      keywords: '',
      isImportant: false,
      removeFromInbox: false,
      order: labels.length + 1
    });
    setShowAddLabelForm(true);
    setEditingLabelId(null);
  };
  
  // Handle edit label button click
  const handleEditLabel = (labelId) => {
    const labelToEdit = labels.find(label => label.id === labelId);
    if (labelToEdit) {
      setNewLabel({ ...labelToEdit });
      setEditingLabelId(labelId);
      setShowAddLabelForm(true);
    }
  };
  
  // Handle delete label
  const handleDeleteLabel = (labelId) => {
    setLabels(labels.filter(label => label.id !== labelId));
    success({
      title: 'Success',
      description: 'Label deleted successfully'
    });
  };
  
  // Handle save label
  const handleSaveLabel = () => {
    if (!newLabel.name) {
      error('Label name is required');
      return;
    }
    
    if (editingLabelId !== null) {
      // Update existing label
      setLabels(labels.map(label => 
        label.id === editingLabelId ? { ...newLabel, id: editingLabelId } : label
      ));
      success({
        title: 'Success',
        description: 'Label updated successfully'
      });
    } else {
      // Add new label
      const newId = Math.max(0, ...labels.map(l => l.id)) + 1;
      setLabels([...labels, { ...newLabel, id: newId }]);
      success({
        title: 'Success',
        description: 'Label created successfully'
      });
    }
    
    setShowAddLabelForm(false);
    setEditingLabelId(null);
  };
  
  // Handle cancel label form
  const handleCancelLabelForm = () => {
    setShowAddLabelForm(false);
    setEditingLabelId(null);
  };
  
  // Handle reorder labels
  const handleReorderLabels = (updatedLabels) => {
    setLabels(updatedLabels);
    success({
      title: 'Success',
      description: 'Labels reordered successfully'
    });
  };
  
  // Handle generate AI rules
  const handleGenerateAIRules = () => {
    if (!newLabel.name) {
      error('Please enter a label name first');
      return;
    }
    
    // In a real app, this would call an AI service
    // Here we're just setting a placeholder
    const aiRules = `Emails related to ${newLabel.name.toLowerCase()}, including messages about ${newLabel.name.toLowerCase()} topics, discussions, and updates.`;
    
    setNewLabel({
      ...newLabel,
      aiRules
    });
    
    success({
      title: 'AI Rules Generated',
      description: 'AI classification rules have been generated'
    });
  };
  
  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Email Rules & Labels</h1>
        <div className="flex items-center text-muted-foreground text-sm">
          <Lightbulb className="h-4 w-4 mr-2" />
          <span>Rules are processed in the order they appear</span>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="rules">Rules</TabsTrigger>
          <TabsTrigger value="labels">Labels</TabsTrigger>
        </TabsList>
        
        <TabsContent value="rules">
          {showAddRuleForm ? (
            <RuleForm
              rule={newRule}
              isEditing={editingRuleId !== null}
              onChange={setNewRule}
              onSave={handleSaveRule}
              onCancel={handleCancelRuleForm}
              folders={folders}
              labels={labels}
            />
          ) : (
            <RulesList
              rules={rules}
              onEditRule={handleEditRule}
              onDeleteRule={handleDeleteRule}
              onToggleRule={handleToggleRule}
              onAddRule={handleAddRuleClick}
            />
          )}
        </TabsContent>
        
        <TabsContent value="labels">
          {showAddLabelForm ? (
            <LabelForm
              label={newLabel}
              isEditing={editingLabelId !== null}
              onChange={setNewLabel}
              onSave={handleSaveLabel}
              onCancel={handleCancelLabelForm}
              onGenerateAIRules={handleGenerateAIRules}
            />
          ) : (
            <LabelsList
              labels={labels}
              onEditLabel={handleEditLabel}
              onDeleteLabel={handleDeleteLabel}
              onAddLabel={handleAddLabelClick}
              onReorderLabels={handleReorderLabels}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
