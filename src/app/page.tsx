'use client';

import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import Header from '@/components/Header';
import CodingProblem from '@/components/CodingProblem';
import ResultModal from '@/components/ResultModal';
import GameOver from '@/components/GameOver';
import EnrollmentForm from '@/components/EnrollmentForm';
import CountdownTimer from '@/components/CountdownTimer';

export default function Home() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [problem, setProblem] = useState<any>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [modalResult, setModalResult] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGameActive, setIsGameActive] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [isBlocked, setIsBlocked] = useState(false);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [pausedTimeRemaining, setPausedTimeRemaining] = useState<number | undefined>(undefined);

  // Initialize Socket.IO connection and fetch initial data
  useEffect(() => {
    // Initialize Socket connection
    const initSocket = async () => {
      try {
        // Initialize the Socket.IO connection on the client with more options
        const socketIo = io(process.env.NEXT_PUBLIC_SOCKET_URL || '', {
          path: '/api/socketio',
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          timeout: 10000,
          transports: ['websocket', 'polling']
        });
        
        // Set up socket event listeners
        socketIo.on('connect', () => {
          console.log('Socket connected:', socketIo.id);
          // Join a room specific to this team
          const storedTeamName = localStorage.getItem('teamName');
          if (storedTeamName) {
            socketIo.emit('joinTeam', { teamName: storedTeamName });
            console.log('Joined team room:', storedTeamName);
          }
        });
        
        // Only listen for game status changes, not game completion
        socketIo.on('gameStatusChange', (data) => {
          console.log('Received gameStatusChange event:', data);
          
          // Update game active state
          setIsGameActive(data.active);
          
          // Set end time for countdown
          if (data.endTime) {
            setEndTime(new Date(data.endTime));
          } else {
            setEndTime(null);
          }
          
          // Handle pause state - always update the isPaused state
          console.log('Timer pause state update received:', {
            isPaused: data.isPaused,
            pausedTimeRemaining: data.pausedTimeRemaining
          });
          
          setIsPaused(!!data.isPaused); // Convert to boolean in case it's undefined
          
          // Handle paused time remaining if paused
          if (data.isPaused && data.pausedTimeRemaining !== undefined) {
            console.log('Setting pausedTimeRemaining:', data.pausedTimeRemaining);
            setPausedTimeRemaining(data.pausedTimeRemaining);
          } else {
            setPausedTimeRemaining(undefined);
          }
        });

        socketIo.on('teamStatusChange', (data) => {
          console.log('Team status change received:', data);
          // Check if this message is for our team
          const storedTeamName = localStorage.getItem('teamName');
          if (data.teamName === storedTeamName) {
            console.log('This block message is for us!');
            setIsBlocked(data.isBlocked);
            if (data.isBlocked) {
              alert('Your team has been blocked due to unauthorized activity. You will be redirected.');
              // Clear localStorage when blocked
              localStorage.removeItem('teamName');
              localStorage.removeItem('email');
              // Force reload the page to show blocked message
              window.location.reload();
            }
          }
        });
        
        socketIo.on('disconnect', () => {
          console.log('Socket disconnected');
        });
        
        socketIo.on('connect_error', (err) => {
          console.error('Socket connection error:', err);
        });
        
        socketIo.on('reconnect_attempt', (attempt) => {
          console.log(`Socket reconnection attempt ${attempt}`);
        });
        
        socketIo.on('reconnect', () => {
          console.log('Socket reconnected, fetching latest game state');
          // Fetch latest game state on reconnection
          fetchGameState();
        });
        
        socketIo.on('error', (err) => {
          console.error('Socket error:', err);
        });
        
        setSocket(socketIo);
      } catch (err) {
        console.error('Socket initialization error:', err);
        setError('Failed to connect to the server. Please refresh the page.');
      }
    };
    
    // Fetch active problem
    const fetchProblem = async () => {
      try {
        const savedTeamName = localStorage.getItem('teamName');
        const url = savedTeamName 
          ? `/api/problems?teamName=${encodeURIComponent(savedTeamName)}`
          : '/api/problems';
          
        const response = await axios.get(url);
        setProblem(response.data);
      } catch (err: any) {
        console.error('Error fetching problem:', err);
        setError('No active coding problems found.');
      }
    };

    // Fetch game state
    const fetchGameState = async () => {
      try {
        const response = await axios.get('/api/game-state');
        setIsGameActive(response.data.active);
        
        // Set pause state
        setIsPaused(response.data.isPaused || false);
        
        // Handle paused time remaining
        if (response.data.isPaused && response.data.pausedTimeRemaining) {
          setPausedTimeRemaining(response.data.pausedTimeRemaining);
        } else {
          setPausedTimeRemaining(undefined);
        }
        
        // Set end time for countdown
        if (response.data.endTime) {
          setEndTime(new Date(response.data.endTime));
        } else {
          setEndTime(null);
        }
      } catch (err) {
        console.error('Error fetching game state:', err);
      }
    };

    // Check if user is already enrolled from localStorage
    const checkEnrollment = async () => {
      const savedTeamName = localStorage.getItem('teamName');
      const savedEmail = localStorage.getItem('email');
      
      if (savedTeamName && savedEmail) {
        try {
          console.log('Checking enrollment for team:', savedTeamName);
          const response = await axios.get(`/api/enroll/check?teamName=${encodeURIComponent(savedTeamName)}`);
          console.log('Enrollment check response:', response.data);
          
          if (response.data.enrolled) {
            setTeamName(savedTeamName);
            setEnrolled(true);
            
            if (response.data.isBlocked) {
              console.log('Team is blocked!');
              setIsBlocked(true);
              // We'll keep localStorage intact to keep showing the blocked message
              // until they clear localStorage or admin unblocks them
            }
          } else {
            console.log('Team not found in database');
            // Clear localStorage if team is not found
            localStorage.removeItem('teamName');
            localStorage.removeItem('email');
          }
        } catch (err) {
          console.error('Error checking enrollment:', err);
          // Clear localStorage on error
          localStorage.removeItem('teamName');
          localStorage.removeItem('email');
        }
      } else {
        console.log('No saved team credentials found');
      }
    };
    
    const initData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          initSocket(),
          fetchProblem(),
          fetchGameState(),
          checkEnrollment()
        ]);
      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    initData();
    
    // Cleanup function
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);
  
  // Handle submission result
  const handleSubmissionComplete = (result: any) => {
    setModalResult(result);
    setIsModalOpen(true);
    
    // Don't set game over when a team qualifies
    // Keep the game running for all teams
  };
  
  // Close the result modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Handle enrollment
  const handleEnrollment = (teamName: string, email: string) => {
    setTeamName(teamName);
    setEnrolled(true);
    localStorage.setItem('teamName', teamName);
    localStorage.setItem('email', email);
  };

  // Handle game time expiring
  const handleTimeExpired = () => {
    setIsGameOver(true);
  };

  // Ensure socket connection is maintained
  useEffect(() => {
    const checkSocketConnection = () => {
      if (socket && !socket.connected) {
        console.log('Socket disconnected, attempting to reconnect...');
        socket.connect();
      }
    };
    
    // Set up interval to check connection
    const connectionInterval = setInterval(checkSocketConnection, 5000);
    
    return () => {
      clearInterval(connectionInterval);
    };
  }, [socket]);
  
  // Effect to update the game state whenever isPaused changes
  useEffect(() => {
    console.log('isPaused state changed:', isPaused, 'pausedTimeRemaining:', pausedTimeRemaining);
  }, [isPaused, pausedTimeRemaining]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md px-4">
            <svg className="h-16 w-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // If an admin explicitly ends the game via an admin action or time expired
  if (isGameOver) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <GameOver timeExpired={endTime ? new Date(endTime) <= new Date() : false} />
        </div>
      </div>
    );
  }

  // Show enrollment form if not enrolled
  if (!enrolled) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <EnrollmentForm onEnroll={handleEnrollment} />
        </div>
      </div>
    );
  }

  // Show blocked message if team is blocked
  if (isBlocked) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Access Denied</h1>
            <p className="text-gray-600 mb-4">Due to unauthorized activity, your team has been blocked from participating in the game.</p>
            <p className="text-gray-600">Please contact the administrator for more information.</p>
          </div>
        </div>
      </div>
    );
  }

  // Show waiting screen if game is not active
  if (!isGameActive) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto text-center">
            <div className="mb-6">
              <svg className="w-16 h-16 text-indigo-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-2xl font-bold mb-2">Team Enrolled: {teamName}</h2>
              <p className="text-gray-600 mb-4">Waiting for the admin to start the game. Please stand by...</p>
              <div className="relative pt-1">
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-200">
                  <div className="animate-pulse w-full h-full bg-indigo-500"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      {isGameActive && endTime && !isGameOver && (
        <div className="absolute top-0 left-0 w-full flex justify-center mt-4 z-10">
          <CountdownTimer 
            endTime={endTime} 
            onTimeExpired={handleTimeExpired} 
            isPaused={isPaused}
            pausedTimeRemaining={pausedTimeRemaining}
          />
        </div>
      )}
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {problem ? (
            <CodingProblem 
              problem={problem} 
              onSubmissionComplete={handleSubmissionComplete}
              teamName={teamName}
            />
          ) : (
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <p className="text-gray-600">No active coding problem found.</p>
            </div>
          )}
        </div>
      </main>
      
      {/* Result Modal */}
      <ResultModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        result={modalResult} 
      />
    </div>
  );
}
