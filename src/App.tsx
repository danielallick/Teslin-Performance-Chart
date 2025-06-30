import React, { useState } from 'react';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import PeriodSelector from './components/PeriodSelector';
import ResultsDisplay from './components/ResultsDisplay';
import ChartDisplay from './components/ChartDisplay';
import { DataPoint, ProcessedData, Period, CustomPeriod } from './types';
import { processData } from './utils/dataProcessor';
import { useDataProcessor } from './hooks/useDataProcessor';

function App() {
  // State for the uploaded data
  const [data, setData] = useState<DataPoint[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('1y');
  const [customPeriod, setCustomPeriod] = useState<CustomPeriod>({
    startDate: new Date(),
    endDate: new Date()
  });
  
  // Process data based on the selected period
  const {
    processedData,
    startDate,
    endDate,
    startValue,
    endValue,
    returnValue,
    isAnnualized
  } = useDataProcessor(data, selectedPeriod, customPeriod);

  // Handle data upload
  const handleDataUpload = (uploadedData: DataPoint[]) => {
    setData(uploadedData);
    // Initialize custom period with first and last dates from data
    if (uploadedData.length > 0) {
      setCustomPeriod({
        startDate: uploadedData[0].date,
        endDate: uploadedData[uploadedData.length - 1].date
      });
    }
  };

  // Handle period change
  const handlePeriodChange = (period: Period) => {
    setSelectedPeriod(period);
  };

  // Handle custom period change
  const handleCustomPeriodChange = (period: CustomPeriod) => {
    setCustomPeriod(period);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8">
          {/* File Upload Section */}
          <section className="bg-white rounded-lg shadow-md p-6 transition-all duration-300">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload Data</h2>
            <FileUpload onDataUpload={handleDataUpload} />
          </section>

          {/* Period Selector and Results Section (only visible when data is loaded) */}
          {data.length > 0 && (
            <>
              <section className="bg-white rounded-lg shadow-md p-6 transition-all duration-300">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Select Period</h2>
                <PeriodSelector 
                  selectedPeriod={selectedPeriod} 
                  onPeriodChange={handlePeriodChange}
                  customPeriod={customPeriod}
                  onCustomPeriodChange={handleCustomPeriodChange}
                  data={data}
                />
              </section>

              <section className="bg-white rounded-lg shadow-md p-6 transition-all duration-300">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Results</h2>
                <ResultsDisplay 
                  startDate={startDate}
                  endDate={endDate}
                  startValue={startValue}
                  endValue={endValue}
                  returnValue={returnValue}
                  isAnnualized={isAnnualized}
                />
              </section>

              <section className="bg-white rounded-lg shadow-md p-6 transition-all duration-300">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Performance Chart</h2>
                <ChartDisplay 
                  data={processedData} 
                  fullDataset={data}
                />
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;