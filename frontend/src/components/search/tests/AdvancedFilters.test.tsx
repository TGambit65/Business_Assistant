import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AdvancedFilters } from '../AdvancedFilters';
import { AdvancedFiltersProps } from '../types';
import { Filter, FilterOperator } from '../../../types/search';

describe('AdvancedFilters', () => {
  const mockFilters: Filter[] = [
    {
      field: 'category',
      operator: FilterOperator.EQUALS,
      value: 'test'
    }
  ];

  const mockOnAddFilter = jest.fn();
  const mockOnRemoveFilter = jest.fn();
  const mockOnUpdateFilter = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders existing filters', () => {
    render(
      <AdvancedFilters
        filters={mockFilters}
        onAddFilter={mockOnAddFilter}
        onRemoveFilter={mockOnRemoveFilter}
        onUpdateFilter={mockOnUpdateFilter}
      />
    );

    // Check individual elements instead of combined text
    expect(screen.getByDisplayValue('category')).toBeInTheDocument(); // Select with value 'category'
    expect(screen.getByDisplayValue('equals')).toBeInTheDocument(); // Select with value 'equals'
    expect(screen.getByDisplayValue('test')).toBeInTheDocument(); // Input with value 'test'
  });

  it('opens filter dialog when Add Filter is clicked', () => {
    render(
      <AdvancedFilters
        filters={[]}
        onAddFilter={mockOnAddFilter}
        onRemoveFilter={mockOnRemoveFilter}
        onUpdateFilter={mockOnUpdateFilter}
      />
    );

    const addButton = screen.getByText('Add Filter');
    fireEvent.click(addButton);

    expect(mockOnAddFilter).toHaveBeenCalledWith({
      field: '',
      operator: FilterOperator.EQUALS,
      value: ''
    });
  });

  it('removes filter when delete button is clicked', () => {
    render(
      <AdvancedFilters
        filters={mockFilters}
        onAddFilter={mockOnAddFilter}
        onRemoveFilter={mockOnRemoveFilter}
        onUpdateFilter={mockOnUpdateFilter}
      />
    );

    const deleteButton = screen.getByTitle('Remove Filter');
    fireEvent.click(deleteButton);

    expect(mockOnRemoveFilter).toHaveBeenCalledWith(0);
  });

  it('updates filter when field is changed', () => {
    render(
      <AdvancedFilters
        filters={mockFilters}
        onAddFilter={mockOnAddFilter}
        onRemoveFilter={mockOnRemoveFilter}
        onUpdateFilter={mockOnUpdateFilter}
      />
    );

    // Use getByLabelText now that aria-label is added
    const fieldSelect = screen.getByLabelText('Field'); 
    fireEvent.change(fieldSelect, { target: { value: 'title' } });

    expect(mockOnUpdateFilter).toHaveBeenCalledWith(0, {
      field: 'title',
      operator: FilterOperator.EQUALS,
      value: 'test'
    });
  });

  it('updates filter when operator is changed', () => {
    render(
      <AdvancedFilters
        filters={mockFilters}
        onAddFilter={mockOnAddFilter}
        onRemoveFilter={mockOnRemoveFilter}
        onUpdateFilter={mockOnUpdateFilter}
      />
    );

    // Use getByLabelText now that aria-label is added
    const operatorSelect = screen.getByLabelText('Operator');
    fireEvent.change(operatorSelect, { target: { value: 'contains' } });

    expect(mockOnUpdateFilter).toHaveBeenCalledWith(0, {
      field: 'category',
      operator: FilterOperator.CONTAINS,
      value: 'test'
    });
  });

  it('updates filter when value is changed', () => {
    render(
      <AdvancedFilters
        filters={mockFilters}
        onAddFilter={mockOnAddFilter}
        onRemoveFilter={mockOnRemoveFilter}
        onUpdateFilter={mockOnUpdateFilter}
      />
    );

    // Use getByLabelText now that aria-label is added
    const valueInput = screen.getByLabelText('Value');
    fireEvent.change(valueInput, { target: { value: 'new value' } });

    expect(mockOnUpdateFilter).toHaveBeenCalledWith(0, {
      field: 'category',
      operator: FilterOperator.EQUALS,
      value: 'new value'
    });
  });

  it('handles date range filters', async () => {
    const dateFilters: Filter[] = [
      {
        field: 'date',
        operator: FilterOperator.BETWEEN,
        value: {
          start: new Date('2023-01-01'),
          end: new Date('2023-12-31')
        }
      }
    ];

    render(
      <AdvancedFilters
        filters={dateFilters}
        onAddFilter={mockOnAddFilter}
        onRemoveFilter={mockOnRemoveFilter}
        onUpdateFilter={mockOnUpdateFilter}
      />
    );

    // Check selects are rendered with correct values
    expect(await screen.findByDisplayValue('date')).toBeInTheDocument(); // Use findBy
    expect(await screen.findByDisplayValue('between')).toBeInTheDocument(); // Use findBy
    // Check the input value which should be the stringified object
    const valueInput = screen.getByLabelText('Value'); // Find input by aria-label
    expect(valueInput).toHaveValue(JSON.stringify(dateFilters[0].value));
  });

  it('handles tag filters', async () => {
    const tagFilters: Filter[] = [
      {
        field: 'tags',
        operator: FilterOperator.CONTAINS,
        value: 'test'
      }
    ];

    render(
      <AdvancedFilters
        filters={tagFilters}
        onAddFilter={mockOnAddFilter}
        onRemoveFilter={mockOnRemoveFilter}
        onUpdateFilter={mockOnUpdateFilter}
      />
    );

    // Check selects are rendered with correct values
    expect(await screen.findByDisplayValue('tags')).toBeInTheDocument(); // Use findBy
    expect(await screen.findByDisplayValue('contains')).toBeInTheDocument(); // Use findBy
    // Check the input value
    expect(await screen.findByDisplayValue('test')).toBeInTheDocument(); // Use findBy
  });
}); 