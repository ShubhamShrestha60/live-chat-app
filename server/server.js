const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/message');
const { verifyTokenSocket } = require('./middleware/authMiddleware');

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

io.on('connection', (socket) => {
  console.log('New connection: ', socket.user.email);

  socket.on('send_message', (data) => {
    socket.broadcast.emit('receive_message', data);
  });

  socket.on('disconnect', () => {
    console.log('Disconnected:', socket.user.email);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

