# The Code Rush - Real-time Competitive Coding Game

A real-time competitive coding game built with Next.js, React, MongoDB, and Socket.IO where players compete to solve coding challenges for qualification to the next round.

## Features

- 🎮 Real-time competitive coding challenge
- 📊 Live leaderboard updates using Socket.IO
- ⏱️ Countdown timer for each challenge
- 🏆 Top 10 players qualification system
- 🔄 Instant feedback on submissions
- 📱 Responsive design for all devices

## Tech Stack

- **Frontend**: React, TailwindCSS
- **Backend**: Next.js API routes
- **Database**: MongoDB
- **Real-time**: Socket.IO
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- MongoDB (local or Atlas)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/code-rush.git
cd code-rush
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Configure environment variables
   - Rename `.env.local.example` to `.env.local`
   - Add your MongoDB connection string

```
MONGODB_URI=mongodb+srv://your_username:your_password@cluster.mongodb.net/code-rush
```

4. Seed the database with initial problems
```bash
npm run seed
# or
yarn seed
```

### Running the Application

#### Development Mode
```bash
npm run dev
# or
yarn dev
```

The application will start at http://localhost:3000

#### Production Build
```bash
npm run build
npm start
# or
yarn build
yarn start
```

## Deployment to Vercel

The easiest way to deploy this app is to use the [Vercel Platform](https://vercel.com).

1. Push your code to a GitHub repository
2. Import the project to Vercel
3. Add your environment variables in the Vercel dashboard
4. Deploy

## Game Flow

1. Players enter the game and see a coding problem with a famous quote
2. They have a limited time to solve the problem
3. The first 10 players with correct answers qualify for Round 3
4. Real-time leaderboard shows current qualifiers and remaining slots
5. When all 10 slots are filled, the game ends

## Project Structure

```
code-rush/
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── api/           # API Routes
│   │   ├── page.tsx       # Home page
│   │   └── round3/        # Round 3 page for qualified players
│   ├── components/        # React components
│   ├── models/            # MongoDB models
│   └── utils/             # Utility functions
├── public/                # Static files
├── .env.local             # Environment variables
└── package.json           # Dependencies and scripts
```

## License

This project is licensed under the MIT License
