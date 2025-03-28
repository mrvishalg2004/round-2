import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/utils/db';
import fs from 'fs';
import path from 'path';

// Path to the game state file
const GAME_STATE_FILE = path.join(process.cwd(), 'game-state.json');
const DEFAULT_GAME_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds

// Define GameState interface
interface GameState {
  active: boolean;
  startTime: string | null;
  endTime: string | null;
  duration: number;
  isPaused?: boolean;
  pausedTimeRemaining?: number;
}

// Default game state
const DEFAULT_GAME_STATE: GameState = {
  active: false,
  startTime: null,
  endTime: null,
  duration: DEFAULT_GAME_DURATION,
  isPaused: false,
  pausedTimeRemaining: 0
};

// Helper function to read the game state
const readGameState = (): GameState => {
  try {
    if (!fs.existsSync(GAME_STATE_FILE)) {
      fs.writeFileSync(GAME_STATE_FILE, JSON.stringify(DEFAULT_GAME_STATE, null, 2), 'utf8');
      return DEFAULT_GAME_STATE;
    }
    
    const data = fs.readFileSync(GAME_STATE_FILE, 'utf8');
    return JSON.parse(data) as GameState;
  } catch (error) {
    console.error('Error reading game state:', error);
    return DEFAULT_GAME_STATE;
  }
};

// Helper function to update the game state
const updateGameState = (state: GameState): GameState | null => {
  try {
    fs.writeFileSync(GAME_STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
    return state;
  } catch (error) {
    console.error('Error updating game state:', error);
    return null;
  }
};

// GET /api/game-state
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    await dbConnect();
    
    const gameState = readGameState();
    
    return NextResponse.json(gameState);
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
    await dbConnect();
    
    const body = await req.json();
    console.log('Received game state update:', body);
    
    // Read existing state
    let gameState = readGameState();
    console.log('Current game state:', gameState);
    
    // Update state with values from request
    const newState = {
      ...gameState,
      ...body
    };
    
    // If activating the game, set start time
    if (body.active === true && !gameState.active) {
      const now = new Date();
      newState.startTime = now.toISOString();
      
      // Don't automatically set end time when activating game
      // Only set it if explicitly provided in the request
      if (!body.hasOwnProperty('endTime')) {
        newState.endTime = null;
      }
      
      // Reset pause state when activating
      newState.isPaused = false;
      newState.pausedTimeRemaining = 0;
    }
    
    // Handle pause state changes
    if (body.hasOwnProperty('isPaused')) {
      newState.isPaused = body.isPaused;
      
      // If pausing, capture the remaining time
      if (body.isPaused && body.hasOwnProperty('pausedTimeRemaining')) {
        newState.pausedTimeRemaining = body.pausedTimeRemaining;
      }
      
      // If resuming, set pausedTimeRemaining to 0
      if (body.isPaused === false) {
        newState.pausedTimeRemaining = 0;
      }
    }
    
    // If explicitly setting endTime
    if (body.hasOwnProperty('endTime')) {
      if (body.endTime === null) {
        newState.endTime = null;
      } else {
        try {
          // Ensure endTime is a valid date
          const endTimeDate = new Date(body.endTime);
          if (isNaN(endTimeDate.getTime())) {
            throw new Error('Invalid date format for endTime');
          }
          newState.endTime = endTimeDate.toISOString();
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
    if (body.duration) {
      // If game is active, recalculate end time only if we have an active timer
      if (newState.active && newState.startTime && newState.endTime && !newState.isPaused) {
        const startTime = new Date(newState.startTime);
        const endTime = new Date(startTime.getTime() + body.duration);
        newState.endTime = endTime.toISOString();
      }
    }
    
    console.log('Updated game state:', newState);
    const updatedState = updateGameState(newState);
    
    if (!updatedState) {
      return NextResponse.json(
        { error: 'Failed to update game state' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(updatedState);
  } catch (error) {
    console.error('Error updating game state:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 