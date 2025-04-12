// const express = require('express')
import express from 'express'
import { createServer } from 'http' 
import login from './modules/login.js'
import cors from 'cors'
import Connection from './connection/connection.js'
import signupapi from './modules/signupapi.js'
import findusers from './modules/findusers.js'
const app = express()
const port = 3000
app.use(cors())
app.get('/', (req, res) => {
  res.send('Hello World!')
})
Connection()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/api', signupapi)
app.use('/api', findusers)
app.use(express.static('public'))
const httpServer = createServer(app);
import { Server } from 'socket.io';
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST','PUT','DELETE'],
  },
});
app.use('/api', login(io))
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})