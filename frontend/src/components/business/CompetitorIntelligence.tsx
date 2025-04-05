import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Search, TrendingUp, TrendingDown, BarChart2, Globe, Users, Loader2 } from 'lucide-react';
import { perplexityService } from '../../services/business/perplexityService';

interface CompetitorData {
  id: string;
  name: string;
  marketShare: number;
  trend: 'up' | 'down' | 'neutral';
  strengths: string[];
  weaknesses: string[];
  recentDevelopments: string[];
  lastUpdated: string;
}

const CompetitorIntelligence: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompetitor, setSelectedCompetitor] = useState<CompetitorData | null>(null);
  const [competitors, setCompetitors] = useState<CompetitorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; details?: string } | null>(null);
  const [loadingCompetitors, setLoadingCompetitors] = useState<{ [key: string]: boolean }>({});
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    const fetchCompetitors = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch analysis for major competitors
        const competitorNames = ['TechCorp Solutions', 'Innovate Systems', 'Global Tech Inc'];
        
        const competitorDataPromises = competitorNames.map(async (name) => {
          setLoadingCompetitors(prev => ({ ...prev, [name]: true }));
          const analysis = await perplexityService.getCompetitorAnalysis(name);
          setLoadingCompetitors(prev => ({ ...prev, [name]: false }));
          if (!analysis) {
            throw new Error(`Failed to fetch data for ${name}`);
          }
          return {
            id: name.toLowerCase().replace(/\s+/g, '-'),
            name,
            marketShare: analysis.marketShare,
            trend: analysis.trend,
            strengths: analysis.strengths,
            weaknesses: analysis.weaknesses,
            recentDevelopments: analysis.recentDevelopments,
            lastUpdated: new Date().toLocaleString()
          };
        });

        const competitorData = await Promise.all(competitorDataPromises);
        setCompetitors(competitorData);
        
        // Select the first competitor by default
        if (competitorData.length > 0 && !selectedCompetitor) {
          setSelectedCompetitor(competitorData[0]);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError({
          message: 'Failed to fetch competitor data',
          details: errorMessage
        });
        console.error('Error fetching competitors:', errorMessage);
        // Reset loading states on error
        setLoadingCompetitors({});
        setAnalyzing(false);
      } finally {
        setLoading(false);
      }
    };

    fetchCompetitors();
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
        return <BarChart2 className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleCompetitorAnalysis = async (competitor: CompetitorData) => {
    try {
      setAnalyzing(true);
      const analysis = await perplexityService.getCompetitorAnalysis(competitor.name);
      
      const updatedCompetitor = {
        ...competitor,
        marketShare: analysis.marketShare,
        trend: analysis.trend,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        recentDevelopments: analysis.recentDevelopments,
        lastUpdated: new Date().toLocaleString()
      };

      setSelectedCompetitor(updatedCompetitor);
      setCompetitors(prev => 
        prev.map(c => c.id === updatedCompetitor.id ? updatedCompetitor : c)
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError({
        message: 'Failed to analyze competitor',
        details: `Error analyzing ${competitor.name}: ${errorMessage}`
      });
      console.error('Error analyzing competitor:', errorMessage);
      setAnalyzing(false);
    } finally {
      setAnalyzing(false);
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center space-y-2">
          <div className="text-destructive font-medium">{error.message}</div>
          {error.details && <div className="text-sm text-muted-foreground">{error.details}</div>}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Competitor Intelligence</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search competitors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <Button variant="outline">
            <Globe className="h-4 w-4 mr-2" />
            Market Overview
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Competitor List */}
        <div className="lg:col-span-1 space-y-4">
          {filteredCompetitors.map((competitor) => {
            const isLoading = loadingCompetitors[competitor.name];
            return (
              <div
                key={competitor.id}
                className={`cursor-pointer transition-colors ${
                  selectedCompetitor?.id === competitor.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedCompetitor(competitor)}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        ) : (
                          getTrendIcon(competitor.trend)
                        )}
                        <span className="font-medium">{competitor.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {isLoading ? (
                          <span className="animate-pulse">Loading...</span>
                        ) : (
                          `${competitor.marketShare}% Market Share`
                        )}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>

        {/* Detailed Analysis */}
        <div className="lg:col-span-2">
          {selectedCompetitor ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{selectedCompetitor.name}</CardTitle>
                    <CardDescription>Last updated {selectedCompetitor.lastUpdated}</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCompetitorAnalysis(selectedCompetitor)}
                    disabled={analyzing}
                  >
                    {analyzing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Users className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-2">Recent Developments</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {selectedCompetitor.recentDevelopments.map((development, index) => (
                        <li key={index} className="text-sm text-muted-foreground">{development}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Strengths</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {selectedCompetitor.strengths.map((strength, index) => (
                        <li key={index} className="text-sm text-muted-foreground">{strength}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Weaknesses</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {selectedCompetitor.weaknesses.map((weakness, index) => (
                        <li key={index} className="text-sm text-muted-foreground">{weakness}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Select a competitor to view detailed analysis
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompetitorIntelligence;