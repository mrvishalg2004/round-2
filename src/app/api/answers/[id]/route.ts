import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/utils/db';
import Answer from '@/models/Answer';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    const { id } = await params;
    const answer = await Answer.findById(id)
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    const { status } = await req.json();
    
    const { id } = await params;
    const answer = await Answer.findById(id);
    
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