import React, { useState, useEffect } from 'react';
import { PerplexityService } from '../../services/perplexity/PerplexityService';
import { PerplexityRequest } from '../../types/perplexity';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Loader2, Info } from 'lucide-react'; // Icons

// Initialize the service
const perplexityService = new PerplexityService({});

const EmailContextDashboard: React.FC = () => {
  const [contextInfo, setContextInfo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContext = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const request: PerplexityRequest = {
          model: 'pplx-7b-online', // Use a suitable model
          messages: [
            { role: 'system', content: 'Provide a concise summary.' },
            { role: 'user', content: 'Briefly explain the importance of providing context in business communication and emails.' },
          ],
          max_tokens: 150,
        };
        const response = await perplexityService.getChatCompletion(request);
        setContextInfo(response.choices?.[0]?.message?.content || 'No context information received.');

      } catch (err: any) {
        setError(err.message || 'Failed to fetch email context information.');
        console.error("Email Context Fetch Error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContext();
  }, []); // Fetch context on component mount

  return (
    <Card className=""> {/* Added className */}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"> {/* Added className */}
        <CardTitle className="text-lg font-medium"> {/* Added className */}
          Email Context Insights
        </CardTitle>
        <Info className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className=""> {/* Added className */}
        {isLoading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2">Loading insights...</span>
          </div>
        )}
        {error && (
          <Alert variant="destructive" className="mt-4"> {/* Added className */}
            <AlertTitle className="">Error</AlertTitle> {/* Added className */}
            <AlertDescription className="">{error}</AlertDescription> {/* Added className */}
          </Alert>
        )}
        {!isLoading && !error && !contextInfo && (
          <p className="text-center text-muted-foreground py-4">No context information available.</p>
        )}
        {!isLoading && !error && contextInfo && (
           <p className="text-sm text-muted-foreground mt-4">{contextInfo}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default EmailContextDashboard;
