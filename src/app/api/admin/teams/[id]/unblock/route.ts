import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/utils/db';
import User from '@/models/User';

// Define proper types according to Next.js docs
interface RouteParams {
  params: {
    id: string;
  };
}

// Use proper type signature matching Next.js API Route definition
export async function POST(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    await dbConnect();
    
    // Find the user by ID
    const user = await User.findById(params.id);
    if (!user) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }
    
    // Update the isBlocked field
    user.isBlocked = false;
    await user.save();
    
    console.log(`Team unblocked: ${user.teamName}, ID: ${user._id}`);
    
    return NextResponse.json({ 
      success: true,
      message: 'Team unblocked successfully',
      team: {
        _id: user._id,
        teamName: user.teamName,
        isBlocked: user.isBlocked,
        win: user.win,
        lose: user.lose,
        qualified: user.qualified
      }
    });
  } catch (error) {
    console.error('Error unblocking team:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 