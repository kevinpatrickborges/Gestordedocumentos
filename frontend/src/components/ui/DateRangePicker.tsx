import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';
import { Card, CardContent } from './Card';
import { Input } from './Input';

export interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (dateRange: DateRange) => void;
  placeholder?: string;
  className?: string;
}

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function DateRangePicker({ value, onChange, placeholder = "Selecionar período", className = "" }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectingStart, setSelectingStart] = useState(true);

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('pt-BR');
  };

  const getDisplayText = () => {
    if (value.startDate && value.endDate) {
      return `${formatDate(value.startDate)} - ${formatDate(value.endDate)}`;
    }
    if (value.startDate) {
      return `${formatDate(value.startDate)} - Selecionar fim`;
    }
    return placeholder;
  };

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handleDateClick = (day: number) => {
    const selectedDate = new Date(currentYear, currentMonth, day);
    
    if (selectingStart || !value.startDate) {
      onChange({ startDate: selectedDate, endDate: null });
      setSelectingStart(false);
    } else {
      if (selectedDate < value.startDate) {
        onChange({ startDate: selectedDate, endDate: value.startDate });
      } else {
        onChange({ startDate: value.startDate, endDate: selectedDate });
      }
      setSelectingStart(true);
      setIsOpen(false);
    }
  };

  const isDateInRange = (day: number) => {
    if (!value.startDate || !value.endDate) return false;
    const date = new Date(currentYear, currentMonth, day);
    return date >= value.startDate && date <= value.endDate;
  };

  const isDateSelected = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    return (
      (value.startDate && date.getTime() === value.startDate.getTime()) ||
      (value.endDate && date.getTime() === value.endDate.getTime())
    );
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = isDateSelected(day);
      const isInRange = isDateInRange(day);
      
      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(day)}
          className={`
            p-2 text-sm rounded-md hover:bg-gray-100 transition-colors
            ${isSelected ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}
            ${isInRange && !isSelected ? 'bg-blue-100 text-blue-800' : ''}
          `}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const clearSelection = () => {
    onChange({ startDate: null, endDate: null });
    setSelectingStart(true);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Input
          value={getDisplayText()}
          placeholder={placeholder}
          readOnly
          onClick={() => setIsOpen(!isOpen)}
          className="cursor-pointer pr-10"
        />
        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>

      {isOpen && (
        <Card className="absolute top-full left-0 mt-1 z-50 w-80">
          <CardContent className="p-4">
            {/* Header with month navigation */}
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateMonth('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h3 className="font-medium">
                {MONTHS[currentMonth]} {currentYear}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateMonth('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {WEEKDAYS.map(day => (
                <div key={day} className="p-2 text-xs font-medium text-gray-500 text-center">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {renderCalendar()}
            </div>

            {/* Action buttons */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={clearSelection}
              >
                Limpar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                Fechar
              </Button>
            </div>

            {/* Selection status */}
            {value.startDate && (
              <div className="mt-2 text-xs text-gray-600">
                {selectingStart ? 'Selecione a data final' : 'Selecione a data inicial'}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}