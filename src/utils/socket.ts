import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { NextApiResponse } from 'next';

// Store the Socket.IO server instance globally
let io: SocketIOServer | null = null;

export const getIO = () => {
  if (!io) {
    console.error('Socket.io not initialized! This may prevent real-time updates.');
    return null;
  }
  return io;
};

export const initSocket = (server: NetServer) => {
  if (!io) {
    console.log('Initializing Socket.io server...');
    
    // Create a new Socket.io server
    io = new SocketIOServer(server, {
      path: '/api/socketio',
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });
    
    // Set up event handlers
    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);
      
      socket.on('joinTeam', (data) => {
        const { teamName } = data;
        if (teamName) {
          socket.join(`team:${teamName}`);
          console.log(`Client ${socket.id} joined team room: ${teamName}`);
        }
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }
  
  return io;
};

export const emitLeaderboardUpdate = (
  leaderboard: any[],
  remainingSlots: number
) => {
  if (!io) return;
  io.emit('leaderboardUpdate', { leaderboard, remainingSlots });
};

export const emitGameComplete = () => {
  if (!io) return;
  io.emit('gameComplete');
};

export const emitGameStatusChange = (data: any) => {
  if (!io) {
    console.error('Socket.io not initialized, cannot emit gameStatusChange');
    return;
  }
  
  console.log('Broadcasting gameStatusChange to all clients:', data);
  console.log('Connected clients:', io.engine.clientsCount);
  
  io.emit('gameStatusChange', data);
  console.log('gameStatusChange broadcast complete');
};

export const emitTeamStatusChange = (teamName: string, isBlocked: boolean, message: string) => {
  if (!io) return;
  // Emit to all clients in the team's room
  io.to(`team:${teamName}`).emit('teamStatusChange', {
    teamName,
    isBlocked,
    message
  });
  // Also emit to all clients for backup
  io.emit('teamStatusChange', {
    teamName,
    isBlocked,
    message
  });
}; 