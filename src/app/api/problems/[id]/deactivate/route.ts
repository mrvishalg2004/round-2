import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/utils/db';
import Problem from '@/models/Problem';

type Props = {
  params: {
    id: string;
  };
};

export async function PUT(request: NextRequest, props: Props): Promise<NextResponse> {
  try {
    await dbConnect();
    
    // Set the problem to inactive
    const problem = await Problem.findByIdAndUpdate(
      props.params.id,
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