import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Label } from '../../../components/ui/label';
import { Switch } from '../../../components/ui/switch';
import { Slider } from '../../../components/ui/slider';
import { Button } from '../../../components/ui/Button';
import { ArrowUp, ArrowDown, Trash2, Plus } from 'lucide-react';

interface InformationSource {
  id: string;
  name: string;
  priority: number;
  enabled: boolean;
}

interface InformationSourcesConfigProps {
  data: {
    priorityOrder: InformationSource[];
    confidenceThreshold: number;
    citeSources: boolean;
    includeSourceLinks: boolean;
    maxSourcesPerResponse: number;
  };
  editMode: boolean;
  onUpdate: (data: any) => void;
}

/**
 * InformationSourcesConfig Component
 * 
 * Configuration for information sources and their prioritization.
 */
const InformationSourcesConfig: React.FC<InformationSourcesConfigProps> = ({ data, editMode, onUpdate }) => {
  // Handle input change
  const handleInputChange = (field: string, value: any) => {
    onUpdate({
      ...data,
      [field]: value
    });
  };
  
  // Handle source toggle
  const handleSourceToggle = (sourceId: string, enabled: boolean) => {
    const updatedSources = data.priorityOrder.map(source => 
      source.id === sourceId ? { ...source, enabled } : source
    );
    
    handleInputChange('priorityOrder', updatedSources);
  };
  
  // Handle source priority change (move up)
  const handleMoveUp = (index: number) => {
    if (index === 0) return; // Already at the top
    
    const updatedSources = [...data.priorityOrder];
    const temp = updatedSources[index];
    updatedSources[index] = updatedSources[index - 1];
    updatedSources[index - 1] = temp;
    
    // Update priorities
    updatedSources.forEach((source, idx) => {
      source.priority = idx + 1;
    });
    
    handleInputChange('priorityOrder', updatedSources);
  };
  
  // Handle source priority change (move down)
  const handleMoveDown = (index: number) => {
    if (index === data.priorityOrder.length - 1) return; // Already at the bottom
    
    const updatedSources = [...data.priorityOrder];
    const temp = updatedSources[index];
    updatedSources[index] = updatedSources[index + 1];
    updatedSources[index + 1] = temp;
    
    // Update priorities
    updatedSources.forEach((source, idx) => {
      source.priority = idx + 1;
    });
    
    handleInputChange('priorityOrder', updatedSources);
  };
  
  // Handle source removal
  const handleRemoveSource = (sourceId: string) => {
    const updatedSources = data.priorityOrder.filter(source => source.id !== sourceId);
    
    // Update priorities
    updatedSources.forEach((source, idx) => {
      source.priority = idx + 1;
    });
    
    handleInputChange('priorityOrder', updatedSources);
  };
  
  // Handle add new source (placeholder)
  const handleAddSource = () => {
    // In a real app, this would open a modal to add a new source
    console.log('Add new information source');
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Information Sources Configuration</CardTitle>
        <CardDescription>
          Configure which information sources your assistant uses and their priority
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Information Sources Priority */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label>Information Sources Priority</Label>
            {editMode && (
              <Button variant="outline" size="sm" onClick={handleAddSource}>
                <Plus className="h-4 w-4 mr-1" />
                Add Source
              </Button>
            )}
          </div>
          <div className="space-y-2">
            {data.priorityOrder.map((source, index) => (
              <div key={source.id} className="flex items-center justify-between p-3 border rounded-md">
                <div className="flex items-center gap-3">
                  <div className="font-medium">{source.priority}.</div>
                  <div>
                    <div className="font-medium">{source.name}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    disabled={!editMode}
                    checked={source.enabled}
                    onCheckedChange={(checked) => handleSourceToggle(source.id, checked)}
                  />
                  {editMode && (
                    <div className="flex items-center">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        disabled={index === 0}
                        onClick={() => handleMoveUp(index)}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        disabled={index === data.priorityOrder.length - 1}
                        onClick={() => handleMoveDown(index)}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleRemoveSource(source.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Sources are queried in priority order until sufficient information is found
          </p>
        </div>
        
        {/* Confidence Threshold */}
        <div className="space-y-2">
          <Label htmlFor="confidence">Confidence Threshold</Label>
          <div className="flex items-center gap-4">
            <Slider
              id="confidence"
              disabled={!editMode}
              min={0}
              max={1}
              step={0.1}
              value={[data.confidenceThreshold]}
              onValueChange={([value]) => handleInputChange('confidenceThreshold', value)}
              className="flex-1"
            />
            <span className="w-16 text-right">{data.confidenceThreshold}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Minimum confidence level required for information to be used in responses (0-1)
          </p>
        </div>
        
        {/* Cite Sources */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="cite-sources">Cite Sources</Label>
            <p className="text-sm text-muted-foreground">
              Include citations for information sources in responses
            </p>
          </div>
          <Switch
            id="cite-sources"
            disabled={!editMode}
            checked={data.citeSources}
            onCheckedChange={(checked) => handleInputChange('citeSources', checked)}
          />
        </div>
        
        {/* Include Source Links */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="source-links">Include Source Links</Label>
            <p className="text-sm text-muted-foreground">
              Include clickable links to source documents in responses
            </p>
          </div>
          <Switch
            id="source-links"
            disabled={!editMode}
            checked={data.includeSourceLinks}
            onCheckedChange={(checked) => handleInputChange('includeSourceLinks', checked)}
          />
        </div>
        
        {/* Max Sources Per Response */}
        <div className="space-y-2">
          <Label htmlFor="max-sources">Maximum Sources Per Response</Label>
          <div className="flex items-center gap-4">
            <Slider
              id="max-sources"
              disabled={!editMode}
              min={1}
              max={10}
              step={1}
              value={[data.maxSourcesPerResponse]}
              onValueChange={([value]) => handleInputChange('maxSourcesPerResponse', value)}
              className="flex-1"
            />
            <span className="w-16 text-right">{data.maxSourcesPerResponse}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Maximum number of sources to cite in a single response
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default InformationSourcesConfig;
