import express from 'express';
// import { sendMessage, getChatHistory } from '../controllers/chatController.mjs';
import { sendMessage, getChatHistory } from './controller.js'; // Adjust the import path as necessary
const router = express.Router();

// POST: Send a message
router.post('/send', sendMessage);

// GET: Fetch chat history
router.get('/history', getChatHistory);

export default router;
