import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  score: number;
  submissionTime?: Date;
  qualified: boolean;
  teamName: string;
  enrolled: boolean;
  assignedProblem?: mongoose.Types.ObjectId;
  isBlocked: boolean;
  win?: boolean;
  lose?: boolean;
}

const UserSchema: Schema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  score: { type: Number, default: 0 },
  submissionTime: { type: Date },
  qualified: { type: Boolean, default: false },
  teamName: { type: String, default: '' },
  enrolled: { type: Boolean, default: false },
  assignedProblem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem' },
  isBlocked: { type: Boolean, default: false },
  win: { type: Boolean, default: false },
  lose: { type: Boolean, default: false },
}, {
  timestamps: true,
});

// Use mongoose.models to check if the model already exists before creating it
export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema); 