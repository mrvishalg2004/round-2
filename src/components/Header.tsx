import React from 'react';

interface HeaderProps {
  teamName?: string;
  isGameActive: boolean;
  tabSwitchCount?: number;
  isFullScreen?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  teamName, 
  isGameActive,
  tabSwitchCount = 0,
  isFullScreen = false
}) => {
  return (
    <div className="bg-gradient-to-r from-indigo-600 to-blue-600 py-5 px-4 sticky top-0 z-10">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <div className="text-white font-bold text-2xl">
            Code Rush
          </div>
          {teamName && (
            <div className="bg-white text-indigo-700 px-3 py-1 rounded-full text-sm font-bold ml-3">
              {teamName}
            </div>
          )}
        </div>
        
        <div className="flex items-center">
          {isGameActive && (
            <div className="flex space-x-4 mr-4">
              <div className={`text-white text-sm flex items-center px-3 py-1 rounded-full font-medium ${
                tabSwitchCount >= 1 ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'
              }`}>
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
                Tab Switches: {tabSwitchCount}/2
              </div>
              
              <div className={`text-white text-sm flex items-center px-3 py-1 rounded-full font-medium ${
                isFullScreen ? 'bg-green-500' : 'bg-red-500 animate-pulse'
              }`}>
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
                {isFullScreen ? 'Fullscreen: On' : 'Fullscreen: Off'}
              </div>
            </div>
          )}
          
          <div className={`px-3 py-1 rounded-full text-white text-sm font-bold ${
            isGameActive ? 'bg-green-500' : 'bg-red-500'
          }`}>
            Game {isGameActive ? 'Active' : 'Inactive'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header; 