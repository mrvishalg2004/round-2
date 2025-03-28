import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/utils/db';
import Problem from '@/models/Problem';

// Define correct param type following Next.js documentation
interface RequestContext {
  params: {
    id: string;
  };
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const problem = await Problem.findById(params.id);
    if (!problem) {
      return NextResponse.json(
        { error: 'Problem not found' },
        { status: 404 }
      );
    }
    
    // If deleting the active problem, make sure to set another one as active
    if (problem.active) {
      // Find another problem to set as active
      const anotherProblem = await Problem.findOne({ _id: { $ne: params.id } });
      if (anotherProblem) {
        anotherProblem.active = true;
        await anotherProblem.save();
      }
    }
    
    await Problem.findByIdAndDelete(params.id);
    
    return NextResponse.json({ 
      success: true,
      message: 'Problem deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting problem:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 