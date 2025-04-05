import React, { useState, useCallback, useEffect } from 'react';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useOffline } from '../../hooks/useOffline';
import { AIDraftGenerator } from '../../services/AIDraftGenerator';
import { Draft, DraftContext } from '../../types/draft';
import { Button } from '../ui/Button';
import { TextArea } from '../ui/TextArea';
import { Spinner } from '../ui/Spinner';
import { ErrorBoundary } from '../ui/ErrorBoundary';

interface DraftGeneratorProps {
  initialContext?: DraftContext;
  onDraftGenerated?: (draft: Draft) => void;
  onError?: (error: Error) => void;
}

export const DraftGenerator: React.FC<DraftGeneratorProps> = ({
  initialContext,
  onDraftGenerated,
  onError
}) => {
  const [context, setContext] = useState<DraftContext>(initialContext || {} as DraftContext);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { isOffline, syncQueue } = useOffline();
  
  const handleGenerate = useCallback(async () => {
    try {
      setIsGenerating(true);
      setError(null);
      
      const generator = AIDraftGenerator.getInstance();
      const newDraft = await generator.generateDraft(context);
      
      setDraft(newDraft);
      onDraftGenerated?.(newDraft);
      
      if (isOffline) {
        syncQueue.add('draft', newDraft);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate draft';
      setError(errorMessage);
      onError?.(err as Error);
    } finally {
      setIsGenerating(false);
    }
  }, [context, isOffline, syncQueue, onDraftGenerated, onError]);

  const handleContextChange = useCallback((field: keyof DraftContext, value: any) => {
    setContext(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <div className={`p-4 ${isMobile ? 'space-y-4' : 'space-y-6'}`}>
        <div className="space-y-4">
          <TextArea
            label="Purpose"
            value={context.purpose || ''}
            onChange={(e) => handleContextChange('purpose', e.target.value)}
            placeholder="What is the purpose of this email?"
            className="w-full"
          />
          
          <TextArea
            label="Key Points"
            value={context.keyPoints || ''}
            onChange={(e) => handleContextChange('keyPoints', e.target.value)}
            placeholder="Enter the main points to include"
            className="w-full"
          />
          
          <div className="flex items-center gap-2">
            <select
              value={context.tone || 'professional'}
              onChange={(e) => handleContextChange('tone', e.target.value)}
              className="form-select"
            >
              <option value="professional">Professional</option>
              <option value="casual">Casual</option>
              <option value="formal">Formal</option>
            </select>
            
            <input
              type="text"
              value={context.recipient?.email || ''}
              onChange={(e) => handleContextChange('recipient', { email: e.target.value })}
              placeholder="Recipient Email"
              className="form-input flex-1"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || (!context.purpose && !context.keyPoints)}
            className="primary"
          >
            {isGenerating ? <Spinner size="sm" /> : 'Generate Draft'}
          </Button>
        </div>

        {error && (
          <div className="text-red-500 text-sm mt-2">
            {error}
          </div>
        )}

        {draft && (
          <div className="mt-6 p-4 border rounded-lg">
            <h3 className="font-medium mb-2">Generated Draft</h3>
            <div className="prose max-w-none">
              {draft.content}
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}; 