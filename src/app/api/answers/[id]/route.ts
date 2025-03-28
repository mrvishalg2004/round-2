import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/utils/db';
import Answer from '@/models/Answer';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    await dbConnect();
    
    const answer = await Answer.findById(params.id)
      .populate('problem')
      .populate('team');
      
    if (!answer) {
      return NextResponse.json(
        { error: 'Answer not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ answer });
  } catch (error) {
    console.error('Error fetching answer:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    await dbConnect();
    
    const { status } = await req.json();
    
    const answer = await Answer.findById(params.id);
    
    if (!answer) {
      return NextResponse.json(
        { error: 'Answer not found' },
        { status: 404 }
      );
    }
    
    answer.status = status;
    await answer.save();
    
    return NextResponse.json({ 
      answer,
      message: 'Answer updated successfully' 
    });
  } catch (error) {
    console.error('Error updating answer:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 