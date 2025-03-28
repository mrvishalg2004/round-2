import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/utils/db';
import Problem from '@/models/Problem';
import User from '@/models/User';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    // Check if we need to get all problems (for admin)
    const getAllProblems = req.nextUrl.searchParams.get('all') || 
                          !req.nextUrl.searchParams.get('teamName');
                          
    if (getAllProblems) {
      // Return all problems (for admin)
      const problems = await Problem.find({}).sort({ active: -1 });
      return NextResponse.json(problems);
    }
    
    // Extract teamName from query or cookies
    let teamName = req.nextUrl.searchParams.get('teamName') || '';
    
    // If not in query params, try to get from cookies
    if (!teamName) {
      const cookieStore = await cookies();
      const teamNameCookie = cookieStore.get('teamName');
      if (teamNameCookie) {
        teamName = teamNameCookie.value;
      }
    }
                    
    let problem;
    
    if (teamName) {
      // Find the team's assigned problem if available
      const user = await User.findOne({ teamName }).populate('assignedProblem');
      
      if (user && user.assignedProblem) {
        // Return the assigned problem for this team
        problem = user.assignedProblem;
      } else {
        // Fall back to active problem if no assignment
        problem = await Problem.findOne({ active: true });
      }
    } else {
      // Fall back to active problem if no team is specified
      problem = await Problem.findOne({ active: true });
    }
    
    if (!problem) {
      return NextResponse.json(
        { error: 'No problem found for this team' },
        { status: 404 }
      );
    }
    
    // Don't send the answer to client
    const problemObj = problem.toObject();
    delete problemObj.expectedAnswer;
    
    return NextResponse.json(problemObj);
  } catch (error) {
    console.error('Error fetching problem:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const body = await req.json();
    const { title, description, quote, expectedAnswer, difficulty, timeLimit } = body;
    
    // Validate required fields
    if (!title || !description || !quote || !expectedAnswer) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Create new problem
    const problem = await Problem.create({
      title,
      description,
      quote,
      expectedAnswer,
      difficulty: difficulty || 'medium',
      timeLimit: timeLimit || 300,
      active: true
    });
    
    // Set all other problems to inactive
    await Problem.updateMany(
      { _id: { $ne: problem._id } },
      { active: false }
    );
    
    return NextResponse.json(problem, { status: 201 });
  } catch (error) {
    console.error('Error creating problem:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 