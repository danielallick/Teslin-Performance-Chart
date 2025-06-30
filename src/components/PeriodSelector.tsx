import React, { useState } from 'react';
import { Period, CustomPeriod } from '../types';
import { Calendar } from 'lucide-react';

interface PeriodSelectorProps {
  selectedPeriod: Period;
  onPeriodChange: (period: Period) => void;
  customPeriod?: CustomPeriod;
  onCustomPeriodChange?: (period: CustomPeriod) => void;
  data: { date: Date; value: number }[];
}

const PeriodSelector: React.FC<PeriodSelectorProps> = ({ 
  selectedPeriod, 
  onPeriodChange,
  customPeriod,
  onCustomPeriodChange,
  data
}) => {
  const [showCustomDates, setShowCustomDates] = useState(false);

  // Define all available periods with their labels
  const periods: { value: Period; label: string }[] = [
    { value: '1m', label: '1 Month' },
    { value: '3m', label: '3 Months' },
    { value: 'ytd', label: 'Year to Date' },
    { value: '1y', label: '1 Year' },
    { value: '3y', label: '3 Years' },
    { value: '5y', label: '5 Years' },
    { value: '10y', label: '10 Years' },
    { value: '15y', label: '15 Years' },
    { value: '20y', label: '20 Years' },
    { value: 'si', label: 'Since Inception' },
    { value: 'custom', label: 'Custom Period' },
  ];

  // Get min and max dates from data
  const minDate = data.length > 0 ? data[0].date : new Date();
  const maxDate = data.length > 0 ? data[data.length - 1].date : new Date();

  const handleCustomDateChange = (type: 'start' | 'end', value: string) => {
    if (!onCustomPeriodChange || !customPeriod) return;

    const newDate = new Date(value);
    onCustomPeriodChange({
      ...customPeriod,
      [type === 'start' ? 'startDate' : 'endDate']: newDate
    });
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-wrap gap-2">
        {periods.map((period) => (
          <button
            key={period.value}
            onClick={() => {
              onPeriodChange(period.value);
              setShowCustomDates(period.value === 'custom');
            }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              selectedPeriod === period.value
                ? 'bg-blue-800 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            aria-pressed={selectedPeriod === period.value}
          >
            {period.label}
          </button>
        ))}
      </div>

      {showCustomDates && customPeriod && onCustomPeriodChange && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Custom Period Selection
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={customPeriod.startDate.toISOString().split('T')[0]}
                onChange={(e) => handleCustomDateChange('start', e.target.value)}
                min={minDate.toISOString().split('T')[0]}
                max={maxDate.toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={customPeriod.endDate.toISOString().split('T')[0]}
                onChange={(e) => handleCustomDateChange('end', e.target.value)}
                min={minDate.toISOString().split('T')[0]}
                max={maxDate.toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PeriodSelector;