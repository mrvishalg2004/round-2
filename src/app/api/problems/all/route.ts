import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/utils/db';
import Problem from '@/models/Problem';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    // Get all problems for admin view
    const problems = await Problem.find()
      .sort({ active: -1, createdAt: -1 });
    
    return NextResponse.json(problems);
  } catch (error) {
    console.error('Error fetching all problems:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 