import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Layouts } from 'react-grid-layout';

export interface Widget {
  id: string;
  type: string;
  title: string;
  description: string;
  config?: Record<string, unknown>;
}

type LayoutConfig = Layouts;

interface BusinessState {
  widgets: Widget[];
  layouts: LayoutConfig;
  isConfiguring: boolean;
}

type BusinessAction =
  | { type: 'ADD_WIDGET'; widget: Widget }
  | { type: 'REMOVE_WIDGET'; widgetId: string }
  | { type: 'UPDATE_WIDGET'; widgetId: string; updates: Partial<Widget> }
  | { type: 'SET_LAYOUTS'; layouts: LayoutConfig }
  | { type: 'SET_CONFIGURING'; isConfiguring: boolean }
  | { type: 'RESET_TO_DEFAULT' };

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

const initialState: BusinessState = {
  widgets: defaultWidgets,
  layouts: defaultLayouts,
  isConfiguring: false
};

function businessReducer(state: BusinessState, action: BusinessAction): BusinessState {
  switch (action.type) {
    case 'ADD_WIDGET':
      return {
        ...state,
        widgets: [...state.widgets, action.widget]
      };
    case 'REMOVE_WIDGET':
      return {
        ...state,
        widgets: state.widgets.filter(w => w.id !== action.widgetId)
      };
    case 'UPDATE_WIDGET':
      return {
        ...state,
        widgets: state.widgets.map(w =>
          w.id === action.widgetId ? { ...w, ...action.updates } : w
        )
      };
    case 'SET_LAYOUTS':
      return {
        ...state,
        layouts: action.layouts
      };
    case 'SET_CONFIGURING':
      return {
        ...state,
        isConfiguring: action.isConfiguring
      };
    case 'RESET_TO_DEFAULT':
      return initialState;
    default:
      return state;
  }
}

interface BusinessContextType extends BusinessState {
  dispatch: React.Dispatch<BusinessAction>;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export function BusinessProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(businessReducer, initialState);

  return (
    <BusinessContext.Provider value={{ ...state, dispatch }}>
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusinessContext() {
  const context = useContext(BusinessContext);
  if (context === undefined) {
    throw new Error('useBusinessContext must be used within a BusinessProvider');
  }
  return context;
}

export function useWidgets() {
  const { widgets, dispatch } = useBusinessContext();
  return {
    widgets,
    addWidget: (widget: Widget) => dispatch({ type: 'ADD_WIDGET', widget }),
    removeWidget: (widgetId: string) => dispatch({ type: 'REMOVE_WIDGET', widgetId }),
    updateWidget: (widgetId: string, updates: Partial<Widget>) =>
      dispatch({ type: 'UPDATE_WIDGET', widgetId, updates })
  };
}

export function useLayouts() {
  const { layouts, dispatch } = useBusinessContext();
  return {
    layouts,
    setLayouts: (layouts: LayoutConfig) => dispatch({ type: 'SET_LAYOUTS', layouts })
  };
}

export function useConfiguring() {
  const { isConfiguring, dispatch } = useBusinessContext();
  return {
    isConfiguring,
    setConfiguring: (isConfiguring: boolean) =>
      dispatch({ type: 'SET_CONFIGURING', isConfiguring }),
    resetToDefault: () => dispatch({ type: 'RESET_TO_DEFAULT' })
  };
}