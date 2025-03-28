'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface Assignment {
  teamName: string;
  problemTitle: string;
  problemId: string;
  difficulty: string;
}

interface Problem {
  _id: string;
  title: string;
  difficulty: string;
}

interface Team {
  _id: string;
  teamName: string;
}

export default function AssignProblemsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [selectedProblem, setSelectedProblem] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch assignments, problems, and teams in parallel
      const [assignmentsRes, problemsRes, teamsRes] = await Promise.all([
        axios.get('/api/problems/assign'),
        axios.get('/api/problems/all'),
        axios.get('/api/enroll')
      ]);
      
      setAssignments(assignmentsRes.data.assignments || []);
      setProblems(problemsRes.data || []);
      setTeams(teamsRes.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch data');
      setLoading(false);
    }
  };

  const handleAssignProblems = async () => {
    if (!confirm('This will randomly assign problems to teams. Continue?')) return;
    
    try {
      setMessage(null);
      setError(null);
      setLoading(true);
      
      const response = await axios.post('/api/problems/assign');
      
      if (response.status === 200) {
        setMessage(response.data.message);
        fetchData();
      }
    } catch (err) {
      console.error('Error assigning problems:', err);
      setError('Failed to assign problems to teams');
    } finally {
      setLoading(false);
    }
  };

  const handleSingleAssignment = async () => {
    if (!selectedTeam || !selectedProblem) {
      setError('Please select both a team and a problem');
      return;
    }
    
    try {
      setMessage(null);
      setError(null);
      setLoading(true);
      
      const response = await axios.post('/api/problems/assign/single', {
        teamId: selectedTeam,
        problemId: selectedProblem
      });
      
      if (response.status === 200) {
        setMessage(`Problem successfully assigned to team`);
        fetchData();
        // Reset selections
        setSelectedTeam('');
        setSelectedProblem('');
      }
    } catch (err) {
      console.error('Error assigning problem to team:', err);
      setError('Failed to assign problem to team');
    } finally {
      setLoading(false);
    }
  };

  // Get team name by ID
  const getTeamName = (teamId: string) => {
    const team = teams.find(t => t._id === teamId);
    return team ? team.teamName : 'Unknown Team';
  };
  
  // Get problem title by ID
  const getProblemTitle = (problemId: string) => {
    const problem = problems.find(p => p._id === problemId);
    return problem ? problem.title : 'Unknown Problem';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Assign Problems to Teams</h1>
          <div className="flex space-x-4">
            <button
              onClick={() => router.push('/admin')}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Back to Admin
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
            <p>{error}</p>
          </div>
        )}

        {message && (
          <div className="mb-6 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md">
            <p>{message}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-6 bg-indigo-50 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Automatic Assignment</h2>
              <p className="mt-1 text-gray-600">
                This system automatically assigns a random problem to each team during enrollment,
                and lets you shuffle all assignments at once.
              </p>
            </div>
            <div className="p-6">
              <div className="flex space-x-4">
                <button
                  onClick={handleAssignProblems}
                  disabled={loading}
                  className={`px-4 py-2 ${loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'} text-white rounded-md transition-colors`}
                >
                  {loading ? 'Working...' : 'Shuffle All Assignments'}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-6 bg-indigo-50 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Manual Assignment</h2>
              <p className="mt-1 text-gray-600">
                Assign a specific problem to a specific team.
              </p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Team
                  </label>
                  <select
                    value={selectedTeam}
                    onChange={(e) => setSelectedTeam(e.target.value)}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">-- Select a Team --</option>
                    {teams.map(team => (
                      <option key={team._id} value={team._id}>
                        {team.teamName}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Problem
                  </label>
                  <select
                    value={selectedProblem}
                    onChange={(e) => setSelectedProblem(e.target.value)}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">-- Select a Problem --</option>
                    {problems.map(problem => (
                      <option key={problem._id} value={problem._id}>
                        {problem.title} ({problem.difficulty.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>
                
                <button
                  onClick={handleSingleAssignment}
                  disabled={loading || !selectedTeam || !selectedProblem}
                  className={`px-4 py-2 ${
                    loading || !selectedTeam || !selectedProblem 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-green-600 hover:bg-green-700'
                  } text-white rounded-md transition-colors`}
                >
                  Assign Problem to Team
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-indigo-50 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Current Assignments</h2>
          </div>
          
          {loading ? (
            <div className="p-6 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="mt-2 text-gray-600">Loading assignments...</p>
            </div>
          ) : assignments.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-600">No assignments available. Teams will be automatically assigned problems when they enroll.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Team Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned Problem
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Difficulty
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {assignments.map((assignment, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {assignment.teamName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {assignment.problemTitle}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          assignment.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                          assignment.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {assignment.difficulty?.toUpperCase()}
                        </span>
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