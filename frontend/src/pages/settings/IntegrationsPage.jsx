import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom'; // Removed unused import
import { IntegrationDashboard } from '../../components/integration';
import { IntegrationManager } from '../../services';

/**
 * Page component for managing third-party service integrations.
 * Displays available integrations and allows users to connect, disconnect,
 * and manage their connected services.
 */
const IntegrationsPage = () => {
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // const navigate = useNavigate(); // Removed unused variable

  useEffect(() => {
    const fetchIntegrations = async () => {
      try {
        setLoading(true);
        const integrationManager = IntegrationManager.getInstance();
        const availableIntegrations = await integrationManager.getAvailableIntegrations();
        const connectedIntegrations = await integrationManager.getUserIntegrations();
        
        // Merge available and connected integrations
        const allIntegrations = availableIntegrations.map(integration => {
          const connectedIntegration = connectedIntegrations.find(
            connected => connected.type === integration.type
          );
          
          return {
            ...integration,
            isConnected: !!connectedIntegration,
            connectionId: connectedIntegration?.id || null,
            status: connectedIntegration?.status || 'disconnected'
          };
        });
        
        setIntegrations(allIntegrations);
      } catch (err) {
        console.error('Failed to load integrations:', err);
        setError('Failed to load integration data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchIntegrations();
  }, []);

  const handleConnect = (integrationType) => {
    const integrationManager = IntegrationManager.getInstance();
    integrationManager.initiateOAuthFlow(integrationType);
  };

  const handleDisconnect = async (integrationId) => {
    try {
      setLoading(true);
      const integrationManager = IntegrationManager.getInstance();
      await integrationManager.disconnectIntegration(integrationId);
      
      // Update the integrations list
      setIntegrations(prevIntegrations => 
        prevIntegrations.map(integration => 
          integration.connectionId === integrationId 
            ? { ...integration, isConnected: false, connectionId: null, status: 'disconnected' }
            : integration
        )
      );
    } catch (err) {
      console.error('Failed to disconnect integration:', err);
      setError('Failed to disconnect. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="integrations-page">
      <h1>Service Integrations</h1>
      <p>Connect to third-party services to enhance your email workflow</p>
      
      {error && <div className="error-message">{error}</div>}
      
      <IntegrationDashboard 
        integrations={integrations}
        loading={loading}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
      />
    </div>
  );
};

export default IntegrationsPage; 