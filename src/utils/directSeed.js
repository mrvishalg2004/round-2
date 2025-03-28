require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const { Schema } = mongoose;

console.log('Starting database seeding...');
console.log('Using MongoDB URI:', process.env.MONGODB_URI);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });

// Define Problem schema
const ProblemSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  quote: { type: String, required: true },
  expectedAnswer: { type: String, required: true },
  difficulty: { 
    type: String, 
    enum: ['easy', 'medium', 'hard'], 
    default: 'medium' 
  },
  timeLimit: { type: Number, default: 300 },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// Create Problem model
const Problem = mongoose.model('Problem', ProblemSchema);

// Sample problems data
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

async function seedDatabase() {
  try {
    // Check if problems already exist
    const count = await Problem.countDocuments();
    if (count > 0) {
      console.log(`Database already has ${count} problems. Skipping seeding.`);
      mongoose.disconnect();
      return;
    }

    // Insert problems
    await Problem.insertMany(problems);
    console.log(`Successfully seeded ${problems.length} problems`);
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Close the connection
    mongoose.disconnect();
  }
}

// Run the seed function
seedDatabase(); 