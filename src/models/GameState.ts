import mongoose, { Schema, Document } from 'mongoose';

export interface IGameState extends Document {
  active: boolean;
  startTime: Date | null;
  endTime: Date | null;
  duration: number;
  isPaused: boolean;
  pausedTimeRemaining: number;
  isDefault: boolean; // To ensure we only have one game state document
}

const GameStateSchema: Schema = new Schema({
  active: { type: Boolean, default: false },
  startTime: { type: Date, default: null },
  endTime: { type: Date, default: null },
  duration: { type: Number, default: 10 * 60 * 1000 }, // 10 minutes in milliseconds
  isPaused: { type: Boolean, default: false },
  pausedTimeRemaining: { type: Number, default: 0 },
  isDefault: { type: Boolean, default: true } // To ensure we only have one game state document
});

export default mongoose.models.GameState || mongoose.model<IGameState>('GameState', GameStateSchema); 