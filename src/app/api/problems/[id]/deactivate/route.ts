import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/utils/db';
import Problem from '@/models/Problem';

// Define correct param type following Next.js documentation
interface RequestContext {
  params: {
    id: string;
  };
}

export async function PUT(request: NextRequest, { params }: RequestContext): Promise<NextResponse> {
  try {
    await dbConnect();
    
    // Set the problem to inactive
    const problem = await Problem.findByIdAndUpdate(
      params.id,
      { active: false },
      { new: true }
    );
    
    if (!problem) {
      return NextResponse.json(
        { error: 'Problem not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(problem);
  } catch (error) {
    console.error('Error deactivating problem:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 