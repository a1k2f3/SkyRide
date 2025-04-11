// const express = require('express')
import express from 'express'
import { createServer } from 'http' 
import cors from 'cors'
import Connection from './connection/connection.js'
import signupapi from './modules/signupapi.js'
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
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})