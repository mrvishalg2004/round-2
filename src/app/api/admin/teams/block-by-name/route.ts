import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/utils/db';
import User from '@/models/User';
import { getIO } from '@/utils/socket';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const body = await req.json();
    const { teamName, reason } = body;
    
    if (!teamName) {
      return NextResponse.json(
        { error: 'Team name is required' },
        { status: 400 }
      );
    }
    
    // Find the user by team name
    const user = await User.findOne({ teamName });
    if (!user) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }
    
    // Update the isBlocked field
    user.isBlocked = true;
    await user.save();
    
    console.log(`Team blocked via client violation: ${user.teamName}, ID: ${user._id}, Reason: ${reason || 'Not specified'}`);
    
    // Notify via socket.io if possible
    try {
      const io = getIO();
      if (io) {
        io.emit('teamStatusChange', { 
          teamName: user.teamName, 
          isBlocked: true 
        });
        console.log('Socket notification sent for blocked team:', user.teamName);
      } else {
        console.log('Socket.io not initialized for notification');
      }
    } catch (socketError) {
      console.error('Error sending socket notification:', socketError);
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Team blocked successfully',
      team: {
        _id: user._id,
        teamName: user.teamName,
        isBlocked: user.isBlocked,
        reason
      }
    });
  } catch (error) {
    console.error('Error blocking team by name:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 