import dbConnect from './db';
import Problem from '../models/Problem';

/**
 * Seed the database with sample coding problems
 */
export async function seedProblems() {
  await dbConnect();
  
  // Check if we already have problems
  const count = await Problem.countDocuments();
  if (count > 0) {
    console.log('Database already has problems seeded.');
    return;
  }
  
  // Sample problems for the challenge
  const problems = [
    {
      title: 'The Elegant Algorithm',
      description: 'Write a function that finds the missing number in an array of consecutive integers. For example, given [1, 2, 3, 5, 6], the function should return 4.',
      quote: '"The best code is no code at all." - Jeff Atwood',
      expectedAnswer: 'function findMissingNumber(arr) { const n = arr.length + 1; const expectedSum = (n * (n + 1)) / 2; const actualSum = arr.reduce((sum, num) => sum + num, 0); return expectedSum - actualSum; }',
      difficulty: 'medium',
      timeLimit: 300,
      active: true
    },
    {
      title: 'Palindrome Checker',
      description: 'Write a function that checks if a given string is a palindrome (reads the same forwards and backwards), ignoring spaces, punctuation, and case sensitivity. For example, "A man, a plan, a canal: Panama" should return true.',
      quote: '"Any fool can write code that a computer can understand. Good programmers write code that humans can understand." - Martin Fowler',
      expectedAnswer: 'function isPalindrome(str) { const cleanStr = str.toLowerCase().replace(/[^a-z0-9]/g, ""); return cleanStr === cleanStr.split("").reverse().join(""); }',
      difficulty: 'easy',
      timeLimit: 180,
      active: false
    },
    {
      title: 'Recursive Binary Search',
      description: 'Implement a recursive binary search algorithm to find an element in a sorted array. Return the index of the element, or -1 if not found.',
      quote: '"Premature optimization is the root of all evil." - Donald Knuth',
      expectedAnswer: 'function binarySearch(arr, target, start = 0, end = arr.length - 1) { if (start > end) return -1; const mid = Math.floor((start + end) / 2); if (arr[mid] === target) return mid; if (arr[mid] > target) return binarySearch(arr, target, start, mid - 1); return binarySearch(arr, target, mid + 1, end); }',
      difficulty: 'hard',
      timeLimit: 420,
      active: false
    }
  ];
  
  try {
    await Problem.insertMany(problems);
    console.log('Database seeded successfully with sample problems!');
  } catch (error) {
    console.error('Error seeding the database:', error);
  }
}

export async function runSeed() {
  try {
    await seedProblems();
    console.log('Seed completed successfully!');
  } catch (error) {
    console.error('Error during seed process:', error);
  }
}

// Allow running directly from CLI: node -r ts-node/register src/utils/seed.ts
if (require.main === module) {
  runSeed()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
} 