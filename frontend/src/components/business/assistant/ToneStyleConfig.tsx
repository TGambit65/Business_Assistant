import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';

interface ToneStyleConfigProps {
  data: {
    tone: string;
    formality: string;
    personality: string;
    humor: string;
    empathy: string;
    customVoiceGuidelines: string;
  };
  editMode: boolean;
  onUpdate: (data: any) => void;
}

/**
 * ToneStyleConfig Component
 * 
 * Configuration for the assistant's tone and style guidelines.
 */
const ToneStyleConfig: React.FC<ToneStyleConfigProps> = ({ data, editMode, onUpdate }) => {
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
        <CardTitle>Tone & Style Configuration</CardTitle>
        <CardDescription>
          Configure how your assistant communicates and presents information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tone */}
        <div className="space-y-2">
          <Label htmlFor="tone">Communication Tone</Label>
          <Select
            disabled={!editMode}
            value={data.tone}
            onValueChange={(value: string) => handleInputChange('tone', value)}
          >
            <SelectTrigger
              id="tone"
              className=""
              onClick={() => {}}
              open={false}
              value={data.tone}
            >
              <SelectValue placeholder="Select tone" />
            </SelectTrigger>
            <SelectContent className="" onSelect={() => {}}>
              <SelectItem value="professional" className="" onSelect={() => {}}>Professional</SelectItem>
              <SelectItem value="friendly" className="" onSelect={() => {}}>Friendly</SelectItem>
              <SelectItem value="casual" className="" onSelect={() => {}}>Casual</SelectItem>
              <SelectItem value="technical" className="" onSelect={() => {}}>Technical</SelectItem>
              <SelectItem value="enthusiastic" className="" onSelect={() => {}}>Enthusiastic</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Overall tone of voice for the assistant
          </p>
        </div>
        
        {/* Formality */}
        <div className="space-y-2">
          <Label htmlFor="formality">Formality Level</Label>
          <Select
            disabled={!editMode}
            value={data.formality}
            onValueChange={(value: string) => handleInputChange('formality', value)}
          >
            <SelectTrigger
              id="formality"
              className=""
              onClick={() => {}}
              open={false}
              value={data.formality}
            >
              <SelectValue placeholder="Select formality level" />
            </SelectTrigger>
            <SelectContent className="" onSelect={() => {}}>
              <SelectItem value="formal" className="" onSelect={() => {}}>Formal</SelectItem>
              <SelectItem value="semi-formal" className="" onSelect={() => {}}>Semi-formal</SelectItem>
              <SelectItem value="neutral" className="" onSelect={() => {}}>Neutral</SelectItem>
              <SelectItem value="casual" className="" onSelect={() => {}}>Casual</SelectItem>
              <SelectItem value="informal" className="" onSelect={() => {}}>Informal</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Level of formality in language and expressions
          </p>
        </div>
        
        {/* Personality */}
        <div className="space-y-2">
          <Label htmlFor="personality">Personality Traits</Label>
          <Select
            disabled={!editMode}
            value={data.personality}
            onValueChange={(value: string) => handleInputChange('personality', value)}
          >
            <SelectTrigger
              id="personality"
              className=""
              onClick={() => {}}
              open={false}
              value={data.personality}
            >
              <SelectValue placeholder="Select personality" />
            </SelectTrigger>
            <SelectContent className="" onSelect={() => {}}>
              <SelectItem value="helpful" className="" onSelect={() => {}}>Helpful</SelectItem>
              <SelectItem value="authoritative" className="" onSelect={() => {}}>Authoritative</SelectItem>
              <SelectItem value="supportive" className="" onSelect={() => {}}>Supportive</SelectItem>
              <SelectItem value="analytical" className="" onSelect={() => {}}>Analytical</SelectItem>
              <SelectItem value="creative" className="" onSelect={() => {}}>Creative</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Primary personality characteristic of the assistant
          </p>
        </div>
        
        {/* Humor Level */}
        <div className="space-y-2">
          <Label htmlFor="humor">Humor Level</Label>
          <Select
            disabled={!editMode}
            value={data.humor}
            onValueChange={(value: string) => handleInputChange('humor', value)}
          >
            <SelectTrigger
              id="humor"
              className=""
              onClick={() => {}}
              open={false}
              value={data.humor}
            >
              <SelectValue placeholder="Select humor level" />
            </SelectTrigger>
            <SelectContent className="" onSelect={() => {}}>
              <SelectItem value="none" className="" onSelect={() => {}}>None</SelectItem>
              <SelectItem value="minimal" className="" onSelect={() => {}}>Minimal</SelectItem>
              <SelectItem value="moderate" className="" onSelect={() => {}}>Moderate</SelectItem>
              <SelectItem value="high" className="" onSelect={() => {}}>High</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Amount of humor to incorporate in responses
          </p>
        </div>
        
        {/* Empathy Level */}
        <div className="space-y-2">
          <Label htmlFor="empathy">Empathy Level</Label>
          <Select
            disabled={!editMode}
            value={data.empathy}
            onValueChange={(value: string) => handleInputChange('empathy', value)}
          >
            <SelectTrigger
              id="empathy"
              className=""
              onClick={() => {}}
              open={false}
              value={data.empathy}
            >
              <SelectValue placeholder="Select empathy level" />
            </SelectTrigger>
            <SelectContent className="" onSelect={() => {}}>
              <SelectItem value="low" className="" onSelect={() => {}}>Low</SelectItem>
              <SelectItem value="moderate" className="" onSelect={() => {}}>Moderate</SelectItem>
              <SelectItem value="high" className="" onSelect={() => {}}>High</SelectItem>
              <SelectItem value="very-high" className="" onSelect={() => {}}>Very High</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Level of empathy to express in responses
          </p>
        </div>
        
        {/* Custom Voice Guidelines */}
        <div className="space-y-2">
          <Label htmlFor="voice-guidelines">Custom Voice Guidelines</Label>
          <Textarea
            id="voice-guidelines"
            disabled={!editMode}
            value={data.customVoiceGuidelines}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('customVoiceGuidelines', e.target.value)}
            rows={4}
            placeholder="Enter specific guidelines for your assistant's voice and tone"
          />
          <p className="text-sm text-muted-foreground">
            Specific instructions for how your assistant should communicate
          </p>
        </div>
        
        {/* Preview */}
        <div className="space-y-2 p-4 bg-muted rounded-lg">
          <h3 className="font-medium">Voice Preview</h3>
          <p className="text-sm italic">
            "Hello! I'm your {data.tone} assistant. I'm here to provide {data.formality === 'formal' ? 'formal' : 'conversational'} support in a {data.personality} way. 
            {data.humor !== 'none' && data.humor !== 'minimal' ? " I'll add a touch of humor to brighten your day." : ""} 
            {data.empathy === 'high' || data.empathy === 'very-high' ? " I understand that your questions are important, and I'm here to help with empathy and care." : ""}
            How can I assist you today?"
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ToneStyleConfig;
