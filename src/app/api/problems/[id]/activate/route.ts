import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/utils/db';
import Problem from '@/models/Problem';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    // Set all problems to inactive
    await Problem.updateMany({}, { active: false });
    
    // Set the specified problem to active
    const { id } = await params;
    const problem = await Problem.findByIdAndUpdate(
      id,
      { active: true },
      { new: true }
    );
    
    if (!problem) {
      return NextResponse.json(
        { error: 'Problem not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Problem activated successfully',
      problem
    });
  } catch (error) {
    console.error('Error activating problem:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 