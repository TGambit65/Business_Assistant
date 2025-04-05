import React, { useState, useCallback, useEffect } from 'react';
import { PerplexityService } from '../../services/perplexity/PerplexityService';
import { PerplexityRequest, PerplexityResponse } from '../../types/perplexity'; // Removed PerplexityMessage as it's unused here
import { BusinessWidget } from '../../types/business';
import { Button } from '../../components/ui/Button';
import { TextArea } from '../../components/ui/TextArea';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { Loader2, Plus } from 'lucide-react';
import IndustryNewsDashboard from '../../components/business/IndustryNewsDashboard';
import EmailContextDashboard from '../../components/business/EmailContextDashboard';
import MarketTrendChart from '../../components/business/MarketTrendChart';
import AddWidgetModal from '../../components/business/AddWidgetModal';
import Widget from '../../components/business/Widget';
import { getWidgetsFromStorage, saveWidgetsToStorage, addWidgetToStorage, removeWidgetFromStorage, getLayoutFromStorage, saveLayoutToStorage } from '../../utils/widgetStorage';
import { Responsive, WidthProvider, Layouts } from 'react-grid-layout';
import type { Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { v4 as uuidv4 } from 'uuid';

// Apply WidthProvider HOC for Responsive component
const ResponsiveGridLayout = WidthProvider(Responsive);

// Initialize the service
const perplexityService = new PerplexityService({});

const BusinessCenterPage = () => {
  // State for old search functionality (review if still needed)
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PerplexityResponse | null>(null);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false); // Renamed to avoid clash
  const [searchError, setSearchError] = useState<string | null>(null); // Renamed to avoid clash

  // State for customizable widgets
  const [widgets, setWidgets] = useState<BusinessWidget[]>([]);
  const [layouts, setLayouts] = useState<Layouts>({ lg: [] }); // Initialize Layouts state
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load widgets and layout from storage on mount
  useEffect(() => {
    const loadedWidgets = getWidgetsFromStorage();
    setWidgets(loadedWidgets);
    const loadedLayouts = getLayoutFromStorage(); // Returns Layouts | null

    if (loadedLayouts && loadedLayouts.lg) {
        // Ensure layout items match current widgets
        const currentWidgetIds = new Set(loadedWidgets.map(w => w.id));
        const filteredLayout = loadedLayouts.lg.filter(item => currentWidgetIds.has(item.i));
        setLayouts({ lg: filteredLayout });
        // Optionally save back the filtered layout if items were removed
        if (filteredLayout.length !== loadedLayouts.lg.length) {
            saveLayoutToStorage({ lg: filteredLayout });
        }
    } else {
        const defaultLayout = generateLayout(loadedWidgets);
        setLayouts({ lg: defaultLayout });
        saveLayoutToStorage({ lg: defaultLayout });
    }
  }, []);

  // Generate default layout based on widgets
  const generateLayout = (currentWidgets: BusinessWidget[]): Layout[] => {
    return currentWidgets.map((widget, index) => ({
      i: widget.id,
      x: (index * 4) % 12,
      y: Math.floor(index / 3) * 8,
      w: 4, h: 8, minW: 3, minH: 4,
    }));
  };

  // --- Old Search Functionality (Review/Remove?) ---
  const handleSearch = useCallback(async () => {
    if (!query.trim()) {
      setSearchError('Please enter a search query.');
      return;
    }
    setIsLoadingSearch(true);
    setSearchError(null);
    setResults(null);
    try {
      const request: PerplexityRequest = {
        model: 'pplx-7b-online',
        messages: [{ role: 'user', content: query }],
      };
      const response = await perplexityService.getChatCompletion(request);
      setResults(response);
    } catch (err: any) {
      setSearchError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoadingSearch(false);
    }
  }, [query]);

  const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSearch();
    }
  };

  const getAssistantResponse = (response: PerplexityResponse | null): string => {
    return response?.choices?.[0]?.message?.content || 'No response.';
  };

  // --- Widget Management ---
  const handleAddWidget = (newWidget: BusinessWidget) => {
    addWidgetToStorage(newWidget);
    const updatedWidgets = [...widgets, newWidget];
    setWidgets(updatedWidgets);
    const newLayoutItem: Layout = {
        i: newWidget.id, x: (widgets.length * 4) % 12, y: Infinity,
        w: 4, h: 8, minW: 3, minH: 4
    };
    const currentLayout = layouts.lg || [];
    const newLayout = [...currentLayout, newLayoutItem];
    setLayouts({ lg: newLayout });
    saveLayoutToStorage({ lg: newLayout });
  };

  const handleRemoveWidget = (widgetId: string) => {
    removeWidgetFromStorage(widgetId);
    const updatedWidgets = widgets.filter(w => w.id !== widgetId);
    setWidgets(updatedWidgets);
    const currentLayout = layouts.lg || [];
    const newLayout = currentLayout.filter(item => item.i !== widgetId);
    setLayouts({ lg: newLayout });
    saveLayoutToStorage({ lg: newLayout });
  };

  const onLayoutChange = (newLayout: Layout[], allLayouts: Layouts) => {
    // RGL calls this for every breakpoint change, but we only save 'lg' here
    // It might be better to save allLayouts if multiple breakpoint persistence is needed
    // Check if the layout actually changed for the 'lg' breakpoint before saving
    if (JSON.stringify(newLayout) !== JSON.stringify(layouts.lg)) {
        setLayouts({ lg: newLayout });
        saveLayoutToStorage({ lg: newLayout });
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold">Business Center</h1>
        <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Custom Widget
        </Button>
      </div>
      <p className="text-gray-500 dark:text-gray-400">
        Your customizable dashboard for research and insights.
      </p>

      {/* Predefined Components Section */}
      <h2 className="text-xl font-semibold border-b pb-2">Insights Overview</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <IndustryNewsDashboard />
          <EmailContextDashboard />
          <MarketTrendChart />
          {/* Add ProductResearchReport here if desired as predefined */}
          {/* <ProductResearchReport /> */}
      </div>

       {/* Customizable Widget Grid Section */}
       <h2 className="text-xl font-semibold border-b pb-2">My Widgets</h2>
       {widgets.length === 0 && !isLoadingSearch && ( // Show message only if no widgets and not loading initial search
           <p className="text-muted-foreground text-center py-4">No custom widgets added yet. Click "Add Custom Widget" to create one.</p>
       )}
       <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={30}
          isDraggable
          isResizable
          onLayoutChange={onLayoutChange}
          draggableCancel=".widget-card input, .widget-card textarea, .widget-card button, .widget-controls button"
          containerPadding={[0, 0]} // Adjust padding if needed
          margin={[10, 10]}
          // useCSSTransforms={true} // Can improve performance
      >
          {widgets.map(widget => (
              <div key={widget.id} className="overflow-hidden"> {/* Wrapper div required by RGL */}
                  <Widget widget={widget} onRemove={handleRemoveWidget} />
              </div>
          ))}
      </ResponsiveGridLayout>

      {/* Old Search Area (Review if needed) */}
      {/*
      <Card className="">
        <CardHeader className="">
          <CardTitle className="">Perplexity Search</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <TextArea
            placeholder="Enter your research query here..."
            value={query}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="min-h-[80px]"
            disabled={isLoadingSearch}
          />
          <Button onClick={handleSearch} disabled={isLoadingSearch || !query.trim()}>
            {isLoadingSearch ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isLoadingSearch ? 'Searching...' : 'Search'}
          </Button>
        </CardContent>
      </Card>
      {searchError && (
         <Alert variant="destructive" className="">
           <AlertTitle className="">Error</AlertTitle>
           <AlertDescription className="">{searchError}</AlertDescription>
         </Alert>
      )}
      {isLoadingSearch && !results && ( <div /> )}
      {results && ( <div /> )}
      */}

      {/* Add Widget Modal */}
      <AddWidgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddWidget={handleAddWidget}
      />
    </div>
  );
};

export default BusinessCenterPage;