import mongoose from 'mongoose';
const messageSchema = new mongoose.Schema({
    senderId: String,
    receiverId: String,
    message: String,
    role: { type: String, required: true }, //
    timestamp: { type: Date, default: Date.now }
  });
  const Chats = mongoose.model('chats', messageSchema);
export default Chats;
  