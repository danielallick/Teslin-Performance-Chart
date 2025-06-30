import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';
import { DataPoint } from '../types';
import { formatDate, formatValue, formatReturn } from '../utils/formatters';
import { calculateYearFrac } from '../utils/dateUtils';

interface ChartDisplayProps {
  data: DataPoint[];
  fullDataset: DataPoint[];
}

/**
 * Custom tooltip component that appears when hovering over the chart.
 * Shows three pieces of information for each data point:
 * 1. The date for the point
 * 2. NAV incl. reinv. div. - The actual value (e.g., portfolio value, stock price) in #,###.## format
 * 3. Annualized return since inception - The CAGR from the very first data point in the Excel file to this point
 * 4. Indexed value - The value relative to the selected period's starting point (= 100)
 * 
 * Example tooltip content:
 * Date: Jan 15, 2024
 * NAV incl. reinv. div.: 12,500.00
 * Annualized return since inception: +12.50%
 * Indexed: 110 (meaning it's 10% higher than the selected period's starting point)
 */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const date = new Date(label);
    const actualValue = payload[0].payload.actualValue; // The true NAV value
    const annualizedReturnSinceInception = payload[0].payload.annualizedReturnSinceInception; // Annualized return from inception
    const indexedValue = payload[0].payload.indexedValue; // Indexed to selected period start
    
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg min-w-[220px]">
        {/* Date header */}
        <p className="text-sm font-semibold text-gray-800 mb-3 border-b border-gray-100 pb-2">
          {formatDate(date)}
        </p>
        
        {/* NAV (actual value) - formatted with commas, no abbreviations */}
        <div className="mb-2">
          <p className="text-xs text-gray-500">NAV incl. reinv. div.</p>
          <p className="text-base font-bold text-blue-800">{formatValue(actualValue)}</p>
        </div>
        
        {/* Annualized return since inception */}
        <div className="mb-2">
          <p className="text-xs text-gray-500">Annualized return since inception</p>
          <p className={`text-sm font-semibold ${annualizedReturnSinceInception >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatReturn(annualizedReturnSinceInception)}
          </p>
        </div>
        
        {/* Indexed value (relative to selected period start) */}
        <div>
          <p className="text-xs text-gray-500">Indexed (period start = 100)</p>
          <p className="text-sm font-medium text-gray-700">{indexedValue.toFixed(2)}</p>
        </div>
      </div>
    );
  }
  
  return null;
};

/**
 * Chart component that visualizes performance over time.
 * 
 * Key Features:
 * 1. Indexing to 100:
 *    - First data point of the SELECTED PERIOD is set to 100 (baseline)
 *    - All other points are shown relative to this baseline
 *    - Example: If selected period start value is 1000 and current value is 1100,
 *      the chart shows 100 and 110 respectively (10% increase from period start)
 * 
 * 2. Visual Elements:
 *    - Blue line showing relative performance within the selected period
 *    - Dashed reference line at 100 (starting point of selected period)
 *    - Y-axis showing percentage changes from selected period start
 *    - X-axis showing dates
 * 
 * 3. Interactive Features:
 *    - Hover tooltips showing:
 *      a) Actual NAV value (true underlying value, formatted as #,###.##)
 *      b) Annualized return since inception (CAGR from the very first data point in Excel file)
 *      c) Indexed value (relative to selected period start)
 *    - Automatic y-axis scaling with logical intervals
 * 
 * 4. Financial Context:
 *    - "Annualized return since inception" = CAGR from the very beginning of the Excel data
 *      (what yearly rate would produce the total return from inception to this point)
 *    - "Indexed value" = Performance relative to the selected time period's start
 *    - These are different reference points that help users understand both
 *      long-term performance and period-specific performance
 * 
 * @param {Object} props - Component props
 * @param {DataPoint[]} props.data - Array of date-value pairs for the selected period
 * @param {DataPoint[]} props.fullDataset - Complete dataset from Excel file (for inception calculations)
 */
const ChartDisplay: React.FC<ChartDisplayProps> = ({ data, fullDataset }) => {
  // Show message if no data is available
  if (!data || data.length === 0) {
    return (
      <div className="p-8 bg-gray-50 rounded-md text-gray-500 text-center">
        No data available for the selected period.
      </div>
    );
  }

  // Step 1: Calculate the baseline value for the selected period
  // This will be our reference point (shown as 100 on the chart)
  const selectedPeriodStartValue = data[0].value;
  
  // Step 2: Get true inception values from the full dataset
  // Sort the full dataset to ensure we get the very first data point
  const sortedFullDataset = [...fullDataset].sort((a, b) => a.date.getTime() - b.date.getTime());
  const inceptionStartValue = sortedFullDataset[0].value; // Very first value from Excel
  const inceptionStartDate = sortedFullDataset[0].date; // Very first date from Excel
  
  // Step 3: Transform the data for the chart
  // For each point, we calculate:
  // - actualValue: Original value (kept for tooltips, formatted with commas)
  // - indexedValue: (current value / selected period start value) × 100
  // - annualizedReturnSinceInception: CAGR from true inception to this point
  // - value: Same as indexedValue (used by the chart for plotting)
  const chartData = data.map((point) => {
    // Calculate indexed value relative to selected period start
    const indexedValue = (point.value / selectedPeriodStartValue) * 100;
    
    // Calculate annualized return since TRUE inception (from very first data point in Excel)
    // This shows what the yearly growth rate would be if it was consistent from inception
    let annualizedReturnSinceInception: number;
    const yearsFromInception = calculateYearFrac(inceptionStartDate, point.date);
    
    if (yearsFromInception >= 1/12) { // Only annualize if at least 1 month
      // CAGR formula: (End Value / Start Value)^(1/years) - 1
      // This calculates what constant yearly rate would produce the total return from inception
      annualizedReturnSinceInception = Math.pow(point.value / inceptionStartValue, 1 / yearsFromInception) - 1;
    } else {
      // For very short periods, use simple return
      annualizedReturnSinceInception = (point.value / inceptionStartValue) - 1;
    }
    
    return {
      date: point.date.getTime(), // Convert date to timestamp for x-axis
      value: indexedValue,        // This is what gets plotted on the chart
      actualValue: point.value,   // Keep original value for tooltip (will be formatted with commas)
      indexedValue: indexedValue, // Indexed value for tooltip
      annualizedReturnSinceInception: annualizedReturnSinceInception, // Annualized return from true inception
    };
  });
  
  // Step 4: Calculate y-axis range for indexed values
  // Find the highest and lowest indexed values to determine chart boundaries
  const indexedValues = chartData.map((point) => point.indexedValue);
  const minIndexed = Math.min(...indexedValues);
  const maxIndexed = Math.max(...indexedValues);
  
  // Step 5: Create logical y-axis intervals
  // We want clean, round numbers that make sense to users
  // Example: Instead of showing 97.3, 104.7, 112.1, we show 95, 100, 105, 110, 115
  const range = maxIndexed - minIndexed;
  
  // Calculate a reasonable interval based on the data range
  let interval: number;
  if (range <= 10) {
    interval = 2; // For small ranges, use intervals of 2
  } else if (range <= 50) {
    interval = 5; // For medium ranges, use intervals of 5
  } else if (range <= 100) {
    interval = 10; // For larger ranges, use intervals of 10
  } else {
    interval = Math.ceil(range / 10 / 10) * 10; // For very large ranges, use multiples of 10
  }
  
  // Calculate the y-axis boundaries
  const minY = Math.floor(minIndexed / interval) * interval;
  const maxY = Math.ceil(maxIndexed / interval) * interval;
  
  // Step 6: Ensure y-axis always shows 100 (baseline) with adequate padding
  // This is crucial because 100 represents the starting point of the selected period
  const yAxisDomain = [
    Math.min(minY, 100 - interval), // Show at least one interval below 100
    Math.max(maxY, 100 + interval), // Show at least one interval above 100
  ];
  
  // Get date range for display
  const startDate = data[0].date;
  const endDate = data[data.length - 1].date;

  return (
    <div className="w-full">
      <div className="w-full h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 10, bottom: 30 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              type="number"
              domain={['dataMin', 'dataMax']}
              tickFormatter={(timestamp) => {
                const date = new Date(timestamp);
                return `${date.getMonth() + 1}/${date.getFullYear().toString().substr(2, 2)}`;
              }}
              tick={{ fontSize: 12 }}
              label={{
                value: 'Date',
                position: 'insideBottom',
                offset: -15,
                fontSize: 12,
              }}
            />
            <YAxis
              domain={yAxisDomain}
              tickFormatter={(value) => value.toFixed(0)}
              tick={{ fontSize: 12 }}
              width={80}
              interval={0}
              ticks={Array.from(
                { length: Math.floor((yAxisDomain[1] - yAxisDomain[0]) / interval) + 1 },
                (_, i) => yAxisDomain[0] + i * interval
              )}
              label={{
                value: 'Indexed Value (Start = 100)',
                angle: -90,
                position: 'insideLeft',
                offset: 10,
                fontSize: 12,
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {/* Add reference line at 100 to show baseline */}
            <ReferenceLine y={100} stroke="#888" strokeDasharray="3 3" />
            <Line
              type="monotone"
              dataKey="value"
              name="Indexed Value"
              stroke="#1E40AF"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, fill: '#1E40AF', stroke: '#fff' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Display date range and indexing information */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-gray-500">
          <span>{formatDate(startDate)}</span>
          <span>{formatDate(endDate)}</span>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Values indexed to 100 at start date ({formatDate(startDate)})
        </p>
      </div>
    </div>
  );
};

export default ChartDisplay;