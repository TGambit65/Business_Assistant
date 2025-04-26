import React, { useState } from 'react';
import { Button } from './button';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';

/**
 * A simple date range picker component
 *
 * @param {Object} props - Component props
 * @param {Object} props.value - Current date range value { from: Date, to: Date }
 * @param {Function} props.onChange - Function called when date range changes
 * @param {string} props.className - Additional CSS classes
 */
export const DateRangePicker = ({ value, onChange, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localValue, setLocalValue] = useState(value || { from: null, to: null });

  // Format date for display
  const formatDate = (date) => {
    if (!date) return '';
    return format(date, 'MMM dd, yyyy');
  };

  // Get display text
  const getDisplayText = () => {
    if (localValue.from && localValue.to) {
      return `${formatDate(localValue.from)} - ${formatDate(localValue.to)}`;
    }

    if (localValue.from) {
      return `From ${formatDate(localValue.from)}`;
    }

    if (localValue.to) {
      return `Until ${formatDate(localValue.to)}`;
    }

    return 'Select date range';
  };

  // Handle date selection - used in a real implementation with a calendar component
  // eslint-disable-next-line no-unused-vars
  const handleDateSelect = (date) => {
    // If no dates selected or both dates selected, start new selection
    if (!localValue.from || (localValue.from && localValue.to)) {
      setLocalValue({ from: date, to: null });
      return;
    }

    // If start date selected, set end date
    if (localValue.from && !localValue.to) {
      // Ensure end date is after start date
      if (date < localValue.from) {
        setLocalValue({ from: date, to: localValue.from });
      } else {
        setLocalValue({ ...localValue, to: date });
      }

      // Close picker and notify parent
      setIsOpen(false);
      onChange({ from: localValue.from, to: date });
    }
  };

  // Simple calendar UI (in a real app, you'd use a proper calendar component)
  const renderCalendar = () => {
    // This is a simplified placeholder
    // In a real app, you'd use a proper calendar component
    return (
      <div className="p-4 bg-white dark:bg-gray-800 rounded-md shadow-lg">
        <div className="text-center mb-4">
          <p className="text-sm text-muted-foreground">
            Select start and end dates
          </p>
        </div>
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => {
              const today = new Date();
              const lastWeek = new Date();
              lastWeek.setDate(today.getDate() - 7);

              setLocalValue({ from: lastWeek, to: today });
              setIsOpen(false);
              onChange({ from: lastWeek, to: today });
            }}
          >
            Last 7 days
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const today = new Date();
              const lastMonth = new Date();
              lastMonth.setDate(today.getDate() - 30);

              setLocalValue({ from: lastMonth, to: today });
              setIsOpen(false);
              onChange({ from: lastMonth, to: today });
            }}
          >
            Last 30 days
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-start text-left font-normal"
      >
        <Calendar className="mr-2 h-4 w-4" />
        <span>{getDisplayText()}</span>
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-2 w-auto">
          {renderCalendar()}
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
