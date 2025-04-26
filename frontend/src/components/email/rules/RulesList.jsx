import React from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { 
  Trash2, 
  Edit2, 
  Check, 
  X
} from 'lucide-react';
import { Switch } from '../../../components/ui/switch';

/**
 * RulesList Component
 * 
 * Displays a list of email rules with options to edit, delete, and toggle them.
 */
const RulesList = ({ 
  rules, 
  onEditRule, 
  onDeleteRule, 
  onToggleRule,
  onAddRule
}) => {
  // Get condition display text
  const getConditionText = (rule) => {
    switch (rule.condition) {
      case 'FROM':
        return `From: ${rule.value}`;
      case 'TO':
        return `To: ${rule.value}`;
      case 'SUBJECT_CONTAINS':
        return `Subject contains: ${rule.value}`;
      case 'BODY_CONTAINS':
        return `Body contains: ${rule.value}`;
      case 'HAS_ATTACHMENT':
        return 'Has attachment';
      case 'ALL_MESSAGES':
        return 'All messages';
      default:
        return rule.condition;
    }
  };
  
  // Get action display text
  const getActionText = (rule) => {
    switch (rule.action) {
      case 'PRIORITY':
        return 'Mark as priority';
      case 'MOVE_TO_FOLDER':
        return `Move to folder: ${rule.actionValue}`;
      case 'APPLY_LABEL':
        return `Apply label: ${rule.actionValue}`;
      case 'AUTO_REPLY':
        return 'Send auto-reply';
      case 'FORWARD':
        return `Forward to: ${rule.actionValue}`;
      case 'DELETE':
        return 'Delete message';
      default:
        return rule.action;
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Email Rules</h2>
        <Button onClick={onAddRule}>
          Add Rule
        </Button>
      </div>
      
      {rules.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              No rules created yet. Click "Add Rule" to create your first rule.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {rules.map(rule => (
            <Card key={rule.id} className={!rule.enabled ? 'opacity-60' : ''}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="font-medium">{rule.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {getConditionText(rule)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Action: {getActionText(rule)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      checked={rule.enabled} 
                      onCheckedChange={() => onToggleRule(rule.id)}
                    />
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => onEditRule(rule.id)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => onDeleteRule(rule.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default RulesList;
