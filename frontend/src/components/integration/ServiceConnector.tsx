import React from 'react';
import { Integration } from '../../types/integration';
import { Button } from '../ui/Button';
import { CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';

interface ServiceConnectorProps {
  integration: Integration & { 
    isConnected: boolean;
    connectionId: string | null;
    status: string;
  };
  isConnected: boolean;
  status: string;
  onConnect: () => void;
  onDisconnect: () => void;
}

/**
 * Component for connecting to or disconnecting from a third-party service
 * Shows connection status and provides buttons for connection management
 */
export const ServiceConnector: React.FC<ServiceConnectorProps> = ({
  integration,
  isConnected,
  status,
  onConnect,
  onDisconnect
}) => {
  const getStatusIcon = () => {
    if (isConnected) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    return <AlertCircle className="h-5 w-5 text-muted-foreground" />;
  };

  const getStatusText = () => {
    if (isConnected) {
      return 'Connected';
    }
    return 'Not connected';
  };

  return (
    <div className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {integration.iconUrl && (
            <img 
              src={integration.iconUrl} 
              alt={`${integration.name} logo`} 
              className="h-10 w-10 rounded-md object-contain"
            />
          )}
          <div>
            <h3 className="font-medium text-lg">{integration.name}</h3>
            <div className="flex items-center text-sm text-muted-foreground">
              {getStatusIcon()}
              <span className="ml-1">{getStatusText()}</span>
            </div>
          </div>
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4">
        {integration.description}
      </p>
      
      <div className="flex justify-end space-x-2">
        {isConnected ? (
          <Button 
            variant="secondary" 
            onClick={onDisconnect}
            className="text-sm"
          >
            Disconnect
          </Button>
        ) : (
          <Button 
            onClick={onConnect}
            className="text-sm flex items-center"
          >
            Connect <ExternalLink className="ml-1 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}; 