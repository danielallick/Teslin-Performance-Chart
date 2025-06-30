import React from 'react';
import { formatDate, formatValue, formatReturn } from '../utils/formatters';

interface ResultsDisplayProps {
  startDate: Date | null;
  endDate: Date | null;
  startValue: number | null;
  endValue: number | null;
  returnValue: number | null;
  isAnnualized: boolean;
}

/**
 * Component to display the calculation results.
 * Shows start/end dates, values, and calculated returns.
 * 
 * @param {Object} props - Component props
 * @param {Date|null} props.startDate - Start date for the selected period
 * @param {Date|null} props.endDate - End date for the selected period
 * @param {number|null} props.startValue - Start value for the selected period
 * @param {number|null} props.endValue - End value for the selected period
 * @param {number|null} props.returnValue - Calculated return value
 * @param {boolean} props.isAnnualized - Whether the return is annualized
 */
const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  startDate,
  endDate,
  startValue,
  endValue,
  returnValue,
  isAnnualized,
}) => {
  // If we don't have the data yet, show a message
  if (!startDate || !endDate || startValue === null || endValue === null || returnValue === null) {
    return (
      <div className="p-4 bg-gray-50 rounded-md text-gray-500 text-center">
        No data available for the selected period.
      </div>
    );
  }

  // Format return value with appropriate sign
  const formattedReturn = formatReturn(returnValue);
  
  // Determine return color based on positive/negative value
  const returnColor = returnValue >= 0 ? 'text-green-600' : 'text-red-600';
  
  // Calculate absolute value change
  const absoluteChange = endValue - startValue;
  const formattedAbsoluteChange = formatValue(absoluteChange);
  const absoluteChangeColor = absoluteChange >= 0 ? 'text-green-600' : 'text-red-600';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Date Range Card */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-500 mb-2">Date Range</h3>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-500">Start</p>
            <p className="text-base font-medium text-gray-800">{formatDate(startDate)}</p>
          </div>
          <div className="text-gray-400">→</div>
          <div className="text-right">
            <p className="text-xs text-gray-500">End</p>
            <p className="text-base font-medium text-gray-800">{formatDate(endDate)}</p>
          </div>
        </div>
      </div>

      {/* Values Card */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-500 mb-2">Values</h3>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-500">Start</p>
            <p className="text-base font-medium text-gray-800">{formatValue(startValue)}</p>
          </div>
          <div className="text-gray-400">→</div>
          <div className="text-right">
            <p className="text-xs text-gray-500">End</p>
            <p className="text-base font-medium text-gray-800">{formatValue(endValue)}</p>
          </div>
        </div>
      </div>

      {/* Return Card */}
      <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
        <h3 className="text-sm font-medium text-gray-500 mb-2">
          {isAnnualized ? 'Annualized Return (CAGR)' : 'Period Return'}
        </h3>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <p className={`text-xl font-bold ${returnColor}`}>{formattedReturn}</p>
            <p className="text-xs text-gray-500">
              {isAnnualized ? 'Annualized rate of return' : 'Total return for period'}
            </p>
          </div>
          <div className="bg-gray-100 p-3 rounded-md">
            <p className="text-xs text-gray-500">Absolute Change</p>
            <p className={`text-base font-medium ${absoluteChangeColor}`}>
              {formattedAbsoluteChange}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay;