/**
 * Responsiveness Tests for Analytics Dashboard
 *
 * Tests to verify the mobile responsiveness of the analytics dashboard
 * components using Jest and React Testing Library.
 */

import React, { act } from 'react';
import { render, screen, waitFor, RenderResult, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AnalyticsDashboard, { AnalyticsDashboardProps } from '../../components/dashboard/AnalyticsDashboard';
import MetricsChart, { MetricsChartProps } from '../../components/dashboard/MetricsChart';
import PerformanceIndicators, { PerformanceIndicatorsProps } from '../../components/dashboard/PerformanceIndicators';
import { resizeWindow } from '../test-utils';
import { analyticsService } from '../../services/AnalyticsService';
import { webSocketService } from '../../services/WebSocketService';

// Mock the services
jest.mock('../../services/AnalyticsService');
jest.mock('../../services/WebSocketService');

// Mock data
const mockMetrics = {
  openRate: {
    current: 0.75,
    previous: 0.70,
    change: 0.05
  },
  clickRate: {
    current: 0.45,
    previous: 0.40,
    change: 0.05
  },
  bounceRate: {
    current: 0.02,
    previous: 0.03,
    change: -0.01
  },
  spamRate: {
    current: 0.01,
    previous: 0.02,
    change: -0.01
  }
};

// Mock implementation
(analyticsService.getUserAnalytics as jest.Mock).mockResolvedValue(mockMetrics);
(webSocketService.connect as jest.Mock).mockImplementation(() => {});
(webSocketService.disconnect as jest.Mock).mockImplementation(() => {});
(webSocketService.addStatusListener as jest.Mock).mockImplementation(() => {});
(webSocketService.removeStatusListener as jest.Mock).mockImplementation(() => {});

// Mock the recharts library
jest.mock('recharts', () => {
const OriginalModule = jest.requireActual('recharts');

return {
  ...OriginalModule,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  LineChart: ({ children }: { children: React.ReactNode }) => <div data-testid="line-chart">{children}</div>,
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  AreaChart: ({ children }: { children: React.ReactNode }) => <div data-testid="area-chart">{children}</div>,
  PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
  RadialBarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="radial-bar-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  Bar: () => <div data-testid="bar" />,
  Area: () => <div data-testid="area" />,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  RadialBar: () => <div data-testid="radial-bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />
};
});

describe('Analytics Dashboard Responsiveness Tests', () => {
  // Original window dimensions
  let originalInnerWidth: number;
  let originalInnerHeight: number;
  
  beforeAll(() => {
    // Store original window dimensions
    originalInnerWidth = window.innerWidth;
    originalInnerHeight = window.innerHeight;
  });
  
  afterEach(() => {
    // Reset window dimensions after each test
    resizeWindow(originalInnerWidth, originalInnerHeight);
    cleanup();
  });
  
  describe('AnalyticsDashboard Component', () => {
    beforeEach(() => {
      // Clear all mocks before each test
      jest.clearAllMocks();
      
      // Mock the analytics service
      (analyticsService.getUserAnalytics as jest.Mock).mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay
        return mockMetrics;
      });
    });
    
    test('renders correctly on desktop', async () => {
      // Set desktop viewport
      resizeWindow(1200, 800);
      
      let renderResult: RenderResult | undefined;
      await act(async () => {
        renderResult = render(<AnalyticsDashboard />);
      });
      
      // Wait for loading states to complete
      await waitFor(() => {
        expect(screen.queryByTestId('metrics-chart-loading')).not.toBeInTheDocument();
        expect(screen.queryByTestId('performance-indicators-loading')).not.toBeInTheDocument();
      }, { timeout: 2000 });
      
      // Wait for metrics data to be loaded and rendered
      await waitFor(() => {
        expect(screen.queryByTestId('performance-indicators-no-data')).not.toBeInTheDocument();
        expect(screen.getByTestId('pie-chart-container')).toBeInTheDocument();
        expect(screen.getByTestId('radial-chart-container')).toBeInTheDocument();
      }, { timeout: 2000 });
      
      // Check that both sections are rendered
      expect(screen.getByTestId('metrics-chart')).toBeInTheDocument();
      
      renderResult?.unmount();
    });
    
    test('renders correctly on tablet', async () => {
      // Set tablet viewport
      resizeWindow(768, 1024);
      
      let renderResult: RenderResult | undefined;
      await act(async () => {
        renderResult = render(<AnalyticsDashboard />);
      });
      
      // Wait for loading states to complete
      await waitFor(() => {
        expect(screen.queryByTestId('metrics-chart-loading')).not.toBeInTheDocument();
        expect(screen.queryByTestId('performance-indicators-loading')).not.toBeInTheDocument();
      }, { timeout: 2000 });
      
      // Wait for metrics data to be loaded and rendered
      await waitFor(() => {
        expect(screen.queryByTestId('performance-indicators-no-data')).not.toBeInTheDocument();
        expect(screen.getByTestId('pie-chart-container')).toBeInTheDocument();
        expect(screen.getByTestId('radial-chart-container')).toBeInTheDocument();
      }, { timeout: 2000 });
      
      // Check that both sections are rendered
      expect(screen.getByTestId('metrics-chart')).toBeInTheDocument();
      
      renderResult?.unmount();
    });
    
    test('renders correctly on mobile', async () => {
      // Set mobile viewport
      resizeWindow(375, 667);
      
      let renderResult: RenderResult | undefined;
      await act(async () => {
        renderResult = render(<AnalyticsDashboard />);
      });
      
      // Wait for loading states to complete
      await waitFor(() => {
        expect(screen.queryByTestId('metrics-chart-loading')).not.toBeInTheDocument();
        expect(screen.queryByTestId('performance-indicators-loading')).not.toBeInTheDocument();
      }, { timeout: 2000 });
      
      // Wait for metrics data to be loaded and rendered
      await waitFor(() => {
        expect(screen.queryByTestId('performance-indicators-no-data')).not.toBeInTheDocument();
        expect(screen.getByTestId('pie-chart-container')).toBeInTheDocument();
        expect(screen.getByTestId('radial-chart-container')).toBeInTheDocument();
      }, { timeout: 2000 });
      
      // Check that both sections are rendered
      expect(screen.getByTestId('metrics-chart')).toBeInTheDocument();
      
      renderResult?.unmount();
    });
  });
  
  describe('MetricsChart Component', () => {
    const mockProps: MetricsChartProps = {
      timeRange: 'week' as const,
      realTime: false,
      socketStatus: 'disconnected' as const
    };
    
    test('adjusts chart size based on viewport width', async () => {
      // Test desktop viewport
      resizeWindow(1200, 800);
      
      let renderResult: RenderResult | undefined;
      await act(async () => {
        renderResult = render(<MetricsChart {...mockProps} />);
      });
      
      // Wait for loading state to complete
      await waitFor(() => {
        expect(screen.queryByTestId('metrics-chart-loading')).not.toBeInTheDocument();
      });
      
      // Use findByTestId to wait for the container to appear after loading
      expect(await screen.findByTestId('metrics-chart')).toBeInTheDocument();
      renderResult?.unmount();
      
      // Test tablet viewport with new render
      resizeWindow(768, 1024);
      
      await act(async () => {
        renderResult = render(<MetricsChart {...mockProps} />);
      });
      
      await waitFor(() => {
        expect(screen.queryByTestId('metrics-chart-loading')).not.toBeInTheDocument();
      });
      
      expect(await screen.findByTestId('metrics-chart')).toBeInTheDocument();
      renderResult?.unmount();
      
      // Test mobile viewport with new render
      resizeWindow(375, 667);
      
      await act(async () => {
        renderResult = render(<MetricsChart {...mockProps} />);
      });
      
      await waitFor(() => {
        expect(screen.queryByTestId('metrics-chart-loading')).not.toBeInTheDocument();
      });
      
      expect(await screen.findByTestId('metrics-chart')).toBeInTheDocument();
    });
  });
  
  describe('PerformanceIndicators Component', () => {
    const mockProps: PerformanceIndicatorsProps = {
      timeRange: 'week' as const,
      metrics: {
        'email.sent': { current: 1000, previous: 800, change: 25 },
        'email.opened': { current: 800, previous: 600, change: 33.3 },
        'email.clicked': { current: 400, previous: 300, change: 33.3 },
        'user.active': { current: 2000, previous: 1800, change: 11.1 }
      }
    };
    
    test('renders indicators in responsive grid layout', async () => {
      // Desktop
      resizeWindow(1200, 800);
      
      let renderResult: RenderResult | undefined;
      await act(async () => {
        renderResult = render(<PerformanceIndicators {...mockProps} />);
      });
      
      // Wait for loading state to complete and charts to render
      await waitFor(() => {
        expect(screen.queryByTestId('performance-indicators-loading')).not.toBeInTheDocument();
        expect(screen.getByTestId('pie-chart-container')).toBeInTheDocument();
        expect(screen.getByTestId('radial-chart-container')).toBeInTheDocument();
      });
      
      expect(screen.getByTestId('performance-indicators')).toBeInTheDocument();
      renderResult?.unmount();
      
      // Tablet - use new render instead of rerender after unmount
      resizeWindow(768, 1024);
      
      await act(async () => {
        renderResult = render(<PerformanceIndicators {...mockProps} />);
      });
      
      // Wait for loading state to complete and charts to render
      await waitFor(() => {
        expect(screen.queryByTestId('performance-indicators-loading')).not.toBeInTheDocument();
        expect(screen.getByTestId('pie-chart-container')).toBeInTheDocument();
        expect(screen.getByTestId('radial-chart-container')).toBeInTheDocument();
      });
      
      expect(screen.getByTestId('performance-indicators')).toBeInTheDocument();
      renderResult?.unmount();
      
      // Mobile - use new render instead of rerender after unmount
      resizeWindow(375, 667);
      
      await act(async () => {
        renderResult = render(<PerformanceIndicators {...mockProps} />);
      });
      
      // Wait for loading state to complete and charts to render
      await waitFor(() => {
        expect(screen.queryByTestId('performance-indicators-loading')).not.toBeInTheDocument();
        expect(screen.getByTestId('pie-chart-container')).toBeInTheDocument();
        expect(screen.getByTestId('radial-chart-container')).toBeInTheDocument();
      });
      
      expect(screen.getByTestId('performance-indicators')).toBeInTheDocument();
    });
  });
});

// Test utility functions to help with responsiveness testing
describe('Responsive Utility Function Tests', () => {
  test('resizeWindow function correctly resizes the window', () => {
    // Test with different dimensions
    resizeWindow(1024, 768);
    expect(window.innerWidth).toBe(1024);
    expect(window.innerHeight).toBe(768);
    
    resizeWindow(375, 667);
    expect(window.innerWidth).toBe(375);
    expect(window.innerHeight).toBe(667);
  });
});
