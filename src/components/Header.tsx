import React from 'react';
import { LineChart } from 'lucide-react';

/**
 * Header component for the application.
 * Displays the application title and a logo.
 */
const Header: React.FC = () => {
  return (
    <header className="bg-blue-900 text-white p-4 shadow-md">
      <div className="container mx-auto flex items-center">
        <LineChart className="h-8 w-8 mr-3 text-blue-300" />
        <h1 className="text-2xl font-bold">Financial Performance Analyzer</h1>
      </div>
    </header>
  );
};

export default Header;