import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/utils/db';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const teamName = searchParams.get('teamName');
    
    console.log('Checking team status for:', teamName);
    
    if (!teamName) {
      console.log('No team name provided');
      return NextResponse.json(
        { error: 'Team name is required' },
        { status: 400 }
      );
    }
    
    const user = await User.findOne({ teamName });
    
    if (!user) {
      console.log('Team not found:', teamName);
      return NextResponse.json({
        enrolled: false,
        isBlocked: false
      });
    }
    
    console.log('Team found:', teamName, 'blocked status:', user.isBlocked);
    
    return NextResponse.json({
      enrolled: true,
      isBlocked: user.isBlocked,
      qualified: user.qualified,
      teamId: user._id
    });
  } catch (error) {
    console.error('Error checking team status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 