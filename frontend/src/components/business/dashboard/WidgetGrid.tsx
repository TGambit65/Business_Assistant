import React, { useEffect } from 'react';
import { Responsive, WidthProvider, Layout, Layouts } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import IndustryNewsWidget from '../widgets/IndustryNewsWidget';
import MarketTrendWidget from '../widgets/MarketTrendWidget';
import CompetitorWidget from '../widgets/CompetitorWidget';
import { useLayouts, useWidgets, useConfiguring } from '../store/BusinessContext';

const ResponsiveGridLayout = WidthProvider(Responsive);

const WidgetGrid: React.FC = () => {
  const { layouts, setLayouts } = useLayouts();
  const { widgets } = useWidgets();
  const { isConfiguring } = useConfiguring();

  useEffect(() => {
    const savedLayouts = localStorage.getItem('businessDashboardLayout');
    if (savedLayouts) {
      try {
        const parsedLayouts = JSON.parse(savedLayouts);
        setLayouts(parsedLayouts);
      } catch (error) {
        console.error('Failed to parse saved layouts:', error);
      }
    }
  }, [setLayouts]);

  const handleLayoutChange = (currentLayout: Layout[], allLayouts: Layouts) => {
    setLayouts(allLayouts);
    localStorage.setItem('businessDashboardLayout', JSON.stringify(allLayouts));
  };

  const renderWidget = (widget: { id: string; type: string }) => {
    switch (widget.type) {
      case 'news':
        return <IndustryNewsWidget />;
      case 'chart':
        return <MarketTrendWidget />;
      case 'competitor':
        return <CompetitorWidget />;
      default:
        return <div>Unknown widget type</div>;
    }
  };

  return (
    <div className="p-4">
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 12, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={100}
        margin={[16, 16]}
        containerPadding={[16, 16]}
        isDraggable={isConfiguring}
        isResizable={isConfiguring}
        onLayoutChange={handleLayoutChange}
        draggableHandle=".widget-drag-handle"
      >
        {widgets.map((widget) => (
          <div
            key={widget.id}
            className={`shadow-lg rounded-lg overflow-hidden transition-shadow ${
              isConfiguring ? 'shadow-xl ring-2 ring-primary/50' : ''
            }`}
          >
            {isConfiguring && (
              <div className="widget-drag-handle bg-primary/10 p-2 cursor-move">
                <div className="text-xs text-muted-foreground">
                  Drag to move • Resize from corners
                </div>
              </div>
            )}
            {renderWidget(widget)}
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
};

export default WidgetGrid;