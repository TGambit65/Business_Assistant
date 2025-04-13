import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Switch } from '../../../components/ui/switch';
import { X } from 'lucide-react';

/**
 * RuleForm Component
 * 
 * Form for creating or editing email rules.
 */
const RuleForm = ({ 
  rule, 
  isEditing, 
  onChange, 
  onSave, 
  onCancel,
  folders,
  labels
}) => {
  // Handle input change
  const handleChange = (field, value) => {
    onChange({ ...rule, [field]: value });
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave();
  };
  
  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit Rule' : 'Create New Rule'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Rule Name */}
          <div className="space-y-2">
            <Label htmlFor="rule-name">Rule Name</Label>
            <Input
              id="rule-name"
              value={rule.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter rule name"
              required
            />
          </div>
          
          {/* Condition */}
          <div className="space-y-2">
            <Label htmlFor="condition">Condition</Label>
            <Select
              value={rule.condition}
              onValueChange={(value) => handleChange('condition', value)}
            >
              <SelectTrigger id="condition">
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FROM">From</SelectItem>
                <SelectItem value="TO">To</SelectItem>
                <SelectItem value="SUBJECT_CONTAINS">Subject Contains</SelectItem>
                <SelectItem value="BODY_CONTAINS">Body Contains</SelectItem>
                <SelectItem value="HAS_ATTACHMENT">Has Attachment</SelectItem>
                <SelectItem value="ALL_MESSAGES">All Messages</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Condition Value */}
          {rule.condition !== 'HAS_ATTACHMENT' && rule.condition !== 'ALL_MESSAGES' && (
            <div className="space-y-2">
              <Label htmlFor="condition-value">
                {rule.condition === 'FROM' || rule.condition === 'TO' 
                  ? 'Email Address(es)' 
                  : 'Keywords'}
              </Label>
              <Input
                id="condition-value"
                value={rule.value}
                onChange={(e) => handleChange('value', e.target.value)}
                placeholder={rule.condition === 'FROM' || rule.condition === 'TO'
                  ? 'example@email.com, another@email.com'
                  : 'keyword1, keyword2, keyword3'}
                required={rule.condition !== 'HAS_ATTACHMENT' && rule.condition !== 'ALL_MESSAGES'}
              />
              <p className="text-xs text-muted-foreground">
                {rule.condition === 'FROM' || rule.condition === 'TO'
                  ? 'Separate multiple email addresses with commas'
                  : 'Separate multiple keywords with commas'}
              </p>
            </div>
          )}
          
          {/* Action */}
          <div className="space-y-2">
            <Label htmlFor="action">Action</Label>
            <Select
              value={rule.action}
              onValueChange={(value) => handleChange('action', value)}
            >
              <SelectTrigger id="action">
                <SelectValue placeholder="Select action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PRIORITY">Mark as Priority</SelectItem>
                <SelectItem value="MOVE_TO_FOLDER">Move to Folder</SelectItem>
                <SelectItem value="APPLY_LABEL">Apply Label</SelectItem>
                <SelectItem value="AUTO_REPLY">Send Auto-Reply</SelectItem>
                <SelectItem value="FORWARD">Forward</SelectItem>
                <SelectItem value="DELETE">Delete Message</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Action Value */}
          {rule.action === 'MOVE_TO_FOLDER' && (
            <div className="space-y-2">
              <Label htmlFor="folder">Folder</Label>
              <Select
                value={rule.actionValue}
                onValueChange={(value) => handleChange('actionValue', value)}
              >
                <SelectTrigger id="folder">
                  <SelectValue placeholder="Select folder" />
                </SelectTrigger>
                <SelectContent>
                  {folders?.map(folder => (
                    <SelectItem key={folder.id} value={folder.name}>
                      {folder.name}
                    </SelectItem>
                  )) || (
                    <>
                      <SelectItem value="Inbox">Inbox</SelectItem>
                      <SelectItem value="Archive">Archive</SelectItem>
                      <SelectItem value="Sent">Sent</SelectItem>
                      <SelectItem value="Drafts">Drafts</SelectItem>
                      <SelectItem value="Spam">Spam</SelectItem>
                      <SelectItem value="Trash">Trash</SelectItem>
                      <SelectItem value="Newsletters">Newsletters</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {rule.action === 'APPLY_LABEL' && (
            <div className="space-y-2">
              <Label htmlFor="label">Label</Label>
              <Select
                value={rule.actionValue}
                onValueChange={(value) => handleChange('actionValue', value)}
              >
                <SelectTrigger id="label">
                  <SelectValue placeholder="Select label" />
                </SelectTrigger>
                <SelectContent>
                  {labels?.map(label => (
                    <SelectItem key={label.id} value={label.name}>
                      {label.name}
                    </SelectItem>
                  )) || (
                    <>
                      <SelectItem value="Important">Important</SelectItem>
                      <SelectItem value="Work">Work</SelectItem>
                      <SelectItem value="Personal">Personal</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {rule.action === 'AUTO_REPLY' && (
            <div className="space-y-2">
              <Label htmlFor="auto-reply">Auto-Reply Message</Label>
              <Textarea
                id="auto-reply"
                value={rule.actionValue}
                onChange={(e) => handleChange('actionValue', e.target.value)}
                placeholder="Enter auto-reply message"
                rows={4}
                required={rule.action === 'AUTO_REPLY'}
              />
            </div>
          )}
          
          {rule.action === 'FORWARD' && (
            <div className="space-y-2">
              <Label htmlFor="forward-email">Forward To</Label>
              <Input
                id="forward-email"
                type="email"
                value={rule.actionValue}
                onChange={(e) => handleChange('actionValue', e.target.value)}
                placeholder="example@email.com"
                required={rule.action === 'FORWARD'}
              />
            </div>
          )}
          
          {/* Enabled Switch */}
          <div className="flex items-center justify-between">
            <Label htmlFor="enabled" className="cursor-pointer">Enable Rule</Label>
            <Switch
              id="enabled"
              checked={rule.enabled}
              onCheckedChange={(checked) => handleChange('enabled', checked)}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button type="submit">
            {isEditing ? 'Update Rule' : 'Create Rule'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default RuleForm;
