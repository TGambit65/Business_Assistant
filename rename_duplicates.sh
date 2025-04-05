#!/bin/bash

# Script to rename duplicate component files in the codebase

# Set the base directory
BASE_DIR="/home/thoder/Desktop/Cursor/email-assistant/frontend/src"

# UI Components with duplicate names
echo "Renaming duplicate UI components..."
cd "$BASE_DIR/components/ui"
if [ -f "button.jsx" ] && [ -f "Button.tsx" ]; then
  mv button.jsx UNUSED_button.jsx
  echo "Renamed button.jsx to UNUSED_button.jsx"
fi

if [ -f "card.jsx" ] && [ -f "Card.tsx" ]; then
  mv card.jsx UNUSED_card.jsx
  echo "Renamed card.jsx to UNUSED_card.jsx"
fi

# Analytics Components with duplicate files
echo "Renaming duplicate analytics components..."
cd "$BASE_DIR/components/dashboard"
if [ -f "AnalyticsDashboard.jsx" ] && [ -f "AnalyticsDashboard.tsx" ]; then
  mv AnalyticsDashboard.jsx UNUSED_AnalyticsDashboard.jsx
  echo "Renamed AnalyticsDashboard.jsx to UNUSED_AnalyticsDashboard.jsx"
fi

if [ -f "PerformanceIndicators.jsx" ] && [ -f "PerformanceIndicators.tsx" ]; then
  mv PerformanceIndicators.jsx UNUSED_PerformanceIndicators.jsx
  echo "Renamed PerformanceIndicators.jsx to UNUSED_PerformanceIndicators.jsx"
fi

if [ -f "MetricsChart.jsx" ] && [ -f "MetricsChart.tsx" ]; then
  mv MetricsChart.jsx UNUSED_MetricsChart.jsx
  echo "Renamed MetricsChart.jsx to UNUSED_MetricsChart.jsx"
fi

echo "Duplicate file renaming complete!" 