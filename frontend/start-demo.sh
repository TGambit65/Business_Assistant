#!/bin/bash

# Clear any previous environment variable cache
echo "Clearing environment variable cache..."
if [ -f "node_modules/.cache" ]; then
  rm -rf node_modules/.cache
fi

# Set demo mode explicitly
echo "Setting demo mode environment variables..."
export REACT_APP_USE_DEMO_MODE=true

# Start the application
echo "Starting application in demo mode..."
npm start