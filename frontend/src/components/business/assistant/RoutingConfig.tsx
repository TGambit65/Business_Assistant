import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../../../components/ui/card';
import { Label } from '../../../components/ui/label';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Slider } from '../../../components/ui/slider';
import { Badge } from '../../../components/ui/badge';
import { Edit, Trash2, Plus, Save, X } from 'lucide-react';

interface RoutingRule {
  id: string;
  category: string;
  keywords: string[];
  destination: string;
  priority: string;
}

interface RoutingConfigProps {
  data: {
    rules: RoutingRule[];
    defaultDestination: string;
    humanEscalationThreshold: number;
  };
  editMode: boolean;
  onUpdate: (data: any) => void;
}

/**
 * RoutingConfig Component
 * 
 * Configuration for query routing rules and escalation settings.
 */
const RoutingConfig: React.FC<RoutingConfigProps> = ({ data, editMode, onUpdate }) => {
  // State for editing a specific rule
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [editingRule, setEditingRule] = useState<RoutingRule | null>(null);
  const [newKeyword, setNewKeyword] = useState('');
  
  // Handle input change
  const handleInputChange = (field: string, value: any) => {
    onUpdate({
      ...data,
      [field]: value
    });
  };
  
  // Start editing a rule
  const handleEditRule = (rule: RoutingRule) => {
    setEditingRuleId(rule.id);
    setEditingRule({ ...rule });
  };
  
  // Save edited rule
  const handleSaveRule = () => {
    if (!editingRule) return;
    
    const updatedRules = data.rules.map(rule => 
      rule.id === editingRuleId ? editingRule : rule
    );
    
    handleInputChange('rules', updatedRules);
    setEditingRuleId(null);
    setEditingRule(null);
  };
  
  // Cancel editing rule
  const handleCancelEdit = () => {
    setEditingRuleId(null);
    setEditingRule(null);
  };
  
  // Delete a rule
  const handleDeleteRule = (ruleId: string) => {
    const updatedRules = data.rules.filter(rule => rule.id !== ruleId);
    handleInputChange('rules', updatedRules);
  };
  
  // Add a new keyword to the editing rule
  const handleAddKeyword = () => {
    if (!editingRule || !newKeyword.trim()) return;
    
    setEditingRule({
      ...editingRule,
      keywords: [...editingRule.keywords, newKeyword.trim()]
    });
    
    setNewKeyword('');
  };
  
  // Remove a keyword from the editing rule
  const handleRemoveKeyword = (keyword: string) => {
    if (!editingRule) return;
    
    setEditingRule({
      ...editingRule,
      keywords: editingRule.keywords.filter(k => k !== keyword)
    });
  };
  
  // Add a new rule (placeholder)
  const handleAddRule = () => {
    // In a real app, this would create a new rule with default values
    const newRule: RoutingRule = {
      id: `rule${data.rules.length + 1}`,
      category: 'New Category',
      keywords: [],
      destination: data.defaultDestination,
      priority: 'medium'
    };
    
    handleInputChange('rules', [...data.rules, newRule]);
    handleEditRule(newRule);
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Query Routing Configuration</CardTitle>
            <CardDescription>
              Configure how queries are routed to different knowledge areas
            </CardDescription>
          </div>
          {editMode && !editingRuleId && (
            <Button size="sm" onClick={handleAddRule}>
              <Plus className="h-4 w-4 mr-1" />
              Add Rule
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Routing Rules */}
        <div className="space-y-4">
          <Label>Routing Rules</Label>
          
          {data.rules.length === 0 ? (
            <div className="text-center p-4 border rounded-md">
              <p className="text-muted-foreground">No routing rules defined yet.</p>
            </div>
          ) : (
            data.rules.map(rule => (
              <div key={rule.id} className="p-4 border rounded-md">
                {editingRuleId === rule.id ? (
                  // Editing mode for this rule
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Input
                        id="category"
                        value={editingRule?.category || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingRule({ ...editingRule!, category: e.target.value })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="keywords">Keywords</Label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {editingRule?.keywords.map(keyword => (
                          <Badge key={keyword} className="flex items-center gap-1">
                            {keyword}
                            <button 
                              onClick={() => handleRemoveKeyword(keyword)}
                              className="ml-1 h-3 w-3 rounded-full bg-muted-foreground/20 flex items-center justify-center hover:bg-muted-foreground/40"
                            >
                              <X className="h-2 w-2" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          value={newKeyword}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewKeyword(e.target.value)}
                          placeholder="Add keyword"
                          className="flex-1"
                        />
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleAddKeyword}
                          disabled={!newKeyword.trim()}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="destination">Destination</Label>
                      <Input
                        id="destination"
                        value={editingRule?.destination || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingRule({ ...editingRule!, destination: e.target.value })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select
                        value={editingRule?.priority || ''}
                        onValueChange={(value: string) => setEditingRule({ ...editingRule!, priority: value })}
                      >
                        <SelectTrigger
                          id="priority"
                          className=""
                          onClick={() => {}}
                          open={false}
                          value={editingRule?.priority || ''}
                        >
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent className="" onSelect={() => {}}>
                          <SelectItem value="high" className="" onSelect={() => {}}>High</SelectItem>
                          <SelectItem value="medium" className="" onSelect={() => {}}>Medium</SelectItem>
                          <SelectItem value="low" className="" onSelect={() => {}}>Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex justify-end gap-2 mt-4">
                      <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleSaveRule}>
                        <Save className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  // View mode for this rule
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-lg">{rule.category}</h3>
                        <p className="text-sm text-muted-foreground">
                          Routes to: <span className="font-medium">{rule.destination}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="" variant={
                          rule.priority === 'high' ? 'default' :
                          rule.priority === 'medium' ? 'secondary' :
                          'outline'
                        }>
                          {rule.priority} priority
                        </Badge>
                        {editMode && (
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" onClick={() => handleEditRule(rule)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteRule(rule.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-2">
                      <Label className="text-xs">Keywords</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {rule.keywords.map(keyword => (
                          <Badge key={keyword} variant="outline" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
          
          <p className="text-sm text-muted-foreground">
            Rules determine which knowledge base is used based on query content
          </p>
        </div>
        
        {/* Default Destination */}
        <div className="space-y-2">
          <Label htmlFor="default-destination">Default Destination</Label>
          <Input
            id="default-destination"
            disabled={!editMode || !!editingRuleId}
            value={data.defaultDestination}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('defaultDestination', e.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            Knowledge base used when no routing rules match
          </p>
        </div>
        
        {/* Human Escalation Threshold */}
        <div className="space-y-2">
          <Label htmlFor="escalation">Human Escalation Threshold</Label>
          <div className="flex items-center gap-4">
            <Slider />
            <span className="w-16 text-right">{data.humanEscalationThreshold}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Confidence threshold below which queries are escalated to human agents (0-1)
          </p>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <div className="w-full text-sm text-muted-foreground">
          <p>
            <strong>Note:</strong> Routing rules are evaluated in order of priority (high to low).
            The first matching rule determines which knowledge base is used.
          </p>
        </div>
      </CardFooter>
    </Card>
  );
};

export default RoutingConfig;
