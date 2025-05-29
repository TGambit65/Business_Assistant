import { FC } from 'react';

export interface DateRange {
  from: Date | null;
  to: Date | null;
}

export interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
}

export declare const DateRangePicker: FC<DateRangePickerProps>;