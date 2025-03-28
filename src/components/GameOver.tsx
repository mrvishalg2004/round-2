import React from 'react';

interface GameOverProps {
  timeExpired?: boolean;
}

const GameOver: React.FC<GameOverProps> = ({ timeExpired = false }) => {
  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-8 text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 mb-6 rounded-full bg-red-100">
          <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Game Over!</h1>
        
        <p className="text-xl text-gray-600 mb-8">
          {timeExpired 
            ? "Time's up! The game has finished." 
            : "The game has ended."}
        </p>
        
        <p className="text-gray-600 mb-8">
          If you qualified, you can proceed to the next round using the link provided.
        </p>
        
        <div className="flex flex-col md:flex-row justify-center gap-4">
          <a
            href="/"
            className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Return to Home
          </a>
        </div>
      </div>
    </div>
  );
};

export default GameOver; 