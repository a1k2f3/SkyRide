// const express = require('express')
import express from 'express'
import { createServer } from 'http' 
import  http from 'http' 
import login from './modules/login.js'
import cors from 'cors'
import Connection from './connection/connection.js'
import register from './modules/signupapi.js'
import findusers from './modules/findusers.js'
import location from './modules/userlocation.js'
import { Server } from 'socket.io';
import userlocation from './modules/userlocation.js'
const app = express()
const port = 3000
const server = http.createServer(app);
const httpServer = createServer(app);
const onlineUsers = new Map();
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST','PUT','DELETE'],
  },
});
app.use(cors())
app.get('/', (req, res) => {
  res.send('Hello World!')
})
Connection()
io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);
socket.on("register-user", (user) => {
    onlineUsers.set(socket.id, user);
    console.log("User registered:", user);
  });
  socket.on("follow-user", (senderId) => {
    socket.join(`follow-${senderId}`);
    console.log(`📡 Socket ${socket.id} is following ${senderId}`);
  });
  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
    onlineUsers.delete(socket.id);
  });
});

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/api', register)
app.use('/api', findusers)
app.use('/api', userlocation(io))
app.use(express.static('public'))
app.use('/api', login(io,onlineUsers))
io.on("connection", (socket) => {
  console.log("Client connected", socket.id);

  // User sends this right after login
  socket.on("user-online", ({ id, email }) => {
    onlineUsers.set(socket.id, { id, email });
    socket.broadcast.emit("user-status", { id, status: "online" });
  });

  // Optional: Receive location updates from user
  socket.on("send-location", ({ id, latitude, longitude }) => {
    socket.broadcast.emit("location-update", { id, latitude, longitude });
  });

  // When user disconnects
  socket.on("disconnect", () => {
    const user = onlineUsers.get(socket.id);
    if (user) {
      socket.broadcast.emit("user-status", { id: user.id, status: "offline" });
    }
    onlineUsers.delete(socket.id);
    console.log("Client disconnected", socket.id);
  });
});

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})