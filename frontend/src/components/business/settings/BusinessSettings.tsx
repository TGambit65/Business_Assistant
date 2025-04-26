import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Clock, Save } from 'lucide-react';

interface RefreshSettings {
  newsRefreshTime: string;
  marketDataRefreshTime: string;
  competitorDataRefreshTime: string;
  timezone: string;
}

const BusinessSettings: React.FC = () => {
  const [settings, setSettings] = React.useState<RefreshSettings>({
    newsRefreshTime: '06:00',
    marketDataRefreshTime: '08:00',
    competitorDataRefreshTime: '09:00',
    timezone: 'America/New_York'
  });

  const timezones = [
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'America/Phoenix'
  ];

  const handleSave = () => {
    // Save settings to backend/localStorage
    localStorage.setItem('businessSettings', JSON.stringify(settings));
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Business Center Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Data Refresh Settings</CardTitle>
          <CardDescription>Configure when to fetch new data from API providers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Business Timezone</label>
              <select
                value={settings.timezone}
                onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                className="w-full p-2 border rounded-md"
              >
                {timezones.map((tz) => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
              <p className="text-sm text-muted-foreground mt-1">
                All refresh times will be based on this timezone
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Industry News Refresh Time</label>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <input
                  type="time"
                  value={settings.newsRefreshTime}
                  onChange={(e) => setSettings({ ...settings, newsRefreshTime: e.target.value })}
                  className="p-2 border rounded-md"
                />
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Daily refresh time for industry news
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Market Data Refresh Time</label>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <input
                  type="time"
                  value={settings.marketDataRefreshTime}
                  onChange={(e) => setSettings({ ...settings, marketDataRefreshTime: e.target.value })}
                  className="p-2 border rounded-md"
                />
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Daily refresh time for market trends and analysis
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Competitor Data Refresh Time</label>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <input
                  type="time"
                  value={settings.competitorDataRefreshTime}
                  onChange={(e) => setSettings({ ...settings, competitorDataRefreshTime: e.target.value })}
                  className="p-2 border rounded-md"
                />
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Daily refresh time for competitor intelligence data
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BusinessSettings;