import { NextRequest, NextResponse } from 'next/server';
import { initSocket } from '@/utils/socket';

// This endpoint is disabled in App Router mode as Socket.IO needs to be set up differently
export async function GET(req: NextRequest) {
  try {
    return new NextResponse(JSON.stringify({ 
      message: 'Socket.IO in App Router requires a different setup. Use server actions or a custom server for Socket.IO integration.'
    }), {
      status: 200,
      headers: {
        'content-type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Socket error:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to process socket request' }), {
      status: 500,
      headers: {
        'content-type': 'application/json',
      },
    });
  }
} 