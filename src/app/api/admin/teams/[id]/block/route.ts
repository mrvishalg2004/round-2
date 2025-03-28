import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/utils/db';
import User from '@/models/User';

interface Context {
  params: {
    id: string;
  };
}

export async function POST(
  req: NextRequest,
  context: Context
) {
  try {
    await dbConnect();
    
    // Find the user by ID
    const user = await User.findById(context.params.id);
    if (!user) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }
    
    // Update the isBlocked field
    user.isBlocked = true;
    await user.save();
    
    console.log(`Team blocked: ${user.teamName}, ID: ${user._id}`);
    
    return NextResponse.json({ 
      success: true,
      message: 'Team blocked successfully',
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
    console.error('Error blocking team:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 