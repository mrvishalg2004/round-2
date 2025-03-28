import mongoose, { Schema, Document } from 'mongoose';

export interface IProblem extends Document {
  title: string;
  description: string;
  quote: string;
  expectedAnswer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number; // in seconds
  active: boolean;
  createdAt: Date;
}

const ProblemSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  quote: { type: String, required: true },
  expectedAnswer: { type: String, required: true },
  difficulty: { 
    type: String, 
    enum: ['easy', 'medium', 'hard'], 
    default: 'medium' 
  },
  timeLimit: { type: Number, default: 300 }, // 5 minutes by default
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Problem || mongoose.model<IProblem>('Problem', ProblemSchema); 