import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/utils/db';
import Problem from '@/models/Problem';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const body = await req.json();
    const { title } = body;
    
    // Set all questions to inactive
    await Problem.updateMany({}, { active: false });
    
    // Find the target question by title if specified
    let targetQuestion;
    
    if (title) {
      targetQuestion = await Problem.findOne({ title });
    }
    
    // If not found or not specified, use the first one
    if (!targetQuestion) {
      targetQuestion = await Problem.findOne({});
    }
    
    if (!targetQuestion) {
      return NextResponse.json(
        { error: 'No questions found in database' },
        { status: 404 }
      );
    }
    
    // Set this one to active
    targetQuestion.active = true;
    await targetQuestion.save();
    
    return NextResponse.json({ 
      success: true, 
      message: `Question "${targetQuestion.title}" activated`,
      activeQuestion: targetQuestion.title
    });
  } catch (error) {
    console.error('Error activating question:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 