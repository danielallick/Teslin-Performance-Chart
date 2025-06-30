/**
 * Calculate the difference in years between two dates using Excel's YEARFRAC
 * calculation method (basis 0 - US 30/360).
 * 
 * This matches Excel's default YEARFRAC() function exactly for accurate CAGR calculations.
 * 
 * @param {Date} startDate - The start date
 * @param {Date} endDate - The end date
 * @returns {number} - The fractional year difference
 */
export function calculateYearFrac(startDate: Date, endDate: Date): number {
  // Make sure the dates are in the right order
  if (startDate > endDate) {
    [startDate, endDate] = [endDate, startDate];
  }
  
  // Extract date components
  let startYear = startDate.getFullYear();
  let startMonth = startDate.getMonth() + 1; // 1-12
  let startDay = startDate.getDate();
  
  let endYear = endDate.getFullYear();
  let endMonth = endDate.getMonth() + 1; // 1-12
  let endDay = endDate.getDate();
  
  // Apply 30/360 US NASD adjustments
  if (startDay === 31) {
    startDay = 30;
  }
  
  if (endDay === 31 && startDay >= 30) {
    endDay = 30;
  }
  
  // Calculate days using 30/360 convention
  // Each month = 30 days, each year = 360 days
  const days = ((endYear - startYear) * 360) + ((endMonth - startMonth) * 30) + (endDay - startDay);
  
  return days / 360;
}




/**
 * Find the date closest to target date in the array of data points.
 * 
 * @param {Date} targetDate - The target date to find
 * @param {Array} dates - Array of dates to search in
 * @returns {Date} - The closest date found
 */
export function findClosestDate(targetDate: Date, dates: Date[]): Date | null {
  if (!dates || dates.length === 0) {
    return null;
  }
  
  // Initialize with the first date and its difference
  let closestDate = dates[0];
  let minDifference = Math.abs(dates[0].getTime() - targetDate.getTime());
  
  // Find the date with the minimum difference
  for (let i = 1; i < dates.length; i++) {
    const currentDate = dates[i];
    const difference = Math.abs(currentDate.getTime() - targetDate.getTime());
    
    if (difference < minDifference) {
      minDifference = difference;
      closestDate = currentDate;
    }
  }
  
  return closestDate;
}

/**
 * Calculate the start date based on the selected period and the end date.
 * 
 * @param {string} period - The selected period
 * @param {Date} endDate - The end date
 * @returns {Date} - The calculated start date
 */
export function calculateStartDate(period: string, endDate: Date): Date {
  const startDate = new Date(endDate);
  
  switch (period) {
    case '1m': // 1 month
      startDate.setMonth(endDate.getMonth() - 1);
      break;
    case '3m': // 3 months
      startDate.setMonth(endDate.getMonth() - 3);
      break;
    case 'ytd': // Year to date
      startDate.setMonth(0); // January
      startDate.setDate(1); // 1st day
      break;
    case '1y': // 1 year
      startDate.setFullYear(endDate.getFullYear() - 1);
      break;
    case '3y': // 3 years
      startDate.setFullYear(endDate.getFullYear() - 3);
      break;
    case '5y': // 5 years
      startDate.setFullYear(endDate.getFullYear() - 5);
      break;
    case '10y': // 10 years
      startDate.setFullYear(endDate.getFullYear() - 10);
      break;
    case '15y': // 15 years
      startDate.setFullYear(endDate.getFullYear() - 15);
      break;
    case '20y': // 20 years
      startDate.setFullYear(endDate.getFullYear() - 20);
      break;
    default:
      // For "since inception" or invalid periods, return null (will be handled later)
      return new Date(0); // Earliest possible date
  }
  
  return startDate;
}