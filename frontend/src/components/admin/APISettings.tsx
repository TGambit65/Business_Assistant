import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Plus, Trash2, Save, Key, Globe } from 'lucide-react';

interface APIProvider {
  id: string;
  name: string;
  apiKey: string;
  endpoint: string;
  isActive: boolean;
}

const APISettings: React.FC = () => {
  const [providers, setProviders] = useState<APIProvider[]>([
    {
      id: 'perplexity',
      name: 'Perplexity',
      apiKey: '',
      endpoint: '',
      isActive: true
    }
  ]);

  const [newProvider, setNewProvider] = useState<APIProvider>({
    id: '',
    name: '',
    apiKey: '',
    endpoint: '',
    isActive: true
  });

  const [showAddForm, setShowAddForm] = useState(false);

  const handleSave = async () => {
    try {
      // Save API providers to backend/secure storage
      await saveAPIProviders(providers);
      // Update environment variables or configuration
      await updateAPIConfiguration(providers);
    } catch (error) {
      console.error('Error saving API settings:', error);
    }
  };

  const handleAddProvider = () => {
    if (newProvider.name && newProvider.apiKey) {
      setProviders([...providers, { ...newProvider, id: Date.now().toString() }]);
      setNewProvider({ id: '', name: '', apiKey: '', endpoint: '', isActive: true });
      setShowAddForm(false);
    }
  };

  const handleRemoveProvider = (id: string) => {
    setProviders(providers.filter(provider => provider.id !== id));
  };

  const handleToggleProvider = (id: string) => {
    setProviders(providers.map(provider =>
      provider.id === id ? { ...provider, isActive: !provider.isActive } : provider
    ));
  };

  // Placeholder functions - implement actual backend integration
  const saveAPIProviders = async (providers: APIProvider[]) => {
    // Save to backend
    console.log('Saving providers:', providers);
  };

  const updateAPIConfiguration = async (providers: APIProvider[]) => {
    // Update runtime configuration
    console.log('Updating configuration:', providers);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">API Settings</h1>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Provider
        </Button>
      </div>

      <div className="space-y-4">
        {providers.map((provider) => (
          <Card key={provider.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{provider.name}</CardTitle>
                  <CardDescription>API Provider Configuration</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={provider.isActive ? 'default' : 'outline'}
                    onClick={() => handleToggleProvider(provider.id)}
                  >
                    {provider.isActive ? 'Active' : 'Inactive'}
                  </Button>
                  {provider.id !== 'perplexity' && (
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleRemoveProvider(provider.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">API Key</label>
                <div className="flex items-center gap-2">
                  <Key className="h-4 w-4 text-muted-foreground" />
                  <input
                    type="password"
                    value={provider.apiKey}
                    onChange={(e) => setProviders(providers.map(p =>
                      p.id === provider.id ? { ...p, apiKey: e.target.value } : p
                    ))}
                    className="flex-1 p-2 border rounded-md"
                    placeholder="Enter API key"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">API Endpoint</label>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={provider.endpoint}
                    onChange={(e) => setProviders(providers.map(p =>
                      p.id === provider.id ? { ...p, endpoint: e.target.value } : p
                    ))}
                    className="flex-1 p-2 border rounded-md"
                    placeholder="Enter API endpoint"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {showAddForm && (
          <Card>
            <CardHeader>
              <CardTitle>Add New API Provider</CardTitle>
              <CardDescription>Configure a new API provider</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Provider Name</label>
                <input
                  type="text"
                  value={newProvider.name}
                  onChange={(e) => setNewProvider({ ...newProvider, name: e.target.value })}
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter provider name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">API Key</label>
                <input
                  type="password"
                  value={newProvider.apiKey}
                  onChange={(e) => setNewProvider({ ...newProvider, apiKey: e.target.value })}
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter API key"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">API Endpoint</label>
                <input
                  type="text"
                  value={newProvider.endpoint}
                  onChange={(e) => setNewProvider({ ...newProvider, endpoint: e.target.value })}
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter API endpoint"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddProvider}>
                  Add Provider
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end">
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default APISettings;