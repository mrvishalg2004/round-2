'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface Problem {
  _id: string;
  title: string;
  description: string;
  quote: string;
  expectedAnswer: string;
  difficulty: string;
  timeLimit: number;
  active: boolean;
}

export default function QuestionsPage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [quote, setQuote] = useState('');
  const [expectedAnswer, setExpectedAnswer] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [timeLimit, setTimeLimit] = useState(180);

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/problems');
      setProblems(Array.isArray(response.data) ? response.data : []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching problems:', err);
      setError('Failed to fetch problems');
      setLoading(false);
      setProblems([]); // Set to empty array in case of error
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setMessage(null);
      setError(null);
      
      const response = await axios.post('/api/problems', {
        title,
        description,
        quote,
        expectedAnswer,
        difficulty,
        timeLimit
      });
      
      if (response.status === 201) {
        setMessage('Problem created successfully');
        clearForm();
        fetchProblems();
      }
    } catch (err) {
      console.error('Error creating problem:', err);
      setError('Failed to create problem');
    }
  };

  const handleActivate = async (id: string) => {
    try {
      setMessage(null);
      setError(null);
      
      const response = await axios.put(`/api/problems/${id}/activate`);
      
      if (response.status === 200) {
        setMessage('Problem activated successfully');
        fetchProblems();
      }
    } catch (err) {
      console.error('Error activating problem:', err);
      setError('Failed to activate problem');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this problem?')) return;
    
    try {
      setMessage(null);
      setError(null);
      
      const response = await axios.delete(`/api/problems/${id}`);
      
      if (response.status === 200) {
        setMessage('Problem deleted successfully');
        fetchProblems();
      }
    } catch (err) {
      console.error('Error deleting problem:', err);
      setError('Failed to delete problem');
    }
  };

  const handleSeedQuestions = async () => {
    if (!confirm('This will delete all existing problems and create new ones. Continue?')) return;
    
    try {
      setMessage(null);
      setError(null);
      setLoading(true);
      
      const response = await axios.post('/api/admin/seed-questions');
      
      if (response.status === 200) {
        setMessage(response.data.message);
        fetchProblems();
      }
    } catch (err) {
      console.error('Error seeding questions:', err);
      setError('Failed to seed questions');
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setTitle('');
    setDescription('');
    setQuote('');
    setExpectedAnswer('');
    setDifficulty('medium');
    setTimeLimit(180);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Manage Questions</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => router.push('/admin')}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Back to Admin
            </button>
            <button
              onClick={handleSeedQuestions}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Seed Questions
            </button>
          </div>
        </div>
        
        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {message}
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Add New Question</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                required
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description (Riddle)</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                required
              />
            </div>
            
            <div>
              <label htmlFor="quote" className="block text-sm font-medium text-gray-700">Quote</label>
              <input
                type="text"
                id="quote"
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                required
              />
            </div>
            
            <div>
              <label htmlFor="expectedAnswer" className="block text-sm font-medium text-gray-700">Expected Answer</label>
              <input
                type="text"
                id="expectedAnswer"
                value={expectedAnswer}
                onChange={(e) => setExpectedAnswer(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700">Difficulty</label>
                <select
                  id="difficulty"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="timeLimit" className="block text-sm font-medium text-gray-700">Time Limit (seconds)</label>
                <input
                  type="number"
                  id="timeLimit"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                  min="30"
                  max="600"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                  required
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Add Question
              </button>
            </div>
          </form>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-indigo-50">
            <h2 className="text-xl font-bold">Questions List</h2>
          </div>
          
          {problems.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-600">No questions available.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Answer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Difficulty
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Array.isArray(problems) && problems.map((problem) => (
                    <tr key={problem._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{problem.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{problem.expectedAnswer}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          problem.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                          problem.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {problem.difficulty.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          problem.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {problem.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {!problem.active && (
                            <button
                              onClick={() => handleActivate(problem._id)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Activate
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(problem._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 