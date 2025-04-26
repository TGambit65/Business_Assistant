import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Switch } from '../../../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Slider } from '../../../components/ui/slider';

interface QueryHandlingConfigProps {
  data: {
    defaultResponseMode: string;
    maxResponseLength: number;
    followUpQuestions: boolean;
    clarificationThreshold: number;
    defaultLanguage: string;
    fallbackMessage: string;
  };
  editMode: boolean;
  onUpdate: (data: any) => void;
}

/**
 * QueryHandlingConfig Component
 * 
 * Configuration for how the assistant handles different types of queries.
 */
const QueryHandlingConfig: React.FC<QueryHandlingConfigProps> = ({ data, editMode, onUpdate }) => {
  // Handle input change
  const handleInputChange = (field: string, value: any) => {
    onUpdate({
      ...data,
      [field]: value
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Query Handling Configuration</CardTitle>
        <CardDescription>
          Configure how your assistant handles and responds to different types of queries
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Response Mode */}
        <div className="space-y-2">
          <Label htmlFor="response-mode">Default Response Mode</Label>
          <Select
            disabled={!editMode}
            value={data.defaultResponseMode}
            onValueChange={(value) => handleInputChange('defaultResponseMode', value)}
          >
            <SelectTrigger id="response-mode">
              <SelectValue placeholder="Select response mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="concise">Concise</SelectItem>
              <SelectItem value="detailed">Detailed</SelectItem>
              <SelectItem value="conversational">Conversational</SelectItem>
              <SelectItem value="technical">Technical</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Determines the default verbosity and style of assistant responses
          </p>
        </div>
        
        {/* Max Response Length */}
        <div className="space-y-2">
          <Label htmlFor="max-length">Maximum Response Length (words)</Label>
          <div className="flex items-center gap-4">
            <Slider
              id="max-length"
              disabled={!editMode}
              min={100}
              max={1000}
              step={50}
              value={[data.maxResponseLength]}
              onValueChange={([value]) => handleInputChange('maxResponseLength', value)}
              className="flex-1"
            />
            <span className="w-16 text-right">{data.maxResponseLength}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Limits the length of assistant responses
          </p>
        </div>
        
        {/* Follow-up Questions */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="follow-up">Suggest Follow-up Questions</Label>
            <p className="text-sm text-muted-foreground">
              Assistant will suggest relevant follow-up questions after responses
            </p>
          </div>
          <Switch
            id="follow-up"
            disabled={!editMode}
            checked={data.followUpQuestions}
            onCheckedChange={(checked) => handleInputChange('followUpQuestions', checked)}
          />
        </div>
        
        {/* Clarification Threshold */}
        <div className="space-y-2">
          <Label htmlFor="clarification">Clarification Threshold</Label>
          <div className="flex items-center gap-4">
            <Slider
              id="clarification"
              disabled={!editMode}
              min={0}
              max={1}
              step={0.1}
              value={[data.clarificationThreshold]}
              onValueChange={([value]) => handleInputChange('clarificationThreshold', value)}
              className="flex-1"
            />
            <span className="w-16 text-right">{data.clarificationThreshold}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Threshold at which the assistant will ask for clarification (0-1)
          </p>
        </div>
        
        {/* Default Language */}
        <div className="space-y-2">
          <Label htmlFor="language">Default Language</Label>
          <Select
            disabled={!editMode}
            value={data.defaultLanguage}
            onValueChange={(value) => handleInputChange('defaultLanguage', value)}
          >
            <SelectTrigger id="language">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Spanish</SelectItem>
              <SelectItem value="fr">French</SelectItem>
              <SelectItem value="de">German</SelectItem>
              <SelectItem value="zh">Chinese</SelectItem>
              <SelectItem value="ja">Japanese</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Default language for assistant responses
          </p>
        </div>
        
        {/* Fallback Message */}
        <div className="space-y-2">
          <Label htmlFor="fallback">Fallback Message</Label>
          <Textarea
            id="fallback"
            disabled={!editMode}
            value={data.fallbackMessage}
            onChange={(e) => handleInputChange('fallbackMessage', e.target.value)}
            rows={3}
          />
          <p className="text-sm text-muted-foreground">
            Message displayed when the assistant cannot answer a query
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default QueryHandlingConfig;
