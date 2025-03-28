'use client';

import React from 'react';
import Header from '@/components/Header';

export default function Round3() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header isGameActive={false} />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-3xl mx-auto">
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded-md mb-6 inline-block">
            Congratulations! You made it to Round 3
          </div>
          
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Welcome to the Final Challenge</h1>
          
          <div className="prose prose-indigo max-w-none mb-6">
            <p>
              Great job making it through Round 2! You are now among the top 10 players who have demonstrated exceptional coding skills.
            </p>
            <p>
              For the final round, we have prepared an even more challenging problem that will test your algorithmic thinking, optimization skills, and coding precision.
            </p>
            <p>
              The Round 3 challenge will be released soon. Keep an eye on your email for further instructions.
            </p>
          </div>
          
          <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-md mb-6">
            <h2 className="text-lg font-semibold text-indigo-800 mb-2">What to Expect in Round 3:</h2>
            <ul className="list-disc list-inside text-indigo-700 space-y-1">
              <li>Advanced algorithmic challenge</li>
              <li>Real-time collaboration component</li>
              <li>System design element</li>
              <li>Strict time constraints</li>
              <li>Prizes for the top 3 finishers</li>
            </ul>
          </div>
          
          <div className="text-center mt-8">
            <p className="text-gray-600 mb-4">Be ready for the final challenge. Prepare your development environment and brush up on your algorithms!</p>
            <button 
              className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors font-medium"
              onClick={() => window.alert('Round 3 will be starting soon. Stay tuned!')}
            >
              Check Status
            </button>
          </div>
        </div>
      </main>
    </div>
  );
} 