// Data point representing a single date-value pair from Excel
export interface DataPoint {
  date: Date;
  value: number;
}

// Processed data after period selection and calculations
export interface ProcessedData {
  filteredData: DataPoint[];
  startDate: Date | null;
  endDate: Date | null;
  startValue: number | null;
  endValue: number | null;
  returnValue: number | null;
  isAnnualized: boolean;
  // Inception data for efficient chart calculations
  inceptionStartDate: Date | null;
  inceptionStartValue: number | null;
}

// Available period options
export type Period = 
  | '1m'    // 1 month
  | '3m'    // 3 months
  | 'ytd'   // Year to date
  | '1y'    // 1 year
  | '3y'    // 3 years
  | '5y'    // 5 years
  | '10y'   // 10 years
  | '15y'   // 15 years
  | '20y'   // 20 years
  | 'si'    // Since inception
  | 'custom'; // Custom period

// Custom period selection
export interface CustomPeriod {
  startDate: Date;
  endDate: Date;
}