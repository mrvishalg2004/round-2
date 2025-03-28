import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/utils/db';
import Problem from '@/models/Problem';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const body = await req.json();
    const { teamId, problemId } = body;
    
    // Validate required fields
    if (!teamId || !problemId) {
      return NextResponse.json(
        { error: 'Team ID and Problem ID are required' },
        { status: 400 }
      );
    }
    
    // Verify the team exists
    const team = await User.findById(teamId);
    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }
    
    // Verify the problem exists
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return NextResponse.json(
        { error: 'Problem not found' },
        { status: 404 }
      );
    }
    
    // Update all users with the same team name
    await User.updateMany(
      { teamName: team.teamName },
      { assignedProblem: problemId }
    );
    
    return NextResponse.json({
      success: true,
      message: `Problem "${problem.title}" assigned to team "${team.teamName}"`,
      assignment: {
        teamName: team.teamName,
        problemTitle: problem.title,
        problemId: problem._id
      }
    });
  } catch (error) {
    console.error('Error assigning problem to team:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 