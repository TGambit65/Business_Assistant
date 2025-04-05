/**
 * Mock implementations for the analytics services to use in tests
 */

export const analyticsServiceMock = {
  trackMetric: jest.fn(),
  trackEvent: jest.fn(),
  trackConversion: jest.fn(),
  getAggregatedData: jest.fn().mockImplementation(
    async (metric: string, period: string, startTime: number, endTime = Date.now()) => {
      // Mock data appropriate for the test
      const result: Array<{
        metric: string;
        period: string;
        timestamp: number;
        count: number;
        sum: number;
        avg: number;
        min: number;
        max: number;
      }> = [];
      const hoursInPeriod = period === 'hour' ? 24 : 
                         period === 'day' ? 7 : // 7 days to match test expectations
                         period === 'week' ? 7 : 4; // default to month
      
      const timeStep = period === 'hour' ? 60 * 60 * 1000 :
                     period === 'day' ? 24 * 60 * 60 * 1000 :
                     period === 'week' ? 7 * 24 * 60 * 60 * 1000 :
                     30 * 24 * 60 * 60 * 1000; // default to month
      
      for (let i = 0; i < hoursInPeriod; i++) {
        const timestamp = startTime + (i * timeStep);
        if (timestamp > endTime) break;
        
        result.push({
          metric,
          period,
          timestamp,
          count: 10 + i,
          sum: 100 + (i * 10),
          avg: 10 + i,
          min: 5 + i,
          max: 15 + (i * 2)
        });
      }
      
      return result;
    }
  ),
  getUserAnalytics: jest.fn().mockResolvedValue({
    emailsSent: 100,
    emailsReceived: 200,
    responseTime: 30,
    activeHours: [9, 10, 11, 14, 15, 16],
    mostActiveDay: 'Tuesday',
    aiUsage: {
      draftsGenerated: 10,
      responsesUsed: 8,
      tokensConsumed: 1000,
      suggestionsAccepted: 7,
      suggestionsRejected: 3
    }
  })
};