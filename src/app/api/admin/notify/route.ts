import { NextRequest, NextResponse } from 'next/server';
import { getIO } from '@/utils/socket';

export async function POST(req: NextRequest) {
  try {
    const io = getIO();
    if (!io) {
      console.error('Socket.IO is not initialized');
      return NextResponse.json(
        { error: 'Socket.IO is not initialized' },
        { status: 500 }
      );
    }
    
    const body = await req.json();
    const { event, data } = body;
    
    if (!event) {
      return NextResponse.json(
        { error: 'Event name is required' },
        { status: 400 }
      );
    }
    
    console.log(`[Socket API] Emitting event: ${event}`, data);
    
    // Emit the event to all connected clients
    io.emit(event, data);
    console.log(`[Socket API] Event emitted successfully: ${event} to ${io.engine.clientsCount} clients`);
    
    return NextResponse.json({ 
      success: true,
      clientCount: io.engine.clientsCount
    });
  } catch (error) {
    console.error('Error in notify:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 