# API Provider Integration Guide

## Overview

The Business Center supports integration with various API providers to fetch industry news, market trends, and competitor analysis. This guide explains how to configure and manage API providers through the admin interface.

## Supported API Providers

### 1. Perplexity API
- Default provider for business intelligence
- Provides real-time industry news and market analysis
- Requires API key and endpoint configuration

## Configuration Steps

### 1. Access API Settings
1. Log in as an administrator
2. Click on your profile avatar in the top-right corner
3. Select "Admin Panel" from the dropdown menu
4. Navigate to "API Settings" in the admin sidebar

### 2. Configure API Provider
1. Locate the Perplexity API configuration card
2. Enter your API key in the secure input field
3. (Optional) Configure custom API endpoint if using self-hosted instance
4. Toggle provider status to activate/deactivate

### 3. Add Custom API Provider
1. Click "Add Provider" button
2. Fill in provider details:
   - Provider Name
   - API Key
   - API Endpoint
3. Click "Add Provider" to save

## Business Center Settings

### 1. Configure Refresh Times
1. Navigate to Settings → Business Center
2. Set refresh times for:
   - Industry News (default: 6:00 AM)
   - Market Data (default: 8:00 AM)
   - Competitor Data (default: 9:00 AM)
3. Select your business timezone

### 2. Data Refresh Rules
- Data is refreshed once per day at configured times
- Refresh times are timezone-aware
- First user login after refresh time triggers data update
- Cached data is used between refresh intervals

## Security Considerations

### API Key Storage
- API keys are stored securely using encryption
- Keys are never exposed in client-side code
- Access to API settings requires admin privileges

### Provider Management
- Deactivate unused providers to prevent unnecessary API calls
- Monitor API usage through provider dashboards
- Regularly rotate API keys for security

## Troubleshooting

### Common Issues

1. API Calls Failing
   - Verify API key is valid
   - Check endpoint configuration
   - Ensure provider is activated

2. Data Not Refreshing
   - Verify refresh time configuration
   - Check timezone settings
   - Clear cache if needed

3. Provider Not Available
   - Confirm admin privileges
   - Check network connectivity
   - Verify provider service status

## Best Practices

1. API Cost Optimization
   - Configure refresh times during business hours
   - Use caching effectively
   - Monitor API usage limits

2. Provider Management
   - Document custom provider integrations
   - Maintain backup provider configurations
   - Regular testing of failover scenarios

3. Security
   - Regular API key rotation
   - Audit provider access logs
   - Monitor for unusual activity

## Support

For additional support:
- Check API provider documentation
- Contact system administrator
- Review error logs in admin panel

## API Response Format

### Industry News
```json
{
  "articles": [
    {
      "id": "string",
      "title": "string",
      "summary": "string",
      "source": "string",
      "published_at": "string",
      "url": "string"
    }
  ]
}
```

### Market Trends
```json
{
  "trends": [
    {
      "date": "string",
      "market_share": "number",
      "revenue": "number",
      "competitor_count": "number",
      "analysis": "string"
    }
  ]
}
```

### Competitor Analysis
```json
{
  "market_position": "string",
  "strengths": ["string"],
  "weaknesses": ["string"],
  "recent_developments": ["string"],
  "market_share": "number",
  "trend": "string"
}