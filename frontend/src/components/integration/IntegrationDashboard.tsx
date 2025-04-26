import React from 'react';
import { Integration } from '../../types/integration';
import { ServiceConnector } from './ServiceConnector';
import { Loader } from 'lucide-react';

/**
 * Props for the IntegrationDashboard component
 */
interface IntegrationDashboardProps {
  integrations: Array<Integration & { 
    isConnected: boolean;
    connectionId: string | null;
    status: string;
  }>;
  loading: boolean;
  onConnect: (integrationType: string) => void;
  onDisconnect: (connectionId: string) => void;
}

/**
 * Component for displaying available integrations and managing connections
 * to third-party services. Shows connection status and provides actions
 * to connect or disconnect services.
 */
export const IntegrationDashboard: React.FC<IntegrationDashboardProps> = ({
  integrations,
  loading,
  onConnect,
  onDisconnect
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader className="animate-spin mr-2 h-6 w-6 text-primary" />
        <span>Loading integrations...</span>
      </div>
    );
  }
  
  if (!integrations.length) {
    return (
      <div className="text-center p-8 border rounded-lg bg-muted/20">
        <p className="text-muted-foreground">No integrations available at this time.</p>
      </div>
    );
  }
  
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
      {integrations.map((integration) => (
        <ServiceConnector
          key={integration.id}
          integration={integration}
          isConnected={integration.isConnected}
          status={integration.status}
          onConnect={() => onConnect(integration.provider)}
          onDisconnect={() => integration.connectionId && onDisconnect(integration.connectionId)}
        />
      ))}
    </div>
  );
}; 