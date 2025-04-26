import React, { useState } from 'react';
import { BusinessWidget } from '../../types/business';
import { Button } from '../ui/Button';
import { Input } from '../ui/input'; // Assuming .jsx version, use assertion
import { Textarea } from '../ui/textarea'; // Assuming .jsx version, use assertion
import { Label } from '../ui/label'; // Assuming label component exists
import { Dialog as DialogPrimitive, DialogContent as DialogContentPrimitive, DialogHeader as DialogHeaderPrimitive, DialogTitle as DialogTitlePrimitive, DialogDescription as DialogDescriptionPrimitive } from '../ui/dialog'; // Import from .jsx
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

// Type assertions for JS components used in TSX
const AnyInput = Input as any;
const AnyTextarea = Textarea as any;
const AnyLabel = Label as any;
const Dialog = DialogPrimitive as any;
const DialogContent = DialogContentPrimitive as any;
const DialogHeader = DialogHeaderPrimitive as any;
const DialogTitle = DialogTitlePrimitive as any;
const DialogDescription = DialogDescriptionPrimitive as any;
// DialogClose is likely okay as it's just a button wrapper

interface AddWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWidget: (widget: BusinessWidget) => void;
}

const AddWidgetModal: React.FC<AddWidgetModalProps> = ({ isOpen, onClose, onAddWidget }) => {
  const [title, setTitle] = useState('');
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!title.trim() || !query.trim()) {
      setError('Both title and query are required.');
      return;
    }

    const newWidget: BusinessWidget = {
      id: uuidv4(), // Generate a unique ID
      title: title.trim(),
      query: query.trim(),
      type: 'summary', // Default type for now
    };

    onAddWidget(newWidget);
    setTitle('');
    setQuery('');
    onClose(); // Close the modal after adding
  };

  // Handle modal open state externally via isOpen prop for better control
  if (!isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}> {/* Added boolean type */}
      {/* DialogTrigger might be handled by the parent component */}
      {/* <DialogTrigger asChild> */}
      {/*   <Button>Add Widget</Button> */}
      {/* </DialogTrigger> */}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="">
          <DialogTitle className="">Add New Widget</DialogTitle>
          <DialogDescription className=""> {/* Added className */}
            Define a title and a Perplexity query for your custom widget.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <AnyLabel htmlFor="widget-title" className="text-right"> {/* Added className */}
                Title
              </AnyLabel>
              <AnyInput
                id="widget-title"
                value={title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                className="col-span-3"
                placeholder="e.g., Latest AI Developments"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <AnyLabel htmlFor="widget-query" className="text-right"> {/* Added className */}
                Query
              </AnyLabel>
              <AnyTextarea
                id="widget-query"
                value={query}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setQuery(e.target.value)}
                className="col-span-3 min-h-[100px]"
                placeholder="Enter the query for Perplexity AI..."
              />
            </div>
            {error && (
                <p className="col-span-4 text-red-600 text-sm text-center">{error}</p>
            )}
          </div>
          {/* Removed DialogFooter wrapper */}
          <div className="flex justify-end pt-4"> {/* Added basic footer styling */}
            {/* Add Cancel button with onClose if needed */}
            <Button type="submit">Add Widget</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddWidgetModal;
