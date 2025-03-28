import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/utils/db';
import User from '@/models/User';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    // Parse the request body
    const body = await req.json();
    const { win, lose, qualified } = body;
    
    // Find the user by ID
    const { id } = await params;
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }
    
    // Update the win/lose/qualified fields
    if (win !== undefined) user.win = win;
    if (lose !== undefined) user.lose = lose;
    if (qualified !== undefined) user.qualified = qualified;
    
    await user.save();
    
    console.log(`Team status updated: ${user.teamName}, ID: ${user._id}, Win: ${user.win}, Lose: ${user.lose}, Qualified: ${user.qualified}`);
    
    return NextResponse.json({ 
      success: true,
      message: 'Team status updated successfully',
      team: {
        _id: user._id,
        teamName: user.teamName,
        win: user.win,
        lose: user.lose,
        qualified: user.qualified,
        isBlocked: user.isBlocked
      }
    });
  } catch (error) {
    console.error('Error updating team status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 