// import Message from '../models/Message.mjs';
import Chats from "../../schema/chat.js";
// Send a message from user to mechanic
export const sendMessage = async (req, res) => {
  const { senderId, receiverId, message, role } = req.body;
  try {
    const newMessage = new Chats({ senderId, receiverId, message, role });
    await newMessage.save();
    req.io.to(`room-${senderId}-${receiverId}`).emit('receive-message', { senderId, message });

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message' });
  }
};

// Get chat history between user and mechanic
export const getChatHistory = async (req, res) => {
  const { userId, mechanicId } = req.query;
  try {
    const chatHistory = await Chats.find({
      $or: [
        { senderId: userId, receiverId: mechanicId },
        { senderId: mechanicId, receiverId: userId }
      ]
    }).sort({ timestamp: 1 });
    res.status(200).json(chatHistory);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};
