import { useState, useEffect } from 'react';
import { DataPoint, Period, ProcessedData, CustomPeriod } from '../types';
import { processData } from '../utils/dataProcessor';

/**
 * Custom hook to process data based on the selected period.
 * 
 * This hook handles the complex logic of:
 * 1. Filtering data based on user-selected time periods
 * 2. Calculating financial returns (both simple and annualized)
 * 3. Preparing data for chart visualization
 * 
 * Financial Context:
 * - "Return" = How much an investment has grown or declined over time
 * - Simple return = (End Value / Start Value) - 1 (for short periods)
 * - Annualized return (CAGR) = (End Value / Start Value)^(1/years) - 1 (for longer periods)
 * 
 * @param {DataPoint[]} data - The full dataset uploaded by the user
 * @param {Period} selectedPeriod - The time period selected by the user (1y, 3y, custom, etc.)
 * @param {CustomPeriod} customPeriod - Custom date range when user selects "custom" period
 * @returns {ProcessedData & { processedData: DataPoint[] }} - The processed data and calculated results
 */
export function useDataProcessor(
  data: DataPoint[], 
  selectedPeriod: Period,
  customPeriod?: CustomPeriod
) {
  // State for the processed data
  // This will contain the filtered data points and all calculated financial metrics
  const [processedResult, setProcessedResult] = useState<ProcessedData>({
    filteredData: [],      // Data points within the selected time period
    startDate: null,       // Actual start date found in the data
    endDate: null,         // Actual end date found in the data
    startValue: null,      // Portfolio/investment value at start date
    endValue: null,        // Portfolio/investment value at end date
    returnValue: null,     // Calculated return (simple or annualized)
    isAnnualized: false,   // Whether the return is annualized (CAGR) or simple
    inceptionStartDate: null, // Very first date in dataset
    inceptionStartValue: null, // Very first value in dataset
  });

  // Process data whenever the input data or selected period changes
  // This is the main processing logic that runs automatically
  useEffect(() => {
    // Process the data using our utility function
    // This function handles all the complex date filtering and return calculations
    const result = processData(data, selectedPeriod, customPeriod);
    
    // Update our component state with the processed results
    setProcessedResult(result);
  }, [data, selectedPeriod, customPeriod]); // Dependencies: re-run when any of these change

  // Return the processed data in a format that components can easily use
  return {
    processedData: processedResult.filteredData,  // Data points for the chart
    startDate: processedResult.startDate,         // Start date for display
    endDate: processedResult.endDate,             // End date for display
    startValue: processedResult.startValue,       // Start value for display
    endValue: processedResult.endValue,           // End value for display
    returnValue: processedResult.returnValue,     // Calculated return for display
    isAnnualized: processedResult.isAnnualized,   // Whether return is annualized
    inceptionStartDate: processedResult.inceptionStartDate, // Inception date for charts
    inceptionStartValue: processedResult.inceptionStartValue, // Inception value for charts
  };
}