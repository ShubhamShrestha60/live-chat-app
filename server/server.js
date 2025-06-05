const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/message');
const { verifyTokenSocket } = require('./middleware/authMiddleware');
const Message = require('./models/Message'); // Add this line

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.log(err));

// Socket.IO
io.use(verifyTokenSocket);

// Add this after connectedUsers declaration
const connectedUsers = new Set();

io.on('connection', (socket) => {
  console.log('New connection: ', socket.user.email);
  connectedUsers.add(socket.user.email);
  
  // Emit the updated users list to all clients
  io.emit('users_online', Array.from(connectedUsers));

  socket.on('send_message', async (data) => {
    const messageData = {
      sender: socket.user.email,
      receiver: data.receiver,
      content: data.content,
      timestamp: data.timestamp
    };
    
    // Save message to database
    const message = new Message(messageData);
    await message.save();
    
    // Send to specific user
    const receiverSocket = Array.from(io.sockets.sockets.values())
      .find(s => s.user.email === data.receiver);
    
    if (receiverSocket) {
      receiverSocket.emit('receive_message', messageData);
    }
  });

  socket.on('disconnect', () => {
    console.log('Disconnected:', socket.user.email);
    connectedUsers.delete(socket.user.email);
    io.emit('users_online', Array.from(connectedUsers));
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

