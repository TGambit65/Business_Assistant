import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { QuickAccessItem } from '../../types/dashboard';
import { Edit3, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

interface QuickAccessPanelProps {
  items: QuickAccessItem[];
  onAddItem?: () => void;
  onEditItems?: () => void;
  onRemoveItem?: (index: number) => void;
}

export const QuickAccessPanel: React.FC<QuickAccessPanelProps> = ({
  items,
  onAddItem,
  onEditItems,
  onRemoveItem,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="flex-shrink-0 border-b p-4">
        <div className="flex justify-between items-center w-full">
          <CardTitle className="text-lg font-semibold flex items-center">
            Quick Access
          </CardTitle>
          <div className="flex gap-1">
            {/* Mobile collapse button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 xl:hidden"
              onClick={() => setIsCollapsed(!isCollapsed)}
              aria-label={isCollapsed ? "Expand Quick Access" : "Collapse Quick Access"}
            >
              {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
            {onEditItems && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onEditItems}
                aria-label="Edit Quick Access"
              >
                <Edit3 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className={`flex-grow p-4 overflow-auto ${isCollapsed ? 'hidden xl:block' : ''}`}>
        {items.length > 0 ? (
          <div className="space-y-2">
            {items.map((item, index) => (
              <div 
                key={index}
                className="flex justify-between items-center w-full rounded hover:bg-accent transition-colors group"
              >
                <button
                  className="flex items-center space-x-3 p-3 flex-grow"
                  onClick={item.action}
                >
                  <div className={`p-2 rounded-full bg-primary/10 text-primary`}>
                    {item.icon}
                  </div>
                  <span className="font-medium text-foreground">{item.label}</span>
                </button>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                  {onEditItems && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditItems();
                      }}
                      aria-label="Edit item"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  {onRemoveItem && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveItem(index);
                      }}
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <p className="text-muted-foreground font-medium">No quick access items</p>
            {onAddItem && (
              <Button variant="outline" size="sm" className="mt-3" onClick={onAddItem}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 