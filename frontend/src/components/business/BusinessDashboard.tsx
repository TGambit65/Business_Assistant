import React from 'react';
import WidgetGrid from './dashboard/WidgetGrid';
import WidgetControls from './dashboard/WidgetControls';
import { BusinessProvider } from './store/BusinessContext';

const BusinessDashboard: React.FC = () => {
  return (
    <BusinessProvider>
      <div className="h-full flex flex-col bg-background">
        <WidgetControls />
        <div className="flex-1 overflow-auto">
          <WidgetGrid />
        </div>
      </div>
    </BusinessProvider>
  );
};

export default BusinessDashboard;