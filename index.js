import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import Connection from './connection/connection.js';
import setupSocket, { onlineUsers } from './modules/SocketsMManegar.js';
import login from './modules/login.js';
import register from './modules/signupapi.js';
import findusers from './modules/findusers.js';
import userlocation from './modules/userlocation.js';
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});
// Setup middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
// Connect to DB
Connection();
// Use Routes
app.use('/api', register(io));
app.use('/api', login(io, onlineUsers));
app.use('/api', findusers);
app.use('/api', userlocation(io));
// Test Routes
app.get('/', (req, res) => res.send('Hello World!'));
app.get('/test', (req, res) => res.send('Testing endpoint'));
// Centralized Socket Logic
setupSocket(io);
// Start Server
const port = 3000;
httpServer.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});