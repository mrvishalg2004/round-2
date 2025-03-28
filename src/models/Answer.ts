import mongoose, { Schema, Document } from 'mongoose';

export interface IAnswer extends Document {
  problem: Schema.Types.ObjectId;
  team: Schema.Types.ObjectId;
  answer: string;
  status: 'pending' | 'accepted' | 'rejected';
  submittedAt: Date;
}

const AnswerSchema: Schema = new Schema({
  problem: { type: Schema.Types.ObjectId, ref: 'Problem', required: true },
  team: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  answer: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'rejected'], 
    default: 'pending' 
  },
  submittedAt: { type: Date, default: Date.now }
});

export default mongoose.models.Answer || mongoose.model<IAnswer>('Answer', AnswerSchema); 