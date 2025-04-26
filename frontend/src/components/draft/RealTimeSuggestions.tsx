import React, { useEffect, useState } from 'react';
import { AIDraftGenerator } from '../../services/AIDraftGenerator';
import { debounce } from '../../utils/debounce';

// Define Suggestion type to match what's returned by getSuggestions
interface Suggestion {
  id?: string;
  text: string;
  type?: string;
  score?: number;
  explanation?: string;
}

interface RealTimeSuggestionsProps {
  content: string;
  onSuggestionApply: (suggestion: Suggestion) => void;
}

export const RealTimeSuggestions: React.FC<RealTimeSuggestionsProps> = ({
  content,
  onSuggestionApply
}) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestions = debounce(async (text: string) => {
    if (!text.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const generator = AIDraftGenerator.getInstance();
      const newSuggestions = await generator.getSuggestions(text);
      
      // Convert string[] to Suggestion[]
      setSuggestions(newSuggestions.map(text => ({ 
        text,
        id: crypto.randomUUID(),
        type: 'completion',
        explanation: undefined
      })));
    } catch (err) {
      setError('Failed to fetch suggestions');
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, 500);

  useEffect(() => {
    fetchSuggestions(content);
  }, [content]);

  if (loading) {
    return <div className="text-sm text-gray-500">Loading suggestions...</div>;
  }

  if (error) {
    return <div className="text-sm text-red-500">{error}</div>;
  }

  if (!suggestions.length) {
    return null;
  }

  return (
    <div className="mt-4 space-y-2">
      <h4 className="text-sm font-medium text-gray-700">Suggestions</h4>
      <div className="space-y-2">
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className="p-2 bg-muted rounded-md hover:bg-gray-100 cursor-pointer"
            onClick={() => onSuggestionApply(suggestion)}
          >
            <div className="text-sm font-medium text-foreground">
              {suggestion.type}
            </div>
            <div className="text-sm text-gray-600">
              {suggestion.text}
            </div>
            {suggestion.explanation && (
              <div className="mt-1 text-xs text-gray-500">
                {suggestion.explanation}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}; 