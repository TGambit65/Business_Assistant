import React, { useState, useCallback } from 'react';
import { Filter, FilterOperator } from '../../types/search';
import { Plus, Trash2, Save } from 'lucide-react';
import { AdvancedFiltersProps } from './types';

// For string values in input element, convert the value to string safely 
const getStringValue = (value: any): string => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value.toString();
  if (typeof value === 'boolean') return value.toString();
  if (Array.isArray(value)) return value.join(', ');
  if (value && typeof value === 'object') return JSON.stringify(value);
  return '';
};

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  filters,
  onAddFilter,
  onRemoveFilter,
  onUpdateFilter
}) => {
  const [savedFilters, setSavedFilters] = useState<Array<{
    name: string;
    filters: Filter[];
  }>>([]);
  const [editingFilter, setEditingFilter] = useState<Filter | null>(null);
  const [expanded, setExpanded] = useState(false);

  const handleToggleExpand = useCallback(() => {
    setExpanded(prev => !prev);
  }, []);
  
  const handleUpdateFilter = useCallback((index: number, filter: Filter) => {
    onUpdateFilter(index, filter);
  }, [onUpdateFilter]);

  // Save current filters
  const saveFilters = useCallback(() => {
    const name = prompt('Enter a name for these filters:');
    if (name) {
      setSavedFilters(prev => [...prev, { name, filters }]);
    }
  }, [filters]);

  // Load saved filters
  const loadSavedFilters = useCallback((savedFilter: { name: string; filters: Filter[] }) => {
    savedFilter.filters.forEach((filter, index) => {
      onAddFilter(filter);
    });
  }, [onAddFilter]);

  return (
    <div className="space-y-4">
      {/* Current Filters */}
      <div className="space-y-2">
        {filters.map((filter, index) => (
          <div key={index} className="flex items-center space-x-2">
            <select
              value={filter.field}
              onChange={(e) => handleUpdateFilter(index, { ...filter, field: e.target.value })}
              className="border rounded px-2 py-1"
              aria-label="Field" // Add aria-label
            >
              <option value="">Select Field</option>
              <option value="title">Title</option>
              <option value="content">Content</option>
              <option value="author">Author</option>
              <option value="date">Date</option>
              <option value="category">Category</option>
              <option value="tags">Tags</option>
            </select>

            <select
              value={filter.operator}
              onChange={(e) => handleUpdateFilter(index, { ...filter, operator: e.target.value as Filter['operator'] })}
              className="border rounded px-2 py-1"
              aria-label="Operator" // Add aria-label
            >
              <option value="equals">Equals</option>
              <option value="contains">Contains</option>
              <option value="gt">Greater Than</option>
              <option value="lt">Less Than</option>
              <option value="between">Between</option>
            </select>

            <input
              type="text"
              value={getStringValue(filter.value)}
              onChange={(e) => handleUpdateFilter(index, { ...filter, value: e.target.value })}
              className="border rounded px-2 py-1 flex-1"
              placeholder="Value"
              aria-label="Value" // Add aria-label
            />

            <button
              onClick={() => onRemoveFilter(index)}
              className="p-1 hover:bg-red-100 rounded-full"
              title="Remove Filter"
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </button>
          </div>
        ))}

        <button
          onClick={() => onAddFilter({
            field: '',
            operator: FilterOperator.EQUALS,
            value: ''
          })}
          className="flex items-center space-x-1 text-primary hover:text-primary-dark"
        >
          <Plus className="h-4 w-4" />
          <span>Add Filter</span>
        </button>
      </div>

      {/* Save/Load Filters */}
      <div className="flex items-center space-x-4">
        <button
          onClick={saveFilters}
          className="flex items-center space-x-1 text-primary hover:text-primary-dark"
        >
          <Save className="h-4 w-4" />
          <span>Save Filters</span>
        </button>

        {savedFilters.length > 0 && (
          <select
            onChange={(e) => {
              const selected = savedFilters.find(f => f.name === e.target.value);
              if (selected) {
                loadSavedFilters(selected);
              }
            }}
            className="border rounded px-2 py-1"
          >
            <option value="">Load Saved Filters</option>
            {savedFilters.map((saved, index) => (
              <option key={index} value={saved.name}>
                {saved.name}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}; 