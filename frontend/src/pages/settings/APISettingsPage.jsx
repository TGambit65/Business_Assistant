import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { useToast } from '../../contexts/ToastContext';
import { getAllApiKeys /*, getEnvVariable */ } from '../../utils/envUtils'; // Removed unused getEnvVariable
import { 
  Key, /* PlusCircle, */ Save, Check, /* X, */ Eye, EyeOff,  // Removed unused PlusCircle, X
  AlertTriangle, RefreshCw, Shield, Trash2 
} from 'lucide-react';

/**
 * API Settings Page
 * 
 * This page allows users to manage their API keys for various LLM services
 * and configure API-related settings.
 */
const APISettingsPage = () => {
  const { success, error, info, warning } = useToast();
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showSecrets, setShowSecrets] = useState({});
  const [apiKeys, setApiKeys] = useState({
    openAI: '',
    deepseek: '',
    googleAI: '',
    anthropic: '',
    mistral: '',
    custom: ''
  });
  
  const [customAPIEndpoint, setCustomAPIEndpoint] = useState('');
  const [defaultProvider, setDefaultProvider] = useState('deepseek');
  
  // Load existing API keys
  useEffect(() => {
    const loadAPIKeys = () => {
      const keys = getAllApiKeys();
      
      setApiKeys({
        openAI: localStorage.getItem('api_key_openai') || '',
        deepseek: keys.deepseekV3 || keys.deepseekR1 || keys.deepseekFallback || '',
        googleAI: localStorage.getItem('api_key_googleai') || '',
        anthropic: localStorage.getItem('api_key_anthropic') || '',
        mistral: localStorage.getItem('api_key_mistral') || '',
        custom: localStorage.getItem('api_key_custom') || '',
      });
      
      setCustomAPIEndpoint(localStorage.getItem('custom_api_endpoint') || '');
      setDefaultProvider(localStorage.getItem('default_api_provider') || 'deepseek');
    };
    
    loadAPIKeys();
  }, []);
  
  // Handle changing API keys
  const handleApiKeyChange = (provider, value) => {
    setApiKeys(prev => ({
      ...prev,
      [provider]: value
    }));
  };
  
  // Toggle visibility of API keys
  const toggleShowSecret = (provider) => {
    setShowSecrets(prev => ({
      ...prev,
      [provider]: !prev[provider]
    }));
  };
  
  // Save API keys
  const saveAPIKeys = async () => {
    setLoading(true);
    try {
      // Store keys in localStorage - in a production app, these would be
      // encrypted or stored on a secure backend
      Object.entries(apiKeys).forEach(([provider, key]) => {
        if (key) {
          localStorage.setItem(`api_key_${provider.toLowerCase()}`, key);
        }
      });
      
      // Store custom endpoint
      if (customAPIEndpoint) {
        localStorage.setItem('custom_api_endpoint', customAPIEndpoint);
      }
      
      // Store default provider
      localStorage.setItem('default_api_provider', defaultProvider);
      
      // Clear the showSecrets state
      setShowSecrets({});
      
      success('API settings saved successfully');
    } catch (err) {
      console.error('Error saving API keys:', err);
      error('Failed to save API settings');
    } finally {
      setLoading(false);
    }
  };
  
  // Test API keys
  const testAPIKeys = async () => {
    setTesting(true);
    
    try {
      // Mock API key testing - in a real app, this would make actual API calls
      info('Testing API keys...');
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const testResults = Object.entries(apiKeys)
        .filter(([_, key]) => key)
        .map(([provider]) => ({ provider, success: Math.random() > 0.2 }));
      
      // Show results
      testResults.forEach(result => {
        if (result.success) {
          success(`${result.provider} API key is valid`);
        } else {
          warning(`${result.provider} API key test failed`);
        }
      });
      
      if (testResults.every(r => r.success)) {
        success('All API keys are valid');
      }
    } catch (err) {
      console.error('Error testing API keys:', err);
      error('Failed to test API keys');
    } finally {
      setTesting(false);
    }
  };
  
  // Reset API keys
  const resetAPIKeys = () => {
    if (window.confirm('Are you sure you want to clear all API keys? This action cannot be undone.')) {
      // Clear all API keys from localStorage
      Object.keys(apiKeys).forEach(provider => {
        localStorage.removeItem(`api_key_${provider.toLowerCase()}`);
      });
      
      // Clear custom endpoint
      localStorage.removeItem('custom_api_endpoint');
      
      // Reset state
      setApiKeys({
        openAI: '',
        deepseek: '',
        googleAI: '',
        anthropic: '',
        mistral: '',
        custom: ''
      });
      setCustomAPIEndpoint('');
      setShowSecrets({});
      
      success('All API keys have been cleared');
    }
  };
  
  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">API Settings</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Configure your AI service API keys and settings. These keys are used for draft generation, 
        spell checking, and other AI-powered features.
      </p>
      
      <div className="grid gap-6">
        {/* API Key Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Key className="mr-2 h-5 w-5" />
              <span>API Keys</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mr-2 flex-shrink-0" />
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  API keys are stored locally on your device. Never share your API keys with others.
                </p>
              </div>
            </div>
            
            {/* DeepSeek API Key */}
            <div className="space-y-2">
              <label className="text-sm font-medium block">
                DeepSeek API Key
                {defaultProvider === 'deepseek' && <span className="ml-2 text-xs text-blue-500">(Default)</span>}
              </label>
              <div className="flex">
                <div className="relative flex-grow">
                  <Input
                    type={showSecrets.deepseek ? 'text' : 'password'}
                    value={apiKeys.deepseek}
                    onChange={(e) => handleApiKeyChange('deepseek', e.target.value)}
                    placeholder="Enter your DeepSeek API key"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowSecret('deepseek')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showSecrets.deepseek ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-2"
                  onClick={() => setDefaultProvider('deepseek')}
                  disabled={defaultProvider === 'deepseek'}
                >
                  {defaultProvider === 'deepseek' ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span>Set Default</span>
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Used for draft generation and smart suggestions.
              </p>
            </div>
            
            {/* OpenAI API Key */}
            <div className="space-y-2">
              <label className="text-sm font-medium block">
                OpenAI API Key
                {defaultProvider === 'openAI' && <span className="ml-2 text-xs text-blue-500">(Default)</span>}
              </label>
              <div className="flex">
                <div className="relative flex-grow">
                  <Input
                    type={showSecrets.openAI ? 'text' : 'password'}
                    value={apiKeys.openAI}
                    onChange={(e) => handleApiKeyChange('openAI', e.target.value)}
                    placeholder="Enter your OpenAI API key"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowSecret('openAI')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showSecrets.openAI ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-2"
                  onClick={() => setDefaultProvider('openAI')}
                  disabled={defaultProvider === 'openAI'}
                >
                  {defaultProvider === 'openAI' ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span>Set Default</span>
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Used for enhanced drafting and content generation.
              </p>
            </div>
            
            {/* Anthropic API Key */}
            <div className="space-y-2">
              <label className="text-sm font-medium block">
                Anthropic API Key
                {defaultProvider === 'anthropic' && <span className="ml-2 text-xs text-blue-500">(Default)</span>}
              </label>
              <div className="flex">
                <div className="relative flex-grow">
                  <Input
                    type={showSecrets.anthropic ? 'text' : 'password'}
                    value={apiKeys.anthropic}
                    onChange={(e) => handleApiKeyChange('anthropic', e.target.value)}
                    placeholder="Enter your Anthropic API key"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowSecret('anthropic')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showSecrets.anthropic ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-2"
                  onClick={() => setDefaultProvider('anthropic')}
                  disabled={defaultProvider === 'anthropic'}
                >
                  {defaultProvider === 'anthropic' ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span>Set Default</span>
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Used for Claude-powered features and advanced drafting.
              </p>
            </div>
            
            {/* Custom API Integration */}
            <div className="pt-4 border-t">
              <div className="space-y-2">
                <label className="text-sm font-medium block">
                  Custom API Endpoint
                </label>
                <Input
                  type="text"
                  value={customAPIEndpoint}
                  onChange={(e) => setCustomAPIEndpoint(e.target.value)}
                  placeholder="https://api.example.com/v1"
                />
                <p className="text-xs text-gray-500">
                  Enter a custom API endpoint if you're using a self-hosted LLM service.
                </p>
              </div>
              
              <div className="space-y-2 mt-4">
                <label className="text-sm font-medium block">
                  Custom API Key
                  {defaultProvider === 'custom' && <span className="ml-2 text-xs text-blue-500">(Default)</span>}
                </label>
                <div className="flex">
                  <div className="relative flex-grow">
                    <Input
                      type={showSecrets.custom ? 'text' : 'password'}
                      value={apiKeys.custom}
                      onChange={(e) => handleApiKeyChange('custom', e.target.value)}
                      placeholder="Enter your custom API key"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowSecret('custom')}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showSecrets.custom ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-2"
                    onClick={() => setDefaultProvider('custom')}
                    disabled={defaultProvider === 'custom'}
                  >
                    {defaultProvider === 'custom' ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <span>Set Default</span>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  API key for your custom LLM service.
                </p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 justify-end mt-6 pt-4 border-t">
              <Button
                variant="outline"
                onClick={resetAPIKeys}
                className="flex items-center gap-1 text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Clear All Keys
              </Button>
              
              <Button
                variant="outline"
                onClick={testAPIKeys}
                disabled={loading || testing}
                className="flex items-center gap-1"
              >
                {testing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4" />
                    Test Keys
                  </>
                )}
              </Button>
              
              <Button
                onClick={saveAPIKeys}
                disabled={loading}
                className="flex items-center gap-1"
              >
                <Save className="h-4 w-4" />
                Save Settings
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Usage Stats - can be added in a future version */}
        <Card>
          <CardHeader>
            <CardTitle>API Usage Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              API usage statistics will be available in a future update. This will help you track token usage
              and costs across different providers.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default APISettingsPage; 