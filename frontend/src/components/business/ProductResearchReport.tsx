import React, { useState, useCallback } from 'react';
import { PerplexityService } from '../../services/perplexity/PerplexityService';
import { PerplexityRequest } from '../../types/perplexity';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Button } from '../ui/Button'; // Use .tsx version
import { Input } from '../ui/input'; // Assuming input component exists
import { Loader2, Search } from 'lucide-react'; // Icons

// Initialize the service
const perplexityService = new PerplexityService({});

// Type assertion for JS Input component used in TSX
const AnyInput = Input as any;

const ProductResearchReport: React.FC = () => {
  const [productInput, setProductInput] = useState<string>('');
  const [reportContent, setReportContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateReport = useCallback(async () => {
    if (!productInput.trim()) {
      setError('Please enter a product name or description.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setReportContent(null);

    try {
      const request: PerplexityRequest = {
        model: 'pplx-70b-online', // Use a more capable model for detailed reports
        messages: [
          { role: 'system', content: 'Generate a concise product research report including potential market size, key competitors, and target audience. Structure the report clearly.' },
          { role: 'user', content: `Generate a product research report for: ${productInput}` },
        ],
        max_tokens: 500, // Allow for a more detailed report
      };
      const response = await perplexityService.getChatCompletion(request);
      setReportContent(response.choices?.[0]?.message?.content || 'Failed to generate report content.');

    } catch (err: any) {
      setError(err.message || 'Failed to generate product research report.');
      console.error("Product Research Error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [productInput]);

  return (
    <Card className=""> {/* Added className */}
      <CardHeader className=""> {/* Added className */}
        <CardTitle className="flex items-center gap-2"> {/* Added className */}
           <Search className="h-5 w-5 text-muted-foreground" />
           Product Research Report
        </CardTitle>
        <CardDescription className=""> {/* Added className */}
          Enter a product name or description to generate a research summary.
        </CardDescription>
      </CardHeader>
      <CardContent className=""> {/* Added className */}
        <div className="flex gap-2 mb-4">
          <AnyInput // Use the variable typed as any
            // type="text" // Removed explicit type, defaults to text
            placeholder="e.g., AI-powered email assistant"
            value={productInput}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProductInput(e.target.value)}
            className="flex-grow" // Assuming Input accepts className
            disabled={isLoading}
          />
          <Button onClick={handleGenerateReport} disabled={isLoading || !productInput.trim()}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Generate Report
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mt-4"> {/* Added className */}
            <AlertTitle className="">Error</AlertTitle> {/* Added className */}
            <AlertDescription className="">{error}</AlertDescription> {/* Added className */}
          </Alert>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-4 mt-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2">Generating report...</span>
          </div>
        )}

        {reportContent && (
          <div className="mt-6 border-t pt-4">
            <h4 className="font-semibold mb-2 text-lg">Generated Report:</h4>
            <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-md overflow-x-auto">
              {reportContent}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductResearchReport;
