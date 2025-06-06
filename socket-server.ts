// socket-server.ts
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);

type UserInfo = { id: string; name: string };
const sessionUsers: Record<string, Map<string, UserInfo>> = {};

const io = new Server(server, {
  cors: {
    origin: 'http://127.0.0.1:3000',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  const rawSessionId = socket.handshake.query.sessionId;
  const sessionId = Array.isArray(rawSessionId) ? rawSessionId[0] : rawSessionId;
  const userId = socket.handshake.query.userId as string;
  const firstName = socket.handshake.query.firstName as string;

  if (!sessionId || !userId || !firstName) {
    console.warn('Missing sessionId, userId, or firstName');
    socket.disconnect();
    return;
  }

  console.log(`🔌 User ${firstName} connected to session ${sessionId}`);
  socket.join(sessionId);

  // Add user to sessionUsers
  if (!sessionUsers[sessionId]) {
    sessionUsers[sessionId] = new Map();
  }
  sessionUsers[sessionId].set(userId, { id: userId, name: firstName });

  // Emit updated participant list
  io.to(sessionId).emit(
    'participants_update',
    Array.from(sessionUsers[sessionId].values())
  );

  socket.on('album_selected', (album) => {
    socket.to(sessionId).emit('album_selected', album);
  });

  socket.on('disconnect', () => {
    console.log(`❌ User ${firstName} disconnected from session ${sessionId}`);
    const users = sessionUsers[sessionId];
    if (users) {
      users.delete(userId);
      if (users.size === 0) {
        delete sessionUsers[sessionId];
      } else {
        io.to(sessionId).emit(
          'participants_update',
          Array.from(users.values())
        );
      }
    }
  });

  socket.on('chat_message', (msg) => {
    io.to(sessionId).emit('chat_message', msg);
  });

  socket.on('ready', ({ sessionId }) => {
    socket.to(sessionId).emit('ready');
  });
  
  socket.on('offer', ({ sessionId, sdp }) => {
    socket.to(sessionId).emit('offer', { sdp });
  });
  
  socket.on('answer', ({ sessionId, sdp }) => {
    socket.to(sessionId).emit('answer', { sdp });
  });
  
  socket.on('ice-candidate', ({ sessionId, candidate }) => {
    socket.to(sessionId).emit('ice-candidate', { candidate });
  });
  
  
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`✅ Socket.IO server running on http://localhost:${PORT}`);
});
