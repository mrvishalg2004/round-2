import React, { useState } from 'react';
import axios from 'axios';

interface EnrollmentFormProps {
  onEnroll: (teamName: string, email: string) => void;
}

const EnrollmentForm: React.FC<EnrollmentFormProps> = ({ onEnroll }) => {
  const [teamName, setTeamName] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!teamName || !email) {
      setError('Please enter both team name and email');
      return;
    }
    
    try {
      setSubmitting(true);
      setError('');
      
      // Submit enrollment to API
      const response = await axios.post('/api/enroll', {
        teamName,
        email
      });
      
      // Call the onEnroll callback to update parent component
      onEnroll(teamName, email);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg max-w-md mx-auto overflow-hidden">
      <div className="bg-indigo-600 p-6 rounded-t-lg">
        <h1 className="text-2xl font-bold text-white mb-2">Team Enrollment</h1>
        <p className="text-white text-base">Enter your team details to join the challenge</p>
      </div>
      
      <div className="p-6">
        <div className="mb-6">
          <div className="bg-blue-50 p-4 rounded-lg mb-6 border-l-4 border-blue-500">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-blue-600 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-blue-800 font-medium">
                  You need to enroll your team before you can participate in the challenge.
                </p>
              </div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="teamName" className="block text-base font-semibold text-gray-800 mb-2">Team Name</label>
              <input
                id="teamName"
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="mt-1 block w-full px-4 py-3 border border-gray-300 text-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
                placeholder="Enter your team name"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-base font-semibold text-gray-800 mb-2">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-4 py-3 border border-gray-300 text-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
                placeholder="Enter your email"
              />
              <p className="mt-2 text-sm font-medium text-gray-600">This will be used to identify your team for the competition.</p>
            </div>
            
            {error && (
              <div className="text-red-700 font-medium p-3 bg-red-50 rounded-md border border-red-200 mt-4">
                {error}
              </div>
            )}
            
            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white ${
                submitting 
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              }`}
            >
              {submitting ? 'Enrolling...' : 'Enroll Team'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentForm; 