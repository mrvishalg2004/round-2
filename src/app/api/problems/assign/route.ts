import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/utils/db';
import Problem from '@/models/Problem';
import User from '@/models/User';

// Helper function to shuffle array using Fisher-Yates algorithm
function shuffleArray(array: any[]) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// Define interface for problem assignments
interface ProblemAssignment {
  teamName: string;
  problemTitle: string;
  problemId: string;
  difficulty?: string;
}

// POST endpoint to assign problems to teams
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    // Get all problems
    const problems = await Problem.find({});
    
    if (problems.length === 0) {
      return NextResponse.json(
        { error: 'No problems found to assign' },
        { status: 404 }
      );
    }
    
    // Get all enrolled users/teams
    const users = await User.find({ enrolled: true });
    
    if (users.length === 0) {
      return NextResponse.json(
        { error: 'No enrolled teams found' },
        { status: 404 }
      );
    }
    
    // Group users by team name to avoid duplicate assignments
    const teamMap = new Map();
    users.forEach(user => {
      if (!teamMap.has(user.teamName)) {
        teamMap.set(user.teamName, user);
      }
    });
    
    const teams = Array.from(teamMap.values());
    
    // Shuffle the problems
    const shuffledProblems = shuffleArray(problems);
    
    // Assign problems to teams (round-robin if more teams than problems)
    const assignments: ProblemAssignment[] = [];
    for (let i = 0; i < teams.length; i++) {
      const team = teams[i];
      const problemIndex = i % shuffledProblems.length;
      const assignedProblem = shuffledProblems[problemIndex];
      
      // Update user with assigned problem
      await User.updateMany(
        { teamName: team.teamName },
        { assignedProblem: assignedProblem._id }
      );
      
      assignments.push({
        teamName: team.teamName,
        problemTitle: assignedProblem.title,
        problemId: assignedProblem._id
      });
    }
    
    // Make all problems active for this system to work
    await Problem.updateMany({}, { active: true });
    
    return NextResponse.json({
      success: true,
      message: `Successfully assigned problems to ${assignments.length} teams`,
      assignments
    });
  } catch (error) {
    console.error('Error assigning problems:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to get the current assignments
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    const users = await User.find({ enrolled: true, assignedProblem: { $exists: true } })
      .populate('assignedProblem', 'title difficulty')
      .select('teamName assignedProblem');
    
    // Group by team and format the response
    const teamMap = new Map();
    users.forEach(user => {
      if (!teamMap.has(user.teamName) && user.assignedProblem) {
        teamMap.set(user.teamName, {
          teamName: user.teamName,
          problemTitle: user.assignedProblem.title,
          problemId: user.assignedProblem._id,
          difficulty: user.assignedProblem.difficulty
        });
      }
    });
    
    const assignments: ProblemAssignment[] = Array.from(teamMap.values());
    
    return NextResponse.json({
      success: true,
      assignments
    });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 