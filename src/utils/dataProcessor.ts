import { DataPoint, Period, ProcessedData, CustomPeriod } from '../types';
import { calculateYearFrac, calculateStartDate, findClosestDate } from './dateUtils';

/**
 * Process the data based on the selected period.
 * 
 * This is the core function that handles all financial calculations and data filtering.
 * It takes the user's full dataset and their selected time period, then:
 * 
 * 1. Filters the data to show only the relevant time period
 * 2. Finds the closest actual dates in the data to the target period
 * 3. Calculates the appropriate return (simple or annualized)
 * 4. Prepares everything for display in the UI
 * 
 * Financial Context:
 * - "Return" = How much money you made or lost on an investment
 * - Simple return = Just the percentage change over the period
 * - Annualized return (CAGR) = What the yearly growth rate would be if it was consistent
 * 
 * Example: If you invested $1000 and it became $1200 over 2 years:
 * - Simple return = (1200/1000) - 1 = 20%
 * - Annualized return = (1200/1000)^(1/2) - 1 = 9.54% per year
 * 
 * @param {DataPoint[]} data - The full dataset from the uploaded Excel file
 * @param {Period} selectedPeriod - The time period selected by the user
 * @param {CustomPeriod} customPeriod - Custom date range for "custom" period selection
 * @returns {ProcessedData} - The processed data including filtered data points and calculations
 */
export function processData(
  data: DataPoint[], 
  selectedPeriod: Period,
  customPeriod?: CustomPeriod
): ProcessedData {
  // Default return value if data is empty or invalid
  if (!data || data.length === 0) {
    return {
      filteredData: [],
      startDate: null,
      endDate: null,
      startValue: null,
      endValue: null,
      returnValue: null,
      isAnnualized: false,
      inceptionStartDate: null,
      inceptionStartValue: null,
    };
  }

  // Step 1: Sort the data by date (oldest to newest)
  // This ensures we can reliably find start and end points
  const sortedData = [...data].sort((a, b) => a.date.getTime() - b.date.getTime());
  
  // Step 2: Find the latest date that's not in the future
  // We don't want to use future dates in our calculations
  const today = new Date();
  const latestData = [...sortedData].reverse().find(item => item.date <= today);
  
  // If we couldn't find a valid latest date, return empty result
  if (!latestData) {
    return {
      filteredData: [],
      startDate: null,
      endDate: null,
      startValue: null,
      endValue: null,
      returnValue: null,
      isAnnualized: false,
      inceptionStartDate: null,
      inceptionStartValue: null,
    };
  }
  
  // Step 3: Determine the target date range based on user selection
  let endDate: Date;
  let targetStartDate: Date;
  
  if (selectedPeriod === 'custom' && customPeriod) {
    // For custom period, use the exact dates the user selected
    endDate = customPeriod.endDate;
    targetStartDate = customPeriod.startDate;
  } else {
    // For predefined periods (1y, 3y, etc.), calculate the start date
    endDate = latestData.date;
    
    if (selectedPeriod === 'si') {
      // "Since inception" means from the very first data point
      targetStartDate = sortedData[0].date;
    } else {
      // Calculate start date based on the selected period
      // e.g., for "1y", go back 1 year from the end date
      targetStartDate = calculateStartDate(selectedPeriod, endDate);
    }
  }
  
  // Step 4: Find the closest actual dates in our data
  // The user might select "1 year ago" but we need to find the closest actual data point
  const allDates = sortedData.map(item => item.date);
  const closestStartDate = findClosestDate(targetStartDate, allDates);
  const closestEndDate = findClosestDate(endDate, allDates);
  
  // If we couldn't find valid dates, return empty result
  if (!closestStartDate || !closestEndDate) {
    return {
      filteredData: [],
      startDate: null,
      endDate: null,
      startValue: null,
      endValue: null,
      returnValue: null,
      isAnnualized: false,
      inceptionStartDate: null,
      inceptionStartValue: null,
    };
  }
  
  // Step 5: Filter data to include only points between start and end dates
  // This gives us the data points that will be shown on the chart
  const filteredData = sortedData.filter(
    item => item.date >= closestStartDate && item.date <= closestEndDate
  );
  
  // Step 6: Get the start and end values for return calculation
  const startDataPoint = filteredData[0];
  const endDataPoint = filteredData[filteredData.length - 1];
  const startValue = startDataPoint.value;
  const endValue = endDataPoint.value;
  
  // Step 7: Determine whether to use simple or annualized return
  // Short periods (< 1 year) typically use simple returns
  // Longer periods use annualized returns (CAGR) for better comparison
  const isAnnualized = selectedPeriod === 'custom' 
    ? calculateYearFrac(closestStartDate, closestEndDate) >= 1
    : ['1y', '3y', '5y', '10y', '15y', '20y', 'si'].includes(selectedPeriod);
  
  // Step 8: Calculate the return
  let returnValue: number;
  
  if (isAnnualized) {
    // Calculate annualized return (CAGR - Compound Annual Growth Rate)
    // This tells us what the yearly growth rate would be if it was consistent
    
    // First, calculate the exact number of years using Excel's YEARFRAC method
    // This accounts for leap years and gives us precise fractional years
    const years = calculateYearFrac(closestStartDate, closestEndDate);
    
    // Only annualize if the period is at least 1 month
    // Very short periods don't benefit from annualization
    if (years >= 1/12) {
      // CAGR formula: (End Value / Start Value)^(1/years) - 1
      // Example: $1000 becomes $1200 over 2 years
      // CAGR = (1200/1000)^(1/2) - 1 = 1.2^0.5 - 1 = 0.0954 = 9.54% per year
      returnValue = Math.pow(endValue / startValue, 1 / years) - 1;
    } else {
      // For very short periods, use simple return instead
      returnValue = (endValue / startValue) - 1;
    }
  } else {
    // Simple period return for shorter periods
    // Formula: (End Value / Start Value) - 1
    // Example: $1000 becomes $1100 = (1100/1000) - 1 = 0.1 = 10%
    returnValue = (endValue / startValue) - 1;
  }
  
  // Step 9: Calculate inception data once for efficient chart processing
  const inceptionStartDate = sortedData[0].date;
  const inceptionStartValue = sortedData[0].value;

  // Step 10: Return all the processed data
  return {
    filteredData,      // Data points for the selected period (for the chart)
    startDate: closestStartDate,  // Actual start date found in data
    endDate: closestEndDate,      // Actual end date found in data
    startValue,        // Investment value at start date
    endValue,          // Investment value at end date
    returnValue,       // Calculated return (simple or annualized)
    isAnnualized,      // Whether the return is annualized
    inceptionStartDate, // Very first date in dataset (for chart calculations)
    inceptionStartValue, // Very first value in dataset (for chart calculations)
  };
}