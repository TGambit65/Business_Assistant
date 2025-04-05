// Color palette for the charts
export const chartColors = {
  sent: '#8884d8',
  opened: '#82ca9d',
  clicked: '#ffc658',
  active: '#ff7300',
  baseline: '#bbb'
};

// Chart types available
export const chartTypes = {
  LINE: 'line',
  AREA: 'area',
  BAR: 'bar'
};

// Time range options
export const timeRanges = {
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
  QUARTER: 'quarter'
};

// Chart configuration
export const chartConfig = {
  [timeRanges.DAY]: {
    pointCount: 24,
    timeStep: 60 * 60 * 1000, // 1 hour
    aggregationLevel: 'hour'
  },
  [timeRanges.WEEK]: {
    pointCount: 14,
    timeStep: 12 * 60 * 60 * 1000, // 12 hours
    aggregationLevel: 'day'
  },
  [timeRanges.MONTH]: {
    pointCount: 30,
    timeStep: 24 * 60 * 60 * 1000, // 1 day
    aggregationLevel: 'day'
  },
  [timeRanges.QUARTER]: {
    pointCount: 30,
    timeStep: 3 * 24 * 60 * 60 * 1000, // 3 days
    aggregationLevel: 'day'
  }
};

// Default chart settings
export const defaultChartSettings = {
  width: '100%',
  height: 400,
  margin: { top: 5, right: 30, left: 20, bottom: 5 },
  animationDuration: 500,
  tooltipDelay: 100
}; 