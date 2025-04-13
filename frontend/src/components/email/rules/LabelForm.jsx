import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Switch } from '../../../components/ui/switch';
import { X, Sparkles } from 'lucide-react';

/**
 * LabelForm Component
 * 
 * Form for creating or editing email labels.
 */
const LabelForm = ({ 
  label, 
  isEditing, 
  onChange, 
  onSave, 
  onCancel,
  onGenerateAIRules
}) => {
  // Handle input change
  const handleChange = (field, value) => {
    onChange({ ...label, [field]: value });
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave();
  };
  
  // Color options
  const colorOptions = [
    '#ff4d4f', // Red
    '#ff7a45', // Orange
    '#ffa940', // Gold
    '#52c41a', // Green
    '#13c2c2', // Cyan
    '#1890ff', // Blue
    '#722ed1', // Purple
    '#eb2f96', // Magenta
    '#fadb14', // Yellow
    '#a0a0a0', // Gray
  ];
  
  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit Label' : 'Create New Label'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Label Name */}
          <div className="space-y-2">
            <Label htmlFor="label-name">Label Name</Label>
            <Input
              id="label-name"
              value={label.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter label name"
              required
            />
          </div>
          
          {/* Label Color */}
          <div className="space-y-2">
            <Label>Label Color</Label>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map(color => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 ${
                    label.color === color ? 'border-black dark:border-white' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleChange('color', color)}
                />
              ))}
            </div>
          </div>
          
          {/* Label Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={label.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Enter label description"
            />
          </div>
          
          {/* AI Rules */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="ai-rules">AI Classification Rules</Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={onGenerateAIRules}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Generate
              </Button>
            </div>
            <Textarea
              id="ai-rules"
              value={label.aiRules}
              onChange={(e) => handleChange('aiRules', e.target.value)}
              placeholder="Describe when this label should be applied (e.g., 'Emails from my boss, with urgent in the subject, or mentioning deadlines')"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Describe in natural language when this label should be applied to emails
            </p>
          </div>
          
          {/* Keywords */}
          <div className="space-y-2">
            <Label htmlFor="keywords">Keywords (Optional)</Label>
            <Input
              id="keywords"
              value={label.keywords || ''}
              onChange={(e) => handleChange('keywords', e.target.value)}
              placeholder="keyword1, keyword2, keyword3"
            />
            <p className="text-xs text-muted-foreground">
              Comma-separated keywords that trigger this label
            </p>
          </div>
          
          {/* Important Switch */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="important" className="cursor-pointer">Mark as Important</Label>
              <p className="text-xs text-muted-foreground">
                Important labels are highlighted and prioritized
              </p>
            </div>
            <Switch
              id="important"
              checked={label.isImportant}
              onCheckedChange={(checked) => handleChange('isImportant', checked)}
            />
          </div>
          
          {/* Remove from Inbox Switch */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="remove-inbox" className="cursor-pointer">Remove from Inbox</Label>
              <p className="text-xs text-muted-foreground">
                Automatically remove labeled messages from inbox
              </p>
            </div>
            <Switch
              id="remove-inbox"
              checked={label.removeFromInbox}
              onCheckedChange={(checked) => handleChange('removeFromInbox', checked)}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button type="submit">
            {isEditing ? 'Update Label' : 'Create Label'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default LabelForm;
