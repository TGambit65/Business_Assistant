import React from 'react';
import { Button } from '../../../components/ui/Button';
import { Plus, Settings, Save, Undo, LayoutGrid } from 'lucide-react';

interface WidgetControlsProps {
  onAddWidget?: () => void;
  onConfigureLayout?: () => void;
  onSaveLayout?: () => void;
  onResetLayout?: () => void;
  isConfiguring?: boolean;
}

const WidgetControls: React.FC<WidgetControlsProps> = ({
  onAddWidget,
  onConfigureLayout,
  onSaveLayout,
  onResetLayout,
  isConfiguring = false
}) => {
  return (
    <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-2">
        <Button 
          onClick={onAddWidget} 
          variant="outline" 
          className="flex items-center gap-2"
          title="Add a new widget to your dashboard"
        >
          <Plus className="h-4 w-4" />
          Add Widget
        </Button>
        <Button 
          onClick={onConfigureLayout} 
          variant={isConfiguring ? 'default' : 'outline'}
          className="flex items-center gap-2"
          title={isConfiguring ? 'Exit configuration mode' : 'Enter configuration mode'}
        >
          {isConfiguring ? (
            <>
              <LayoutGrid className="h-4 w-4" />
              Configuring...
            </>
          ) : (
            <>
              <Settings className="h-4 w-4" />
              Configure
            </>
          )}
        </Button>
      </div>
      
      <div className="flex items-center gap-2">
        {isConfiguring && (
          <>
            <Button 
              onClick={onResetLayout} 
              variant="ghost" 
              className="flex items-center gap-2"
              title="Reset layout to default configuration"
            >
              <Undo className="h-4 w-4" />
              Reset
            </Button>
            <Button 
              onClick={onSaveLayout} 
              variant="default" 
              className="flex items-center gap-2"
              title="Save current layout configuration"
            >
              <Save className="h-4 w-4" />
              Save Layout
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default WidgetControls;