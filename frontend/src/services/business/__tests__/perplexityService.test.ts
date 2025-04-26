import { perplexityService } from '../perplexityService';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('PerplexityService', () => {
  beforeEach(() => {
    localStorage.clear();
    perplexityService.clearCache();
    jest.clearAllMocks();
  });

  describe('API Configuration', () => {
    it('should use environment variables when no providers are configured', () => {
      process.env.REACT_APP_PERPLEXITY_API_URL = 'https://api.test.com';
      process.env.REACT_APP_PERPLEXITY_API_KEY = 'test-key';

      mockedAxios.post.mockResolvedValueOnce({ data: { articles: [] } });
      
      perplexityService.getIndustryNews('tech');
      
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://api.test.com/query',
        expect.any(Object)
      );
    });

    it('should use configured provider settings when available', () => {
      localStorage.setItem('apiProviders', JSON.stringify([{
        id: 'perplexity',
        endpoint: 'https://custom.api.com',
        apiKey: 'custom-key',
        isActive: true
      }]));

      mockedAxios.post.mockResolvedValueOnce({ data: { articles: [] } });
      
      perplexityService.getIndustryNews('tech');
      
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://custom.api.com/query',
        expect.any(Object)
      );
    });
  });

  describe('Caching', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      localStorage.setItem('businessSettings', JSON.stringify({
        newsRefreshTime: '06:00',
        marketDataRefreshTime: '08:00',
        competitorDataRefreshTime: '09:00',
        timezone: 'America/New_York'
      }));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should cache industry news and respect refresh time', async () => {
      const mockNews = {
        articles: [{
          id: '1',
          title: 'Test News',
          summary: 'Test Summary',
          source: 'Test Source',
          published_at: '2025-04-02T12:00:00Z',
          url: 'https://test.com'
        }]
      };

      mockedAxios.post.mockResolvedValueOnce({ data: mockNews });
      
      // First call should make API request
      await perplexityService.getIndustryNews('tech');
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      
      // Second call within refresh window should use cache
      await perplexityService.getIndustryNews('tech');
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);

      // Advance time past refresh time
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(6, 0, 0, 0);
      jest.setSystemTime(tomorrow);

      // Call after refresh time should make new API request
      await perplexityService.getIndustryNews('tech');
      expect(mockedAxios.post).toHaveBeenCalledTimes(2);
    });

    it('should cache market trends and respect refresh time', async () => {
      const mockTrends = {
        trends: [{
          date: '2025-04-02',
          market_share: 25.5,
          revenue: 1000000,
          competitor_count: 5,
          analysis: 'Test Analysis'
        }]
      };

      mockedAxios.post.mockResolvedValueOnce({ data: mockTrends });
      
      // First call should make API request
      await perplexityService.getMarketTrends('tech');
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      
      // Second call within refresh window should use cache
      await perplexityService.getMarketTrends('tech');
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);

      // Advance time past refresh time
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(8, 0, 0, 0);
      jest.setSystemTime(tomorrow);

      // Call after refresh time should make new API request
      await perplexityService.getMarketTrends('tech');
      expect(mockedAxios.post).toHaveBeenCalledTimes(2);
    });

    it('should cache competitor analysis and respect refresh time', async () => {
      const mockAnalysis = {
        market_position: 'Leader',
        strengths: ['Innovation'],
        weaknesses: ['Cost'],
        recent_developments: ['New Product'],
        market_share: 30,
        trend: 'up'
      };

      mockedAxios.post.mockResolvedValueOnce({ data: mockAnalysis });
      
      // First call should make API request
      await perplexityService.getCompetitorAnalysis('TestCorp');
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      
      // Second call within refresh window should use cache
      await perplexityService.getCompetitorAnalysis('TestCorp');
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);

      // Advance time past refresh time
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);
      jest.setSystemTime(tomorrow);

      // Call after refresh time should make new API request
      await perplexityService.getCompetitorAnalysis('TestCorp');
      expect(mockedAxios.post).toHaveBeenCalledTimes(2);
    });
  });

  describe('Error Handling', () => {
    it('should throw error when API request fails', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('API Error'));
      
      await expect(perplexityService.getIndustryNews('tech'))
        .rejects
        .toThrow('API Error');
    });

    it('should clear cache when requested', () => {
      const mockNews = { articles: [] };
      mockedAxios.post.mockResolvedValueOnce({ data: mockNews });
      
      perplexityService.getIndustryNews('tech');
      perplexityService.clearCache();
      perplexityService.getIndustryNews('tech');
      
      expect(mockedAxios.post).toHaveBeenCalledTimes(2);
    });
  });
});