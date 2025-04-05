import React, { useState, useEffect } from 'react';
import { PerplexityService } from '../../services/perplexity/PerplexityService';
import { PerplexityRequest } from '../../types/perplexity';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'; // Assuming Card components exist
import { Alert, AlertDescription, AlertTitle } from '../ui/alert'; // Assuming Alert components exist
import { Loader2, Newspaper } from 'lucide-react'; // Icons

// Initialize the service (consider dependency injection or context later)
const perplexityService = new PerplexityService({});

interface NewsItem {
  id: string; // Use index or generate UUID if API doesn't provide
  title: string;
  summary: string;
  source?: string; // Optional source if parsable
}

const IndustryNewsDashboard: React.FC = () => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const request: PerplexityRequest = {
          model: 'pplx-7b-online', // Or use config default
          messages: [
            { role: 'system', content: 'Provide the top 3 latest news headlines in the tech industry. For each headline, provide a brief 1-2 sentence summary. Format each as "Headline: [headline text]\nSummary: [summary text]".' },
            { role: 'user', content: 'Latest tech news headlines and summaries.' },
          ],
          max_tokens: 300, // Adjust as needed
        };
        const response = await perplexityService.getChatCompletion(request);
        const content = response.choices?.[0]?.message?.content || '';

        // Basic parsing (can be improved with more robust logic or if API returns structured data)
        const parsedItems: NewsItem[] = content.split('Headline:').slice(1).map((item: string, index: number) => { // Added types
          const parts = item.split('Summary:');
          const title = parts[0]?.trim() || 'No Title';
          const summary = parts[1]?.trim() || 'No Summary';
          return { id: `news-${index}`, title, summary };
        });

        setNewsItems(parsedItems);

      } catch (err: any) {
        setError(err.message || 'Failed to fetch industry news.');
        console.error("Industry News Fetch Error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, []); // Fetch news on component mount

  return (
    <Card className=""> {/* Added className */}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"> {/* Added className */}
        <CardTitle className="text-lg font-medium"> {/* Added className */}
          Latest Tech Industry News
        </CardTitle>
        <Newspaper className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className=""> {/* Added className */}
        {isLoading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2">Loading news...</span>
          </div>
        )}
        {error && (
          <Alert variant="destructive" className="mt-4"> {/* Added className */}
            <AlertTitle className="">Error</AlertTitle> {/* Added className */}
            <AlertDescription className="">{error}</AlertDescription> {/* Added className */}
          </Alert>
        )}
        {!isLoading && !error && newsItems.length === 0 && (
          <p className="text-center text-muted-foreground py-4">No news items found.</p>
        )}
        {!isLoading && !error && newsItems.length > 0 && (
          <ul className="space-y-4 mt-4">
            {newsItems.map((item) => (
              <li key={item.id} className="border-b pb-3 last:border-b-0 last:pb-0">
                <h4 className="font-semibold mb-1">{item.title}</h4>
                <p className="text-sm text-muted-foreground">{item.summary}</p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default IndustryNewsDashboard;
