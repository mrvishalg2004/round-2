import { NextRequest, NextResponse } from 'next/server';
import { initSocket, NextApiResponseWithSocket } from '@/utils/socket';

export async function GET(req: NextRequest, res: NextApiResponseWithSocket) {
  try {
    // Initialize Socket.IO
    const io = initSocket(res);
    
    return new NextResponse(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'content-type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Socket initialization error:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to initialize socket' }), {
      status: 500,
      headers: {
        'content-type': 'application/json',
      },
    });
  }
} 