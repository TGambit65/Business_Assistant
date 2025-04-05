import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/Card';
import { perplexityService } from '../../../services/business/perplexityService';
import { Loader2 } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  timestamp: string;
  url: string;
}

const IndustryNewsWidget: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const isLoading = useCallback(() => {
    return perplexityService.isLoading('news');
  }, []);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        // Loading state is now managed by perplexityService
        setError(null);
        // TODO: Make industry configurable
        const newsData = await perplexityService.getIndustryNews('technology');
        setNews(newsData);
      } catch (err) {
        setError('Failed to fetch industry news');
        console.error('Error fetching news:', err);
      }
    };

    fetchNews();
    // Refresh news every 30 minutes
    const interval = setInterval(fetchNews, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <Card className="w-full h-full">
        <CardHeader>
          <CardTitle>Industry News</CardTitle>
          <CardDescription>Latest updates from your industry</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-destructive">
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle>Industry News</CardTitle>
        <CardDescription>Latest updates from your industry</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading() ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            {news.map((item) => (
              <div key={item.id} className="border-b pb-3 last:border-b-0">
                <a 
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block hover:text-primary"
                >
                  <h3 className="font-medium text-sm">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{item.summary}</p>
                  <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                    <span>{item.source}</span>
                    <span>{item.timestamp}</span>
                  </div>
                </a>
              </div>
            ))}
            {news.length === 0 && !isLoading() && (
              <div className="text-center py-8 text-muted-foreground">
                No news articles available
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IndustryNewsWidget;