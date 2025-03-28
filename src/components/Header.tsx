import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-indigo-600 to-purple-600 py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center">
            <svg 
              className="w-8 h-8 text-white mr-3" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" 
              />
            </svg>
            <div>
              <h1 className="text-white text-2xl md:text-3xl font-bold">koddle Round</h1>
              <p className="text-indigo-200 text-sm md:text-base">Check your thiking</p>
            </div>
          </div>
          
          <div className="mt-4 md:mt-0">
            <div className="bg-white px-5 py-2 rounded-lg shadow-md">
              <span className="text-indigo-700 font-bold text-lg">Round 2</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 