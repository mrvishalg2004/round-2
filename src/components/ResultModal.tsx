import React, { useEffect, useState } from 'react';

interface ResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: {
    success: boolean;
    message: string;
    qualified: boolean;
    secretLink?: string;
  } | null;
}

const ResultModal: React.FC<ResultModalProps> = ({ isOpen, onClose, result }) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const teamName = localStorage.getItem('teamName') || 'Your Team';

  useEffect(() => {
    if (isOpen && result?.success) {
      setShowConfetti(true);
    } else {
      setShowConfetti(false);
    }
  }, [isOpen, result]);

  if (!isOpen || !result) return null;

  const isCorrect = result.success === true;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      {showConfetti && (
        <div className="fixed inset-0 z-10 pointer-events-none">
          {/* Confetti elements */}
          {[...Array(50)].map((_, i) => {
            const randomLeft = Math.random() * 100;
            const randomSize = Math.random() * 1 + 0.5;
            const randomDelay = Math.random() * 2;
            const randomDuration = Math.random() * 3 + 2;
            const colors = ['bg-yellow-500', 'bg-green-500', 'bg-blue-500', 'bg-red-500', 'bg-purple-500', 'bg-pink-500'];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            
            return (
              <div 
                key={i}
                className={`absolute top-0 ${randomColor} rounded-full`}
                style={{
                  left: `${randomLeft}%`,
                  width: `${randomSize}rem`,
                  height: `${randomSize}rem`,
                  animation: `confetti ${randomDuration}s ease-out ${randomDelay}s forwards`,
                }}
              />
            );
          })}
        </div>
      )}
      
      <style jsx global>{`
        @keyframes confetti {
          0% {
            transform: translateY(-10px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
      
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden z-20 relative">
        {isCorrect && (
          <div className="absolute -top-4 -right-4 w-24 h-24">
            <svg className="w-full h-full text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
          </div>
        )}
        
        <div className={`p-6 ${isCorrect ? 'bg-gradient-to-r from-green-500 to-teal-500' : 'bg-red-500'}`}>
          <h3 className="text-2xl font-bold text-white text-center">
            {isCorrect ? '🎉 Correct Answer! 🎉' : 'Incorrect Answer'}
          </h3>
        </div>
        
        <div className="p-6">
          {isCorrect && (
            <div className="mb-6 text-center">
              <div className="flex justify-center space-x-2 mb-4">
                <span className="text-3xl">🎊</span>
                <span className="text-3xl">🏆</span>
                <span className="text-3xl">🎊</span>
              </div>
              <h4 className="text-xl font-bold text-indigo-800 mb-2">
                Congratulations, {teamName}!
              </h4>
            </div>
          )}
          
          <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-5 ${
            isCorrect ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {isCorrect ? (
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
          
          <p className="text-center text-gray-700 mb-6 text-lg">
            {result.message}
          </p>
          
          {isCorrect && result.secretLink && (
            <div className="bg-indigo-50 border border-indigo-200 p-5 rounded-md mb-6 transform hover:scale-105 transition-transform">
              <div className="flex items-start">
                <svg className="w-6 h-6 text-indigo-600 mr-3 mt-0.5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-indigo-800 font-medium mb-2">
                    Congratulations! You've qualified for the next round.
                  </p>
                  <p className="text-indigo-600 text-sm mb-3">
                    Click the button below to proceed to the next stage:
                  </p>
                </div>
              </div>
              <a
                href={result.secretLink}
                className="block w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-md text-center font-medium hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
              >
                Proceed to Round 3 🚀
              </a>
            </div>
          )}
          
          <div className="flex justify-center">
            <button
              onClick={onClose}
              className={`px-6 py-3 rounded-md shadow-lg text-white font-medium transition-all ${
                isCorrect 
                ? 'bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700' 
                : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {isCorrect ? 'Continue to Game 👍' : 'Try Again'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultModal; 