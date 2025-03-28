import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User';
import { IProblem } from './Problem';

export interface ISubmission extends Document {
  userId: IUser['_id'];
  problemId: IProblem['_id'];
  answer: string;
  submittedAt: Date;
}

const SubmissionSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  problemId: { type: Schema.Types.ObjectId, ref: 'Problem', required: true },
  answer: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now }
});

export default mongoose.models.Submission || mongoose.model<ISubmission>('Submission', SubmissionSchema); 