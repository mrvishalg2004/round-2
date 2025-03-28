import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/utils/db';
import User from '@/models/User';
import Problem from '@/models/Problem';
import Submission from '@/models/Submission';
import GameState from '@/models/GameState';
import { emitGameComplete, getIO } from '@/utils/socket';

const MAX_QUALIFIED_USERS = 10;

// Helper function to read the game state
const isGameActive = async () => {
  try {
    await dbConnect();
    const gameState = await GameState.findOne({ isDefault: true });
    return gameState?.active === true;
  } catch (error) {
    console.error('Error checking game state:', error);
    return false;
  }
};

export async function POST(req: NextRequest) {
  try {
    if (!await isGameActive()) {
      return NextResponse.json(
        { error: 'Game is not active' },
        { status: 400 }
      );
    }

    await dbConnect();
    
    const body = await req.json();
    console.log('Submission received:', body);
    
    const { answer, teamName } = body;
    
    // Validate required fields
    if (!answer || !teamName) {
      console.log('Missing required fields:', { answer, teamName });
      return NextResponse.json(
        { error: 'Answer and team name are required' },
        { status: 400 }
      );
    }
    
    // Find user by team name
    const user = await User.findOne({ teamName });
    if (!user) {
      console.log('Team not found:', teamName);
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }
    
    // Get the problem assigned to this team, or fall back to active problem
    let problem;
    
    if (user.assignedProblem) {
      // Find the assigned problem for this team
      problem = await Problem.findById(user.assignedProblem);
      console.log('Using team assigned problem:', problem?.title);
    } 
    
    if (!problem) {
      // Fall back to active problem if no assignment
      problem = await Problem.findOne({ active: true });
      console.log('Using active problem:', problem?.title);
    }
    
    if (!problem) {
      console.log('No problem found for this team');
      return NextResponse.json(
        { error: 'No problem found for this team' },
        { status: 404 }
      );
    }
    
    console.log('Creating submission for team:', teamName);
    console.log('Problem found:', problem.title);
    
    try {
      // Create submission
      const submission = await Submission.create({
        userId: user._id,
        problemId: problem._id,
        answer,
        submittedAt: new Date()
      });
      
      console.log('Submission created:', submission._id);
    } catch (submissionError) {
      console.error('Error creating submission:', submissionError);
      // Continue with the validation even if submission creation fails
    }
    
    // Check if answer is correct - with more flexible validation
    const normalizeAnswer = (answer: string): string => {
      // Strip punctuation, convert to lowercase, and trim whitespace
      return answer.toLowerCase()
        .replace(/[^\w\s]/g, '')  // Remove punctuation
        .replace(/\s+/g, ' ')     // Replace multiple spaces with a single space
        .trim();
    };

    // Define acceptable alternative answers
    const alternativeAnswers: Record<string, string[]> = {
      'dictionary': ['hashmap', 'map', 'hashtable', 'hash table', 'hash map'],
      'array': ['list', 'arraylist', 'arrays', 'lists'],
      'api': ['application programming interface', 'apis', 'interface'],
      'lambda': ['lambda function', 'anonymous function', 'lambdas'],
      'if': ['ifelse', 'if else', 'if-else', 'if else statement', 'conditional', 'branch', 'condition'],
      'loop': ['for loop', 'while loop', 'forloop', 'whileloop', 'for', 'while', 'dowhile', 'loops'],
      'exception': ['exception handling', 'try catch', 'try-catch', 'error handling', 'except', 'exceptions'],
      'compiler': ['interpreter', 'transpiler', 'compilers', 'interpreters'],
      'http': ['https', 'http protocol', 'hypertext transfer protocol', 'web protocol']
    };

    const userAnswer = normalizeAnswer(answer);
    const expectedAnswer = normalizeAnswer(problem.expectedAnswer);
    
    console.log(`Answer check: Expected "${expectedAnswer}", Got "${userAnswer}"`);
    
    // Check for exact match or acceptable alternatives
    let isCorrect = userAnswer === expectedAnswer;
    
    // If not an exact match, check alternatives
    if (!isCorrect && alternativeAnswers[expectedAnswer]) {
      isCorrect = alternativeAnswers[expectedAnswer].some(alt => 
        normalizeAnswer(alt) === userAnswer
      );
    }
    
    console.log(`Is answer correct:`, isCorrect);
    
    // Update user if answer is correct
    if (isCorrect) {
      user.score += 1;
      user.submissionTime = new Date();
      user.qualified = true;
      await user.save();
      
      // Get count of qualified users for stats only
      const qualifiedCount = await User.countDocuments({ qualified: true });
      console.log('Qualified users count:', qualifiedCount);
      
      // Return success with qualification status
      return NextResponse.json({
        success: true,
        message: 'Congratulations! Your answer is correct.',
        qualified: true,
        secretLink: '/round3'  // Always provide the link regardless of count
      });
    } else {
      // Return failure response
      return NextResponse.json({
        success: false,
        message: 'Sorry, your answer is incorrect. Please try again.',
        qualified: false
      });
    }
  } catch (error) {
    console.error('Error processing submission:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    if (error instanceof Error && error.stack) {
      console.error('Stack trace:', error.stack);
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 