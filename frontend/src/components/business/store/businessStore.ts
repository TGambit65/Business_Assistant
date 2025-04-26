import { create } from 'zustand';
import { Layout } from 'react-grid-layout';

export interface Widget {
  id: string;
  type: string;
  title: string;
  description: string;
  config?: Record<string, any>;
}

interface LayoutConfig {
  lg: Layout[];
  md: Layout[];
  sm: Layout[];
}

interface BusinessState {
  widgets: Widget[];
  layouts: LayoutConfig;
  isConfiguring: boolean;
  addWidget: (widget: Widget) => void;
  removeWidget: (widgetId: string) => void;
  updateWidget: (widgetId: string, updates: Partial<Widget>) => void;
  setLayouts: (layouts: LayoutConfig) => void;
  setIsConfiguring: (isConfiguring: boolean) => void;
  resetToDefault: () => void;
}

const defaultWidgets: Widget[] = [
  {
    id: 'industry-news',
    type: 'news',
    title: 'Industry News',
    description: 'Latest updates from your industry'
  },
  {
    id: 'market-trends',
    type: 'chart',
    title: 'Market Trends',
    description: 'Real-time market analysis'
  },
  {
    id: 'competitor',
    type: 'competitor',
    title: 'Competitor Intelligence',
    description: 'Track and analyze competitor data'
  }
];

const defaultLayouts: LayoutConfig = {
  lg: [
    { i: 'industry-news', x: 0, y: 0, w: 6, h: 4, minW: 4, minH: 3 },
    { i: 'market-trends', x: 6, y: 0, w: 6, h: 4, minW: 4, minH: 3 },
    { i: 'competitor', x: 0, y: 4, w: 12, h: 4, minW: 6, minH: 3 }
  ],
  md: [
    { i: 'industry-news', x: 0, y: 0, w: 6, h: 4, minW: 4, minH: 3 },
    { i: 'market-trends', x: 6, y: 0, w: 6, h: 4, minW: 4, minH: 3 },
    { i: 'competitor', x: 0, y: 4, w: 12, h: 4, minW: 6, minH: 3 }
  ],
  sm: [
    { i: 'industry-news', x: 0, y: 0, w: 6, h: 4, minW: 3, minH: 3 },
    { i: 'market-trends', x: 0, y: 4, w: 6, h: 4, minW: 3, minH: 3 },
    { i: 'competitor', x: 0, y: 8, w: 6, h: 4, minW: 4, minH: 3 }
  ]
};

const useBusinessStore = create<BusinessState>((set) => ({
  widgets: defaultWidgets,
  layouts: defaultLayouts,
  isConfiguring: false,

  addWidget: (widget: Widget) =>
    set((state) => ({
      widgets: [...state.widgets, widget]
    })),

  removeWidget: (widgetId: string) =>
    set((state) => ({
      widgets: state.widgets.filter((w) => w.id !== widgetId)
    })),

  updateWidget: (widgetId: string, updates: Partial<Widget>) =>
    set((state) => ({
      widgets: state.widgets.map((w) =>
        w.id === widgetId ? { ...w, ...updates } : w
      )
    })),

  setLayouts: (layouts: LayoutConfig) =>
    set(() => ({
      layouts
    })),

  setIsConfiguring: (isConfiguring: boolean) =>
    set(() => ({
      isConfiguring
    })),

  resetToDefault: () =>
    set(() => ({
      widgets: defaultWidgets,
      layouts: defaultLayouts,
      isConfiguring: false
    }))
}));

export default useBusinessStore;