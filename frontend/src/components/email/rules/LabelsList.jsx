import React from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { 
  Trash2, 
  Edit2, 
  Star,
  Move
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

/**
 * LabelsList Component
 * 
 * Displays a list of email labels with options to edit, delete, and reorder them.
 */
const LabelsList = ({ 
  labels, 
  onEditLabel, 
  onDeleteLabel,
  onAddLabel,
  onReorderLabels
}) => {
  // Handle drag and drop for labels reordering
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(labels);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Update order property
    const updatedLabels = items.map((item, index) => ({
      ...item,
      order: index + 1
    }));
    
    onReorderLabels(updatedLabels);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Email Labels</h2>
        <Button onClick={onAddLabel}>
          Add Label
        </Button>
      </div>
      
      {labels.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              No labels created yet. Click "Add Label" to create your first label.
            </p>
          </CardContent>
        </Card>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="labels">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-2"
              >
                {labels.map((label, index) => (
                  <Draggable key={label.id} draggableId={String(label.id)} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="mb-2"
                      >
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center space-x-3">
                                <div
                                  {...provided.dragHandleProps}
                                  className="cursor-move"
                                >
                                  <Move className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div 
                                  className="w-4 h-4 rounded-full" 
                                  style={{ backgroundColor: label.color }}
                                />
                                <div className="space-y-1">
                                  <div className="flex items-center">
                                    <h3 className="font-medium">{label.name}</h3>
                                    {label.isImportant && (
                                      <Star className="h-4 w-4 ml-1 text-amber-500" />
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    {label.description}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => onEditLabel(label.id)}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => onDeleteLabel(label.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
};

export default LabelsList;
