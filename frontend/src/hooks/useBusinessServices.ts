import { useCallback, useState } from 'react';
import { useService } from '../services/ServiceProvider';

/**
 * Business data fetching result
 */
interface FetchResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook for competitor intelligence data
 */
export function useCompetitorIntelligence() {
  const perplexityService = useService('perplexityService');
  const analyticsService = useService('analyticsService');
  const [state, setState] = useState<FetchResult<any>>({
    data: null,
    loading: false,
    error: null
  });

  const fetchCompetitorData = useCallback(async (query: string) => {
    setState({ data: null, loading: true, error: null });
    
    try {
      const data = await perplexityService.getCompetitorIntelligence(query);
      
      // Track analytics
      analyticsService.trackMetric('competitor_intelligence.fetched', 1, {
        query,
        resultCount: data.length
      });
      
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      setState({ 
        data: null, 
        loading: false, 
        error: error instanceof Error ? error : new Error('Unknown error') 
      });
      throw error;
    }
  }, [perplexityService, analyticsService]);

  return {
    ...state,
    fetchCompetitorData
  };
}

/**
 * Hook for market trends data
 */
export function useMarketTrends() {
  const perplexityService = useService('perplexityService');
  const analyticsService = useService('analyticsService');
  const [state, setState] = useState<FetchResult<any>>({
    data: null,
    loading: false,
    error: null
  });

  const fetchMarketTrends = useCallback(async (industry: string) => {
    setState({ data: null, loading: true, error: null });
    
    try {
      const data = await perplexityService.getMarketTrends(industry);
      
      // Track analytics
      analyticsService.trackMetric('market_trends.fetched', 1, {
        industry,
        trendCount: data.trends?.length || 0
      });
      
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      setState({ 
        data: null, 
        loading: false, 
        error: error instanceof Error ? error : new Error('Unknown error') 
      });
      throw error;
    }
  }, [perplexityService, analyticsService]);

  return {
    ...state,
    fetchMarketTrends
  };
}

/**
 * Hook for industry news data
 */
export function useIndustryNews() {
  const perplexityService = useService('perplexityService');
  const analyticsService = useService('analyticsService');
  const [state, setState] = useState<FetchResult<any>>({
    data: null,
    loading: false,
    error: null
  });

  const fetchIndustryNews = useCallback(async (industry: string, filters?: any) => {
    setState({ data: null, loading: true, error: null });
    
    try {
      const data = await perplexityService.getIndustryNews(industry, filters);
      
      // Track analytics
      analyticsService.trackMetric('industry_news.fetched', 1, {
        industry,
        articleCount: data.articles?.length || 0
      });
      
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      setState({ 
        data: null, 
        loading: false, 
        error: error instanceof Error ? error : new Error('Unknown error') 
      });
      throw error;
    }
  }, [perplexityService, analyticsService]);

  return {
    ...state,
    fetchIndustryNews
  };
}

/**
 * Hook for product research data
 */
export function useProductResearch() {
  const perplexityService = useService('perplexityService');
  const analyticsService = useService('analyticsService');
  const [state, setState] = useState<FetchResult<any>>({
    data: null,
    loading: false,
    error: null
  });

  const fetchProductResearch = useCallback(async (productCategory: string) => {
    setState({ data: null, loading: true, error: null });
    
    try {
      const data = await perplexityService.getProductResearch(productCategory);
      
      // Track analytics
      analyticsService.trackMetric('product_research.fetched', 1, {
        productCategory,
        insightCount: data.insights?.length || 0
      });
      
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      setState({ 
        data: null, 
        loading: false, 
        error: error instanceof Error ? error : new Error('Unknown error') 
      });
      throw error;
    }
  }, [perplexityService, analyticsService]);

  return {
    ...state,
    fetchProductResearch
  };
}

/**
 * Hook for business analytics data
 */
export function useBusinessAnalytics() {
  const analyticsService = useService('analyticsService');
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchAnalytics = useCallback(async (timeRange: string) => {
    setLoading(true);
    
    try {
      const data = await analyticsService.getMetrics(timeRange);
      setMetrics(data);
      return data;
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [analyticsService]);

  return {
    metrics,
    loading,
    fetchAnalytics
  };
}