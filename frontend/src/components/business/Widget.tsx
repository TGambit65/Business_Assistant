import React, { useState, useEffect } from 'react';
import { BusinessWidget } from '../../types/business';
import { PerplexityService } from '../../services/perplexity/PerplexityService';
import { PerplexityRequest } from '../../types/perplexity';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Button } from '../ui/Button';
import { Loader2, X, RefreshCw } from 'lucide-react'; // Icons

// Initialize the service (consider dependency injection)
const perplexityService = new PerplexityService({});

interface WidgetProps {
  widget: BusinessWidget;
  onRemove: (widgetId: string) => void;
  // Add onEdit prop later if needed
}

const Widget: React.FC<WidgetProps> = ({ widget, onRemove }) => {
  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    setContent(null); // Clear previous content on refresh
    try {
      const request: PerplexityRequest = {
        model: 'pplx-7b-online', // Consider making model configurable per widget later
        messages: [
          // Maybe add a configurable system prompt later
          { role: 'user', content: widget.query },
        ],
        max_tokens: 200, // Default max tokens for widget summary
      };
      const response = await perplexityService.getChatCompletion(request);
      setContent(response.choices?.[0]?.message?.content || 'No content received.');

    } catch (err: any) {
      setError(err.message || `Failed to fetch data for widget: ${widget.title}`);
      console.error(`Widget Fetch Error (${widget.title}):`, err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [widget.id, widget.query]); // Refetch if ID or query changes

  return (
    <Card className="h-full flex flex-col widget-card"> {/* Added className & card class */}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b"> {/* Added className & border */}
        <CardTitle className="text-base font-medium truncate" title={widget.title}> {/* Added className & truncate */}
          {widget.title}
        </CardTitle>
        <div className="widget-controls">
           <Button variant="ghost" size="sm" onClick={fetchData} disabled={isLoading} title="Refresh">
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
           </Button>
           <Button variant="ghost" size="sm" onClick={() => onRemove(widget.id)} title="Remove Widget">
                <X className="h-4 w-4" />
           </Button>
           {/* Add Edit button later */}
        </div>
      </CardHeader>
      <CardContent className="flex-grow overflow-auto p-4"> {/* Added className & flex-grow */}
        {isLoading && (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
        {error && (
          <Alert variant="destructive" className="my-2"> {/* Added className */}
            <AlertTitle className="">Error</AlertTitle> {/* Added className */}
            <AlertDescription className="text-xs">{error}</AlertDescription> {/* Added className & text-xs */}
          </Alert>
        )}
        {!isLoading && !error && !content && (
          <p className="text-center text-muted-foreground text-sm">No content available.</p>
        )}
        {!isLoading && !error && content && (
           <p className="text-sm text-muted-foreground whitespace-pre-wrap">{content}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default Widget;
