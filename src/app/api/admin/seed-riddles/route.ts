import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/utils/db';
import Problem from '@/models/Problem';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const programmingRiddles = [
      {
        title: 'Memory Manager',
        description: 'I work tirelessly in the background, cleaning up after messy programmers. Without me, your program would hoard memory like a squirrel collecting nuts. Guess who am I?',
        quote: '"Memory is the mother of all wisdom." - Anonymous',
        expectedAnswer: 'Garbage Collector',
        difficulty: 'medium',
        timeLimit: 180,
        active: false
      },
      {
        title: 'Cloud Storage',
        description: 'I exist in the cloud but I\'m not a raindrop. I store your data but don\'t expect me to bring you coffee in the morning. Guess who am I?',
        quote: '"The cloud is just someone else\'s computer." - Anonymous',
        expectedAnswer: 'Database',
        difficulty: 'easy',
        timeLimit: 120,
        active: false
      },
      {
        title: 'Endless Meeting',
        description: 'I go round and round, and if you forget to control me, I will never stop—like a never-ending office meeting. Guess who am I?',
        quote: '"Time is a flat circle." - Anonymous',
        expectedAnswer: 'Infinite Loop',
        difficulty: 'easy',
        timeLimit: 120,
        active: false
      },
      {
        title: 'Function Traveler',
        description: 'I allow you to pass me around, but I don\'t charge for services. I don\'t need a passport, yet I travel between functions. Guess who am I?',
        quote: '"Not all who wander are lost." - J.R.R. Tolkien',
        expectedAnswer: 'Parameter',
        difficulty: 'medium',
        timeLimit: 180,
        active: false
      },
      {
        title: 'Silent Troublemaker',
        description: 'I am a silent troublemaker. You think I am helping, but in reality, I just sit there doing nothing. Forget me, and your program will never work. Guess who am I?',
        quote: '"It\'s the little things that count." - Anonymous',
        expectedAnswer: 'Missing Semicolon',
        difficulty: 'medium',
        timeLimit: 180,
        active: false
      },
      {
        title: 'Identity Crisis',
        description: 'I allow many things to exist under the same name, but they behave differently. You could say I have identity issues. Guess who am I?',
        quote: '"Be yourself; everyone else is already taken." - Oscar Wilde',
        expectedAnswer: 'Polymorphism',
        difficulty: 'hard',
        timeLimit: 240,
        active: false
      },
      {
        title: 'Secretive Helper',
        description: 'You can call me, but I don\'t have a phone. You can define me, but I won\'t tell you my secrets. Guess who am I?',
        quote: '"Action speaks louder than words." - Anonymous',
        expectedAnswer: 'Function',
        difficulty: 'easy',
        timeLimit: 120,
        active: false
      },
      {
        title: 'Unappreciated Commander',
        description: 'I tell computers what to do, but I never get credit. Without me, your code would be as lifeless as a rock. Guess who am I?',
        quote: '"Behind every great program is a great compiler." - Anonymous',
        expectedAnswer: 'Compiler',
        difficulty: 'medium',
        timeLimit: 180,
        active: false
      },
      {
        title: 'Code Exterminator',
        description: 'I help you find bugs, but I am not an exterminator. If you ignore me, your program will go rogue. Guess who am I?',
        quote: '"It\'s not a bug, it\'s an undocumented feature." - Anonymous',
        expectedAnswer: 'Debugger',
        difficulty: 'easy',
        timeLimit: 120,
        active: false
      },
      {
        title: 'Organized Storekeeper',
        description: 'I store things in order, but I am not a librarian. Add to me, remove from me, but always follow my rules. Guess who am I?',
        quote: '"First in, first out or last in, first out — choose wisely." - Anonymous',
        expectedAnswer: 'Stack or Queue',
        difficulty: 'medium',
        timeLimit: 180,
        active: false
      },
      {
        title: 'Digital Gatekeeper',
        description: 'I let people control access to important things, but I am not a security guard. Without me, hackers would have a buffet. Guess who am I?',
        quote: '"Trust, but verify." - Ronald Reagan',
        expectedAnswer: 'Authentication System',
        difficulty: 'medium',
        timeLimit: 180,
        active: false
      },
      {
        title: 'Key Keeper',
        description: 'I store key-value pairs, but I am not a storage locker. If you lose my keys, you are in big trouble. Guess who am I?',
        quote: '"The key to success is finding the right pair." - Anonymous',
        expectedAnswer: 'HashMap',
        difficulty: 'medium',
        timeLimit: 180,
        active: false
      },
      {
        title: 'Language Translator',
        description: 'I translate human-friendly code into machine gibberish. Without me, your \'Hello World\' would remain a dream. Guess who am I?',
        quote: '"Lost in translation? Not on my watch." - Anonymous',
        expectedAnswer: 'Interpreter',
        difficulty: 'medium',
        timeLimit: 180,
        active: false
      },
      {
        title: 'Code Superhero',
        description: 'I handle the unexpected, like a superhero for crashing programs. But if I fail, the entire system comes down with me. Guess who am I?',
        quote: '"With great power comes great responsibility." - Uncle Ben',
        expectedAnswer: 'Exception Handler',
        difficulty: 'hard',
        timeLimit: 240,
        active: false
      },
      {
        title: 'Persistent Haunter',
        description: 'I am like an annoying friend who keeps showing up even when you thought they were gone. Forget to remove me, and I\'ll haunt your program forever. Guess who am I?',
        quote: '"What we don\'t free will come back to haunt us." - Anonymous',
        expectedAnswer: 'Memory Leak',
        difficulty: 'hard',
        timeLimit: 240,
        active: false
      }
    ];
    
    // Delete all existing problems
    const count = await Problem.countDocuments();
    await Problem.deleteMany();
    console.log(`Removed ${count} existing problems`);
    
    // Insert the new problems
    await Problem.insertMany(programmingRiddles);
    
    return NextResponse.json({ 
      success: true,
      message: `Successfully seeded database with ${programmingRiddles.length} coding riddles`
    });
  } catch (error) {
    console.error('Error seeding riddles:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 