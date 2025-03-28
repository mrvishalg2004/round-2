import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/utils/db';
import User from '@/models/User';
import Problem from '@/models/Problem';

// Helper function to get a random item from an array
function getRandomItem(array: any[]) {
  return array[Math.floor(Math.random() * array.length)];
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const body = await req.json();
    const { teamName, email } = body;
    
    // Validate required fields
    if (!teamName || !email) {
      return NextResponse.json(
        { error: 'Team name and email are required' },
        { status: 400 }
      );
    }
    
    // Check if team already exists
    const existingTeam = await User.findOne({ teamName });
    if (existingTeam) {
      return NextResponse.json(
        { error: 'Team name already taken' },
        { status: 400 }
      );
    }
    
    // Get all available problems
    const problems = await Problem.find({});
    
    // Get a random problem to assign to this team
    let assignedProblem = null;
    if (problems.length > 0) {
      assignedProblem = getRandomItem(problems)._id;
    }
    
    // Create new user with team info
    const user = await User.create({
      username: teamName,
      email,
      teamName,
      enrolled: true,
      assignedProblem
    });
    
    return NextResponse.json({
      success: true,
      teamName: user.teamName,
      email: user.email,
      assignedProblem: assignedProblem ? true : false
    });
  } catch (error) {
    console.error('Error enrolling team:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    // Check if it's a single team check
    const teamName = req.nextUrl.searchParams.get('teamName');
    if (teamName) {
      const user = await User.findOne({ teamName }).select('teamName email enrolled isBlocked win lose qualified');
      
      if (!user) {
        return NextResponse.json({
          enrolled: false
        });
      }
      
      return NextResponse.json({
        enrolled: user.enrolled,
        teamName: user.teamName,
        email: user.email,
        isBlocked: user.isBlocked,
        win: user.win,
        lose: user.lose,
        qualified: user.qualified
      });
    }
    
    // Otherwise, return all enrolled teams
    const users = await User.find({ enrolled: true }).select('teamName email qualified isBlocked win lose _id');
    
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error retrieving enrolled teams:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 