import axios, { AxiosError } from 'axios';
import { sleep } from '../../utils/async';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  lastRefreshTime: string;
}

interface BusinessSettings {
  newsRefreshTime: string;
  marketDataRefreshTime: string;
  competitorDataRefreshTime: string;
  timezone: string;
}

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  timestamp: string;
  url: string;
}

interface MarketTrend {
  date: string;
  marketShare: number;
  revenue: number;
  competitors: number;
  analysis: string;
}

interface CompetitorAnalysis {
  marketPosition: string;
  strengths: string[];
  weaknesses: string[];
  recentDevelopments: string[];
  marketShare: number;
  trend: 'up' | 'down' | 'neutral';
}

interface RateLimitConfig {
  maxRequestsPerMinute: number;
  delayBetweenRequests: number; // in milliseconds
}

interface APIError extends Error {
  isRateLimitError?: boolean;
  retryAfter?: number;
}

interface APIErrorResponse {
  message?: string;
  error?: string;
}

interface LoadingState {
  news: boolean;
  marketTrends: boolean;
  competitors: { [key: string]: boolean };
}

class PerplexityService {
  private cache: {
    news?: CacheItem<NewsItem[]>;
    marketTrends?: CacheItem<MarketTrend[]>;
    competitors?: { [key: string]: CacheItem<CompetitorAnalysis> };
  } = {};

  private loadingState: LoadingState = {
    news: false,
    marketTrends: false,
    competitors: {}
  };
  
  private requestCount = 0;
  private lastRequestTime = 0;
  
  private rateLimitConfig: RateLimitConfig = {
    maxRequestsPerMinute: 60,
    delayBetweenRequests: 1000 // 1 second
  };

  constructor() {
    // Reset request count every minute
    setInterval(() => {
      this.requestCount = 0;
    }, 60000);
  }

  private getSettings(): BusinessSettings {
    const defaultSettings: BusinessSettings = {
      newsRefreshTime: '06:00',
      marketDataRefreshTime: '08:00',
      competitorDataRefreshTime: '09:00',
      timezone: 'America/New_York'
    };

    const savedSettings = localStorage.getItem('businessSettings');
    return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
  }

  private getAPIConfig() {
    const providers = localStorage.getItem('apiProviders');
    if (!providers) {
      return {
        apiUrl: process.env.REACT_APP_PERPLEXITY_API_URL,
        apiKey: process.env.REACT_APP_PERPLEXITY_API_KEY
      };
    }

    const perplexityProvider = JSON.parse(providers).find(
      (p: any) => p.id === 'perplexity' && p.isActive
    );

    return {
      apiUrl: perplexityProvider?.endpoint || process.env.REACT_APP_PERPLEXITY_API_URL,
      apiKey: perplexityProvider?.apiKey || process.env.REACT_APP_PERPLEXITY_API_KEY
    };
  }

  private shouldRefresh(lastRefreshTime: string, configuredTime: string): boolean {
    const settings = this.getSettings();
    const now = new Date();
    const tz = settings.timezone;

    // Convert configured time to today's date in the configured timezone
    const configuredDateTime = new Date(
      new Date().toLocaleString('en-US', { timeZone: tz })
    );
    const [hours, minutes] = configuredTime.split(':');
    configuredDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

    // Convert last refresh time to configured timezone
    const lastRefresh = new Date(lastRefreshTime);
    const lastRefreshInTz = new Date(
      lastRefresh.toLocaleString('en-US', { timeZone: tz })
    );

    // If it's past the configured time and we haven't refreshed today
    return (
      now >= configuredDateTime &&
      (lastRefreshInTz < configuredDateTime ||
        lastRefreshInTz.getDate() !== now.getDate())
    );
  }

  private async handleRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    // Enforce delay between requests
    if (timeSinceLastRequest < this.rateLimitConfig.delayBetweenRequests) {
      await sleep(this.rateLimitConfig.delayBetweenRequests - timeSinceLastRequest);
    }
    
    // Check rate limit
    if (this.requestCount >= this.rateLimitConfig.maxRequestsPerMinute) {
      const error = new Error('Rate limit exceeded') as APIError;
      error.isRateLimitError = true;
      error.retryAfter = 60; // Retry after 1 minute
      throw error;
    }
    
    this.requestCount++;
    this.lastRequestTime = Date.now();
  }

  private async makeRequest<T>(query: string): Promise<T> {
    const config = this.getAPIConfig();
    try {
      await this.handleRateLimit();
      
      const response = await axios.post(`${config.apiUrl}/query`, {
        query,
        api_key: config.apiKey
      });
      
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        
        if (axiosError.response?.status === 429) {
          const retryAfter = parseInt(axiosError.response.headers['retry-after'] || '60', 10);
          const rateError = new Error('Rate limit exceeded') as APIError;
          rateError.isRateLimitError = true;
          rateError.retryAfter = retryAfter;
          throw rateError;
        }
        
        const errorData = axiosError.response?.data as APIErrorResponse;
        throw new Error(`API request failed: ${errorData?.message || errorData?.error || axiosError.message}`);
      }
      
      const apiError = error as APIError;
      console.error('Perplexity API Error:', apiError);
      throw apiError;
    }
  }

  isLoading(type: 'news' | 'marketTrends' | 'competitors', companyName?: string): boolean {
    if (type === 'competitors' && companyName) {
      return Boolean(this.loadingState.competitors[companyName]);
    }
    return Boolean(this.loadingState[type]);
  }

  async getIndustryNews(industry: string): Promise<NewsItem[]> {
    try {
      this.loadingState.news = true;
      const settings = this.getSettings();
      const cached = this.cache.news;

      if (
        cached &&
        !this.shouldRefresh(cached.lastRefreshTime, settings.newsRefreshTime)
      ) {
        return cached.data;
      }

      const query = `Latest news and developments in ${industry} industry`;
      const result = await this.makeRequest<{ articles: any[] }>(query);
    
      const news = result.articles.map((article: any) => ({
        id: article.id,
        title: article.title,
        summary: article.summary,
        source: article.source,
        timestamp: article.published_at,
        url: article.url
      }));

      this.cache.news = {
        data: news,
        timestamp: Date.now(),
        lastRefreshTime: new Date().toISOString()
      };

      return news;
    } finally {
      this.loadingState.news = false;
    }
  }

  async getMarketTrends(industry: string): Promise<MarketTrend[]> {
    try {
      this.loadingState.marketTrends = true;
      const settings = this.getSettings();
      const cached = this.cache.marketTrends;

      if (
        cached &&
        !this.shouldRefresh(cached.lastRefreshTime, settings.marketDataRefreshTime)
      ) {
        return cached.data;
      }

      const query = `Market trends and analysis for ${industry} industry`;
      const result = await this.makeRequest<{ trends: any[] }>(query);
    
      const trends = result.trends.map((trend: any) => ({
        date: trend.date,
        marketShare: trend.market_share,
        revenue: trend.revenue,
        competitors: trend.competitor_count,
        analysis: trend.analysis
      }));

      this.cache.marketTrends = {
        data: trends,
        timestamp: Date.now(),
        lastRefreshTime: new Date().toISOString()
      };

      return trends;
    } finally {
      this.loadingState.marketTrends = false;
    }
  }

  async getCompetitorAnalysis(companyName: string): Promise<CompetitorAnalysis> {
    try {
      if (!this.loadingState.competitors[companyName]) {
        this.loadingState.competitors[companyName] = true;
      }
      
      const settings = this.getSettings();
      const cached = this.cache.competitors?.[companyName];

      if (
        cached &&
        !this.shouldRefresh(cached.lastRefreshTime, settings.competitorDataRefreshTime)
      ) {
        return cached.data;
      }

      const query = `Detailed analysis of ${companyName} including market position, strengths, and weaknesses`;
      const result = await this.makeRequest<{
        market_position: string;
        strengths: string[];
        weaknesses: string[];
        recent_developments: string[];
        market_share: number;
        trend: 'up' | 'down' | 'neutral';
      }>(query);
    
      const analysis: CompetitorAnalysis = {
        marketPosition: result.market_position,
        strengths: result.strengths,
        weaknesses: result.weaknesses,
        recentDevelopments: result.recent_developments,
        marketShare: result.market_share,
        trend: result.trend
      };

      if (!this.cache.competitors) {
        this.cache.competitors = {};
      }

      this.cache.competitors[companyName] = {
        data: analysis,
        timestamp: Date.now(),
        lastRefreshTime: new Date().toISOString()
      };

      return analysis;
    } finally {
      if (this.loadingState.competitors[companyName]) {
        this.loadingState.competitors[companyName] = false;
      }
    }
  }

  clearCache() {
    this.cache = {};
    this.loadingState = {
      news: false,
      marketTrends: false,
      competitors: {}
    };
  }
}

export const perplexityService = new PerplexityService();