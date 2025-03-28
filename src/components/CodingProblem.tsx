import React, { useState } from 'react';
import axios from 'axios';

interface Problem {
  _id: string;
  title: string;
  description: string;
  quote: string;
  difficulty: string;
  timeLimit: number;
}

interface CodingProblemProps {
  problem: Problem;
  onSubmissionComplete: (result: any) => void;
  teamName: string;
}

const CodingProblem: React.FC<CodingProblemProps> = ({ problem, onSubmissionComplete, teamName }) => {
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>('');
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!answer.trim()) {
      setError('Please enter your answer');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      console.log('Submitting answer:', { teamName, answer: answer.trim() });
      
      const response = await axios.post('/api/submissions', {
        teamName: teamName,
        answer: answer.trim()
      });
      
      console.log('Submission response:', response.data);
      
      setSubmitting(false);
      setAnswer('');
      setShowForm(false);
      onSubmissionComplete(response.data);
    } catch (err: any) {
      console.error('Submission error:', err);
      setSubmitting(false);
      
      // Check for specific error messages
      const errorMessage = err.response?.data?.error || 'Failed to submit answer. Please try again.';
      setError(errorMessage);
      
      if (errorMessage === 'Game is not active') {
        setError('The game is not currently active. Please wait for the admin to start the game.');
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg max-w-2xl mx-auto">
      <div className="bg-indigo-600 p-6 rounded-t-lg">
        <h1 className="text-3xl font-bold text-white mb-2">{problem.title}</h1>
        <div className="flex items-center justify-between mb-2">
          <span className="text-white font-medium">Team: {teamName}</span>
        </div>
      </div>
      
      <div className="px-6 py-8">
        <div className="bg-indigo-50 p-5 rounded-lg border-l-4 border-indigo-500 mb-6">
          <div className="italic text-gray-700 text-lg mb-2">
            "{problem.quote}"
          </div>
          <div className="text-right text-sm text-gray-500">- Anonymous</div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
          <h3 className="text-xl font-semibold mb-4 text-indigo-700 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Riddle
          </h3>
          <p className="text-lg text-gray-800 leading-relaxed">{problem.description}</p>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="font-medium text-yellow-800 mb-1">Hint</h4>
              <p className="text-yellow-700 text-sm">Your answer should be the name of the technology (e.g., JavaScript, HTML, Git). One word answers are expected.</p>
            </div>
          </div>
        </div>
        
        {showForm ? (
          <form onSubmit={handleSubmit} className="space-y-4 border-t pt-6">
            <div>
              <label htmlFor="answer" className="block text-sm font-medium text-gray-700">Your Answer</label>
              <textarea
                id="answer"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
                placeholder="Enter your answer here..."
              />
            </div>
            
            {error && (
              <div className="text-red-600 text-sm p-2 bg-red-50 rounded-md border border-red-100">
                {error}
              </div>
            )}
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className={`flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  submitting 
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                }`}
              >
                {submitting ? 'Submitting...' : 'Submit Answer'}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center">
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              I Know the Answer
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodingProblem; 