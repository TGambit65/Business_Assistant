# Deployment Guide

This guide covers deploying the Email Assistant application to Netlify and Vercel.

## Prerequisites

- Node.js 18+ installed
- Git repository with your code
- Netlify and/or Vercel account

## Environment Variables

Create a `.env` file in the `frontend` directory with the following variables:

```bash
# API Configuration
REACT_APP_API_URL=your_api_url
REACT_APP_USE_DEMO_MODE=false

# DeepSeek API (Optional)
REACT_APP_DEEPSEEK_API_KEY=your_deepseek_key
REACT_APP_DEEPSEEK_API_URL=https://api.deepseek.com/v1

# Perplexity API (Optional)
REACT_APP_PERPLEXITY_API_KEY=your_perplexity_key
REACT_APP_PERPLEXITY_API_URL=https://api.perplexity.ai

# Google OAuth (Optional)
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
```

## Netlify Deployment

### Option 1: Deploy via Netlify UI

1. Log in to [Netlify](https://app.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect your GitHub repository
4. Configure build settings:
   - Build command: `cd frontend && npm install && npm run build`
   - Publish directory: `frontend/build`
5. Add environment variables in Site settings → Environment variables
6. Deploy!

### Option 2: Deploy via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy to Netlify
netlify deploy --dir=frontend/build --prod
```

### Configuration

The `netlify.toml` file is already configured with:
- Build commands
- Publish directory
- Cache headers for performance
- SPA routing support

## Vercel Deployment

### Option 1: Deploy via Vercel UI

1. Log in to [Vercel](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure project:
   - Framework Preset: Other
   - Build Command: `cd frontend && npm install && npm run build`
   - Output Directory: `frontend/build`
5. Add environment variables in Settings → Environment Variables
6. Deploy!

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
vercel --prod
```

### Configuration

The `vercel.json` file is already configured with:
- Build commands
- Output directory
- Rewrites for SPA routing
- Cache headers

## Build Commands

```bash
# Build frontend only
cd frontend && npm run build

# Build from root directory
npm run build:frontend

# Test build locally
cd frontend && npm run build && npx serve -s build
```

## Post-Deployment

1. **Test your deployment**:
   - Check all pages load correctly
   - Test mobile responsiveness
   - Verify API connections (if not in demo mode)

2. **Configure custom domain** (optional):
   - Netlify: Site settings → Domain management
   - Vercel: Project settings → Domains

3. **Enable HTTPS** (automatic on both platforms)

4. **Monitor performance**:
   - Netlify: Analytics dashboard
   - Vercel: Analytics & Web Vitals

## Troubleshooting

### Build Failures

1. Check Node version (should be 18+)
2. Clear cache and rebuild:
   - Netlify: Deploy settings → Clear cache and deploy
   - Vercel: Redeploy with "Force new build"

### Environment Variables

- Ensure all required variables are set
- Variables must start with `REACT_APP_` to be accessible in React
- Restart/redeploy after changing environment variables

### Routing Issues

Both platforms are configured for SPA routing. If you encounter 404s:
- Check `netlify.toml` redirects configuration
- Check `vercel.json` rewrites configuration

## Demo Mode

By default, deployments are configured with `REACT_APP_USE_DEMO_MODE=true` for testing without backend services. To connect to real APIs, set this to `false` and provide the necessary API keys.