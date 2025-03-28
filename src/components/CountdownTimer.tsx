import React, { useState, useEffect, useRef } from 'react';

interface CountdownTimerProps {
  endTime: Date;
  onTimeExpired: () => void;
  isPaused?: boolean;
  pausedTimeRemaining?: number;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ 
  endTime, 
  onTimeExpired, 
  isPaused = false,
  pausedTimeRemaining
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [progressPercentage, setProgressPercentage] = useState<number>(100);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Log props changes for debugging
  useEffect(() => {
    console.log('CountdownTimer props changed:', { 
      endTime: endTime?.toISOString(), 
      isPaused, 
      pausedTimeRemaining 
    });
  }, [endTime, isPaused, pausedTimeRemaining]);
  
  useEffect(() => {
    // Clear any existing interval when dependencies change
    if (intervalRef.current) {
      console.log('Clearing existing interval');
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // If paused and we have a pausedTimeRemaining value, use that instead
    if (isPaused && pausedTimeRemaining !== undefined) {
      console.log('Timer is paused with remaining time:', pausedTimeRemaining);
      setTimeLeft(pausedTimeRemaining);
      
      // Calculate total duration (assuming 10 minutes)
      const totalDuration = 10 * 60 * 1000; // 10 minutes in milliseconds
      
      // Calculate progress based on paused time
      const pausedProgress = (pausedTimeRemaining / totalDuration) * 100;
      setProgressPercentage(pausedProgress);
      
      // Don't set up an interval when paused
      return;
    }
    
    // Set initial time left
    const initialTimeLeft = Math.max(0, endTime.getTime() - Date.now());
    console.log('Setting initial time left:', initialTimeLeft);
    setTimeLeft(initialTimeLeft);
    
    // Calculate total duration (assuming 10 minutes)
    const totalDuration = 10 * 60 * 1000; // 10 minutes in milliseconds
    
    // Calculate initial progress
    const initialProgress = (initialTimeLeft / totalDuration) * 100;
    setProgressPercentage(initialProgress);
    
    // Only start the interval if not paused
    if (!isPaused) {
      console.log('Starting countdown interval');
      // Update time left every second
      intervalRef.current = setInterval(() => {
        const newTimeLeft = Math.max(0, endTime.getTime() - Date.now());
        setTimeLeft(newTimeLeft);
        
        // Update progress
        const newProgress = (newTimeLeft / totalDuration) * 100;
        setProgressPercentage(newProgress);
        
        // Check if time has expired
        if (newTimeLeft <= 0) {
          console.log('Timer expired');
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          onTimeExpired();
        }
      }, 1000);
    } else {
      console.log('Not starting interval because timer is paused');
    }
    
    // Clean up interval on unmount or when dependencies change
    return () => {
      if (intervalRef.current) {
        console.log('Cleaning up interval');
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [endTime, onTimeExpired, isPaused, pausedTimeRemaining]);
  
  // Format time to MM:SS
  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Get animation class for final countdown
  const getAnimationClass = (): string => {
    if (isPaused) return ''; // No animation when paused
    return timeLeft <= 10000 ? 'animate-pulse' : '';
  };
  
  return (
    <div className="flex items-center justify-center">
      <div className="flex items-center bg-white px-5 py-2 rounded-full shadow-md">
        <span className="font-semibold text-indigo-800 mr-3">Game Time:</span>
        <span className={`text-2xl font-bold ${timeLeft <= 60000 ? 'text-red-600' : 'text-indigo-700'} ${getAnimationClass()}`}>
          {formatTime(timeLeft)}
        </span>
        {isPaused && (
          <span className="ml-2 px-2 py-1 text-xs font-bold bg-yellow-100 text-yellow-800 rounded-full animate-pulse">
            PAUSED
          </span>
        )}
      </div>
    </div>
  );
};

export default CountdownTimer; 