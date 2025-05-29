import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Slider } from '../ui/slider';
import { DateRangePicker } from '../ui/date-range-picker';
import type { AnalyticsFilter } from '../../types/analytics';
import { 
  Filter, 
  X, 
  ChevronDown,
  Search,
  RotateCcw
} from 'lucide-react';
import { format } from 'date-fns';

interface AnalyticsFiltersProps {
  filter: AnalyticsFilter;
  onFilterChange: (filter: AnalyticsFilter) => void;
  onApply: () => void;
  onReset: () => void;
}

export const AnalyticsFilters: React.FC<AnalyticsFiltersProps> = ({
  filter,
  onFilterChange,
  onApply,
  onReset
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleDateRangeChange = (range: { start: Date; end: Date }) => {
    onFilterChange({ ...filter, dateRange: range });
  };

  const handleFeatureToggle = (feature: string) => {
    const currentFeatures = filter.featureType || [];
    const newFeatures = currentFeatures.includes(feature)
      ? currentFeatures.filter(f => f !== feature)
      : [...currentFeatures, feature];
    
    onFilterChange({ 
      ...filter, 
      featureType: newFeatures.length > 0 ? newFeatures : undefined 
    });
  };

  const handleSatisfactionChange = (value: number | number[]) => {
    const numValue = Array.isArray(value) ? value[0] : value;
    onFilterChange({ 
      ...filter, 
      minSatisfaction: numValue > 1 ? numValue : undefined 
    });
  };

  const features = ['compose', 'rewrite', 'reply', 'summarize', 'draft'];

  return (
    <Card>
      <CardHeader 
        className="cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Analytics Filters
            </CardTitle>
            <CardDescription>Filter analytics data by various criteria</CardDescription>
          </div>
          <ChevronDown 
            className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
          />
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-6">
          {/* Date Range Filter */}
          <div className="space-y-2">
            <Label>Date Range</Label>
            <DateRangePicker
              value={filter.dateRange || {
                start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                end: new Date()
              }}
              onChange={handleDateRangeChange}
            />
          </div>

          {/* Feature Type Filter */}
          <div className="space-y-2">
            <Label>Feature Types</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {features.map(feature => (
                <div key={feature} className="flex items-center space-x-2">
                  <Checkbox
                    id={feature}
                    checked={(filter.featureType || []).includes(feature)}
                    onCheckedChange={() => handleFeatureToggle(feature)}
                  />
                  <label
                    htmlFor={feature}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
                  >
                    {feature}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Minimum Satisfaction Filter */}
          <div className="space-y-2">
            <Label>Minimum Satisfaction Score</Label>
            <div className="flex items-center gap-4">
              <Slider
                value={[filter.minSatisfaction || 1]}
                onValueChange={handleSatisfactionChange}
                max={5}
                min={1}
                step={0.5}
                className="flex-1"
              />
              <span className="w-12 text-sm font-medium text-right">
                {filter.minSatisfaction || 1}+
              </span>
            </div>
          </div>

          {/* User ID Filter */}
          <div className="space-y-2">
            <Label htmlFor="userId">User ID (Optional)</Label>
            <Input
              id="userId"
              placeholder="Enter user ID to filter by specific user"
              value={filter.userId || ''}
              onChange={(e) => onFilterChange({ 
                ...filter, 
                userId: e.target.value || undefined 
              })}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={onApply} className="flex-1">
              <Search className="mr-2 h-4 w-4" />
              Apply Filters
            </Button>
            <Button onClick={onReset} variant="outline">
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export const QuickFilters: React.FC<{
  onFilterSelect: (filter: Partial<AnalyticsFilter>) => void;
}> = ({ onFilterSelect }) => {
  const quickFilterOptions = [
    {
      label: 'Today',
      filter: {
        dateRange: {
          start: new Date(new Date().setHours(0, 0, 0, 0)),
          end: new Date()
        }
      }
    },
    {
      label: 'Last 7 Days',
      filter: {
        dateRange: {
          start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          end: new Date()
        }
      }
    },
    {
      label: 'Last 30 Days',
      filter: {
        dateRange: {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          end: new Date()
        }
      }
    },
    {
      label: 'High Satisfaction',
      filter: {
        minSatisfaction: 4
      }
    },
    {
      label: 'Compose Only',
      filter: {
        featureType: ['compose']
      }
    }
  ];

  return (
    <div className="flex gap-2 flex-wrap">
      {quickFilterOptions.map(option => (
        <Button
          key={option.label}
          variant="outline"
          size="sm"
          onClick={() => onFilterSelect(option.filter)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
};

export const ActiveFilters: React.FC<{
  filter: AnalyticsFilter;
  onRemove: (key: keyof AnalyticsFilter) => void;
}> = ({ filter, onRemove }) => {
  const activeFilters: { key: keyof AnalyticsFilter; label: string; value: string }[] = [];

  if (filter.dateRange) {
    activeFilters.push({
      key: 'dateRange',
      label: 'Date Range',
      value: `${format(filter.dateRange.start, 'MMM d')} - ${format(filter.dateRange.end, 'MMM d')}`
    });
  }

  if (filter.featureType && filter.featureType.length > 0) {
    activeFilters.push({
      key: 'featureType',
      label: 'Features',
      value: filter.featureType.join(', ')
    });
  }

  if (filter.minSatisfaction) {
    activeFilters.push({
      key: 'minSatisfaction',
      label: 'Min Satisfaction',
      value: `${filter.minSatisfaction}+`
    });
  }

  if (filter.userId) {
    activeFilters.push({
      key: 'userId',
      label: 'User',
      value: filter.userId
    });
  }

  if (activeFilters.length === 0) return null;

  return (
    <div className="flex gap-2 flex-wrap">
      {activeFilters.map(({ key, label, value }) => (
        <Badge
          key={key}
          variant="secondary"
          className="pl-3 pr-1 py-1 flex items-center gap-1"
        >
          <span className="text-xs">
            {label}: <strong>{value}</strong>
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => onRemove(key)}
            aria-label="Remove filter"
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}
    </div>
  );
};

const Badge: React.FC<{
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  className?: string;
}> = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/80',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/80',
    outline: 'text-foreground border border-input'
  };

  return (
    <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
};