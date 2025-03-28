import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/utils/db';
import User from '@/models/User';
import Submission from '@/models/Submission';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    // Delete all users and submissions
    await User.deleteMany({});
    await Submission.deleteMany({});
    
    return NextResponse.json({ 
      success: true,
      message: 'Competition has been reset. All users and submissions have been removed.'
    });
  } catch (error) {
    console.error('Error resetting competition:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 