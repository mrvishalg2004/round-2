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
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number;
  active: boolean;
  createdAt: string;
}

interface EnrolledTeam {
  _id: string;
  teamName: string;
  email: string;
  isBlocked: boolean;
  qualified: boolean;
  win?: boolean;
  lose?: boolean;
}

interface GameState {
  active: boolean;
  startTime: string | null;
  endTime: string | null;
  duration: number;
  isPaused?: boolean;
  pausedTimeRemaining?: number;
}

export default function AdminPage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [enrolledTeams, setEnrolledTeams] = useState<EnrolledTeam[]>([]);
  const [gameState, setGameState] = useState<GameState>({ 
    active: false, 
    startTime: null,
    endTime: null,
    duration: 10 * 60 * 1000
  });
  const [timeRemaining, setTimeRemaining] = useState<string>('--:--');
  const router = useRouter();
  const [showProblemForm, setShowProblemForm] = useState(false);
  const [editingProblem, setEditingProblem] = useState<string | null>(null);
  const [problemForm, setProblemForm] = useState({
    title: '',
    description: '',
    expectedAnswer: '',
    active: true
  });

  // Admin password (in a real app, this would be handled securely via authentication)
  const ADMIN_PASSWORD = 'admin123';

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      fetchProblems();
      fetchEnrolledTeams();
      fetchGameState();
    } else {
      setError('Invalid password');
    }
  };

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/problems/all');
      setProblems(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching problems:', err);
      setError('Failed to fetch problems');
      setLoading(false);
    }
  };

  const fetchEnrolledTeams = async () => {
    try {
      const response = await axios.get('/api/enroll');
      setEnrolledTeams(response.data);
    } catch (err) {
      console.error('Error fetching enrolled teams:', err);
    }
  };

  const fetchGameState = async () => {
    try {
      const response = await axios.get('/api/game-state');
      setGameState(response.data);
    } catch (err) {
      console.error('Error fetching game state:', err);
    }
  };

  const toggleGameState = async () => {
    try {
      setMessage(null);
      setError(null);
      const newState = !gameState.active;
      
      // When starting the game, don't set an end time anymore
      const response = await axios.put('/api/game-state', {
        active: newState,
        // Only clear the end time if stopping the game
        endTime: newState ? gameState.endTime : null,
        // Maintain existing pause state, but include it explicitly for clarity
        isPaused: gameState.isPaused
      });
      
      if (response.status === 200) {
        setGameState(response.data);
        setMessage(`Game ${newState ? 'started' : 'stopped'} successfully`);
        
        // Emit socket event for real-time update
        try {
          await axios.post('/api/admin/notify', {
            event: 'gameStatusChange',
            data: { 
              active: newState,
              endTime: response.data.endTime,
              isPaused: response.data.isPaused,
              pausedTimeRemaining: response.data.pausedTimeRemaining
            }
          });
          console.log('Game status notification sent successfully');
        } catch (err) {
          console.error('Error emitting game status change:', err);
          // Don't show error to user, just log it
          console.log('Game state updated, but real-time updates to clients may be delayed');
        }
      }
    } catch (err: any) {
      console.error('Error toggling game state:', err);
      console.error('Error details:', err.response?.data);
      setError('Failed to update game state: ' + (err.response?.data?.error || err.message || 'Unknown error'));
    }
  };

  const startTimer = async () => {
    try {
      setMessage(null);
      setError(null);
      
      // Ensure we have a valid duration value
      const duration = gameState.duration || 10 * 60 * 1000; // Default to 10 minutes if invalid
      
      // Calculate end time as current time + duration
      const now = new Date();
      const endTime = new Date(now.getTime() + duration);
      
      console.log('Starting timer with:', {
        active: gameState.active,
        endTime: endTime.toISOString(),
        currentTime: now.toISOString(),
        duration: duration,
        isPaused: false
      });
      
      const response = await axios.put('/api/game-state', {
        active: gameState.active, // Keep current state
        endTime: endTime.toISOString(),
        isPaused: false, // Ensure timer is not paused when started
        pausedTimeRemaining: 0
      });
      
      if (response.status === 200) {
        setGameState(response.data);
        setMessage('Timer started successfully');
        
        // Emit socket event for real-time update
        try {
          await axios.post('/api/admin/notify', {
            event: 'gameStatusChange',
            data: { 
              active: response.data.active,
              endTime: response.data.endTime,
              isPaused: false,
              pausedTimeRemaining: 0
            }
          });
          console.log('Notification sent successfully');
        } catch (err) {
          console.error('Error emitting game status change:', err);
          // Don't show error to user, just log it - the timer still works
          console.log('Timer will still work, but real-time updates to clients may be delayed');
        }
      }
    } catch (err: any) {
      console.error('Error starting timer:', err);
      console.error('Error details:', err.response?.data);
      setError('Failed to start timer: ' + (err.response?.data?.error || err.message || 'Unknown error'));
    }
  };

  const activateProblem = async (id: string) => {
    try {
      setMessage(null);
      const response = await axios.put(`/api/problems/${id}/activate`);
      if (response.status === 200) {
        fetchProblems();
        setMessage('Problem activated successfully');
      }
    } catch (err) {
      console.error('Error activating problem:', err);
      setError('Failed to activate problem');
    }
  };

  const deactivateProblem = async (id: string) => {
    try {
      setMessage(null);
      const response = await axios.put(`/api/problems/${id}/deactivate`);
      if (response.status === 200) {
        fetchProblems();
        setMessage('Problem deactivated successfully');
      }
    } catch (err) {
      console.error('Error deactivating problem:', err);
      setError('Failed to deactivate problem');
    }
  };

  const deleteProblem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this problem?')) return;
    
    try {
      setMessage(null);
      const response = await axios.delete(`/api/problems/${id}`);
      if (response.status === 200) {
        fetchProblems();
        setMessage('Problem deleted successfully');
      }
    } catch (err) {
      console.error('Error deleting problem:', err);
      setError('Failed to delete problem');
    }
  };

  // Function to toggle problem active status
  const toggleProblemActive = async (problemId: string) => {
    try {
      setMessage(null);
      setError(null);
      
      // Find the problem to determine current active status
      const problem = problems.find(p => p._id === problemId);
      if (!problem) {
        setError('Problem not found');
        return;
      }
      
      // Determine which endpoint to call based on current status
      const endpoint = problem.active 
        ? `/api/problems/${problemId}/deactivate`
        : `/api/problems/${problemId}/activate`;
      
      const response = await axios.put(endpoint);
      
      if (response.status === 200) {
        setMessage(`Problem ${problem.active ? 'deactivated' : 'activated'} successfully`);
        // Refresh problem list
        fetchProblems();
      }
    } catch (err: any) {
      console.error('Error toggling problem status:', err);
      setError(err.response?.data?.error || 'Failed to update problem status');
    }
  };

  const resetCompetition = async () => {
    if (!confirm('Are you sure you want to reset the competition? This will remove all users and their submissions.')) return;
    
    try {
      setMessage(null);
      const response = await axios.post('/api/admin/reset');
      if (response.status === 200) {
        setMessage('Competition reset successfully');
        fetchEnrolledTeams();
      }
    } catch (err) {
      console.error('Error resetting competition:', err);
      setError('Failed to reset competition');
    }
  };

  // Run riddles seeder
  const seedRiddles = async () => {
    if (!confirm('Are you sure you want to seed the database with coding riddles? This will replace all existing problems.')) return;
    
    try {
      setMessage(null);
      setLoading(true);
      const response = await axios.post('/api/admin/seed-questions');
      if (response.status === 200) {
        fetchProblems();
        setMessage('Database seeded with coding riddles successfully');
      }
    } catch (err) {
      console.error('Error seeding riddles:', err);
      setError('Failed to seed riddles');
    } finally {
      setLoading(false);
    }
  };

  const handleBlockTeam = async (teamId: string) => {
    if (!confirm('Are you sure you want to block this team?')) return;
    
    try {
      setMessage(null);
      setError(null);
      
      console.log('Blocking team with ID:', teamId);
      const response = await axios.post(`/api/admin/teams/${teamId}/block`);
      
      if (response.status === 200 && response.data.success) {
        setMessage(`Team "${response.data.team.teamName}" blocked successfully`);
        
        // Update the team in the enrolledTeams state directly
        setEnrolledTeams(enrolledTeams.map(team => 
          team._id === teamId ? { ...team, isBlocked: true } : team
        ));
      } else {
        setError(response.data.error || 'Unknown error occurred while blocking team');
      }
    } catch (err: any) {
      console.error('Error blocking team:', err);
      setError(err.response?.data?.error || 'Failed to block team');
    }
  };

  const handleUnblockTeam = async (teamId: string) => {
    if (!confirm('Are you sure you want to unblock this team?')) return;
    
    try {
      setMessage(null);
      setError(null);
      
      console.log('Unblocking team with ID:', teamId);
      const response = await axios.post(`/api/admin/teams/${teamId}/unblock`);
      
      if (response.status === 200 && response.data.success) {
        setMessage(`Team "${response.data.team.teamName}" unblocked successfully`);
        
        // Update the team in the enrolledTeams state directly
        setEnrolledTeams(enrolledTeams.map(team => 
          team._id === teamId ? { ...team, isBlocked: false } : team
        ));
      } else {
        setError(response.data.error || 'Unknown error occurred while unblocking team');
      }
    } catch (err: any) {
      console.error('Error unblocking team:', err);
      setError(err.response?.data?.error || 'Failed to unblock team');
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm('Are you sure you want to delete this team? This action cannot be undone.')) return;
    
    try {
      setMessage(null);
      setError(null);
      
      console.log('Deleting team with ID:', teamId);
      const response = await axios.delete(`/api/admin/teams/${teamId}`);
      
      if (response.status === 200 && response.data.success) {
        setMessage(`Team "${response.data.deletedTeam.teamName}" deleted successfully`);
        
        // Remove the team from the enrolledTeams state
        setEnrolledTeams(enrolledTeams.filter(team => team._id !== teamId));
      } else {
        setError(response.data.error || 'Unknown error occurred while deleting team');
      }
    } catch (err: any) {
      console.error('Error deleting team:', err);
      setError(err.response?.data?.error || 'Failed to delete team');
    }
  };

  const handleToggleWin = async (teamId: string, currentValue: boolean) => {
    try {
      setMessage(null);
      setError(null);
      
      const newWinValue = !currentValue;
      
      // First update the UI optimistically
      const updatedTeams = enrolledTeams.map(team => {
        if (team._id === teamId) {
          return { 
            ...team, 
            win: newWinValue, 
            lose: newWinValue ? false : team.lose, // If marking as winner, remove loser status
            qualified: newWinValue ? true : team.qualified // Winners are automatically qualified
          };
        }
        return team;
      });
      
      setEnrolledTeams(updatedTeams);
      
      const updatedTeam = updatedTeams.find(team => team._id === teamId);
      setMessage(`Team "${updatedTeam?.teamName}" ${newWinValue ? 'marked as winner' : 'unmarked as winner'}`);
      
      // Then update on the server
      try {
        const response = await axios.post(`/api/admin/teams/${teamId}/update-status`, {
          win: newWinValue,
          lose: false, // Clear lose status if setting win
          qualified: newWinValue ? true : undefined // Set qualified if marking as winner
        });
        
        if (response.data.success) {
          console.log('Team status updated successfully:', response.data.team);
        }
      } catch (serverErr) {
        console.error('Error updating team on server:', serverErr);
        // If server update fails, revert the optimistic update
        fetchEnrolledTeams();
        setError('Failed to update team status on server');
      }
    } catch (err: any) {
      console.error('Error toggling win status:', err);
      setError(err.response?.data?.error || 'Failed to toggle win status');
    }
  };

  const handleToggleLose = async (teamId: string, currentValue: boolean) => {
    try {
      setMessage(null);
      setError(null);
      
      const newLoseValue = !currentValue;
      
      // First update the UI optimistically
      const updatedTeams = enrolledTeams.map(team => {
        if (team._id === teamId) {
          return { 
            ...team, 
            lose: newLoseValue, 
            win: newLoseValue ? false : team.win // If marking as loser, remove winner status
          };
        }
        return team;
      });
      
      setEnrolledTeams(updatedTeams);
      
      const updatedTeam = updatedTeams.find(team => team._id === teamId);
      setMessage(`Team "${updatedTeam?.teamName}" ${newLoseValue ? 'marked as loser' : 'unmarked as loser'}`);
      
      // Then update on the server
      try {
        const response = await axios.post(`/api/admin/teams/${teamId}/update-status`, {
          lose: newLoseValue,
          win: false // Clear win status if setting lose
        });
        
        if (response.data.success) {
          console.log('Team status updated successfully:', response.data.team);
        }
      } catch (serverErr) {
        console.error('Error updating team on server:', serverErr);
        // If server update fails, revert the optimistic update
        fetchEnrolledTeams();
        setError('Failed to update team status on server');
      }
    } catch (err: any) {
      console.error('Error toggling lose status:', err);
      setError(err.response?.data?.error || 'Failed to toggle lose status');
    }
  };

  // Set up automatic refresh of enrolled teams
  useEffect(() => {
    if (isAuthenticated) {
      // Initial fetch
      fetchEnrolledTeams();
      
      const interval = setInterval(() => {
        fetchEnrolledTeams();
      }, 10000); // Refresh every 10 seconds
      
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // Additional effect to log state changes for debugging
  useEffect(() => {
    if (enrolledTeams.length > 0) {
      console.log('Enrolled teams updated:', enrolledTeams);
    }
  }, [enrolledTeams]);

  useEffect(() => {
    // Update time remaining if game is active and has an end time
    if (gameState.active && gameState.endTime) {
      const updateTimeRemaining = () => {
        // If paused, show the stored time remaining
        if (gameState.isPaused && gameState.pausedTimeRemaining) {
          const minutes = Math.floor(gameState.pausedTimeRemaining / (60 * 1000));
          const seconds = Math.floor((gameState.pausedTimeRemaining % (60 * 1000)) / 1000);
          setTimeRemaining(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
          return;
        }
        
        const now = new Date();
        const end = new Date(gameState.endTime!);
        const timeLeft = Math.max(0, end.getTime() - now.getTime());
        
        if (timeLeft <= 0) {
          setTimeRemaining('00:00');
          return;
        }
        
        const minutes = Math.floor(timeLeft / (60 * 1000));
        const seconds = Math.floor((timeLeft % (60 * 1000)) / 1000);
        setTimeRemaining(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      };
      
      // Initial update
      updateTimeRemaining();
      
      // Update every second if not paused
      const interval = !gameState.isPaused ? setInterval(updateTimeRemaining, 1000) : null;
      
      return () => {
        if (interval) clearInterval(interval);
      };
    } else {
      setTimeRemaining('--:--');
    }
  }, [gameState]);

  const handleProblemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProblem) {
      // Handle update
      updateProblem(editingProblem, problemForm);
    } else {
      // Handle create
      createProblem(problemForm);
    }
    setShowProblemForm(false);
  };

  const updateProblem = async (id: string, updatedProblem: Partial<Problem>) => {
    try {
      setMessage(null);
      const response = await axios.put(`/api/problems/${id}`, updatedProblem);
      if (response.status === 200) {
        fetchProblems();
        setMessage('Problem updated successfully');
      }
    } catch (err) {
      console.error('Error updating problem:', err);
      setError('Failed to update problem');
    }
  };

  const createProblem = async (newProblem: Partial<Problem>) => {
    try {
      setMessage(null);
      const response = await axios.post('/api/problems', newProblem);
      if (response.status === 200) {
        fetchProblems();
        setMessage('Problem created successfully');
      }
    } catch (err) {
      console.error('Error creating problem:', err);
      setError('Failed to create problem');
    }
  };

  // Add this function
  const activateSpecificQuestions = async () => {
    try {
      setMessage(null);
      setError(null);
      
      const questions = [
        "Memory Manager", 
        "Cloud Storage", 
        "Endless Meeting", 
        "Function Traveler", 
        "Silent Troublemaker"
      ];
      
      for (const title of questions) {
        await axios.post('/api/admin/activate-question', { title });
      }
      
      setMessage('Activated the new set of questions');
      fetchProblems();
    } catch (err) {
      console.error('Error activating questions:', err);
      setError('Failed to activate questions');
    }
  };

  // Add a new function that will force start the timer regardless of game state
  const forceStartTimer = async () => {
    try {
      setMessage(null);
      setError(null);
      
      // Ensure we have a valid duration value
      const duration = gameState.duration || 10 * 60 * 1000; // Default to 10 minutes if invalid
      
      // Force the game to be active and set the timer
      const now = new Date();
      const endTime = new Date(now.getTime() + duration);
      
      console.log('Force starting timer with:', {
        active: true,
        endTime: endTime.toISOString(),
        currentTime: now.toISOString(),
        duration: duration,
        isPaused: false
      });
      
      const response = await axios.put('/api/game-state', {
        active: true, // Force active state
        endTime: endTime.toISOString(),
        isPaused: false, // Ensure timer is not paused when force started
        pausedTimeRemaining: 0
      });
      
      if (response.status === 200) {
        setGameState(response.data);
        setMessage('Game activated and timer started successfully');
        
        // Emit socket event for real-time update
        try {
          await axios.post('/api/admin/notify', {
            event: 'gameStatusChange',
            data: { 
              active: true,
              endTime: response.data.endTime,
              isPaused: false,
              pausedTimeRemaining: 0
            }
          });
          console.log('Notification sent successfully');
        } catch (err) {
          console.error('Error emitting game status change:', err);
          // Don't show error to user, just log it - the timer still works
          console.log('Timer will still work, but real-time updates to clients may be delayed');
        }
      }
    } catch (err: any) {
      console.error('Error force starting timer:', err);
      console.error('Error details:', err.response?.data);
      setError('Failed to force start timer: ' + (err.response?.data?.error || err.message || 'Unknown error'));
    }
  };

  // Add a function to pause/resume the timer
  const toggleTimerPause = async () => {
    try {
      setMessage(null);
      setError(null);
      
      console.log('Current game state before toggle:', gameState);
      
      // If not paused, we need to calculate and store the remaining time
      if (!gameState.isPaused) {
        // Calculate remaining time in ms
        const now = new Date();
        const end = gameState.endTime ? new Date(gameState.endTime) : null;
        
        if (!end) {
          setError("Cannot pause timer - no end time set");
          return;
        }
        
        const remainingMs = Math.max(0, end.getTime() - now.getTime());
        console.log('Pausing timer with remaining ms:', remainingMs);
        
        // Update game state with paused status and remaining time
        const response = await axios.put('/api/game-state', {
          isPaused: true,
          pausedTimeRemaining: remainingMs
        });
        
        if (response.status === 200) {
          setGameState(response.data);
          setMessage('Timer paused');
          console.log('Timer paused. New game state:', response.data);
          
          // Notify clients with complete game state information
          try {
            const notifyData = {
              active: response.data.active,
              endTime: response.data.endTime,
              isPaused: true,
              pausedTimeRemaining: remainingMs,
              startTime: response.data.startTime,
              duration: response.data.duration
            };
            
            console.log('Sending pause notification with data:', notifyData);
            
            await axios.post('/api/admin/notify', {
              event: 'gameStatusChange',
              data: notifyData
            });
            console.log('Pause notification sent successfully');
          } catch (err) {
            console.error('Error notifying about pause:', err);
          }
        }
      } else {
        // Resume timer by setting a new end time based on the remaining time
        const now = new Date();
        const remainingMs = gameState.pausedTimeRemaining || 0;
        console.log('Resuming timer with remaining ms:', remainingMs);
        const newEndTime = new Date(now.getTime() + remainingMs);
        
        const response = await axios.put('/api/game-state', {
          isPaused: false,
          pausedTimeRemaining: 0,
          endTime: newEndTime.toISOString()
        });
        
        if (response.status === 200) {
          setGameState(response.data);
          setMessage('Timer resumed');
          console.log('Timer resumed. New game state:', response.data);
          
          // Notify clients with complete game state information
          try {
            const notifyData = {
              active: response.data.active,
              endTime: response.data.endTime,
              isPaused: false,
              pausedTimeRemaining: 0,
              startTime: response.data.startTime,
              duration: response.data.duration
            };
            
            console.log('Sending resume notification with data:', notifyData);
            
            await axios.post('/api/admin/notify', {
              event: 'gameStatusChange',
              data: notifyData
            });
            console.log('Resume notification sent successfully');
          } catch (err) {
            console.error('Error notifying about resume:', err);
          }
        }
      }
    } catch (err: any) {
      console.error('Error toggling timer pause:', err);
      console.error('Error details:', err.response?.data);
      setError('Failed to toggle timer pause: ' + (err.response?.data?.error || err.message || 'Unknown error'));
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h1 className="text-2xl font-bold text-indigo-800 mb-6">Admin Login</h1>
          
          <form onSubmit={handleAuth} className="space-y-4">
            {error && (
              <div className="bg-red-100 text-red-700 p-3 rounded-md text-sm font-medium border border-red-200">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="password" className="block text-base font-semibold text-gray-800 mb-2">
                Admin Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm text-gray-800 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
                placeholder="Enter admin password"
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-base font-medium mt-2"
            >
              Login to Admin Panel
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-black">Admin Dashboard</h1>
          <div className="flex space-x-4">
            <button
              onClick={() => router.push('/admin/questions')} 
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              Manage Questions
            </button>
            
            <button 
              onClick={() => setIsAuthenticated(false)} 
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Logout
            </button>
          </div>
        </div>
        
        {message && (
          <div className="bg-green-100 text-green-700 p-4 rounded-md mb-4">
            {message}
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold text-black mb-4">Game Control</h2>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full mr-2 ${gameState.active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="font-semibold text-gray-800">Status: {gameState.active ? 'Active' : 'Inactive'}</span>
                  </div>
                  {gameState.startTime && (
                    <div className="text-sm font-medium text-gray-700 mt-2">
                      Started: {new Date(gameState.startTime).toLocaleString()}
                    </div>
                  )}
                  {gameState.active && gameState.endTime && (
                    <div className="mt-2 flex items-center">
                      <span className="text-sm text-gray-600 mr-2">Game Time:</span>
                      <span className={`font-bold ${
                        timeRemaining.startsWith('00:') || timeRemaining === '01:00' 
                          ? 'text-red-600' 
                          : timeRemaining.startsWith('0') && !timeRemaining.startsWith('00:') 
                            ? 'text-yellow-600' 
                            : 'text-green-600'
                      }`}>
                        {timeRemaining}
                      </span>
                      {gameState.isPaused && (
                        <span className="ml-2 px-2 py-1 text-xs font-bold bg-yellow-100 text-yellow-800 rounded-full animate-pulse">
                          PAUSED
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={toggleGameState}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white 
                      ${gameState.active 
                        ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' 
                        : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'} 
                      focus:outline-none focus:ring-2 focus:ring-offset-2`}
                  >
                    {gameState.active ? 'Stop Game' : 'Start Game'}
                  </button>
                  <button
                    onClick={startTimer}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Start Timer
                  </button>
                  <button
                    onClick={toggleTimerPause}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white 
                      ${gameState.isPaused 
                        ? 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500' 
                        : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'} 
                      focus:outline-none focus:ring-2 focus:ring-offset-2`}
                    disabled={!gameState.active || !gameState.endTime}
                  >
                    {gameState.isPaused ? 'Resume Timer' : 'Pause Timer'}
                  </button>
                  <button
                    onClick={forceStartTimer}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    Start Game + Timer
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                {gameState.active
                  ? 'The game is currently running. Players can submit answers until the timer expires.'
                  : 'The game is currently stopped. Players cannot submit answers until you start the game.'}
              </p>
              
              {/* Debug section */}
              <div className="mt-4 p-3 bg-gray-100 rounded-md">
                <h3 className="text-sm font-bold text-gray-700 mb-2">Debug Info:</h3>
                <pre className="text-xs overflow-auto max-h-40 bg-gray-50 p-2 rounded border border-gray-200">
                  {JSON.stringify({
                    active: gameState.active,
                    startTime: gameState.startTime,
                    endTime: gameState.endTime,
                    duration: gameState.duration,
                    timeRemaining
                  }, null, 2)}
                </pre>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold text-black mb-4">Admin Actions</h2>
              <div className="mt-4 space-y-4">
                <button
                  onClick={resetCompetition}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-bold rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Reset Competition
                </button>

                <div>
                  <button
                    onClick={seedRiddles}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-bold rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Seed Coding Riddle
                  </button>
                </div>
                
                <div>
                  <button
                    onClick={activateSpecificQuestions}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-bold rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Activate New Questions
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Anti-Cheating Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-black mb-4">Anti-Cheating System</h2>
            <p className="text-gray-800 font-medium mb-4">
              This system helps prevent cheating by dynamically assigning problems to teams.
            </p>
            
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="text-md font-bold text-blue-800 mb-2">How It Works:</h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-800 font-medium">
                  <li>Each team gets assigned a random problem from the active problem pool.</li>
                  <li>Teams cannot see each other's problems, preventing direct answer sharing.</li>
                  <li>When you activate a problem, it becomes available in the assignment pool.</li>
                  <li>You can deactivate problems to remove them from future assignments.</li>
                </ul>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h3 className="text-md font-bold text-yellow-800 mb-2">Important Notes:</h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-800 font-medium">
                  <li>Ensure multiple problems are active before starting the game.</li>
                  <li>You can add, edit, or delete problems at any time.</li>
                  <li>Blocking a team prevents them from submitting answers.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-indigo-600 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Enrolled Teams</h2>
            <div className="relative">
              <button 
                className="text-sm text-indigo-700 bg-white px-3 py-1 rounded-md shadow-sm border border-indigo-200 hover:bg-indigo-50 flex items-center"
              >
                <svg className="w-5 h-5 mr-1 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Team Management Help
              </button>
            </div>
          </div>

          <div className="px-6 py-4 bg-blue-50 border-b border-blue-100">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm">
                <p className="font-bold text-blue-800 mb-2">Team Management Instructions:</p>
                <ul className="list-disc pl-5 space-y-1 text-blue-800">
                  <li><span className="font-bold">Block</span>: Prevents a team from participating. Their status will show as "Deactive" with a strikethrough.</li>
                  <li><span className="font-bold">Unblock</span>: Allows a blocked team to participate again. Their status returns to "Active".</li>
                  <li><span className="font-bold">Delete</span>: Permanently removes the team and all their submissions from the system.</li>
                </ul>
              </div>
            </div>
          </div>
          
          {enrolledTeams.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-800 font-medium">No teams have enrolled yet.</p>
            </div>
          ) : (
            <div className="overflow-y-auto max-h-80">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                      Team Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                      Win/Lose
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {enrolledTeams.map((team) => (
                    <tr key={team._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`font-semibold text-gray-900 ${team.isBlocked ? 'line-through text-gray-400' : ''}`}>
                          {team.teamName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                        {team.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          team.isBlocked 
                            ? 'bg-red-100 text-red-800'
                            : team.qualified
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {team.isBlocked ? 'Deactive' : team.qualified ? 'Qualified' : 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <input
                              id={`win-${team._id}`}
                              type="checkbox"
                              checked={team.win || false}
                              onChange={(e) => {
                                e.stopPropagation();
                                if (!team.isBlocked) {
                                  handleToggleWin(team._id, team.win || false);
                                }
                              }}
                              className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded cursor-pointer"
                              disabled={team.isBlocked}
                            />
                            <label 
                              htmlFor={`win-${team._id}`} 
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!team.isBlocked) {
                                  handleToggleWin(team._id, team.win || false);
                                }
                              }}
                              className={`ml-2 block text-sm font-bold ${team.win ? 'text-green-700' : 'text-gray-500'} cursor-pointer`}
                            >
                              Win
                            </label>
                            {team.win && (
                              <span className="ml-2 px-2 inline-flex text-xs leading-5 font-bold rounded-full bg-green-100 text-green-800">
                                WINNER
                              </span>
                            )}
                          </div>
                          <div className="flex items-center ml-6">
                            <input
                              id={`lose-${team._id}`}
                              type="checkbox"
                              checked={team.lose || false}
                              onChange={(e) => {
                                e.stopPropagation();
                                if (!team.isBlocked) {
                                  handleToggleLose(team._id, team.lose || false);
                                }
                              }}
                              className="h-5 w-5 text-red-600 focus:ring-red-500 border-gray-300 rounded cursor-pointer"
                              disabled={team.isBlocked}
                            />
                            <label 
                              htmlFor={`lose-${team._id}`} 
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!team.isBlocked) {
                                  handleToggleLose(team._id, team.lose || false);
                                }
                              }}
                              className={`ml-2 block text-sm font-bold ${team.lose ? 'text-red-700' : 'text-gray-500'} cursor-pointer`}
                            >
                              Lose
                            </label>
                            {team.lose && (
                              <span className="ml-2 px-2 inline-flex text-xs leading-5 font-bold rounded-full bg-red-100 text-red-800">
                                LOST
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => team.isBlocked ? handleUnblockTeam(team._id) : handleBlockTeam(team._id)}
                          className={`px-3 py-1.5 text-xs font-bold rounded-md shadow-sm text-white 
                            ${team.isBlocked 
                              ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' 
                              : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'} 
                            focus:outline-none focus:ring-2 focus:ring-offset-1`}
                        >
                          {team.isBlocked ? 'Unblock' : 'Block'}
                        </button>
                        <button
                          onClick={() => handleDeleteTeam(team._id)}
                          className="px-3 py-1.5 text-xs font-bold rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-500"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-indigo-600">
          <h2 className="text-xl font-bold text-white">Problem Management</h2>
        </div>
        
        <div className="px-6 py-4 flex justify-end">
          <button
            onClick={() => {
              setEditingProblem(null);
              setProblemForm({
                title: '',
                description: '',
                expectedAnswer: '',
                active: true
              });
              setShowProblemForm(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-bold rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Add Problem
          </button>
        </div>

        {loading ? (
          <div className="p-6 text-center">
            <p className="text-gray-800 font-medium">Loading problems...</p>
          </div>
        ) : problems.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-800 font-medium">No problems found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Answer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {problems.map((problem) => (
                  <tr key={problem._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-gray-900">{problem.title}</div>
                      <div className="text-sm font-medium text-gray-700 truncate max-w-xs">
                        {problem.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-bold rounded-full ${
                        problem.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {problem.active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                      {problem.expectedAnswer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => toggleProblemActive(problem._id)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-md shadow-sm text-white 
                          ${problem.active 
                            ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' 
                            : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'} 
                          focus:outline-none focus:ring-2 focus:ring-offset-1`}
                      >
                        {problem.active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => {
                          setEditingProblem(problem._id);
                          setProblemForm({
                            title: problem.title,
                            description: problem.description,
                            expectedAnswer: problem.expectedAnswer,
                            active: problem.active
                          });
                          setShowProblemForm(true);
                        }}
                        className="px-3 py-1.5 text-xs font-bold rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteProblem(problem._id)}
                        className="px-3 py-1.5 text-xs font-bold rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-500"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showProblemForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-10">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingProblem ? 'Edit Problem' : 'Add New Problem'}
            </h3>
            <form onSubmit={handleProblemSubmit} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-semibold text-gray-800">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={problemForm.title}
                  onChange={(e) => setProblemForm({ ...problemForm, title: e.target.value })}
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-gray-800">
                  Description
                </label>
                <textarea
                  id="description"
                  value={problemForm.description}
                  onChange={(e) => setProblemForm({ ...problemForm, description: e.target.value })}
                  rows={4}
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  required
                ></textarea>
              </div>
              <div>
                <label htmlFor="expectedAnswer" className="block text-sm font-semibold text-gray-800">
                  Expected Answer
                </label>
                <input
                  type="text"
                  id="expectedAnswer"
                  value={problemForm.expectedAnswer}
                  onChange={(e) => setProblemForm({ ...problemForm, expectedAnswer: e.target.value })}
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div className="flex items-center">
                <input
                  id="active"
                  type="checkbox"
                  checked={problemForm.active}
                  onChange={(e) => setProblemForm({ ...problemForm, active: e.target.checked })}
                  className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="active" className="ml-2 block text-sm font-semibold text-gray-800">
                  Active
                </label>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowProblemForm(false)}
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex justify-center px-4 py-2 text-sm font-bold text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {editingProblem ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 