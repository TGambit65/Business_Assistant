import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { timeRanges } from '../../config/chartConfig';

const TimeRangeSelector = ({ value, onChange }) => {
  const timeRangeLabels = {
    [timeRanges.DAY]: 'Last 24 Hours',
    [timeRanges.WEEK]: 'Last 7 Days',
    [timeRanges.MONTH]: 'Last 30 Days',
    [timeRanges.QUARTER]: 'Last 90 Days'
  };

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[120px]">
        <SelectValue placeholder="Select range" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(timeRangeLabels).map(([value, label]) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default TimeRangeSelector; 