import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Search, TrendingUp, TrendingDown, Minus, Loader2 } from 'lucide-react';
import { perplexityService } from '../../../services/business/perplexityService';

interface CompetitorData {
  id: string;
  name: string;
  marketShare: number;
  trend: 'up' | 'down' | 'neutral';
  strengths: string[];
  weaknesses: string[];
  lastUpdated: string;
}

const CompetitorWidget: React.FC = () => {
  const [competitors, setCompetitors] = useState<CompetitorData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Check if any competitor data is loading
  const isLoading = useCallback((competitorNames?: string[]) => {
    if (!competitorNames) return false;
    return competitorNames.some(name => 
      perplexityService.isLoading('competitors', name)
    );
  }, []);

  useEffect(() => {
    const fetchCompetitors = async () => {
      try {        
        setError(null);
        
        // Fetch analysis for major competitors
        const competitorNames = ['TechCorp Solutions', 'Innovate Systems', 'Global Tech Inc'];
        const competitorDataPromises = competitorNames.map(async (name) => {
          const analysis = await perplexityService.getCompetitorAnalysis(name);
          return {
            id: name.toLowerCase().replace(/\s+/g, '-'),
            name,
            marketShare: analysis.marketShare,
            trend: analysis.trend,
            strengths: analysis.strengths,
            weaknesses: analysis.weaknesses,
            lastUpdated: new Date().toLocaleString()
          };
        });

        const competitorData = await Promise.all(competitorDataPromises);
        setCompetitors(competitorData);
      } catch (err) {
        setError('Failed to fetch competitor data');
      }
    };

    fetchCompetitors();
    // Refresh competitor data every 2 hours
    const interval = setInterval(fetchCompetitors, 2 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const filteredCompetitors = competitors.filter(competitor =>
    competitor.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  if (error) {
    return (
      <Card className="w-full h-full">
        <CardHeader>
          <CardTitle>Competitor Intelligence</CardTitle>
          <CardDescription>Track and analyze competitor data</CardDescription>
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
        <CardTitle>Competitor Intelligence</CardTitle>
        <CardDescription>Track and analyze competitor data</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search competitors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <Button variant="outline" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {isLoading(['TechCorp Solutions', 'Innovate Systems', 'Global Tech Inc']) ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCompetitors.map((competitor) => (
                <div
                  key={competitor.id}
                  className="border rounded-md p-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getTrendIcon(competitor.trend)}
                      <span className="font-medium">{competitor.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {competitor.lastUpdated}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span>Market Share: {competitor.marketShare}%</span>
                    <span className={`${
                      competitor.trend === 'up' ? 'text-green-500' : 
                      competitor.trend === 'down' ? 'text-red-500' : 'text-gray-500'
                    }`}>
                      {competitor.trend === 'up' ? '↑' : competitor.trend === 'down' ? '↓' : '→'}
                    </span>
                  </div>
                </div>
              ))}
              
              {filteredCompetitors.length === 0 && !isLoading(['TechCorp Solutions', 'Innovate Systems', 'Global Tech Inc']) && (
                <div className="text-center py-8 text-muted-foreground">
                  No competitors found matching your search
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CompetitorWidget;