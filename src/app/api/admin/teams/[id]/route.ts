import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/utils/db';
import User from '@/models/User';
import Submission from '@/models/Submission';

// Define proper types according to Next.js docs
interface RouteParams {
  params: {
    id: string;
  };
}

// Use proper type signature matching Next.js API Route definition
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    // Find the user first to get the team name for logging
    const user = await User.findById(params.id);
    if (!user) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }
    
    const teamName = user.teamName;
    const userId = user._id;
    
    // Delete all submissions by this user
    await Submission.deleteMany({ userId: userId });
    
    // Delete the user
    await User.findByIdAndDelete(params.id);
    
    console.log(`Team deleted: ${teamName}, ID: ${userId}`);
    
    return NextResponse.json({
      success: true,
      message: 'Team deleted successfully',
      deletedTeam: {
        _id: userId,
        teamName: teamName
      }
    });
  } catch (error) {
    console.error('Error deleting team:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 