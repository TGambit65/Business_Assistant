import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import { Textarea } from '../../../components/ui/textarea';
import { useDraftForm } from '../../../contexts/DraftFormContext';
import { generateQuickDraft, generateAdvancedDraft, generateReplyDraft } from './DraftGenerator';
import { Copy, RefreshCw, Save, Send } from 'lucide-react';

/**
 * DraftPreview Component
 * 
 * Displays a preview of the generated email draft with options to copy, save, or send.
 */
const DraftPreview = ({ onSave, onSend }) => {
  const { formData } = useDraftForm();
  const [generatedDraft, setGeneratedDraft] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [editedDraft, setEditedDraft] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  // Generate draft when form data changes
  useEffect(() => {
    generateDraft();
  }, [formData]);
  
  // Generate the draft based on form data
  const generateDraft = () => {
    setIsGenerating(true);
    
    try {
      let draft = '';
      
      // Choose the appropriate generator based on the purpose
      if (formData.purpose === 'reply') {
        draft = generateReplyDraft(formData);
      } else if (formData.documentType !== 'email' || formData.includeData) {
        draft = generateAdvancedDraft(formData);
      } else {
        draft = generateQuickDraft(formData);
      }
      
      setGeneratedDraft(draft);
      setEditedDraft(draft);
    } catch (error) {
      console.error('Error generating draft:', error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Handle regenerate button click
  const handleRegenerate = () => {
    generateDraft();
  };
  
  // Handle copy button click
  const handleCopy = () => {
    navigator.clipboard.writeText(isEditing ? editedDraft : generatedDraft)
      .then(() => {
        // Show success message (in a real app)
        console.log('Draft copied to clipboard');
      })
      .catch(err => {
        console.error('Failed to copy draft:', err);
      });
  };
  
  // Handle save button click
  const handleSave = () => {
    if (onSave) {
      onSave({
        subject: formData.subject,
        content: isEditing ? editedDraft : generatedDraft,
        recipientType: formData.recipientType,
        purpose: formData.purpose
      });
    }
  };
  
  // Handle send button click
  const handleSend = () => {
    if (onSend) {
      onSend({
        subject: formData.subject,
        content: isEditing ? editedDraft : generatedDraft,
        recipientType: formData.recipientType,
        purpose: formData.purpose
      });
    }
  };
  
  // Handle edit button click
  const handleEdit = () => {
    setIsEditing(!isEditing);
  };
  
  // Handle edited draft change
  const handleEditedDraftChange = (e) => {
    setEditedDraft(e.target.value);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Draft Preview</h3>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRegenerate}
            disabled={isGenerating}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Regenerate
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleEdit}
          >
            {isEditing ? 'View' : 'Edit'}
          </Button>
        </div>
      </div>
      
      {isGenerating ? (
        <div className="h-64 flex items-center justify-center border rounded-md bg-muted/50">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
            <p className="text-sm text-muted-foreground">Generating draft...</p>
          </div>
        </div>
      ) : isEditing ? (
        <Textarea
          value={editedDraft}
          onChange={handleEditedDraftChange}
          className="min-h-[300px] font-mono text-sm"
        />
      ) : (
        <div className="p-4 border rounded-md bg-muted/50 whitespace-pre-wrap min-h-[300px] font-mono text-sm">
          {generatedDraft || 'No draft generated yet. Please fill in the form and click "Generate".'}
        </div>
      )}
      
      <div className="flex justify-end gap-2">
        <Button 
          variant="outline" 
          onClick={handleCopy}
          disabled={!generatedDraft}
        >
          <Copy className="h-4 w-4 mr-1" />
          Copy
        </Button>
        <Button 
          variant="outline" 
          onClick={handleSave}
          disabled={!generatedDraft}
        >
          <Save className="h-4 w-4 mr-1" />
          Save Draft
        </Button>
        <Button 
          onClick={handleSend}
          disabled={!generatedDraft}
        >
          <Send className="h-4 w-4 mr-1" />
          Send
        </Button>
      </div>
    </div>
  );
};

export default DraftPreview;
