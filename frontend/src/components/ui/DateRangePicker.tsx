import React, { useState, useEffect } from 'react';
import { Input } from './Input';

export interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (dateRange: DateRange) => void;
  placeholder?: string; // This is not used anymore, but I'll keep it to avoid breaking changes in parent
  className?: string;
}

export function DateRangePicker({ value, onChange, className = "" }: DateRangePickerProps) {
  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    // Make sure to get UTC date parts to avoid timezone issues
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();
    return `${day}/${month}/${year}`;
  };

  const [startStr, setStartStr] = useState(formatDate(value.startDate));
  const [endStr, setEndStr] = useState(formatDate(value.endDate));

  useEffect(() => {
    setStartStr(formatDate(value.startDate));
  }, [value.startDate]);

  useEffect(() => {
    setEndStr(formatDate(value.endDate));
  }, [value.endDate]);

  const parseDate = (str: string): Date | null => {
    const parts = str.split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts.map(p => parseInt(p, 10));
      if (!isNaN(day) && !isNaN(month) && !isNaN(year) && year > 1000) {
        // Create date in UTC
        const date = new Date(Date.UTC(year, month - 1, day));
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
    }
    return null;
  };

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const str = e.target.value;
    setStartStr(str);
    const date = parseDate(str);
    onChange({ ...value, startDate: date });
  };
  
  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const str = e.target.value;
    setEndStr(str);
    const date = parseDate(str);
    onChange({ ...value, endDate: date });
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Input
        value={startStr}
        onChange={handleStartChange}
        placeholder="dd/mm/aaaa"
      />
      <span className="text-muted-foreground">-</span>
      <Input
        value={endStr}
        onChange={handleEndChange}
        placeholder="dd/mm/aaaa"
      />
    </div>
  );
}
