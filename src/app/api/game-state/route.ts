import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/utils/db';
import GameState from '@/models/GameState';

// Define default game duration
const DEFAULT_GAME_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds

// Helper function to get the game state from MongoDB
const getGameState = async () => {
  try {
    await dbConnect();
    // Get the default game state or create if it doesn't exist
    let gameState = await GameState.findOne({ isDefault: true });
    
    if (!gameState) {
      // Create default game state if none exists
      gameState = await GameState.create({
        active: false,
        startTime: null,
        endTime: null,
        duration: DEFAULT_GAME_DURATION,
        isPaused: false,
        pausedTimeRemaining: 0,
        isDefault: true
      });
    }
    
    return gameState;
  } catch (error) {
    console.error('Error getting game state:', error);
    throw error;
  }
};

// GET /api/game-state
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const gameState = await getGameState();
    
    // Format dates as ISO strings for JSON serialization
    const formattedState = {
      active: gameState.active,
      startTime: gameState.startTime ? gameState.startTime.toISOString() : null,
      endTime: gameState.endTime ? gameState.endTime.toISOString() : null,
      duration: gameState.duration,
      isPaused: gameState.isPaused,
      pausedTimeRemaining: gameState.pausedTimeRemaining
    };
    
    return NextResponse.json(formattedState);
  } catch (error) {
    console.error('Error fetching game state:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/game-state
export async function PUT(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    console.log('Received game state update:', body);
    
    // Get current game state
    let gameState = await getGameState();
    console.log('Current game state:', gameState);
    
    // If activating the game, set start time
    if (body.active === true && !gameState.active) {
      const now = new Date();
      gameState.startTime = now;
      
      // Don't automatically set end time when activating game
      // Only set it if explicitly provided in the request
      if (!body.hasOwnProperty('endTime')) {
        gameState.endTime = null;
      }
      
      // Reset pause state when activating
      gameState.isPaused = false;
      gameState.pausedTimeRemaining = 0;
    }
    
    // Update active state if provided
    if (body.hasOwnProperty('active')) {
      gameState.active = body.active;
    }
    
    // Handle pause state changes
    if (body.hasOwnProperty('isPaused')) {
      gameState.isPaused = body.isPaused;
      
      // If pausing, capture the remaining time
      if (body.isPaused && body.hasOwnProperty('pausedTimeRemaining')) {
        gameState.pausedTimeRemaining = body.pausedTimeRemaining;
      }
      
      // If resuming, set pausedTimeRemaining to 0
      if (body.isPaused === false) {
        gameState.pausedTimeRemaining = 0;
      }
    }
    
    // If explicitly setting endTime
    if (body.hasOwnProperty('endTime')) {
      if (body.endTime === null) {
        gameState.endTime = null;
      } else {
        try {
          // Ensure endTime is a valid date
          const endTimeDate = new Date(body.endTime);
          if (isNaN(endTimeDate.getTime())) {
            throw new Error('Invalid date format for endTime');
          }
          gameState.endTime = endTimeDate;
        } catch (error) {
          console.error('Error parsing endTime:', error, body.endTime);
          return NextResponse.json(
            { error: 'Invalid time value' },
            { status: 400 }
          );
        }
      }
    }
    
    // If explicitly updating duration
    if (body.hasOwnProperty('duration')) {
      gameState.duration = body.duration;
      
      // If game is active, recalculate end time only if we have an active timer
      if (gameState.active && gameState.startTime && gameState.endTime && !gameState.isPaused) {
        const startTime = new Date(gameState.startTime);
        const endTime = new Date(startTime.getTime() + gameState.duration);
        gameState.endTime = endTime;
      }
    }
    
    console.log('Updated game state:', gameState);
    
    // Save changes to database
    await gameState.save();
    
    // Format dates as ISO strings for JSON serialization
    const formattedState = {
      active: gameState.active,
      startTime: gameState.startTime ? gameState.startTime.toISOString() : null,
      endTime: gameState.endTime ? gameState.endTime.toISOString() : null,
      duration: gameState.duration,
      isPaused: gameState.isPaused,
      pausedTimeRemaining: gameState.pausedTimeRemaining
    };
    
    return NextResponse.json(formattedState);
  } catch (error) {
    console.error('Error updating game state:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 