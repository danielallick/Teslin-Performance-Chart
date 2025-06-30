/**
 * Format a date to a readable string.
 * 
 * @param {Date} date - The date to format
 * @returns {string} - Formatted date string
 */
export const formatDate = (date: Date): string => {
  // Format as: Jan 1, 2023
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Format a numeric value to a readable string with proper comma separators.
 * Uses the format #,###.## (e.g., 1,234.56) without abbreviations.
 * 
 * @param {number} value - The value to format
 * @returns {string} - Formatted value string
 */
export const formatValue = (value: number): string => {
  // Use toLocaleString to add comma separators and limit to 2 decimal places
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

/**
 * Format a return value as a percentage.
 * 
 * @param {number} value - The return value (as a decimal)
 * @returns {string} - Formatted percentage string
 */
export const formatReturn = (value: number): string => {
  // Convert to percentage and format with sign
  const percentage = value * 100;
  const sign = percentage >= 0 ? '+' : '';
  return `${sign}${percentage.toFixed(2)}%`;
};