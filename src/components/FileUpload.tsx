import React, { useRef, useState } from 'react';
import { Upload, FileText, CheckCircle, XCircle } from 'lucide-react';
import { read, utils } from 'xlsx';
import { DataPoint } from '../types';

interface FileUploadProps {
  onDataUpload: (data: DataPoint[]) => void;
}

/**
 * FileUpload component for handling Excel file uploads.
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onDataUpload - Callback function for when data is successfully uploaded
 */
const FileUpload: React.FC<FileUploadProps> = ({ onDataUpload }) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Process the uploaded Excel file and extract date and value columns.
   * 
   * @param {File} file - The uploaded Excel file
   */
  const processExcelFile = async (file: File) => {
    try {
      setError(null);
      setSuccess(false);
      
      // Read the file as an array buffer
      const buffer = await file.arrayBuffer();
      
      // Parse the Excel file
      const workbook = read(buffer, { type: 'array' });
      
      // Get the first worksheet
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      
      // Convert to JSON
      const jsonData = utils.sheet_to_json<any>(worksheet, { header: 'A' });
      
      // Check if the data has the correct format (at least two columns: date and value)
      if (jsonData.length < 2) {
        throw new Error('The Excel file does not contain enough data');
      }
      
      // Extract column headers (first row)
      const headers = jsonData[0];
      
      // Get column names
      const dateColumn = 'A';
      const valueColumn = 'B';
      
      // Validate data
      if (!headers[dateColumn] || !headers[valueColumn]) {
        throw new Error('The Excel file must have date in column A and values in column B');
      }

      // Process data (skip header row)
      const processedData: DataPoint[] = [];
      
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        
        // Skip row if it doesn't have date or value
        if (!row[dateColumn] || !row[valueColumn]) {
          continue;
        }
        
        // Parse date (handle different date formats)
        let date: Date;
        
        // Excel number dates
        if (typeof row[dateColumn] === 'number') {
          // Convert Excel date number to JavaScript Date
          date = new Date(Math.round((row[dateColumn] - 25569) * 86400 * 1000));
        } else {
          // Try to parse as regular date
          date = new Date(row[dateColumn]);
        }
        
        // Skip if date is invalid
        if (isNaN(date.getTime())) {
          continue;
        }
        
        // Parse value
        const value = Number(row[valueColumn]);
        
        // Skip if value is not a number
        if (isNaN(value)) {
          continue;
        }
        
        processedData.push({ date, value });
      }
      
      // Sort by date (ascending)
      processedData.sort((a, b) => a.date.getTime() - b.date.getTime());
      
      // Check if we have enough data
      if (processedData.length < 2) {
        throw new Error('The Excel file does not contain enough valid data points');
      }
      
      // Success
      setSuccess(true);
      setFileName(file.name);
      
      // Call the callback with processed data
      onDataUpload(processedData);
      
    } catch (err) {
      console.error('Error processing Excel file:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setSuccess(false);
    }
  };

  /**
   * Handle file selection from the file input
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    
    if (files && files.length > 0) {
      processExcelFile(files[0]);
    }
  };

  /**
   * Handle click on the upload area to open file dialog
   */
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  /**
   * Handle drag over event
   */
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  /**
   * Handle drag leave event
   */
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  /**
   * Handle drop event
   */
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    
    if (files && files.length > 0) {
      processExcelFile(files[0]);
    }
  };

  return (
    <div className="w-full">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".xlsx,.xls,.csv"
        className="hidden"
      />
      
      {/* Upload area */}
      <div
        onClick={handleUploadClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-200 ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        }`}
      >
        <div className="flex flex-col items-center justify-center space-y-3">
          <Upload className="h-12 w-12 text-blue-500 mb-2" />
          
          <h3 className="text-lg font-medium text-gray-800">
            {success ? 'Upload a different file' : 'Upload your Excel file'}
          </h3>
          
          <p className="text-sm text-gray-500">
            Drag and drop your file here, or click to select
          </p>
          
          <p className="text-xs text-gray-400">
            Supported formats: .xlsx, .xls, .csv
          </p>
        </div>
      </div>
      
      {/* File information */}
      {fileName && (
        <div className="mt-4 flex items-center">
          <FileText className="h-5 w-5 text-gray-500 mr-2" />
          <span className="text-sm text-gray-700">{fileName}</span>
          {success && <CheckCircle className="h-5 w-5 text-green-500 ml-2" />}
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <XCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;